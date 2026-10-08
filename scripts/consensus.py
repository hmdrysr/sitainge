#!/usr/bin/env python3
"""Consensus engine for the siṭaiṅga lexicon. Offline, standard library only.

Run from the repository root:   python3 scripts/consensus.py          (writes the two outputs)
                                python3 scripts/consensus.py --check  (fails if website/data/consensus.json is stale)

Two separate things are computed, and neither is verification or endorsement (docs/protocols/voting-and-consensus.md):
  auto       'auto-confirmed' when records from at least N independent source groups denote the same item
             (same normalised English gloss and a similar or identical form). A machine rule on source metadata.
  community  tallies of votes in votes/votes.jsonl: one GitHub account, one vote per entry and kind.
The script reads lexicon and dataset files and never writes to them. It never changes evidence_level, state or ipa_status.
Exit status is non-zero on malformed rules or votes."""
import argparse, collections, datetime, glob, hashlib, json, os, re, sys, unicodedata

SKIP_CONSENT = {"private", "withdrawn", "restricted"}
KINDS = {"agree", "disagree", "spelling"}
VOTER_RE = re.compile(r"^github:[a-z0-9](?:[a-z0-9-]{0,38})$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ORIGIN_RE = re.compile(r"^(manual|issue#[0-9]+)$")
CTRL_RE = re.compile(r"[\x00-\x1f\x7f]")
SPELLING_MAX = 80


class ConsensusError(Exception):
    pass


# ---------- rules ----------
def load_rules(root):
    path = os.path.join(root, "schemas", "consensus_rules.json")
    try:
        with open(path, encoding="utf-8") as f:
            r = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        raise ConsensusError(f"{path}: cannot read rules: {e}")
    def num(sec, key, lo, hi, integer=False):
        v = (r.get(sec) or {}).get(key)
        ok = isinstance(v, int) and not isinstance(v, bool) if integer else isinstance(v, (int, float)) and not isinstance(v, bool)
        if not ok or not (lo <= v <= hi):
            raise ConsensusError(f"{path}: {sec}.{key} must be a number between {lo} and {hi}")
    if not isinstance(r.get("version"), int) or isinstance(r.get("version"), bool):
        raise ConsensusError(f"{path}: version must be an integer")
    num("auto", "min_independent_groups", 2, 50, True)
    num("auto", "similarity_threshold", 0.5, 1)
    num("auto", "min_form_length", 1, 20, True)
    num("auto", "fuzzy_min_length", 1, 40, True)
    num("auto", "sentence_min_tokens", 2, 50, True)
    pre = (r.get("auto") or {}).get("gloss_strip_prefixes")
    if not isinstance(pre, list) or not all(isinstance(x, str) for x in pre):
        raise ConsensusError(f"{path}: auto.gloss_strip_prefixes must be a list of strings")
    num("community", "min_voters", 1, 1000, True)
    num("community", "consensus_agreement", 0.5, 1)
    num("community", "contested_agreement", 0, 1)
    num("community", "preferred_spelling_min_voters", 1, 1000, True)
    num("community", "preferred_spelling_share", 0.5, 1)
    if r["community"]["contested_agreement"] >= r["community"]["consensus_agreement"]:
        raise ConsensusError(f"{path}: contested_agreement must be below consensus_agreement")
    sg = r.get("source_groups")
    if not isinstance(sg, dict) or not all(isinstance(k, str) and isinstance(v, str) and v for k, v in sg.items()):
        raise ConsensusError(f"{path}: source_groups must map source ids to non-empty group names")
    return r


# ---------- normalisation ----------
def _strip_marks(s):
    d = unicodedata.normalize("NFD", s)
    # Only the general combining diacritics are removed, so that Bangla-script vowel signs are kept.
    return unicodedata.normalize("NFC", "".join(c for c in d if not (0x0300 <= ord(c) <= 0x036F or 0x1AB0 <= ord(c) <= 0x1AFF or 0x1DC0 <= ord(c) <= 0x1DFF)))


def _clean(s):
    s = unicodedata.normalize("NFC", s).lower()
    out = []
    for c in s:
        cat = unicodedata.category(c)
        if cat[0] in "PS" and c not in "ঃ":  # punctuation and symbols become spaces
            out.append(" " if c in "-_/;,:.!?\"()[]{}" else "")
        else:
            out.append(c)
    return re.sub(r"\s+", " ", "".join(out)).strip()


def gloss_key(g, prefixes):
    g = (g or "").lower()
    g = re.sub(r"\([^)]*\)|\[[^\]]*\]", " ", g)
    g = _clean(g.replace("'", "").replace("’", ""))
    for p in prefixes:
        if g.startswith(p) and len(g) > len(p):
            g = g[len(p):]
            break
    return g


def exact_key(form):
    return _clean(form)


def fuzzy_key(form):
    s = _clean(_strip_marks(unicodedata.normalize("NFC", form).lower()))
    return re.sub(r"(\w)\1+", r"\1", s)


def lev(a, b):
    if a == b: return 0
    if len(a) < len(b): a, b = b, a
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


# ---------- records ----------
def read_records(root):
    recs, skipped = [], collections.Counter()
    paths = sorted(glob.glob(os.path.join(root, "lexicon", "raw", "*.jsonl")) + glob.glob(os.path.join(root, "lexicon", "review", "*.jsonl"))
                   + glob.glob(os.path.join(root, "lexicon", "accepted", "*.jsonl")) + glob.glob(os.path.join(root, "datasets", "*.jsonl")))
    for p in paths:
        with open(p, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                if not line.strip(): continue
                try: r = json.loads(line)
                except json.JSONDecodeError: skipped["unreadable line"] += 1; continue
                if not isinstance(r, dict) or not r.get("id"): skipped["no id"] += 1; continue
                if r.get("state") == "ARCHIVED": skipped["archived"] += 1; continue
                if r.get("consent") in SKIP_CONSENT: skipped["consent " + str(r.get("consent"))] += 1; continue
                recs.append(r)
    return recs, skipped


def record_forms(r):
    seen, out = set(), []
    cands = list(r.get("spellings") or []) + [r.get("form_as_submitted"), r.get("reference_form")] + list(r.get("variants") or [])
    for c in cands:
        if isinstance(c, str) and c.strip() and c not in seen:
            seen.add(c); out.append(c)
    return out


class Item:
    __slots__ = ("id", "group", "source", "gloss", "forms")


def build_items(recs, rules, unmapped):
    a = rules["auto"]; sg = rules["source_groups"]; items = []
    for r in recs:
        it = Item(); it.id = r["id"]; it.source = r.get("source") or ""
        if it.source in sg: it.group = sg[it.source]
        else: it.group = "solo-unmapped-" + it.source; unmapped.add(it.source)
        it.gloss = gloss_key(r.get("english_gloss"), a["gloss_strip_prefixes"])
        sent_note = "sentence" in (r.get("form_note") or "").lower()
        it.forms = []
        for f in record_forms(r):
            ex = exact_key(f)
            is_sent = sent_note or len(ex.split()) >= a["sentence_min_tokens"]
            it.forms.append((f, ex, fuzzy_key(f), is_sent))
        if it.gloss and it.forms: items.append(it)
    return items


def form_pair_similar(x, y, a):
    if x[3] or y[3]:
        return x[1] == y[1] and len(x[1]) >= a["min_form_length"]
    kx, ky = x[2], y[2]
    m = min(len(kx), len(ky))
    if m < a["min_form_length"]: return False
    if kx == ky: return True
    if m < a["fuzzy_min_length"]: return False
    return 1 - lev(kx, ky) / max(len(kx), len(ky)) >= a["similarity_threshold"]


def link_forms(i, j, a):
    """Original forms of i and j that matched each other (empty list when the records are not similar)."""
    hits = []
    for x in i.forms:
        for y in j.forms:
            if form_pair_similar(x, y, a): hits.append((x[0], y[0]))
    return hits


def cluster_items(items, rules):
    a = rules["auto"]; by_gloss = collections.defaultdict(list)
    for it in items: by_gloss[it.gloss].append(it)
    clusters = []
    cache = {}
    def sim(i, j):
        k = (i.id, j.id) if i.id < j.id else (j.id, i.id)
        if k not in cache: cache[k] = link_forms(i, j, a)
        return cache[k]
    for gk in sorted(by_gloss):
        grp = sorted(by_gloss[gk], key=lambda t: t.id)
        if len(grp) < 2 or len({t.group for t in grp}) < 2: continue
        parent = list(range(len(grp)))
        def find(x):
            while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
            return x
        for x in range(len(grp)):
            for y in range(x + 1, len(grp)):
                if sim(grp[x], grp[y]): parent[find(x)] = find(y)
        comps = collections.defaultdict(list)
        for x in range(len(grp)): comps[find(x)].append(grp[x])
        for comp in comps.values():
            if len(comp) < 2: continue
            comp.sort(key=lambda t: t.id)
            if all(sim(comp[x], comp[y]) for x in range(len(comp)) for y in range(x + 1, len(comp))):
                parts = [comp]
            else:  # chained, not every pair similar: split greedily so that every member matches every other member
                parts = []
                for t in comp:
                    for p in parts:
                        if all(sim(t, o) for o in p): p.append(t); break
                    else: parts.append([t])
            for p in parts:
                if len(p) >= 2: clusters.append((gk, p, sim))
    return clusters


def auto_results(recs, rules):
    unmapped = set()
    items = build_items(recs, rules, unmapped)
    need = rules["auto"]["min_independent_groups"]
    entries, info = {}, []
    for gk, members, sim in cluster_items(items, rules):
        groups = sorted({m.group for m in members})
        if len(groups) < need: continue
        cid = "CTG-CLU-" + hashlib.sha1((gk + "|" + ",".join(m.id for m in members)).encode()).hexdigest()[:8]
        used = collections.defaultdict(set)  # original form -> groups that wrote it
        for x in range(len(members)):
            for y in range(x + 1, len(members)):
                for fa, fb in sim(members[x], members[y]):
                    used[fa].add(members[x].group); used[fb].add(members[y].group)
        # forms that equal each other after normalisation and come from several groups are listed first
        keyg = collections.defaultdict(set)
        for f, gs in used.items(): keyg[fuzzy_key(f)] |= gs
        forms = sorted(used, key=lambda f: (-len(keyg[fuzzy_key(f)]), f))
        shared = sorted({f for f in used if len(keyg[fuzzy_key(f)]) > 1})
        sources = sorted({m.source for m in members})
        a = {"status": "auto-confirmed", "basis": "source-consensus", "groups": groups, "sources": sources, "cluster": cid, "agreeing_forms": forms[:10]}
        for m in members: entries[m.id] = a
        info.append({"cluster": cid, "gloss": gk, "ids": [m.id for m in members], "groups": groups, "sources": sources, "forms": forms, "shared": shared})
    return entries, info, unmapped


# ---------- votes ----------
def _vote_error(path, n, msg):
    raise ConsensusError(f"{path}:{n} {msg}")


def check_vote_row(v):
    """Strict structural check of one vote row. Returns an error message, or None when the row is well formed."""
    if not isinstance(v, dict): return "not an object"
    for k in ("id", "entry_id", "kind", "date"):
        if not isinstance(v.get(k), str) or not v[k]: return f"missing or invalid {k}"
    if not re.match(r"^CTG-VOTE-[0-9]{5,}$", v["id"]): return "bad vote id"
    if not re.match(r"^CTG-LEX-(RAW|REV|ACC|ARC)-[0-9]{5}$|^CTG-LEX-[0-9]{5}$", v["entry_id"]): return "bad entry_id"
    if v["kind"] not in KINDS: return f"kind must be one of {sorted(KINDS)}"
    if not DATE_RE.match(v["date"]): return "date must be YYYY-MM-DD"
    try: datetime.date.fromisoformat(v["date"])
    except ValueError: return "date is not a real date"
    sp = v.get("spelling")
    if v["kind"] == "spelling":
        if not isinstance(sp, str) or not sp.strip() or len(sp) > SPELLING_MAX or CTRL_RE.search(sp): return "a spelling vote needs a short spelling without control characters"
    elif sp is not None: return "spelling must be null unless kind is spelling"
    rg = v.get("region")
    if rg is not None and (not isinstance(rg, str) or len(rg) > 80 or CTRL_RE.search(rg)): return "bad region"
    org = v.get("origin", "manual")
    if not isinstance(org, str) or not ORIGIN_RE.match(org): return "origin must be manual or issue#<n>"
    note = v.get("note", "")
    if not isinstance(note, str) or len(note) > 500 or CTRL_RE.search(note): return "bad note"
    voter = v.get("voter")
    if voter is not None and not isinstance(voter, str): return "voter must be a string or null"
    return None


def read_votes(root):
    """Returns (votes, exclusions, ignored) after strict validation. Votes without a usable voter identity are ignored, not errors."""
    path = os.path.join(root, "votes", "votes.jsonl"); votes, ignored, ids = [], collections.Counter(), set()
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                if not line.strip(): continue
                try: v = json.loads(line)
                except json.JSONDecodeError as e: _vote_error(path, n, f"invalid JSON: {e}")
                msg = check_vote_row(v)
                if msg: _vote_error(path, n, msg)
                if v["id"] in ids: _vote_error(path, n, f"duplicate vote id {v['id']}")
                ids.add(v["id"])
                voter = v.get("voter")
                if not isinstance(voter, str) or not voter.strip():
                    ignored["no voter identity"] += 1; continue
                voter = voter.strip().lower()
                if not VOTER_RE.match(voter) or voter.endswith("[bot]"):
                    ignored["voter is not a GitHub account"] += 1; continue
                v = dict(v); v["voter"] = voter; v["_n"] = n; votes.append(v)
    excl = []
    xp = os.path.join(root, "votes", "exclusions.jsonl")
    if os.path.exists(xp):
        with open(xp, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                if not line.strip(): continue
                try: x = json.loads(line)
                except json.JSONDecodeError as e: _vote_error(xp, n, f"invalid JSON: {e}")
                msg = check_exclusion_row(x)
                if msg: _vote_error(xp, n, msg)
                excl.append(x)
    return votes, excl, ignored


def check_exclusion_row(x):
    if not isinstance(x, dict) or not (x.get("vote_id") or x.get("voter")): return "needs vote_id or voter"
    if not isinstance(x.get("reason"), str) or not x["reason"].strip(): return "an exclusion needs a recorded reason"
    if not isinstance(x.get("by"), str) or not x["by"].strip(): return "an exclusion needs the reviewer in 'by'"
    if not isinstance(x.get("date", ""), str): return "bad date"
    return None


def effective_votes(votes, excl):
    ex_ids = {x["vote_id"] for x in excl if x.get("vote_id")}
    ex_voters = {str(x["voter"]).strip().lower() for x in excl if x.get("voter")}
    kept = [v for v in votes if v["id"] not in ex_ids and v["voter"] not in ex_voters]
    excluded = len(votes) - len(kept)
    latest = {}
    for v in sorted(kept, key=lambda v: (v["date"], v["id"], v["_n"])):
        latest[(v["voter"], v["entry_id"], v["kind"])] = v  # latest wins
    # A voter who first agreed and later disagreed (or the reverse) is counted once, on the later vote.
    opinion = {}
    for v in sorted(latest.values(), key=lambda v: (v["date"], v["id"], v["_n"])):
        if v["kind"] in ("agree", "disagree"): opinion[(v["voter"], v["entry_id"])] = v
    eff = [v for v in latest.values() if v["kind"] == "spelling"] + list(opinion.values())
    return eff, excluded


def spelling_group_key(s):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", s).strip().casefold())


def community_results(votes, excl, rules, known_ids):
    c = rules["community"]; eff, excluded = effective_votes(votes, excl)
    per = collections.defaultdict(lambda: {"agree": set(), "disagree": set(), "sp": collections.defaultdict(list)})
    orphan = 0
    for v in eff:
        if v["entry_id"] not in known_ids: orphan += 1; continue
        d = per[v["entry_id"]]
        if v["kind"] == "spelling": d["sp"][spelling_group_key(v["spelling"])].append(v["spelling"].strip())
        else: d[v["kind"]].add(v["voter"])
    out = {}
    for eid in sorted(per):
        d = per[eid]; ag, dis = len(d["agree"]), len(d["disagree"]); n = ag + dis
        agreement = round(ag / n, 3) if n else None
        status = "collecting"
        if n >= c["min_voters"]:
            if ag / n >= c["consensus_agreement"]: status = "community-consensus"
            elif ag / n <= c["contested_agreement"]: status = "contested"
        sp_counts = {}
        for k, lst in d["sp"].items():
            disp = sorted(collections.Counter(lst).items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
            sp_counts[disp] = len(lst)
        sp_counts = dict(sorted(sp_counts.items(), key=lambda kv: (-kv[1], kv[0])))
        total = sum(sp_counts.values()); pref = None
        if sp_counts and total >= c["preferred_spelling_min_voters"]:
            top, cnt = next(iter(sp_counts.items()))
            if cnt / total >= c["preferred_spelling_share"]: pref = top
        out[eid] = {"status": status, "voters": n, "agree": ag, "disagree": dis, "agreement": agreement, "preferred_spelling": pref, "spelling_votes": sp_counts}
    return out, {"votes_read": len(votes), "votes_excluded": excluded, "votes_effective": len(eff), "votes_for_unknown_entries": orphan}


# ---------- assemble ----------
def compute(root):
    rules = load_rules(root)
    recs, skipped = read_records(root)
    auto, info, unmapped = auto_results(recs, rules)
    votes, excl, ignored = read_votes(root)
    comm, vcounts = community_results(votes, excl, rules, {r["id"] for r in recs})
    entries = {}
    for eid in sorted(set(auto) | set(comm)):
        entries[eid] = {"auto": auto.get(eid), "community": comm.get(eid)}
    st = collections.Counter(v["status"] for v in comm.values())
    counts = {"records_read": len(recs), "records_skipped": sum(skipped.values()), "clusters_auto": len(info), "entries_auto": len(auto),
              "entries_with_votes": len(comm), "community_collecting": st["collecting"], "community_consensus": st["community-consensus"],
              "community_contested": st["contested"], "preferred_spellings": sum(1 for v in comm.values() if v["preferred_spelling"]),
              "votes_ignored_no_identity": sum(ignored.values()), **vcounts}
    result = {"version": 1, "generated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
              "rules_version": rules["version"], "counts": counts, "entries": entries}
    return result, rules, recs, info, skipped, unmapped, ignored


def make_report(result, rules, recs, info, skipped, unmapped, ignored):
    a, c, cn = rules["auto"], rules["community"], result["counts"]
    gl = collections.Counter()
    for i in info:
        for g in i["groups"]: gl[g] += len(i["ids"])
    pair = collections.Counter(" + ".join(i["groups"]) for i in info)
    L = ["# Consensus report", "",
         f"Generated {result['generated']} by `scripts/consensus.py` (rules version {result['rules_version']}). Do not edit by hand; rerun the script.", "",
         "Consensus is a machine-computed label. It is not verification, it is not endorsement, and it never changes an evidence level, a state or an IPA status. See `docs/protocols/voting-and-consensus.md`.", "",
         "## Counts", "", "| Measure | Count |", "|---|---|"]
    names = {"records_read": "Records read", "records_skipped": "Records skipped (archived, private, withdrawn or restricted)", "clusters_auto": "Clusters auto-confirmed",
             "entries_auto": "Entries auto-confirmed by consensus", "entries_with_votes": "Entries with at least one counted vote",
             "community_collecting": "Community status: collecting", "community_consensus": "Community status: community consensus",
             "community_contested": "Community status: contested", "preferred_spellings": "Entries with a preferred spelling",
             "votes_read": "Votes read", "votes_ignored_no_identity": "Votes ignored (no usable GitHub identity)", "votes_excluded": "Votes excluded by a reviewer",
             "votes_effective": "Effective votes (latest per voter, entry and kind)", "votes_for_unknown_entries": "Effective votes for entries not in the data read"}
    for k, v in names.items(): L.append(f"| {names[k]} | {cn[k]} |")
    L += ["", "## Thresholds in force", "",
          f"- Auto-confirmed: at least {a['min_independent_groups']} independent source groups; form similarity at least {a['similarity_threshold']} after lowercasing, removing diacritics and collapsing doubled letters; forms shorter than {a['min_form_length']} letters are never matched and forms shorter than {a['fuzzy_min_length']} must be identical (with this threshold a single edit needs at least 7 letters, so shorter words must be identical in any case); forms of {a['sentence_min_tokens']} or more words, or records noted as sentences, are matched exactly only.",
          f"- Community consensus: at least {c['min_voters']} distinct voters and at least {round(c['consensus_agreement']*100)}% agreement. Contested: at least {c['min_voters']} voters and agreement of {round(c['contested_agreement']*100)}% or less. Anything else stays in collecting.",
          f"- Preferred spelling: at least {c['preferred_spelling_min_voters']} spelling votes and the top spelling at {round(c['preferred_spelling_share']*100)}% or more of them.", ""]
    L += ["## Source groups that confirmed one another", ""]
    if pair:
        L += ["| Groups | Clusters |", "|---|---|"] + [f"| {k} | {v} |" for k, v in sorted(pair.items(), key=lambda kv: (-kv[1], kv[0]))]
    else: L.append("No clusters.")
    L += ["", "## Largest clusters", ""]
    top = sorted(info, key=lambda i: (-len(i["groups"]), -len(i["ids"]), i["cluster"]))[:25]
    if top:
        L += ["| Cluster | Gloss | Groups | Records | Forms (shared by several groups in bold) |", "|---|---|---|---|---|"]
        for i in top:
            forms = ", ".join(("**" + f + "**") if f in i["shared"] else f for f in i["forms"][:8])
            L.append(f"| {i['cluster']} | {i['gloss'][:60]} | {', '.join(i['groups'])} | {len(i['ids'])} | {forms} |")
    else: L.append("No clusters.")
    L += ["", "## Caveats", "",
          "- Independence is judged from source metadata (`schemas/consensus_rules.json`, `source_groups`) and can be wrong. Two datasets may share an upstream that the metadata does not show; two sources judged independent may have copied one another.",
          "- A match means that two sources give the same English gloss and a similar form. It does not mean that either is correct, that a speaker said it, or that the gloss is right.",
          "- Similarity is computed on lowercased text with diacritics removed and doubled letters collapsed. That deliberately ignores differences that matter in the Hamidian Script and in IPA, so two different words can be matched. Review before relying on a cluster.",
          "- Forms in different scripts (Bangla script, Latin, IPA) are never matched with one another, so cross-script agreement is missed.",
          "- Chittagonian sentence entries are matched exactly only; near-identical sentences are not clustered.",
          "- Glosses are compared as whole strings after removing bracketed context and a leading to, a, an or the. Glosses with several senses separated by semicolons will not match a single-sense gloss.",
          "- Records from the same group never count twice, even if they differ in spelling.",
          "- Votes are a count of GitHub accounts. They are not evidence and do not change any status other than the community label."]
    if unmapped: L.append(f"- Sources used by records but missing from `source_groups`, treated as their own groups: {', '.join(sorted(unmapped))}.")
    if ignored: L.append(f"- Ignored votes: {', '.join(f'{v} ({k})' for k, v in sorted(ignored.items()))}.")
    if skipped: L.append(f"- Records skipped: {', '.join(f'{v} ({k})' for k, v in sorted(skipped.items()))}.")
    return "\n".join(L) + "\n"


def dumps(result):
    return json.dumps(result, ensure_ascii=False, separators=(",", ":"), sort_keys=False) + "\n"


def strip_ts(text):
    d = json.loads(text); d.pop("generated", None); return d


def main(argv=None):
    ap = argparse.ArgumentParser(description="Compute auto-confirmed (source consensus) and community consensus labels.")
    ap.add_argument("--root", default="."); ap.add_argument("--check", action="store_true", help="fail if website/data/consensus.json differs from a fresh run")
    a = ap.parse_args(argv)
    try:
        result, rules, recs, info, skipped, unmapped, ignored = compute(a.root)
    except ConsensusError as e:
        print("ERROR", e, file=sys.stderr); return 2
    out = os.path.join(a.root, "website", "data", "consensus.json")
    if a.check:
        if not os.path.exists(out): print("ERROR consensus.json is missing; run python3 scripts/consensus.py", file=sys.stderr); return 1
        try:
            with open(out, encoding="utf-8") as f: old = strip_ts(f.read())
        except json.JSONDecodeError: print("ERROR consensus.json is not valid JSON", file=sys.stderr); return 1
        new = strip_ts(dumps(result))
        if old != new: print("ERROR consensus.json is out of date; run python3 scripts/consensus.py", file=sys.stderr); return 1
        print("consensus.json is up to date"); return 0
    text = dumps(result)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f: f.write(text)
    rp = os.path.join(a.root, "reports", "consensus-report.md"); os.makedirs(os.path.dirname(rp), exist_ok=True)
    with open(rp, "w", encoding="utf-8") as f: f.write(make_report(result, rules, recs, info, skipped, unmapped, ignored))
    cn = result["counts"]
    print(f"{cn['entries_auto']} entries auto-confirmed in {cn['clusters_auto']} clusters; {cn['entries_with_votes']} entries with votes ({len(text)//1024} KB)")
    for m in sorted(unmapped): print("WARNING source not in source_groups, treated as its own group:", m)
    return 0


if __name__ == "__main__":
    sys.exit(main())
