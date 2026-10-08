"""Structural checks for corpus/rohingya/*.jsonl (Rohingya, ISO 639-3 rhg). Standard library only.
Separate from the Chittagonian checks on purpose. Never decides linguistic truth."""
import glob, json, os, re, unicodedata
import newrecords

# Ranges that must never appear: Bangla/Assamese, Devanagari, Gurmukhi/Gujarati, Burmese, Arabic and its extensions,
# Hanifi Rohingya, Thaana/Syriac/Hebrew. Latin, IPA, combining marks, digits and punctuation are allowed.
BANNED = [(0x0590, 0x08FF), (0x0900, 0x0DFF), (0x1000, 0x109F), (0xA9E0, 0xA9FF), (0xAA60, 0xAA7F),
          (0xFB1D, 0xFDFF), (0xFE70, 0xFEFF), (0x10D00, 0x10D3F), (0x0370, 0x03FF), (0x0400, 0x052F), (0x3000, 0x9FFF)]

def bad_chars(text):
    out = []
    for ch in text:
        cp = ord(ch)
        if any(a <= cp <= b for a, b in BANNED):
            out.append(ch); continue
        if ch.isascii() or ch.isspace():
            continue
        cat = unicodedata.category(ch)
        name = unicodedata.name(ch, "")
        if cat.startswith("L") and not ("LATIN" in name or 0x0250 <= cp <= 0x02FF or 0x2070 <= cp <= 0x209F):
            out.append(ch)
    return out

def source_ids(root):
    ids = set()
    for p in glob.glob(os.path.join(root, "sources", "*.jsonl")):
        for _n, r, _e in newrecords.read_jsonl(p):
            if r and r.get("id"): ids.add(r["id"])
    return ids

def check_rohingya(root="."):
    errors, warnings, seen = [], [], set()
    schema_path = os.path.join(root, "schemas", "rohingya_entry.schema.json")
    files = sorted(glob.glob(os.path.join(root, "corpus", "rohingya", "*.jsonl")))
    if not files: return errors, warnings, 0
    schema = json.load(open(schema_path, encoding="utf-8"))
    known = source_ids(root)
    n = 0
    for path in files:
        for ln, r, err in newrecords.read_jsonl(path):
            where = f"{path}:{ln}"
            if err: errors.append(f"{where} invalid JSON: {err}"); continue
            n += 1
            for p in newrecords.check(r, schema): errors.append(f"{where} {p}")
            rid = r.get("id")
            if rid in seen: errors.append(f"{where} duplicate id {rid}")
            seen.add(rid)
            if r.get("source") not in known: errors.append(f"{where} unknown source id {r.get('source')}")
            kind = (rid or "")[4:7]
            if kind == "WRD" and r.get("unit") != "word": errors.append(f"{where} WRD id needs unit word")
            if kind == "SEN" and r.get("unit") not in ("phrase", "sentence"): errors.append(f"{where} SEN id needs unit phrase or sentence")
            blob = json.dumps(r, ensure_ascii=False)
            bad = bad_chars(blob)
            if bad: errors.append(f"{where} non-Latin script characters: {''.join(sorted(set(bad)))[:20]!r}")
            if re.search(r"chattogram", blob, re.I): errors.append(f"{where} uses Chattogram; write Chittagong")
            if r.get("ai_assisted") is False and "WebFetch" in str(r.get("confidence")): errors.append(f"{where} ai_assisted false but confidence cites WebFetch")
    return errors, warnings, n
