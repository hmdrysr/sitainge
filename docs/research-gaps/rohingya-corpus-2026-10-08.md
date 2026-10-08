# Rohingya corpus: what was tried, retrieved and left (2026-10-08)

Request: collect as much romanized Rohingya (`rhg`) as can be found and keep it unverified. The result is in `corpus/rohingya/`. Rohingya is not Chittagonian and is kept apart.

## Retrieved

4,708 records from five sources. Counts by source and unit are in `corpus/rohingya/README.md`.

1. **GATITOS** (Google Research), 4,315 English-to-Rohingya lines, CC BY 4.0. The files are no longer on the main branch of `google-research/url-nlp` (removed 2025-02-21; the dataset moved to Hugging Face). They were recovered from the git history at commit `3622039` through a partial clone. This is the bulk source. It is mostly single words.
2. **Tatoeba-Challenge** development and test data, 41 sentence pairs (`data/devtest/eng-rhg`). The same repository's `rhg-rhg` file has one line in Hanifi script, which was not recorded.
3. **English Wikipedia, Rohingya language**, 56 records: sample sentences, conjugation rows, case examples, first and second person pronoun forms.
4. **LearnRohingya.com**, lessons 1 to 7, 190 records.
5. **eBible.org rhgc** (Rohingya New Testament, Latin script), 106 complete verses from 12 chapters, unglossed.

## Not retrieved, and why

- **Rohingya Language Foundation dictionaries** (rohingyalanguage.com): the largest Latin-script word lists found, with English glosses. The footer reads "All Rights Reserved" and no open licence is stated. Recorded as a pointer only; no entries were copied. This is the most useful follow-up: ask the foundation for written permission.
- **iRRRd glossary** (NYU): copyrighted; the data sit in a Google Sheet that was not opened; it mixes Latin and Bangla script.
- **Tatoeba full list**: a Hugging Face model card reports 3,548 pairs, but tatoeba.org blocks automated reading and the export host was unreachable from the build environment. Someone with ordinary web access can download `rhg_sentences.tsv.bz2` and the links file. That would add far more sentences than the 41 here.
- **eBible second translation** (`rhg`, The Seed Company, CC BY-SA 4.0): the page-reading tool returned a summary instead of verses. The USFM download from eBible.org would give both Bibles in full, in a few minutes, by a person.
- **Wiktionary / Kaikki**: not readable by the tools. Latin forms there are generated transliterations of Hanifi script, so they need care before use.
- **Hugging Face datasets** (for example Rohingya speech sets), Mendeley, Glosbe: the shell could not reach them, and the page-reading tool gives summaries, not rows.
- **GitHub search**: the API is not available in this environment, so repositories were found only through web search. No Rohingya-specific text repository turned up. Searches for Rohingya romanization datasets, Bible mirrors, phrasebooks and humanitarian glossaries found no other open Latin-script source.
- Omniglot's Rohingya page has one usable sentence, which duplicates the Wikipedia record. It is listed as a source but credited with no records.

## Quality limits

- 352 records came through a page-reading tool that summarises pages and caps each quotation at about 125 characters. Long eBible verses were skipped, and one chapter reply warned that diacritics might not be exact. Treat those 352 records as lower confidence than the 4,356 parsed from files, and re-check them against the pages.
- LearnRohingya lesson 5 returned garbled characters. Only clean items were kept. One lesson 7 line with a mismatched gloss was left out.
- Wikipedia's pronoun table was recorded only for first and second person, split from multi-form cells.
- GATITOS glosses are translator prompts, not dictionary senses. Some entries are translator annotations or definitions, as the source README warns.

## Licence concerns

The repository is CC0. This folder is not. GATITOS (CC BY 4.0) and Tatoeba (CC BY 2.0 FR, though the link in its README points to the share-alike deed) require attribution. Wikipedia and eBible are CC BY-SA 4.0, which also requires share-alike. LearnRohingya states no licence, so those 190 records rest on short-excerpt reasoning and should be confirmed or removed. Options for the owner: keep this folder as a separately licensed layer with `licence_note` retained (recommended); or drop the share-alike and unstated-licence records (352 in total) before any CC0 release.

## Follow-ups

1. Ask the Rohingya Language Foundation for permission to ingest its dictionaries.
2. Download the Tatoeba `rhg` export and both eBible USFM sets, then run them through the same schema.
3. Find a Rohingya speaker reviewer and define a review state for `RHG-` records. The schema now allows only `RAW`.
4. Add the new `SRC-RHG-` ids to `schemas/consensus_rules.json` independence groups to clear 12 warnings.
5. Make sure the stage that supplies `scripts/validate.py` keeps the four-line call to `rohingya_check`.
