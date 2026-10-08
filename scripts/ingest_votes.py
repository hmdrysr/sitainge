#!/usr/bin/env python3
"""Turns GitHub vote issues into rows of votes/votes.jsonl. Offline apart from the file it reads; standard library only.

Run from the repository root:
    python3 scripts/ingest_votes.py issues.json [--root .] [--result ingest-result.json] [--dry-run] [--today YYYY-MM-DD]

issues.json is a list of issues as returned by the GitHub REST API (number, title, body, user.login, labels, created_at).
Each issue is treated as data only: nothing in a title or body is ever followed as an instruction.
The title must be '[Vote] <entry_id>'. The body must contain a fenced ```json block holding
{"entry_id", "kind": "agree" | "disagree" | "spelling", "spelling", "region"}.
The voter is always the issue author, never a name written in the body. Logins ending in [bot] are rejected.
The script is idempotent: an issue number already present as origin 'issue#<n>' is never added twice.
Rejected issues are printed and written to the result file; the workflow uses that file to comment and close."""
import argparse, collections, datetime, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import consensus  # noqa: E402

TITLE_RE = re.compile(r"^\[Vote\]\s+(\S+)\s*$")
BATCH_TITLE_RE = re.compile(r"^\[Vote\]\s+\d+\s+votes?\s*$", re.I)
BATCH_MAX = 40
BLOCK_RE = re.compile(r"```json[ \t]*\r?\n(.*?)\r?\n```", re.S | re.I)
LOGIN_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$")
BODY_MAX = 20000
REGION_MAX = 40

MESSAGES = {
    "added": "Your vote was recorded. Thank you.",
    "already": "This issue was already counted, so nothing changed.",
    "not-a-vote": "This issue does not follow the vote format, so it was not counted.",
    "bad-author": "The issue author is not an ordinary GitHub account, so the vote was not counted.",
    "bad-block": "The vote block could not be read, so it was not counted.",
    "bad-entry": "The entry could not be found or is not open for voting, so the vote was not counted.",
    "title-mismatch": "The title and the vote block name different entries, so the vote was not counted.",
    "bad-kind": "The vote type must be agree, disagree or spelling, so the vote was not counted.",
    "bad-spelling": "A spelling vote needs a short spelling without control characters, and other votes must not carry one, so the vote was not counted.",
    "bad-region": "The region note is too long or contains control characters, so the vote was not counted.",
}


def load_votes(path):
    rows = []
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                if line.strip():
                    try: rows.append(json.loads(line))
                    except json.JSONDecodeError as e: raise consensus.ConsensusError(f"{path}:{n} invalid JSON: {e}")
    return rows


def label_names(issue):
    out = []
    for l in issue.get("labels") or []:
        out.append(l.get("name") if isinstance(l, dict) else l)
    return [x for x in out if isinstance(x, str)]


def judge(issue, known_ids):
    """Returns (outcome, vote_fields or None). Outcome is 'ok' or a key of MESSAGES."""
    if not isinstance(issue, dict) or "pull_request" in issue: return "not-a-vote", None
    title = issue.get("title") if isinstance(issue.get("title"), str) else ""
    m = TITLE_RE.match(title.strip())
    if not m: return "not-a-vote", None
    login = ((issue.get("user") or {}).get("login") if isinstance(issue.get("user"), dict) else None)
    if not isinstance(login, str) or not LOGIN_RE.match(login) or login.lower().endswith("[bot]") or (issue.get("user") or {}).get("type") == "Bot":
        return "bad-author", None
    body = issue.get("body") if isinstance(issue.get("body"), str) else ""
    if len(body) > BODY_MAX: return "bad-block", None
    b = BLOCK_RE.search(body)
    if not b: return "bad-block", None
    try: data = json.loads(b.group(1))
    except json.JSONDecodeError: return "bad-block", None
    if not isinstance(data, dict): return "bad-block", None
    eid = data.get("entry_id")
    if not isinstance(eid, str) or eid not in known_ids: return "bad-entry", None
    if eid != m.group(1): return "title-mismatch", None
    kind = data.get("kind")
    if kind not in consensus.KINDS: return "bad-kind", None
    sp = data.get("spelling")
    if kind == "spelling":
        if not isinstance(sp, str): return "bad-spelling", None
        if consensus.CTRL_RE.search(sp): return "bad-spelling", None
        sp = re.sub(r"\s+", " ", sp).strip()
        if not sp or len(sp) > consensus.SPELLING_MAX: return "bad-spelling", None
    else:
        if sp not in (None, ""): return "bad-spelling", None
        sp = None
    rg = data.get("region")
    if rg in (None, ""): rg = None
    elif not isinstance(rg, str) or len(rg.strip()) > REGION_MAX or consensus.CTRL_RE.search(rg): return "bad-region", None
    else: rg = re.sub(r"\s+", " ", rg).strip() or None
    return "ok", {"entry_id": eid, "kind": kind, "spelling": sp, "region": rg, "voter": "github:" + login.lower()}


