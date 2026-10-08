"""Tests for batch vote issues ('[Vote] 3 votes' with a JSON list) in scripts/ingest_votes.py.
Run from the repository root:  python3 scripts/tests/test_votes_batch.py
Uses temporary directories and invented placeholder words only."""
import json, os, shutil, sys, tempfile, unittest
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ingest_votes, test_consensus as tc  # noqa: E402


def batch(num, items, login="alice", title=None):
    body = "Sent from Dadi.\n\n```json\n" + json.dumps(items) + "\n```\n"
    return {"number": num, "title": title or f"[Vote] {len(items)} votes", "body": body, "user": {"login": login}, "labels": [], "created_at": "2099-02-03T10:00:00Z"}


class BatchTests(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp()
        shutil.copytree(os.path.join(tc.ROOT, "schemas"), os.path.join(self.root, "schemas"))
        tc.write(self.root, "lexicon/raw/a.jsonl", [tc.rec(1, "SRC-A1", "water", ["zorbakelu"]), tc.rec(2, "SRC-A1", "fire", ["quentabo"])])
        tc.write(self.root, "votes/votes.jsonl", [])
    def tearDown(self): shutil.rmtree(self.root)

    def test_batch_adds_each_valid_vote_once(self):
        items = [{"entry_id": "CTG-LEX-RAW-00001", "kind": "agree", "spelling": None, "region": None},
                 {"entry_id": "CTG-LEX-RAW-00002", "kind": "spelling", "spelling": "quentabo", "region": None}]
        res, rows = ingest_votes.ingest(self.root, [batch(5, items)], today="2099-02-03")
        self.assertEqual(len(rows), 2); self.assertEqual({r["voter"] for r in rows}, {"github:alice"})
        res2, rows2 = ingest_votes.ingest(self.root, [batch(5, items)], today="2099-02-03")
        self.assertEqual(len(rows2), 0)

    def test_bad_items_are_dropped_not_the_batch(self):
        items = [{"entry_id": "CTG-LEX-RAW-00001", "kind": "agree"}, {"entry_id": "NOPE", "kind": "agree"}, {"entry_id": "CTG-LEX-RAW-00002", "kind": "shout"}]
        res, rows = ingest_votes.ingest(self.root, [batch(6, items)], today="2099-02-03")
        self.assertEqual(len(rows), 1); self.assertIn("could not be counted", res[0]["message"])

    def test_rejections(self):
        ok_item = [{"entry_id": "CTG-LEX-RAW-00001", "kind": "agree"}]
        self.assertEqual(ingest_votes.ingest(self.root, [batch(7, ok_item, login="robot[bot]")], today="2099-02-03")[1], [])
        self.assertEqual(ingest_votes.ingest(self.root, [batch(8, ok_item * 41, title="[Vote] 41 votes")], today="2099-02-03")[1], [])
        bad = batch(9, ok_item); bad["body"] = "no block here"
        self.assertEqual(ingest_votes.ingest(self.root, [bad], today="2099-02-03")[1], [])


if __name__ == "__main__":
    unittest.main()
