"""Structural checks for votes and consensus rules, called from scripts/validate.py. Never judges linguistic truth."""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import consensus


def check_votes(root, known_ids):
    errors, warnings, n_rows = [], [], 0
    try:
        rules = consensus.load_rules(root)
    except consensus.ConsensusError as e:
        return [f"consensus rules: {e}"], [], 0
    src = os.path.join(root, "sources", "sources.jsonl")
    if os.path.exists(src):
        with open(src, encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try: sid = json.loads(line).get("id")
                    except json.JSONDecodeError: continue
                    if sid and sid not in rules["source_groups"]:
                        warnings.append(f"schemas/consensus_rules.json: source {sid} has no independence group (it will count as its own group)")
    seen_ids, seen_origin = set(), set()
    for rel in ("votes/votes.jsonl",):
        p = os.path.join(root, rel)
        if not os.path.exists(p): continue
        with open(p, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                if not line.strip(): continue
                where = f"{rel}:{n}"; n_rows += 1
                try: v = json.loads(line)
                except json.JSONDecodeError as e: errors.append(f"{where} invalid JSON: {e}"); continue
                msg = consensus.check_vote_row(v)
                if msg: errors.append(f"{where} {msg}"); continue
                if v["id"] in seen_ids: errors.append(f"{where} duplicate vote id {v['id']}")
                seen_ids.add(v["id"])
                org = v.get("origin", "manual")
                if org != "manual":
                    if org in seen_origin: errors.append(f"{where} origin {org} used twice")
                    seen_origin.add(org)
                if v["entry_id"] not in known_ids: warnings.append(f"{where} vote for an entry that is not in the lexicon: {v['entry_id']}")
                if not v.get("voter"): warnings.append(f"{where} vote has no voter identity and will be ignored")
    xp = os.path.join(root, "votes", "exclusions.jsonl")
    if os.path.exists(xp):
        with open(xp, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                if not line.strip(): continue
                try: x = json.loads(line)
                except json.JSONDecodeError as e: errors.append(f"votes/exclusions.jsonl:{n} invalid JSON: {e}"); continue
                msg = consensus.check_exclusion_row(x)
                if msg: errors.append(f"votes/exclusions.jsonl:{n} {msg}")
                elif x.get("vote_id") and x["vote_id"] not in seen_ids: warnings.append(f"votes/exclusions.jsonl:{n} names a vote id that is not in votes.jsonl")
    return errors, warnings, n_rows
