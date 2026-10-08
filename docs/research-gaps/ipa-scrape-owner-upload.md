# IPA scrape supplied by the owner, October 8, 2026

File: `lexicon/raw/2026-10-08-ipa-scrape-owner-upload.jsonl`, 98 records (`CTG-LEX-RAW-04000` to `04097`), from the owner's file `chittagonian_vocab_ipa_scrape.json`.

## How the records were made
- Every record is RAW, evidence level `unassessed`, consent `research-only`, `ai_assisted: true`.
- The scrape gave IPA only. The IPA is stored in `ipa` and, because there is no everyday spelling, also in `form_as_submitted` and `spellings`. Nothing was respelled or corrected.
- `ipa_status` is `ai-drafted-unverified`, the closest value in the existing schema. None of the existing values describes IPA copied from a published source by an outside scrape. Adding a value such as `published-source-unverified` would need a schema change and a change in Dadi's trust ranking, and is left for a decision.
- The compiler's confidence rating (high, medium, low) is kept in `confidence` and `notes`. It is not an evidence level.
- Four source records were added to `sources/sources.jsonl` as `pointer, unchecked`. The scrape's two labels for the loanword paper ('RJOE' and the paper's title) are one source.

## Counts by source
LangMap 42, IIUC Studies 10, Research Journal of English paper 33, Kaikki 13 (the scrape's own labels, merged as above).

## Cautions
- 15 records are rated low. Several look like OCR or transcription errors (for example a gloss of 'danger; hole' for one form). They are retained as leads only.
- The loanword paper's items may be borrowings (for example 'pill', 'table'), not core vocabulary.
- Some meanings repeat across sources with different forms (egg, morning, hand, pain, soil). They are kept as separate records so that variants can be compared.
- The Kaikki category name says the entries have an incorrect language header.
- The records are not yet in any Dadi theme unit. They appear in Words and the dictionary, and in lessons only if a unit lists them.
