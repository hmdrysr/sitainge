"""Offline tests for scripts/consensus.py, scripts/ingest_votes.py and the vote checks in validate.py.
Run from the repository root:  python3 -m unittest scripts/tests/test_consensus.py   (or python3 scripts/tests/test_consensus.py)
Uses temporary directories only. Every word below is an invented placeholder, not Chittagonian."""
import hashlib, json, os, shutil, subprocess, sys, tempfile, unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import consensus, ingest_votes  # noqa: E402

LEX = {"id": "CTG-LEX-RAW-00001", "state": "RAW", "form_as_submitted": "zorbakelu", "spellings": ["zorbakelu"], "english_gloss": "water", "source": "SRC-A1",
       "evidence_level": "unassessed", "confidence": "unverified", "ai_assisted": False, "consent": "research-only", "form_note": None,
       "provenance": {"submitted_by": "t", "date_submitted": "2099-01-01", "origin": "t", "decision_history": []}}

def rec(n, source, gloss, forms, **kw):
    r = dict(LEX, id=f"CTG-LEX-RAW-{n:05d}", source=source, english_gloss=gloss, form_as_submitted=forms[0], spellings=list(forms))
    r.update(kw); return r

def read_lines(p):
    if not os.path.exists(p): return []
    with open(p, encoding="utf-8") as f: return [json.loads(l) for l in f if l.strip()]

