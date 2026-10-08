# Repository structure map

Status: October 2026. One page. Read with `documentation-plan.md` (sections 13 to 15), which gives the reasons. This file says what exists, what is canonical, what must not be renamed, and the order of migration. Nothing listed here has been moved or deleted.

## Layout today

| Path | Holds | Status | Read by |
|---|---|---|---|
| `lexicon/raw/`, `review/`, `accepted/`, `archived/` | Lexical entries, JSONL | **Canonical.** The folder should match each record's `state`; `validate.py` now warns when it does not. | `validate.py`, Dadi, unpack workflow |
| `datasets/*.jsonl` | Imported lists, such as the 2019 starter list | Canonical, unchanged | `validate.py`, Dadi |
| `corpus/texts/*.yaml` | Sentences and texts | Canonical. New files may be JSONL. | Dadi (minimal YAML reader) |
| `corpus/{transcripts,translations,annotations}/` | Empty | Kept. Candidates to merge into text records later. | Nothing |
| `audio/catalogue/*.jsonl`, `audio/metadata/` | Existing audio catalogue | Canonical for now | `validate.py` |
| `schemas/lexical_entry.schema.json` | Live entry schema | **Canonical, untouched** | CI, tools |
| `schemas/lexical_entry_v2.schema.json` | Draft v2 entry (state-free id, `senses[]`, `place`, `recording_ids`, `confirmations[]`, per-field `evidence`) | Draft, not used by any tool | Tests only |
| `schemas/{session,recording,speaker,source,text,prompt}.schema.json` | Schemas for the new record types | New | `scripts/newrecords.py` |
| `sessions/`, `recordings/`, `speakers/` | Session, recording and public speaker records | New, empty | `validate.py`, `coverage_report.py` |
| `sources/sources.jsonl` | Source register as data | New, seeded. The Markdown register in `docs/research-gaps/` stays the original until a person reconciles the two. | `validate.py`, `coverage_report.py` |
| `prompts/` | English elicitation sheets | New | `coverage_report.py` |
| `reports/` | Generated reports | New, generated | Readers |
| `docs/protocols/` | Fieldwork protocols | New | People |
| `lexicon/speakers.json`, `lexicon/ingested-issues.txt` | Written by `dadi_ingest_issue.py` | Unchanged | Dadi workflow |
| `comparative/`, `cultural/`, `archive/`, `standards/`, `rosetta/`, `website/`, `extension/`, `dadi-worker/` | As described in their own files | Unchanged | Various |

## What must not be renamed, and why

| Name | Why |
|---|---|
| `lexicon/raw`, `lexicon/review`, `lexicon/accepted` | The `WANTED` regular expressions in `website/dadi/js/data.js` list these paths, so Dadi would read nothing from a renamed folder. `validate.py` globs them too. |
| `datasets/` and `corpus/texts/` | Same `WANTED` list. |
| The `CTG-TXT` id prefix | `normalize()` in `data.js` detects text records by this prefix or by the `corpus/texts` path. |
| `form_as_submitted`, `english_gloss`, `consent`, `original`, `english` | `normalize()` reads them. A record with no `consent` is shown as `permission pending`; `private`, `withdrawn` and `restricted` are hidden. Withdrawal depends on this. |
| `CTG-LEX-(RAW\|REV\|ACC\|ARC)-nnnnn` ids already in use | Citations and the de-duplication in Dadi treat ids as plain strings. Existing ids are never rewritten. |
| `lexicon/speakers.json` | Written by `scripts/dadi_ingest_issue.py`. |
| `workflows-to-install/dadi-tools.yml` | Installed into `.github/workflows/` by the owner. Changed only with the scripts it runs. |

## Canonical copies

Entries: the JSONL files under `lexicon/` and `datasets/`. Sources: the Markdown register until reconciled, then `sources/sources.jsonl`. Consent: the session record, once Dadi reads sessions; until then each entry keeps its own `consent` value. Speakers: the private register (outside Git) is the full record; `speakers/` is the public view. Generated files (`reports/`) are never edited by hand.

## Migration order (each step ships with tests; none has been done)

1. **Done in this change:** new folders, schemas, source and prompt data, `coverage_report.py`, additive `validate.py` checks, protocols.
2. Write the consent form and session log with an ethics adviser. Run a pilot of three speakers, 30 minutes each, and register their sessions, recordings and speakers.
3. Decide the id change and the `senses[]` structure with the Dadi maintainer. Update `lexical_entry.schema.json`, `validate.py`, `dadi_ingest_issue.py` and `data.js` together, accepting both id patterns, with `english_gloss` kept as a derived field. Until then new entries keep using the live schema.
4. Move sentence-level records from `lexicon/raw/` to `corpus/texts/` as text records. Keep the ids, and leave a pointer in the old file, so that nothing is lost.
5. Move the speaker map out of public view by changing `dadi_ingest_issue.py` and its workflow together.
6. Convene the orthography working group (`docs/protocols/working-group-charter.md`).
7. Only then consider tidying the empty folders (`corpus/transcripts` and similar, the stray `*.gitkeep` files in the repository root). A deletion needs an entry in `docs/governance/decision-log.md` stating what was removed, why, by whom and on what date, and the content must exist elsewhere first.

## Checks

`python3 scripts/validate.py` (structure, existing rules unchanged, plus the new record types when their files exist and a warning for folder and state disagreement). `python3 scripts/tests/test_new_records.py` (offline). `python3 scripts/coverage_report.py` regenerates `reports/coverage.md`.
