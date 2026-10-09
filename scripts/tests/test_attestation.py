"""Tests for the attestation rule in scripts/consensus.py. Run: python3 scripts/tests/test_attestation.py"""
import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
import consensus as C

def item(i, g, d, *forms):
    it = C.Item(); it.id = i; it.group = g; it.source = g; it.gloss = "x"; it.date = d
    it.forms = [(f, C.exact_key(f), C.fuzzy_key(f), False) for f in forms]; return it

R = {"attestation": {"preferred_min_independent_groups": 3, "preferred_min_distinct_dates": 2}}

class T(unittest.TestCase):
    def test_three_sources_preferred(self):
        a = C.attestation([item("1", "a", "2026-01-01", "fua"), item("2", "b", "2026-02-01", "fua"), item("3", "c", "2026-03-01", "fua"), item("4", "d", "2026-03-01", "poa")], R)
        self.assertEqual((a["preferred_form"], a["preferred_basis"]), ("fua", "attested-3-sources"))
    def test_same_day_is_not_three_times(self):
        a = C.attestation([item(str(i), g, "2026-01-01", "fua") for i, g in enumerate("abc")] + [item("9", "d", "2026-01-01", "poa")], R)
        self.assertEqual(a["preferred_basis"], "most-attested")
    def test_tie_then_votes(self):
        ms = [item("1", "a", "", "fua"), item("2", "b", "", "poa")]
        a = C.attestation(ms, R); self.assertEqual(a["preferred_basis"], "tie")
        ent = {"1": a, "2": a}; C.apply_vote_tiebreak(ent, {"2": {"preferred_spelling": "poa"}})
        self.assertEqual((a["preferred_form"], a["preferred_basis"]), ("poa", "votes"))
    def test_same_group_counts_once(self):
        a = C.attestation([item("1", "a", "2026-01-01", "fua"), item("2", "a", "2026-02-01", "fua"), item("3", "a", "2026-03-01", "fua")], R)
        self.assertEqual(a["attestation"][0]["groups"], 1)

if __name__ == "__main__": unittest.main()
