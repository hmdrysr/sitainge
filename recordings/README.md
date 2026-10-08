# recordings/

One record per audio file, in JSONL. Schema: `schemas/recording.schema.json`. Protocol: `docs/protocols/recording-checklist.md`.

**Audio stays out of Git.** Only the record is stored here: the SHA-256 hash of the original, duration, format, quality, access tier (`public`, `research-only`, `restricted` or `private`), and the archive location where the original is kept. The access tier follows the consent given for the session.

This folder is separate from `audio/catalogue/`, which `scripts/validate.py` already checks and which is left as it is. Migration, if any, is described in `docs/methodology/STRUCTURE.md`.

Status: no recordings are registered yet.
