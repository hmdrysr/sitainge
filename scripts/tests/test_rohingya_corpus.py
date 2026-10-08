"""Tests for corpus/rohingya/*.jsonl. Standard library only. Run: python3 scripts/tests/test_rohingya_corpus.py"""
import glob, json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REQUIRED = ["id", "language", "language_name", "state", "unit", "form_as_submitted", "english_gloss", "source",
            "evidence_level", "confidence", "ai_assisted", "provenance", "consent", "licence_note"]
BANNED = [(0x0590, 0x08FF), (0x0900, 0x0DFF), (0x1000, 0x109F), (0xFB1D, 0xFDFF), (0xFE70, 0xFEFF), (0x10D00, 0x10D3F),
          (0x0370, 0x052F), (0x3000, 0x9FFF)]


def non_latin(text):
    bad = set()
    for ch in text:
        cp = ord(ch)
        if any(a <= cp <= b for a, b in BANNED):
            bad.add(ch)
        elif not ch.isascii() and unicodedata.category(ch).startswith("L"):
            if not ("LATIN" in unicodedata.name(ch, "") or 0x0250 <= cp <= 0x02FF or 0x2070 <= cp <= 0x209F):
                bad.add(ch)
    return bad


def load():
    recs = []
    for p in sorted(glob.glob(os.path.join(ROOT, "corpus", "rohingya", "*.jsonl"))):
        with open(p, encoding="utf-8") as f:
            for n, line in enumerate(f, 1):
                if line.strip():
                    recs.append((f"{os.path.basename(p)}:{n}", json.loads(line)))
    return recs


def main():
    recs = load()
    problems = []
    if not recs:
        problems.append("no Rohingya records found")
    src_ids = set()
    for p in glob.glob(os.path.join(ROOT, "sources", "*.jsonl")):
        for line in open(p, encoding="utf-8"):
            if line.strip():
                src_ids.add(json.loads(line)["id"])
    ids = set()
    for where, r in recs:
        for k in REQUIRED:
            if r.get(k) in (None, ""):
                problems.append(f"{where} missing {k}")
        if r.get("id") in ids:
            problems.append(f"{where} duplicate id {r.get('id')}")
        ids.add(r.get("id"))
        if not re.match(r"^RHG-(WRD|SEN)-RAW-[0-9]{5}$", str(r.get("id"))):
            problems.append(f"{where} bad id")
        if r.get("language") != "rhg" or r.get("language_name") != "Rohingya":
            problems.append(f"{where} language must be rhg / Rohingya")
        if r.get("state") != "RAW":
            problems.append(f"{where} state must be RAW")
        if r.get("evidence_level") != "unassessed":
            problems.append(f"{where} evidence_level must be unassessed")
        if r.get("consent") != "research-only":
            problems.append(f"{where} consent must be research-only")
        if r.get("unit") not in ("word", "phrase", "sentence"):
            problems.append(f"{where} bad unit")
        if r.get("source") not in src_ids:
            problems.append(f"{where} source {r.get('source')} not in sources.jsonl")
        if not isinstance(r.get("ai_assisted"), bool):
            problems.append(f"{where} ai_assisted must be true or false")
        bad = non_latin(json.dumps(r, ensure_ascii=False))
        if bad:
            problems.append(f"{where} non-Latin script characters {sorted(bad)}")
        if re.search(r"chattogram|chittagonian", str(r.get("form_note", "")) + str(r.get("english_gloss", "")), re.I):
            problems.append(f"{where} mentions Chittagonian in a gloss or form note; Rohingya must not be presented as Chittagonian")
    print(f"{len(recs)} Rohingya records checked; {len(problems)} problems")
    for m in problems[:50]:
        print("FAIL", m)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