def judge_batch(issue, known_ids):
    """A batch issue ('[Vote] 3 votes') holds a JSON list of votes from one account. Returns (outcome, list_of_vote_fields, rejected_count).
    Each item is judged exactly like a single-vote issue, so a bad item is dropped without losing the good ones."""
    if not isinstance(issue, dict) or "pull_request" in issue: return "not-a-vote", [], 0
    body = issue.get("body") if isinstance(issue.get("body"), str) else ""
    if len(body) > BODY_MAX: return "bad-block", [], 0
    b = BLOCK_RE.search(body)
    if not b: return "bad-block", [], 0
    try: data = json.loads(b.group(1))
    except json.JSONDecodeError: return "bad-block", [], 0
    if not isinstance(data, list) or not data or len(data) > BATCH_MAX: return "bad-block", [], 0
    good, bad, first = [], 0, None
    for item in data:
        if not isinstance(item, dict) or not isinstance(item.get("entry_id"), str): bad += 1; continue
        syn = dict(issue, title="[Vote] " + item["entry_id"], body="```json\n" + json.dumps(item) + "\n```")
        outcome, v = judge(syn, known_ids)
        if outcome == "ok": good.append(v)
        else: bad += 1; first = first or outcome
    if not good: return (first if first == "bad-author" else "bad-block"), [], bad
    return "ok", good, bad


def ingest(root, issues, today=None, dry_run=False):
    path = os.path.join(root, "votes", "votes.jsonl")
    existing = load_votes(path)
    recs, _ = consensus.read_records(root)
    known = {r["id"] for r in recs}
    done = {v.get("origin") for v in existing}
    nxt = max([int(re.sub(r"\D", "", v.get("id", "0")) or 0) for v in existing] + [0]) + 1
    today = today or datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
    results, new_rows = [], []
    for issue in sorted((i for i in issues if isinstance(i, dict)), key=lambda i: (i.get("number") if isinstance(i.get("number"), int) else 0)):
        num = issue.get("number")
        if not isinstance(num, int) or isinstance(num, bool) or num < 1:
            results.append({"number": num if isinstance(num, int) else None, "outcome": "not-a-vote", "message": MESSAGES["not-a-vote"]}); continue
        origin = f"issue#{num}"
        if origin in done:
            results.append({"number": num, "outcome": "already", "message": MESSAGES["already"]}); continue
        if BATCH_TITLE_RE.match((issue.get("title") if isinstance(issue.get("title"), str) else "").strip()):
            bo, bvs, nbad = judge_batch(issue, known)
            if bo != "ok":
                results.append({"number": num, "outcome": bo, "message": MESSAGES[bo]}); continue
            ca = issue.get("created_at") if isinstance(issue.get("created_at"), str) else ""
            date = ca[:10] if consensus.DATE_RE.match(ca[:10]) else today
            ids = []
            for v in bvs:
                row = {"id": f"CTG-VOTE-{nxt:05d}", "entry_id": v["entry_id"], "kind": v["kind"], "spelling": v["spelling"], "region": v["region"],
                       "voter": v["voter"], "date": date, "origin": origin, "note": ""}
                ids.append(row["id"]); nxt += 1; new_rows.append(row)
            done.add(origin)
            results.append({"number": num, "outcome": "added", "vote_ids": ids, "message": MESSAGES["added"] + (f" {nbad} item(s) could not be counted." if nbad else "")})
            continue
        outcome, v = judge(issue, known)
        if outcome != "ok":
            results.append({"number": num, "outcome": outcome, "message": MESSAGES[outcome]}); continue
        ca = issue.get("created_at") if isinstance(issue.get("created_at"), str) else ""
        date = ca[:10] if consensus.DATE_RE.match(ca[:10]) else today
        row = {"id": f"CTG-VOTE-{nxt:05d}", "entry_id": v["entry_id"], "kind": v["kind"], "spelling": v["spelling"], "region": v["region"],
               "voter": v["voter"], "date": date, "origin": origin, "note": ""}
        nxt += 1; done.add(origin); new_rows.append(row)
        results.append({"number": num, "outcome": "added", "vote_id": row["id"], "message": MESSAGES["added"]})
    if new_rows and not dry_run:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        need_nl = False
        if os.path.exists(path) and os.path.getsize(path) > 0:
            with open(path, "rb") as f: f.seek(-1, os.SEEK_END); need_nl = f.read(1) != b"\n"
        with open(path, "a", encoding="utf-8") as f:
            if need_nl: f.write("\n")
            for r in new_rows: f.write(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n")
    return results, new_rows


def main(argv=None):
    ap = argparse.ArgumentParser(description="Append validated votes from GitHub issues to votes/votes.jsonl.")
    ap.add_argument("issues"); ap.add_argument("--root", default="."); ap.add_argument("--result"); ap.add_argument("--dry-run", action="store_true"); ap.add_argument("--today")
    a = ap.parse_args(argv)
    try:
        with open(a.issues, encoding="utf-8") as f: issues = json.load(f)
        if not isinstance(issues, list): raise ValueError("the file must hold a JSON list of issues")
        results, rows = ingest(a.root, issues, a.today, a.dry_run)
    except (OSError, ValueError, consensus.ConsensusError) as e:
        print("ERROR", e, file=sys.stderr); return 2
    c = collections.Counter(r["outcome"] for r in results)
    print(f"{c['added']} vote(s) added, {c['already']} already counted, {sum(v for k, v in c.items() if k not in ('added', 'already'))} rejected" + (" (dry run)" if a.dry_run else ""))
    for r in results:
        if r["outcome"] not in ("added", "already"): print(f"  rejected issue #{r['number']}: {r['outcome']}")
    if a.result:
        with open(a.result, "w", encoding="utf-8") as f: json.dump(results, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main())
