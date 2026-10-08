# Rohingya romanized corpus (unverified)

Language: Rohingya, ISO 639-3 `rhg`. This is a different language from Chittagonian (`ctg`). Nothing in this folder is Chittagonian, and nothing here may be presented, indexed or searched as Chittagonian. The Chittagonian pipeline does not read this folder.

## What is here

| File | Contents |
|---|---|
| `words-raw.jsonl` | Records with `unit` word. Ids `RHG-WRD-RAW-nnnnn`. |
| `sentences-raw.jsonl` | Records with `unit` phrase or sentence. Ids `RHG-SEN-RAW-nnnnn`. |

Total: 4,708 records (4,121 words, 587 phrases and sentences). Latin script only. No Hanifi Rohingya, Arabic, Burmese or Bangla script is stored; the validator fails on any such character.

Every record is `RAW`, evidence level `unassessed`, consent `research-only`, and has a source id, an origin (URL or repository path with commit) and a retrieval date of 2026-10-08. Nothing has been checked by a Rohingya speaker. The Latin forms are copied from the sources and were not corrected, normalised or generated.

## Counts by source and unit

| Source id | Words | Phrases | Sentences | Total | How read | Licence |
|---|---|---|---|---|---|---|
| `SRC-RHG-GATITOS` | 4,015 | 291 | 9 | 4,315 | downloaded file, parsed by program | CC BY 4.0 |
| `SRC-RHG-TATOEBA-CHALLENGE` | 0 | 0 | 41 | 41 | downloaded file, parsed by program | CC BY 2.0 FR (possibly share-alike) |
| `SRC-RHG-WIKIPEDIA-ARTICLE` | 29 | 3 | 24 | 56 | AI page-reading tool | CC BY-SA 4.0 |
| `SRC-RHG-LEARNROHINGYA` | 77 | 11 | 102 | 190 | AI page-reading tool | not stated |
| `SRC-RHG-EBIBLE-RHGC` | 0 | 0 | 106 | 106 | AI page-reading tool | CC BY-SA 4.0 |

`ai_assisted` is `false` for the 4,356 records parsed from downloaded files and `true` for the 352 that came through the page-reading tool. That tool returns summaries, so its characters and diacritics are not guaranteed to match the page. Those records carry a matching `confidence` statement.

## Cautions

- Not Chittagonian. A Rohingya form is never evidence for a Chittagonian form (see the Rohingya comparison levels in `EVIDENCE_POLICY.md`).
- Not verified. Treat every record as a claim by its source.
- The romanization is the compilers' own. Rohingya has no single standard Latin spelling. GATITOS and the eBible text use accented spellings close to the "Rohingyalish" style, Tatoeba contributors use asterisks and apostrophes, and LearnRohingya uses tildes and carons. The same word will appear under different spellings; they are kept separate on purpose.
- Glosses are the sources' own English. GATITOS glosses are the English prompts that translators rendered into Rohingya, so a polysemous English word may carry a different sense in Rohingya.
- Unit labels for GATITOS are assigned mechanically from the English side: one token is a word, two to five tokens a phrase, six or more tokens (or three or more with final punctuation) a sentence. A multi-word Rohingya rendering of one English term is still a word and is flagged in `form_note`.
- eBible verses have `english_gloss` set to `unglossed in source` and carry the verse reference in `notes`. Only verses returned in full are included, so longer verses are missing.
- IPA printed on LearnRohingya and Wikipedia is not stored in the `ipa` field because how it was produced is not stated. Where it is useful it is quoted in `notes`. All records have `ipa_status` `none`.
- Licences differ from the repository's CC0. GATITOS (CC BY) and Tatoeba need attribution. Wikipedia and eBible (CC BY-SA) add share-alike. Every record carries its own `licence_note`. Before any release, decide whether this folder ships as a separate, differently licensed layer. See `docs/research-gaps/rohingya-corpus-2026-10-08.md`.

## How this differs from the Chittagonian layer

- Separate folder (`corpus/rohingya/`), separate schema (`schemas/rohingya_entry.schema.json`), separate id prefix (`RHG-`), and a separate check (`scripts/rohingya_check.py`, called from `scripts/validate.py`).
- `language` is always `rhg`, `language_name` is always `Rohingya`.
- Source ids start with `SRC-RHG-`.
- Records cannot be promoted by the Chittagonian review workflow. The schema allows only `RAW` until a Rohingya review process exists.

## Website bundle

`website/data/rohingya-seed.json` holds every record as `{id, unit, form, gloss, source}` (about 0.5 MB, so nothing was cut). Verses have an empty gloss. The dictionary should show it only under a Rohingya heading, never merged into Chittagonian results.

## Checks

```
python3 scripts/validate.py
python3 scripts/tests/test_rohingya_corpus.py
```