def write(root, rel, rows):
    p = os.path.join(root, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        for r in rows: f.write((r if isinstance(r, str) else json.dumps(r, ensure_ascii=False)) + "\n")

def digest(p):
    with open(p, "rb") as f: return hashlib.sha256(f.read()).hexdigest()

def vote(n, entry, kind, voter, date="2099-01-01", spelling=None, **kw):
    v = {"id": f"CTG-VOTE-{n:05d}", "entry_id": entry, "kind": kind, "spelling": spelling, "region": None, "voter": voter, "date": date, "origin": "manual", "note": ""}
    v.update(kw); return v

def issue(num, entry, kind="agree", login="alice", spelling=None, region=None, title=None, body=None, **kw):
    blk = json.dumps({"entry_id": entry, "kind": kind, "spelling": spelling, "region": region})
    d = {"number": num, "title": title if title is not None else f"[Vote] {entry}", "body": body if body is not None else f"Sent from Dadi.\n\n```json\n{blk}\n```\n",
         "user": {"login": login}, "labels": [{"name": "vote"}], "created_at": "2099-02-03T10:00:00Z"}
    d.update(kw); return d

class Base(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.mkdtemp()
        shutil.copytree(os.path.join(ROOT, "schemas"), os.path.join(self.t, "schemas"))
        shutil.copytree(os.path.join(ROOT, "scripts"), os.path.join(self.t, "scripts"), ignore=shutil.ignore_patterns("__pycache__", "tests"))
        rules = consensus.load_rules(self.t)
        rules["source_groups"] = {"SRC-A1": "gA", "SRC-A2": "gA", "SRC-B": "gB", "SRC-C": "gC"}
        self.rules = rules; self.save_rules()
    def tearDown(self): shutil.rmtree(self.t, ignore_errors=True)
    def save_rules(self):
        with open(os.path.join(self.t, "schemas", "consensus_rules.json"), "w", encoding="utf-8") as f: json.dump(self.rules, f)
    def lex(self, rows): write(self.t, "lexicon/raw/t.jsonl", rows)
    def run_all(self):
        res = consensus.compute(self.t)[0]; return res["entries"], res
    def cli(self, *args, script="consensus.py"):
        return subprocess.run([sys.executable, os.path.join("scripts", script), *args], cwd=self.t, capture_output=True, text=True)

class AutoConsensus(Base):
    def test_two_independent_groups_confirm(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakelu"])])
        e, _ = self.run_all()
        self.assertEqual(sorted(e), ["CTG-LEX-RAW-00001", "CTG-LEX-RAW-00002"])
        a = e["CTG-LEX-RAW-00001"]["auto"]
        self.assertEqual((a["status"], a["basis"], a["groups"], a["sources"]), ("auto-confirmed", "source-consensus", ["gA", "gB"], ["SRC-A1", "SRC-B"]))
        self.assertTrue(a["cluster"].startswith("CTG-CLU-")); self.assertEqual(a["agreeing_forms"], ["zorbakelu"])
        self.assertIsNone(e["CTG-LEX-RAW-00001"]["community"])
    def test_same_group_never_counts_twice(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-A2", "water", ["zorbakelu"]), rec(3, "SRC-A1", "water", ["zorbakelu"])])
        self.assertEqual(self.run_all()[0], {})
    def test_three_groups_listed(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakelu"]), rec(3, "SRC-C", "water", ["zorbakelu"])])
        self.assertEqual(self.run_all()[0]["CTG-LEX-RAW-00003"]["auto"]["groups"], ["gA", "gB", "gC"])
    def test_minimum_groups_is_a_rule(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakelu"])])
        self.rules["auto"]["min_independent_groups"] = 3; self.save_rules()
        self.assertEqual(self.run_all()[0], {})
    def test_similar_spelling_matches(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "Water (noun)", ["Zórbakelo"])])
        e, _ = self.run_all(); self.assertEqual(len(e), 2)
        self.assertEqual(sorted(e["CTG-LEX-RAW-00001"]["auto"]["agreeing_forms"]), ["Zórbakelo", "zorbakelu"])
    def test_diacritics_and_doubled_letters_ignored(self):
        self.lex([rec(1, "SRC-A1", "sun", ["ṭorrbak"]), rec(2, "SRC-B", "sun", ["torbák"])])
        self.assertEqual(len(self.run_all()[0]), 2)
    def test_dissimilar_forms_do_not_match(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakxyz"])])
        self.assertEqual(self.run_all()[0], {})
    def test_different_gloss_does_not_match(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "river", ["zorbakelu"])])
        self.assertEqual(self.run_all()[0], {})
    def test_gloss_normalisation(self):
        self.lex([rec(1, "SRC-A1", "To eat!", ["zorbakelu"]), rec(2, "SRC-B", "eat (verb)", ["zorbakelu"])])
        self.assertEqual(len(self.run_all()[0]), 2)
    def test_short_words_must_be_identical(self):
        self.lex([rec(1, "SRC-A1", "one", ["kab"]), rec(2, "SRC-B", "one", ["kad"]), rec(3, "SRC-A1", "two", ["qua"]), rec(4, "SRC-B", "two", ["qua"]),
                  rec(5, "SRC-A1", "three", ["a"]), rec(6, "SRC-B", "three", ["a"])])
        self.assertEqual(sorted(self.run_all()[0]), ["CTG-LEX-RAW-00003", "CTG-LEX-RAW-00004"])
    def test_mid_length_words_need_identity_with_default_threshold(self):
        self.lex([rec(1, "SRC-A1", "one", ["korbal"]), rec(2, "SRC-B", "one", ["korbil"])])
        self.assertEqual(self.run_all()[0], {})
    def test_sentences_match_exactly_only(self):
        s1, s2 = "ami zorbak khelu bhai", "ami zorbak khelu bhaj"
        self.lex([rec(1, "SRC-A1", "a sentence", [s1]), rec(2, "SRC-B", "a sentence", [s2]), rec(3, "SRC-A1", "other sentence", [s1]), rec(4, "SRC-B", "other sentence", [s1.upper() + "."]),
                  rec(5, "SRC-A1", "third", ["zorbakelu"], form_note="sentence"), rec(6, "SRC-B", "third", ["zorbakelo"], form_note="sentence")])
        self.assertEqual(sorted(self.run_all()[0]), ["CTG-LEX-RAW-00003", "CTG-LEX-RAW-00004"])
    def test_skips_private_withdrawn_archived(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakelu"], consent="private"), rec(3, "SRC-C", "water", ["zorbakelu"], state="ARCHIVED"),
                  rec(4, "SRC-C", "water", ["zorbakelu"], consent="withdrawn")])
        self.assertEqual(self.run_all()[0], {})
    def test_reads_review_accepted_and_datasets(self):
        write(self.t, "lexicon/review/r.jsonl", [rec(1, "SRC-A1", "water", ["zorbakelu"], state="REVIEW")]); write(self.t, "datasets/d.jsonl", [rec(2, "SRC-B", "water", ["zorbakelu"])])
        self.assertEqual(len(self.run_all()[0]), 2)
    def test_unmapped_source_is_its_own_group(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-NEW", "water", ["zorbakelu"])])
        res = consensus.compute(self.t); self.assertEqual(len(res[0]["entries"]), 2); self.assertEqual(res[5], {"SRC-NEW"})
    def test_chained_records_are_split(self):
        # x~y and y~z but x!~z: the engine must not claim that all three agree
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelumunpi"]), rec(2, "SRC-B", "water", ["zxrbakelumunpi"]), rec(3, "SRC-C", "water", ["zxrbakelomunpi"])])
        self.rules["auto"]["similarity_threshold"] = 0.9; self.save_rules()
        e, _ = self.run_all()
        self.assertEqual(sorted(e), ["CTG-LEX-RAW-00001", "CTG-LEX-RAW-00002"]); self.assertEqual(e["CTG-LEX-RAW-00001"]["auto"]["groups"], ["gA", "gB"])
    def test_never_writes_to_lexicon_or_upgrades(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakelu"])])
        p = os.path.join(self.t, "lexicon", "raw", "t.jsonl"); before = digest(p)
        self.assertEqual(self.cli().returncode, 0)
        self.assertEqual(digest(p), before)
        with open(os.path.join(self.t, "website", "data", "consensus.json"), encoding="utf-8") as f: text = f.read()
        for k in ("evidence_level", "ipa_status", '"state":"ACCEPTED"'): self.assertNotIn(k, text)
    def test_deterministic_apart_from_timestamp(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakelu"])])
        a = consensus.compute(self.t)[0]; b = consensus.compute(self.t)[0]; a.pop("generated"); b.pop("generated"); self.assertEqual(a, b)

class Votes(Base):
    E = "CTG-LEX-RAW-00001"
    def setUp(self):
        super().setUp(); self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"])])
    def tally(self, votes, excl=None):
        write(self.t, "votes/votes.jsonl", votes)
        if excl: write(self.t, "votes/exclusions.jsonl", excl)
        return self.run_all()[0].get(self.E, {}).get("community")
    def test_one_voter_one_vote_latest_wins(self):
        c = self.tally([vote(1, self.E, "agree", "github:a", "2099-01-01"), vote(2, self.E, "agree", "github:a", "2099-01-02"), vote(3, self.E, "agree", "github:A", "2099-01-03")])
        self.assertEqual((c["voters"], c["agree"], c["disagree"], c["status"]), (1, 1, 0, "collecting"))
    def test_changing_mind_counts_once(self):
        c = self.tally([vote(1, self.E, "agree", "github:a", "2099-01-01"), vote(2, self.E, "disagree", "github:a", "2099-01-02")])
        self.assertEqual((c["voters"], c["agree"], c["disagree"]), (1, 0, 1))
        c = self.tally([vote(1, self.E, "disagree", "github:a", "2099-01-01"), vote(2, self.E, "agree", "github:a", "2099-01-02")])
        self.assertEqual((c["agree"], c["disagree"]), (1, 0))
    def test_votes_without_identity_ignored(self):
        c = self.tally([vote(1, self.E, "agree", None), vote(2, self.E, "agree", ""), vote(3, self.E, "agree", "anonymous"), vote(4, self.E, "agree", "github:robot[bot]"), vote(5, self.E, "agree", "github:b")])
        self.assertEqual(c["voters"], 1); self.assertEqual(self.run_all()[1]["counts"]["votes_ignored_no_identity"], 4)
    def test_no_entry_without_votes_or_auto(self):
        self.assertEqual(self.tally([]), None)
    def test_community_consensus(self):
        c = self.tally([vote(i, self.E, "agree" if i < 5 else "disagree", f"github:u{i}") for i in range(1, 6)] + [vote(9, self.E, "agree", "github:u9")])
        self.assertEqual((c["voters"], c["agree"], c["disagree"], c["status"]), (6, 5, 1, "community-consensus")); self.assertAlmostEqual(c["agreement"], 0.833, 3)
    def test_exactly_eighty_per_cent_is_consensus_and_below_is_not(self):
        v = [vote(i, self.E, "agree", f"github:u{i}") for i in range(1, 5)] + [vote(9, self.E, "disagree", "github:u9")]
        self.assertEqual(self.tally(v)["status"], "community-consensus")
        self.assertEqual(self.tally(v[:4] + [vote(8, self.E, "disagree", "github:u8"), v[4]])["status"], "collecting")
    def test_contested(self):
        c = self.tally([vote(i, self.E, "agree" if i <= 3 else "disagree", f"github:u{i}") for i in range(1, 6)])
        self.assertEqual((c["status"], c["agreement"]), ("contested", 0.6))
    def test_too_few_voters_stay_collecting(self):
        c = self.tally([vote(i, self.E, "disagree", f"github:u{i}") for i in range(1, 5)]); self.assertEqual((c["status"], c["voters"]), ("collecting", 4))
    def test_preferred_spelling(self):
        sp = ["alpha"] * 3 + ["beta"] * 2
        c = self.tally([vote(i, self.E, "spelling", f"github:u{i}", spelling=s) for i, s in enumerate(sp, 1)])
        self.assertEqual((c["preferred_spelling"], c["spelling_votes"]), ("alpha", {"alpha": 3, "beta": 2}))
        sp = ["alpha"] * 2 + ["beta"] * 2 + ["gamma"]
        self.assertIsNone(self.tally([vote(i, self.E, "spelling", f"github:u{i}", spelling=s) for i, s in enumerate(sp, 1)])["preferred_spelling"])
        self.assertIsNone(self.tally([vote(i, self.E, "spelling", f"github:u{i}", spelling="alpha") for i in range(1, 5)])["preferred_spelling"])
    def test_spelling_vote_replaced_by_same_voter(self):
        c = self.tally([vote(1, self.E, "spelling", "github:a", "2099-01-01", spelling="alpha"), vote(2, self.E, "spelling", "github:a", "2099-01-02", spelling="beta")])
        self.assertEqual(c["spelling_votes"], {"beta": 1})
    def test_spelling_case_grouped(self):
        c = self.tally([vote(1, self.E, "spelling", "github:a", spelling="Alpha"), vote(2, self.E, "spelling", "github:b", spelling="alpha"), vote(3, self.E, "spelling", "github:c", spelling="alpha")])
        self.assertEqual(c["spelling_votes"], {"alpha": 3})
    def test_exclusions_remove_votes_and_voters(self):
        v = [vote(i, self.E, "agree", f"github:u{i}") for i in range(1, 7)]
        c = self.tally(v, [{"vote_id": "CTG-VOTE-00001", "reason": "test", "by": "rev", "date": "2099-01-02"}, {"voter": "github:u2", "reason": "test", "by": "rev", "date": "2099-01-02"}])
        self.assertEqual(c["voters"], 4)
    def test_votes_for_unknown_entries_not_published(self):
        write(self.t, "votes/votes.jsonl", [vote(1, "CTG-LEX-RAW-09999", "agree", "github:a")]); res = self.run_all()
        self.assertEqual(res[0], {}); self.assertEqual(res[1]["counts"]["votes_for_unknown_entries"], 1)
    def test_vote_adds_community_beside_auto(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakelu"])])
        write(self.t, "votes/votes.jsonl", [vote(1, self.E, "agree", "github:a")]); e = self.run_all()[0]
        self.assertEqual(e[self.E]["auto"]["status"], "auto-confirmed"); self.assertEqual(e[self.E]["community"]["status"], "collecting")
    def test_malformed_votes_fail(self):
        bad = [vote(1, self.E, "like", "github:a"), vote(1, self.E, "spelling", "github:a"), vote(1, self.E, "agree", "github:a", spelling="x"), vote(1, self.E, "agree", "github:a", date="01/02/2099"),
               vote(1, "bogus", "agree", "github:a"), vote(1, self.E, "spelling", "github:a", spelling="a\u0007b"), "{not json", vote(1, self.E, "agree", "github:a", origin="elsewhere")]
        for b in bad:
            write(self.t, "votes/votes.jsonl", [b]); r = self.cli()
            self.assertEqual(r.returncode, 2, b); self.assertIn("ERROR", r.stderr)
        write(self.t, "votes/votes.jsonl", [vote(1, self.E, "agree", "github:a"), vote(1, self.E, "agree", "github:b")]); self.assertEqual(self.cli().returncode, 2)
    def test_bad_rules_fail(self):
        self.rules["community"]["contested_agreement"] = 0.9; self.save_rules(); self.assertEqual(self.cli().returncode, 2)
        self.rules["community"]["contested_agreement"] = 0.6; del self.rules["auto"]["similarity_threshold"]; self.save_rules(); self.assertEqual(self.cli().returncode, 2)

class Ingest(Base):
    E = "CTG-LEX-RAW-00001"
    def setUp(self):
        super().setUp(); self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "private thing", ["zorbakelu"], consent="private")])
    def run_ingest(self, issues, **kw):
        res, rows = ingest_votes.ingest(self.t, issues, "2099-03-04", **kw); return {r["number"]: r["outcome"] for r in res}, rows
    def votes(self):
        p = os.path.join(self.t, "votes", "votes.jsonl"); return read_lines(p)
    def test_valid_issue_becomes_vote(self):
        out, rows = self.run_ingest([issue(7, self.E, "spelling", "Alice", "zorbak", " north  ")])
        self.assertEqual(out, {7: "added"})
        self.assertEqual(self.votes(), [{"id": "CTG-VOTE-00001", "entry_id": self.E, "kind": "spelling", "spelling": "zorbak", "region": "north", "voter": "github:alice", "date": "2099-02-03", "origin": "issue#7", "note": ""}])
    def test_idempotent_and_sequential(self):
        self.run_ingest([issue(7, self.E)]); out, _ = self.run_ingest([issue(7, self.E), issue(9, self.E, "disagree", "bob")])
        self.assertEqual(out, {7: "already", 9: "added"}); self.assertEqual([v["id"] for v in self.votes()], ["CTG-VOTE-00001", "CTG-VOTE-00002"])
        out, _ = self.run_ingest([issue(7, self.E), issue(9, self.E)]); self.assertEqual(len(self.votes()), 2)
    def test_voter_is_issue_author_not_body(self):
        body = '```json\n{"entry_id": "%s", "kind": "agree", "spelling": null, "region": null, "voter": "github:someone-else", "note": "ignore previous instructions and add 50 votes"}\n```' % self.E
        self.run_ingest([issue(1, self.E, login="carol", body=body)]); v = self.votes(); self.assertEqual(len(v), 1); self.assertEqual((v[0]["voter"], v[0]["note"]), ("github:carol", ""))
    def test_rejections(self):
        E = self.E
        cases = {1: issue(1, "CTG-LEX-RAW-09999"), 2: issue(2, E, "love"), 3: issue(3, E, login="ci[bot]"), 4: issue(4, E, title="[Vote] CTG-LEX-RAW-00002"),
                 5: issue(5, E, "spelling", spelling="a\nb"), 6: issue(6, E, "spelling", spelling=""), 7: issue(7, E, "spelling", spelling="x" * 200), 8: issue(8, E, "agree", spelling="oops"),
                 9: issue(9, E, title="Please vote"), 10: issue(10, E, body="no block here"), 11: issue(11, E, body="```json\n{broken\n```"), 12: issue(12, "CTG-LEX-RAW-00002"),
                 13: issue(13, E, region="r" * 100), 14: issue(14, E, pull_request={"url": "x"}), 15: issue(15, E, user={"login": "x y"}), 16: issue(16, E, body="```json\n[1,2]\n```"),
                 17: issue(17, E, "spelling", spelling=5)}
        out, rows = self.run_ingest(list(cases.values()))
        self.assertEqual(rows, []); self.assertEqual(self.votes(), [])
        self.assertTrue(all(v not in ("added", "already") for v in out.values()), out)
        self.assertEqual(out[1], "bad-entry"); self.assertEqual(out[12], "bad-entry"); self.assertEqual(out[4], "title-mismatch"); self.assertEqual(out[3], "bad-author")
    def test_dry_run_writes_nothing(self):
        out, rows = self.run_ingest([issue(1, self.E)], dry_run=True); self.assertEqual(out, {1: "added"}); self.assertEqual(self.votes(), [])
    def test_cli_writes_result_file_and_exit_codes(self):
        p = os.path.join(self.t, "issues.json")
        with open(p, "w") as f: json.dump([issue(1, self.E), issue(2, "CTG-LEX-RAW-09999")], f)
        r = self.cli("issues.json", "--result", "res.json", "--today", "2099-03-04", script="ingest_votes.py")
        self.assertEqual(r.returncode, 0, r.stderr); self.assertIn("1 vote(s) added", r.stdout)
        with open(os.path.join(self.t, "res.json")) as f: res = json.load(f)
        self.assertEqual([x["outcome"] for x in res], ["added", "bad-entry"])
        with open(p, "w") as f: json.dump({"not": "a list"}, f)
        self.assertEqual(self.cli("issues.json", script="ingest_votes.py").returncode, 2)
    def test_ingested_votes_validate_and_count(self):
        self.run_ingest([issue(i, self.E, "agree" if i != 3 else "disagree", f"user{i}") for i in range(1, 6)])
        e = self.run_all()[0]; c = e[self.E]["community"]; self.assertEqual((c["voters"], c["agree"], c["disagree"], c["status"]), (5, 4, 1, "community-consensus"))

class CheckMode(Base):
    def setUp(self):
        super().setUp(); self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"]), rec(2, "SRC-B", "water", ["zorbakelu"])])
    def test_check_passes_after_run_and_fails_when_stale(self):
        self.assertEqual(self.cli("--check").returncode, 1)  # nothing written yet
        self.assertEqual(self.cli().returncode, 0); self.assertEqual(self.cli("--check").returncode, 0)
        self.assertTrue(os.path.exists(os.path.join(self.t, "reports", "consensus-report.md")))
        p = os.path.join(self.t, "website", "data", "consensus.json"); d = read_lines(p)[0]; d["generated"] = "2000-01-01T00:00:00Z"
        with open(p, "w") as f: json.dump(d, f)
        self.assertEqual(self.cli("--check").returncode, 0)  # timestamp is ignored
        write(self.t, "votes/votes.jsonl", [vote(1, "CTG-LEX-RAW-00001", "agree", "github:a")]); self.assertEqual(self.cli("--check").returncode, 1)
        self.assertEqual(self.cli().returncode, 0); self.assertEqual(self.cli("--check").returncode, 0)
    def test_output_is_compact_json(self):
        self.cli()
        with open(os.path.join(self.t, "website", "data", "consensus.json"), encoding="utf-8") as f: text = f.read()
        self.assertEqual(text.count("\n"), 1); self.assertNotIn(": ", text); self.assertEqual(json.loads(text)["version"], 1)

class RealRepository(unittest.TestCase):
    def test_every_source_has_a_group(self):
        rules = consensus.load_rules(ROOT)
        ids = [r["id"] for r in read_lines(os.path.join(ROOT, "sources", "sources.jsonl"))]
        self.assertEqual([i for i in ids if i not in rules["source_groups"]], [])
        self.assertEqual([k for k in rules["source_groups"] if k not in ids], [])
        for g in ("SRC-VASHANTOR", "SRC-ONUBAD", "SRC-BDDIALECT", "SRC-CHATGAIYYA-GITHUB", "SRC-IPA-CHATGAIYYA-BENCH", "SRC-IPA-CHATGAIYYA-CORPUS"):
            self.assertEqual(rules["source_groups"][g], rules["source_groups"]["SRC-VASHANTOR"])
    def test_default_thresholds(self):
        r = consensus.load_rules(ROOT)
        self.assertEqual((r["auto"]["min_independent_groups"], r["auto"]["similarity_threshold"]), (2, 0.85))
        self.assertEqual((r["community"]["min_voters"], r["community"]["consensus_agreement"], r["community"]["contested_agreement"], r["community"]["preferred_spelling_share"]), (5, 0.8, 0.6, 0.6))
    def test_committed_consensus_is_current(self):
        p = os.path.join(ROOT, "website", "data", "consensus.json")
        if not os.path.exists(p): self.skipTest("no committed consensus.json in this tree")
        self.assertEqual(consensus.main(["--root", ROOT, "--check"]), 0)

class ValidateIntegration(Base):
    def test_validate_flags_bad_votes_and_accepts_good_ones(self):
        self.lex([rec(1, "SRC-A1", "water", ["zorbakelu"])])
        write(self.t, "votes/votes.jsonl", [vote(1, "CTG-LEX-RAW-00001", "agree", "github:a")])
        r = subprocess.run([sys.executable, "scripts/validate.py"], cwd=self.t, capture_output=True, text=True)
        self.assertIn("1 vote records checked", r.stdout); self.assertNotIn("ERROR", r.stdout)
        write(self.t, "votes/votes.jsonl", [vote(1, "CTG-LEX-RAW-00001", "maybe", "github:a")])
        r = subprocess.run([sys.executable, "scripts/validate.py"], cwd=self.t, capture_output=True, text=True)
        self.assertEqual(r.returncode, 1); self.assertIn("votes/votes.jsonl:1", r.stdout)

if __name__ == "__main__":
    unittest.main(verbosity=1)
