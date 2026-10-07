"""Reviewer tool. Converts a chatbot interview submission into RAW records.
Structural only; it never judges linguistic truth and never accepts anything."""
import argparse, glob, hashlib, json, os, re, sys, unicodedata, zipfile
import yaml

START, END = "=== SITAINGE SUBMISSION START ===", "=== SITAINGE SUBMISSION END ==="
TYPES = {"word","sentence","proverb","idiom","riddle","rhyme","song_line","place_name","story","other"}
STATUS = {"used","not_used","unsure","skipped"}
CONF = {"sure":"speaker: sure","fairly_sure":"speaker: fairly sure","not_sure":"speaker: not sure"}

def nfc(v): return unicodedata.normalize("NFC", v) if isinstance(v, str) else v

IPA_NOTE = re.compile(r"^IPA:\s*(.+?)\s*\[status:\s*([a-z\-]+)\]\s*(.*)$", re.S)
IPA_STATUS = {"none", "speaker-described", "speaker-chosen-by-ear", "audio-transcribed", "phonetician-verified", "ai-drafted-unverified"}

def split_ipa(note):
    """The Dadi app writes the IPA a speaker chose as: 'IPA: <ipa> [status: <status>]'. Anything else stays a plain note."""
    m = IPA_NOTE.match(note or "")
    if not m: return None, None, note or None
    status = m.group(2) if m.group(2) in IPA_STATUS else "speaker-chosen-by-ear"
    return nfc(m.group(1)), status, (m.group(3) or None)

def next_txt_id(root):
    top = 0
    for p in glob.glob(os.path.join(root, "corpus", "texts", "*")):
        for line in open(p, encoding="utf-8"):
            m = re.search(r"CTG-TXT-RAW-(\d{5})", line)
            if m: top = max(top, int(m.group(1)))
    return top + 1

def extract(text):
    if START in text:
        text = text.split(START,1)[1]
        text = text.split(END,1)[0]
    data = yaml.safe_load(text)
    if not isinstance(data, dict): raise ValueError("submission is not a YAML mapping")
    return data

def check(d):
    errs = []
    for k in ("sitainge_interview_version","interview_id","consent","speaker","items","review"):
        if k not in d: errs.append(f"missing top-level key {k}")
    if errs: return errs
    if d["sitainge_interview_version"] != 1: errs.append("unsupported version")
    for it in d["items"]:
        n = it.get("n")
        for k in ("n","type","prompt_english","status"):
            if it.get(k) in (None,""): errs.append(f"item {n}: missing {k}")
        if it.get("type") not in TYPES: errs.append(f"item {n}: bad type {it.get('type')}")
        if it.get("status") not in STATUS: errs.append(f"item {n}: bad status {it.get('status')}")
        if it.get("status") == "used" and not it.get("response_as_given"):
            errs.append(f"item {n}: status used but no response")
    cnt = d["review"].get("item_count")
    if cnt is not None and cnt != len(d["items"]):
        errs.append(f"item_count {cnt} does not match {len(d['items'])} items")
    if str(d["review"].get("read_back_confirmed")).lower() != "yes":
        errs.append("read_back_confirmed is not yes")
    acons = (d.get("consent") or {}).get("audio_consent", "none")
    for it in d["items"]:
        if it.get("audio_file"):
            if acons not in ("public", "research_only"):
                errs.append(f"item {it.get('n')}: has audio but audio_consent is {acons}")
            if not it.get("audio_sha256"):
                errs.append(f"item {it.get('n')}: audio has no sha256")
    want = d["review"].get("items_sha256")
    if want:
        got = hashlib.sha256(json.dumps(d["items"], ensure_ascii=False, separators=(",", ":")).encode("utf-8")).hexdigest()
        if got != want:
            errs.append("items_sha256 does not match: the submission may have been edited or damaged in transit")
    return errs

def next_id(root):
    top = 0
    for p in glob.glob(os.path.join(root,"datasets","*.jsonl")) + glob.glob(os.path.join(root,"lexicon","*","*.jsonl")):
        for line in open(p, encoding="utf-8"):
            m = re.search(r'"id":\s*"CTG-LEX-RAW-(\d{5})"', line)
            if m: top = max(top, int(m.group(1)))
    return top + 1

