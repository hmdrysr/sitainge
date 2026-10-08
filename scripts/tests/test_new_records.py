"""Offline tests for the newer record types, validate.py additions and coverage_report.py.
Run from the repository root:  python3 -m unittest scripts/tests/test_new_records.py   (or python3 scripts/tests/test_new_records.py)
Uses temporary directories only. Placeholder values are marked [TEST]; no Chittagonian appears here."""
import json, os, shutil, subprocess, sys, tempfile, unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import newrecords, coverage_report  # noqa: E402

SES = {"id": "CTG-SES-00001", "date": "2099-01-01", "interviewer": "interviewer-A", "place": {"district": "[TEST]", "upazila": "[TEST]"},
       "style": "wordlist", "device": "[TEST] phone", "prompt_sets": ["leipzig-jakarta-100"],
       "consent": {"record": True, "research_archive": True, "publish_cc0": False, "credit": "pseudonymous", "ai_processing": False},
       "entry_consent": "research-only"}
REC = {"id": "CTG-REC-00001", "session_id": "CTG-SES-00001", "speaker_id": "CTG-SPK-00001", "file_name": "[TEST].wav", "sha256": "0" * 64,
       "duration_s": 61.5, "format": {"container": "wav", "sample_rate_hz": 48000, "bit_depth": 24, "channels": 1}, "quality": "good",
       "access_tier": "research-only", "archive_location": "[TEST] archive"}
SPK = {"id": "CTG-SPK-00001", "age_band": "30-59", "gender": "not stated", "place": {"district": "[TEST]", "upazila": "[TEST]"}}
LEX = {"id": "CTG-LEX-RAW-00001", "state": "RAW", "form_as_submitted": "[TEST]", "english_gloss": "water", "source": "SRC-TEST", "evidence_level": "unassessed",
       "confidence": "unverified", "ai_assisted": False, "consent": "research-only",
       "provenance": {"submitted_by": "t", "date_submitted": "2099-01-01", "origin": "t", "decision_history": []}}

def load(p):
    with open(p, encoding="utf-8") as f: return json.load(f)

