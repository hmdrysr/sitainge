"""Structural validation only. Never decides linguistic truth."""
import json, sys, glob, unicodedata, collections
STATES = {"RAW","REVIEW","ACCEPTED","ARCHIVED"}
LEVELS = {"A","B","C","D","E","unassessed"}
CONSENT = {"public","research-only","restricted","private","withdrawn","permission pending"}
REQ = ["id","state","form_as_submitted","english_gloss","source","evidence_level","confidence","ai_assisted","provenance","consent"]
errors, warnings, ids, forms = [], [], set(), collections.defaultdict(list)

for path in glob.glob("datasets/*.jsonl") + glob.glob("lexicon/*/*.jsonl"):
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        if not line.strip(): continue
        where = f"{path}:{n}"
        try: r = json.loads(line)
        except json.JSONDecodeError as e: errors.append(f"{where} invalid JSON: {e}"); continue
        for k in REQ:
            if k not in r or r[k] in (None, ""): errors.append(f"{where} missing {k}")
        if r.get("id") in ids: errors.append(f"{where} duplicate id {r.get('id')}")
        ids.add(r.get("id"))
        if r.get("state") not in STATES: errors.append(f"{where} bad state")
        if r.get("evidence_level") not in LEVELS: errors.append(f"{where} bad evidence_level")
        if r.get("state") in {"ACCEPTED"} and r.get("evidence_level") in {"D","E","unassessed"}:
            errors.append(f"{where} ACCEPTED requires evidence level A-C")
        if r.get("state") in {"REVIEW","ACCEPTED"} and r.get("evidence_level") == "unassessed":
            errors.append(f"{where} must have an evidence level before review")
        if r.get("consent") not in CONSENT: errors.append(f"{where} bad consent status")
        for field in ("form_as_submitted","reference_form","english_gloss"):
            v = r.get(field)
            if isinstance(v,str) and unicodedata.normalize("NFC", v) != v: errors.append(f"{where} {field} not NFC")
        if r.get("ai_assisted") and r.get("state") == "ACCEPTED" and not r["provenance"].get("reviewer"):
            errors.append(f"{where} AI-assisted record accepted without named human reviewer")
        p = r.get("provenance") or {}
        for k in ("submitted_by","date_submitted","origin","decision_history"):
            if k not in p: errors.append(f"{where} provenance missing {k}")
        forms[(r.get("form_as_submitted"), r.get("english_gloss"))].append(r.get("id"))
for k, v in forms.items():
    if len(v) > 1: warnings.append(f"possible duplicate {k}: {v}")
aud_ids = set()
for path in glob.glob("audio/catalogue/*.jsonl"):
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        if not line.strip(): continue
        where = f"{path}:{n}"
        try: r = json.loads(line)
        except json.JSONDecodeError as e: errors.append(f"{where} invalid JSON: {e}"); continue
        for k in ("id","sha256","consent","file","speaker_id","source"):
            if not r.get(k): errors.append(f"{where} missing {k}")
        if r.get("id") in aud_ids: errors.append(f"{where} duplicate audio id {r.get('id')}")
        aud_ids.add(r.get("id"))
        if r.get("consent") not in CONSENT | {"research-only"}: errors.append(f"{where} bad audio consent")
        if r.get("consent") != "public" and not str(r.get("file","")).startswith(("audio/staging/","audio/private/")):
            errors.append(f"{where} non-public audio must not be stored outside audio/staging or audio/private")
print(f"{len(aud_ids)} audio catalogue entries")
print(f"{len(ids)} records checked; {len(errors)} errors; {len(warnings)} warnings")
for m in errors: print("ERROR  ", m)
for m in warnings: print("WARNING", m)
sys.exit(1 if errors else 0)