def read_input(path):
    """Returns (text, audio_bytes_by_name). Accepts a .txt/.yaml submission or a .zip bundle."""
    if path.lower().endswith(".zip"):
        z = zipfile.ZipFile(path)
        bad = z.testzip()
        if bad: sys.exit(f"zip is damaged at {bad}")
        names = z.namelist()
        if "submission.txt" not in names: sys.exit("zip has no submission.txt")
        return z.read("submission.txt").decode("utf-8"), {n: z.read(n) for n in names if n.startswith("audio/") and not n.endswith("/")}
    return open(path, encoding="utf-8").read(), {}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file"); ap.add_argument("--speaker-id", required=True, help="e.g. CTG-SPK-00001, assigned by a steward")
    ap.add_argument("--root", default="."); ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--allow-errors", action="store_true")
    a = ap.parse_args()
    if not re.fullmatch(r"CTG-SPK-\d{5}", a.speaker_id): sys.exit("speaker id must look like CTG-SPK-00001")
    text, audio = read_input(a.file)
    d = extract(text)
    errs = check(d)
    for it in d.get("items", []):
        f = it.get("audio_file")
        if not f: continue
        if f not in audio: errs.append(f"item {it.get('n')}: {f} is listed but missing from the zip"); continue
        if it.get("audio_sha256") and hashlib.sha256(audio[f]).hexdigest() != it["audio_sha256"]:
            errs.append(f"item {it.get('n')}: audio fingerprint does not match {f}")
    for e in errs: print("PROBLEM:", e)
    if errs and not a.allow_errors: sys.exit("fix the problems above or use --allow-errors after review")
    iid = str(d["interview_id"]); sp = d["speaker"]; c = d["consent"]
    web = d.get("capture_method", "chatbot") == "web_form"
    publish = str(c.get("publish_cc0")).lower() == "yes"
    consent = "public" if publish else "permission pending"
    nid = next_id(a.root); tid = next_txt_id(a.root); recs = []; other = []; texts = []
    acons = c.get("audio_consent", "none")
    audio_consent = "public" if (acons == "public" and publish) else "research-only"
    aud_ids = {it["n"]: f"AUD-{iid}-{int(it['n']):04d}" for it in d["items"] if it.get("audio_file") and it["status"] == "used"}
    for it in d["items"]:
        if it["status"] != "used": continue
        if it["type"] == "word":
            ipa, ipa_status, pron_rest = split_ipa(it.get("pronunciation_note"))
            recs.append({
              "id": f"CTG-LEX-RAW-{nid:05d}", "state": "RAW",
              "form_as_submitted": nfc(str(it["response_as_given"])), "reference_form": None,
              "variants": [nfc(str(v)) for v in (it.get("variants_given") or [])],
              "pronunciation": pron_rest, "ipa": ipa, "ipa_status": ipa_status or "none", "ipa_source": (f"{iid}" if ipa else None),
              "spellings": [nfc(str(it["response_as_given"]))] + [nfc(str(v)) for v in (it.get("variants_given") or [])],
              "english_gloss": it["prompt_english"], "part_of_speech": None,
              "example_sentence": None, "region": sp.get("locality_as_given") or None,
              "generation": sp.get("age_group") or None, "register": it.get("context_given") or None,
              "speaker_id": a.speaker_id, "recording": aud_ids.get(it["n"]), "source": f"SRC-{iid}",
              "evidence_level": "unassessed",
              "confidence": CONF.get(it.get("speaker_confidence"), "unverified"),
              "ai_assisted": not web,
              "notes": ("Captured by web form; unverified; needs native-speaker verification." if web else "Elicited by AI-assisted interview; AI-assisted / unverified; needs native-speaker verification.") + (f" Speaker comment: {it['speaker_comment']}" if it.get("speaker_comment") else ""),
              "comparative_data": None,
              "provenance": {"submitted_by": "interview contributor (credit: %s)" % c.get("credit","anonymous"),
                             "date_submitted": str(d.get("date","unknown")), "origin": ("web form " if web else "chatbot interview ") + iid,
                             "reviewer": None, "review_date": None, "decision_history": []},
              "consent": consent})
            nid += 1
        else:
            other.append(it)
            if it["type"] == "sentence" and it["status"] == "used":
                texts.append({"id": f"CTG-TXT-RAW-{tid:05d}", "state": "RAW", "type": "sentence", "original": nfc(str(it["response_as_given"])),
                    "variants": [nfc(str(v)) for v in (it.get("variants_given") or [])], "english": it["prompt_english"],
                    "region": sp.get("locality_as_given") or None, "source": f"SRC-{iid}", "evidence_level": "unassessed",
                    "confidence": CONF.get(it.get("speaker_confidence"), "unverified"), "ai_assisted": not web, "consent": consent,
                    "notes": ("Captured by web form; unverified." if web else "AI-assisted interview; unverified.") + (f" Speaker comment: {it['speaker_comment']}" if it.get("speaker_comment") else ""),
                    "provenance": {"submitted_by": "interview contributor (credit: %s)" % c.get("credit","anonymous"), "date_submitted": str(d.get("date","unknown")),
                                   "origin": ("web form " if web else "chatbot interview ") + iid, "reviewer": None, "review_date": None, "decision_history": []}})
                tid += 1
    base = os.path.join(a.root)
    arch = os.path.join(base,"datasets","interviews",f"{iid}.yaml")
    lex = os.path.join(base,"lexicon","raw",f"{iid}.jsonl")
    txt = os.path.join(base,"corpus","texts",f"{iid}.jsonl")
    stage = os.path.join(base, "audio", "staging", iid); cat = os.path.join(base, "audio", "catalogue", f"{iid}.jsonl")
    print(f"{len(d['items'])} items, {len(recs)} word records, {len(texts)} sentence records, {len(other)} non-word items kept in the raw copy; consent={consent}")
    if a.dry_run: return
    os.makedirs(os.path.dirname(arch), exist_ok=True); os.makedirs(os.path.dirname(lex), exist_ok=True)
    if os.path.exists(arch): sys.exit(f"{arch} already exists; refusing to overwrite")
    d["_ingest"] = {"speaker_id": a.speaker_id, "state": "RAW", "ai_assisted": not web, "evidence_level": "unassessed"}
    with open(arch,"w",encoding="utf-8") as f: yaml.safe_dump(d, f, allow_unicode=True, sort_keys=False)
    if recs:
        with open(lex,"w",encoding="utf-8") as f:
            for r in recs: f.write(json.dumps(r, ensure_ascii=False)+"\n")
    if texts:
        os.makedirs(os.path.dirname(txt), exist_ok=True)
        if os.path.exists(txt): sys.exit(f"{txt} already exists; refusing to overwrite")
        with open(txt,"w",encoding="utf-8") as f:
            for r in texts: f.write(json.dumps(r, ensure_ascii=False)+"\n")
    if aud_ids:
        if os.path.exists(stage): sys.exit(f"{stage} already exists; refusing to overwrite")
        os.makedirs(stage); os.makedirs(os.path.dirname(cat), exist_ok=True)
        with open(cat, "w", encoding="utf-8") as f:
            for it in d["items"]:
                if it["n"] not in aud_ids: continue
                fn = os.path.basename(it["audio_file"])
                open(os.path.join(stage, fn), "wb").write(audio[it["audio_file"]])
                f.write(json.dumps({"id": aud_ids[it["n"]], "state": "RAW", "item_n": it["n"], "prompt_english": it["prompt_english"],
                    "file": f"audio/staging/{iid}/{fn}", "sha256": it.get("audio_sha256"), "duration_ms": it.get("audio_ms"),
                    "mime": it.get("audio_mime"), "consent": audio_consent, "speaker_id": a.speaker_id,
                    "locality_as_given": sp.get("locality_as_given") or None, "date": str(d.get("date", "unknown")),
                    "source": f"SRC-{iid}", "evidence_level": "unassessed",
                    "notes": "Unverified recording. Staging copy is not in version control; non-public audio must stay out of the repository."}, ensure_ascii=False) + "\n")
        print(f"audio: {len(aud_ids)} clip(s) in {stage} (gitignored) and catalogue {cat}; consent={audio_consent}")
    print("wrote", arch, "and", lex if recs else "(no word records)")
    print("Next: python3 scripts/validate.py ; then review. Sentences, heritage items and non-responses are in the raw copy for reviewers.")
main()
