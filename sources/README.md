# sources/

The source register as data: `sources/sources.jsonl`, one record per source. Schema: `schemas/source.schema.json`.

Each record has `status` of exactly one of:

- `checked`: someone has opened the source, and the claims are limited to what the record says was seen.
- `pointer, unchecked`: a lead only. **Do not cite it as evidence until someone reads it.**

Seeding. The file was built from `docs/research-gaps/starter-sources.md`, `docs/research-gaps/source-register.md` and the web-harvest notes (`docs/research-gaps/web-harvest-2026-10-08*.md`). Status follows the originals: from the starter list only an answer of "Yes" to "Have you read it yourself?" is recorded as `checked` (the `read` field keeps Yes, Partly or No as written). Sources listed in the register's "Checked" table keep that status. Web-harvest sources were read by an AI tool to extract RAW records; the harvest notes do not claim a human check, so they are `pointer, unchecked`. Hoque 2015 appears once (`SRC-STARTER-02`, register id S001), at the more cautious status, with the difference explained in its notes.

Source of truth. During migration the Markdown files under `docs/research-gaps/` remain the originals. If the two disagree, the Markdown wins until a person reconciles them and records the change. Add new sources here and to the Markdown register together.

Licence caution. The repository is CC0. Facts about a source are fine to record; do not copy text, word lists or data from CC BY, CC BY-SA or copyrighted sources.