def write(root, rel, recs):
    p = os.path.join(root, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        for r in recs: f.write((r if isinstance(r, str) else json.dumps(r)) + "\n")

class Base(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.mkdtemp()
        shutil.copytree(os.path.join(ROOT, "schemas"), os.path.join(self.t, "schemas"))
        shutil.copytree(os.path.join(ROOT, "scripts"), os.path.join(self.t, "scripts"), ignore=shutil.ignore_patterns("__pycache__", "tests"))
    def tearDown(self): shutil.rmtree(self.t, ignore_errors=True)
    def run_validate(self):
        return subprocess.run([sys.executable, "scripts/validate.py"], cwd=self.t, capture_output=True, text=True)

class RecordChecks(Base):
    def test_valid_records_pass(self):
        write(self.t, "sessions/s.jsonl", [SES]); write(self.t, "recordings/r.jsonl", [REC]); write(self.t, "speakers/p.jsonl", [SPK])
        e, w, counts, _ = newrecords.check_new_records(self.t)
        self.assertEqual(e, []); self.assertEqual(w, []); self.assertEqual(counts, {"session": 1, "recording": 1, "speaker": 1})
    def test_speaker_cannot_carry_identifying_fields(self):
        write(self.t, "speakers/p.jsonl", [dict(SPK, name="[TEST]")])
        e, *_ = newrecords.check_new_records(self.t); self.assertTrue(any("not allowed" in m for m in e))
    def test_bad_hash_and_duplicate_id(self):
        write(self.t, "recordings/r.jsonl", [dict(REC, sha256="xyz"), REC, REC])
        e, *_ = newrecords.check_new_records(self.t)
        self.assertTrue(any("sha256" in m for m in e)); self.assertTrue(any("duplicate" in m for m in e))
    def test_public_entry_consent_needs_cc0_agreement(self):
        write(self.t, "sessions/s.jsonl", [dict(SES, entry_consent="public")])
        e, *_ = newrecords.check_new_records(self.t); self.assertTrue(any("publish_cc0" in m for m in e))
    def test_unknown_session_is_a_warning_only(self):
        write(self.t, "sessions/s.jsonl", [SES]); write(self.t, "recordings/r.jsonl", [dict(REC, session_id="CTG-SES-00009")])
        e, w, *_ = newrecords.check_new_records(self.t); self.assertEqual(e, []); self.assertEqual(len(w), 1)
    def test_invalid_json_line_is_reported(self):
        write(self.t, "sources/s.jsonl", ["{not json"])
        e, *_ = newrecords.check_new_records(self.t); self.assertTrue(any("invalid JSON" in m for m in e))

class ValidateScript(Base):
    def test_unchanged_behaviour_without_new_folders(self):
        write(self.t, "lexicon/raw/a.jsonl", [LEX])
        r = self.run_validate(); self.assertEqual(r.returncode, 0, r.stdout); self.assertIn("1 records checked; 0 errors", r.stdout)
    def test_folder_state_mismatch_warns_without_failing(self):
        write(self.t, "lexicon/review/a.jsonl", [LEX])  # RAW record in review/
        r = self.run_validate(); self.assertEqual(r.returncode, 0, r.stdout); self.assertIn("WARNING lexicon/review/a.jsonl:1 state RAW", r.stdout)
    def test_new_record_errors_give_exit_code_1(self):
        write(self.t, "speakers/p.jsonl", [dict(SPK, id="bad")])
        r = self.run_validate(); self.assertEqual(r.returncode, 1); self.assertIn("ERROR", r.stdout)
    def test_old_errors_still_fail(self):
        write(self.t, "lexicon/raw/a.jsonl", [dict(LEX, consent="nonsense")])
        self.assertEqual(self.run_validate().returncode, 1)

class Shipped(unittest.TestCase):
    def test_shipped_data_validates(self):
        e, w, counts, recs = newrecords.check_new_records(ROOT)
        self.assertEqual(e, [], e[:3])
        self.assertEqual(counts.get("prompt", 0), len(recs.get("prompt", [])))
    def test_leipzig_jakarta_has_100_ranked_meanings(self):
        rows = [r for _, r, _e in newrecords.read_jsonl(os.path.join(ROOT, "prompts", "leipzig-jakarta-100.jsonl"))]
        self.assertEqual([r["rank"] for r in rows], list(range(1, 101)))
    def test_prompts_are_english_ascii_only(self):
        for name in os.listdir(os.path.join(ROOT, "prompts")):
            if name.endswith(".jsonl"):
                for _, r, _e in newrecords.read_jsonl(os.path.join(ROOT, "prompts", name)):
                    for k in ("meaning_en", "prompt_en"):
                        if k in r: self.assertTrue(r[k].isascii(), r)
    def test_source_status_values(self):
        for _, r, _e in newrecords.read_jsonl(os.path.join(ROOT, "sources", "sources.jsonl")):
            self.assertIn(r["status"], ("checked", "pointer, unchecked"))
            if r["status"] == "checked": self.assertTrue(r["checked_on"])
    def test_lexical_entry_v2_accepts_both_id_forms(self):
        schema = load(os.path.join(ROOT, "schemas", "lexical_entry_v2.schema.json"))
        v2 = {"id": "CTG-LEX-00001", "state": "RAW", "headword_as_heard": "[TEST]", "senses": [{"gloss_en": "water"}], "source": "SRC-TEST", "evidence_level": "unassessed",
              "ai_assisted": False, "consent": "research-only", "provenance": {"submitted_by": "t", "date_submitted": "2099-01-01", "origin": "t", "decision_history": []},
              "place": {"district": "[TEST]", "upazila": "[TEST]"}, "recording_ids": ["CTG-REC-00001"],
              "confirmations": [{"speaker_id": "CTG-SPK-00001", "date": "2099-01-01", "outcome": "confirmed"}], "evidence": {"form": "C", "gloss": "B"}}
        self.assertEqual(newrecords.check(v2, schema), [])
        self.assertEqual(newrecords.check(dict(v2, id="CTG-LEX-RAW-00001"), schema), [])
        self.assertNotEqual(newrecords.check(dict(v2, id="CTG-LEX-1"), schema), [])
        self.assertNotEqual(newrecords.check(dict(v2, senses=[]), schema), [])
        try:
            import jsonschema
            jsonschema.Draft202012Validator.check_schema(schema)
            self.assertEqual(list(jsonschema.Draft202012Validator(schema).iter_errors(v2)), [])
        except ImportError:
            pass
    def test_all_schemas_are_valid_draft_2020_12(self):
        try: import jsonschema
        except ImportError: self.skipTest("jsonschema not installed")
        for n in os.listdir(os.path.join(ROOT, "schemas")):
            if n.endswith(".schema.json"):
                s = load(os.path.join(ROOT, "schemas", n))
                self.assertEqual(s["$schema"], "https://json-schema.org/draft/2020-12/schema")
                jsonschema.Draft202012Validator.check_schema(s)

class Coverage(Base):
    def test_empty_repository_says_no_data(self):
        text = coverage_report.build(self.t)
        self.assertIn("No data", text); self.assertIn("Total entries read from `datasets/` and `lexicon/*/`: **0**", text)
    def test_counts_and_leipzig_match(self):
        write(self.t, "lexicon/raw/a.jsonl", [LEX, dict(LEX, id="CTG-LEX-RAW-00002", english_gloss="to drink")])
        shutil.copytree(os.path.join(ROOT, "prompts"), os.path.join(self.t, "prompts"))
        text = coverage_report.build(self.t)
        self.assertIn("**2**", text); self.assertIn("With at least one existing entry (any state, any evidence level): **2**", text)
        self.assertIn("evidence level A to C in review or accepted: **0**", text)
    def test_cli_writes_file(self):
        out = os.path.join(self.t, "reports", "coverage.md")
        subprocess.run([sys.executable, "scripts/coverage_report.py", "--root", self.t], cwd=self.t, check=True, capture_output=True)
        self.assertTrue(os.path.exists(out))

if __name__ == "__main__": unittest.main()
