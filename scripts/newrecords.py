"""Offline checks for the newer record types (sessions, recordings, speakers, sources, prompts, text records).
Standard library only. Implements the small part of JSON Schema (draft 2020-12) that the files in schemas/ use.
Structural validation only; it never decides linguistic truth. Imported by scripts/validate.py."""
import glob, json, os, re

KINDS = {  # record type -> (glob patterns, schema file)
    "session": (["sessions/*.jsonl"], "session.schema.json"),
    "recording": (["recordings/*.jsonl"], "recording.schema.json"),
    "speaker": (["speakers/*.jsonl"], "speaker.schema.json"),
    "source": (["sources/*.jsonl"], "source.schema.json"),
    "prompt": (["prompts/*.jsonl"], "prompt.schema.json"),
    "text": (["corpus/texts/*.jsonl"], "text.schema.json"),
}
FOLDER_STATE = {"raw": "RAW", "review": "REVIEW", "accepted": "ACCEPTED", "archived": "ARCHIVED"}
_TYPES = {"string": str, "boolean": bool, "object": dict, "array": list, "null": type(None)}


def _is(v, t):
    if t == "integer":
        return isinstance(v, int) and not isinstance(v, bool)
    if t == "number":
        return isinstance(v, (int, float)) and not isinstance(v, bool)
    return isinstance(v, _TYPES[t])


def check(v, schema, path="$"):
    """Return a list of problems for value v against schema."""
    out = []
    if "anyOf" in schema and not any(not check(v, s, path) for s in schema["anyOf"]):
        out.append(f"{path}: matches none of the allowed forms")
    t = schema.get("type")
    if t is not None:
        ts = t if isinstance(t, list) else [t]
        if not any(_is(v, x) for x in ts):
            return out + [f"{path}: expected {'/'.join(ts)}"]
    if "enum" in schema and v not in schema["enum"]:
        out.append(f"{path}: {v!r} not one of {schema['enum']}")
    if isinstance(v, str) and "pattern" in schema and not re.search(schema["pattern"], v):
        out.append(f"{path}: {v!r} does not match {schema['pattern']}")
    if _is(v, "number"):
        if "minimum" in schema and v < schema["minimum"]:
            out.append(f"{path}: below minimum {schema['minimum']}")
        if "exclusiveMinimum" in schema and v <= schema["exclusiveMinimum"]:
            out.append(f"{path}: must be greater than {schema['exclusiveMinimum']}")
    if isinstance(v, dict):
        for k in schema.get("required", []):
            if k not in v:
                out.append(f"{path}: missing {k}")
        props = schema.get("properties", {})
        for k, val in v.items():
            if k in props:
                out += check(val, props[k], f"{path}.{k}")
            elif schema.get("additionalProperties") is False:
                out.append(f"{path}: field {k} is not allowed")
    if isinstance(v, list):
        if "minItems" in schema and len(v) < schema["minItems"]:
            out.append(f"{path}: needs at least {schema['minItems']} item(s)")
        if "items" in schema:
            for i, x in enumerate(v):
                out += check(x, schema["items"], f"{path}[{i}]")
    return out


def read_jsonl(path):
    """Yield (line number, record or None, error or None)."""
    with open(path, encoding="utf-8") as f:
        for n, line in enumerate(f, 1):
            if line.strip():
                try:
                    yield n, json.loads(line), None
                except json.JSONDecodeError as e:
                    yield n, None, str(e)


def check_new_records(root="."):
    """Validate every new-type file that exists. Returns (errors, warnings, counts, records)."""
    errors, warnings, counts, recs = [], [], {}, {}
    for kind, (pats, sfile) in KINDS.items():
        files = sorted(p for pat in pats for p in glob.glob(os.path.join(root, pat)))
        if not files:
            continue
        with open(os.path.join(root, "schemas", sfile), encoding="utf-8") as f:
            schema = json.load(f)
        seen = set()
        for path in files:
            for n, r, err in read_jsonl(path):
                where = f"{os.path.relpath(path, root)}:{n}"
                if err:
                    errors.append(f"{where} invalid JSON: {err}")
                    continue
                if not isinstance(r, dict):
                    errors.append(f"{where} record is not an object")
                    continue
                if kind == "text" and not str(r.get("id", "")).startswith("CTG-TXT"):
                    continue  # JSONL in corpus/texts/ that is not a text record is left to Dadi's own reader
                errors += [f"{where} {m}" for m in check(r, schema)]
                if r.get("id") in seen:
                    errors.append(f"{where} duplicate {kind} id {r.get('id')}")
                seen.add(r.get("id"))
                recs.setdefault(kind, []).append(r)
        counts[kind] = len(seen)
    ses = {r.get("id") for r in recs.get("session", [])}
    rec = {r.get("id") for r in recs.get("recording", [])}
    spk = {r.get("id") for r in recs.get("speaker", [])}
    for r in recs.get("recording", []):
        if ses and r.get("session_id") not in ses:
            warnings.append(f"recording {r.get('id')} names unknown session {r.get('session_id')}")
        if spk and r.get("speaker_id") not in spk:
            warnings.append(f"recording {r.get('id')} names unknown speaker {r.get('speaker_id')}")
        if r.get("access_tier") == "public" and r.get("withdrawn"):
            errors.append(f"recording {r.get('id')} is withdrawn but marked public")
    for r in recs.get("session", []):
        for rid in r.get("recording_ids", []) or []:
            if rec and rid not in rec:
                warnings.append(f"session {r.get('id')} lists unknown recording {rid}")
        c = r.get("consent") or {}
        if r.get("entry_consent") == "public" and not c.get("publish_cc0"):
            errors.append(f"session {r.get('id')} entry_consent is public but publish_cc0 is not agreed")
    return errors, warnings, counts, recs


def folder_state_warnings(root="."):
    """Warn (never error) when a lexicon file's folder disagrees with a record's state field."""
    out = []
    for path in sorted(glob.glob(os.path.join(root, "lexicon", "*", "*.jsonl"))):
        want = FOLDER_STATE.get(os.path.basename(os.path.dirname(path)))
        if not want:
            continue
        for n, r, err in read_jsonl(path):
            if r and isinstance(r, dict) and r.get("state") and r.get("state") != want:
                out.append(f"{os.path.relpath(path, root)}:{n} state {r.get('state')} but file is in lexicon/{want.lower()}/")
    return out
