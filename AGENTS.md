# Instructions for AI assistants working on this repository

Read this first. It is short on purpose, to save tokens. The full rules are in `EVIDENCE_POLICY.md`, `ETHICS.md` and `docs/contribute/ai-tokens.md`.

## What this project is
This repository documents siṭaiṅga (the Chittagonian language). It is in the public domain (CC0), is owned by native speakers, and is evidence-governed throughout.

## Hard rules
1. **Never invent Chittagonian.** Do not guess words, spellings, grammar or pronunciations. If a source does not state a form, it does not belong in the repository.
2. **AI output is never evidence.** Anything extracted or drafted by an AI enters as `RAW`, evidence `unassessed`, `ai: true`, with its source ID. Humans promote it.
3. **Write the language name as siṭaiṅga.** "Sitainge" is only the project and repository name. In English, the city and region are always **Chittagong**. Never use the 2018 official respelling.
4. **Use Canadian English** for all English text (colour; licence as a noun; practise as a verb; neighbour). Avoid "tick," "kindly" and "do the needful."
5. Do not mention Bengali, Bangla or Bengal on the landing page (`website/index.html`). The country name Bangladesh is acceptable.
6. Never store personal details. Speakers appear only as hashed IDs.
7. Do not edit another contributor's record in place. Add a new record that points to it (`CTG-LEX-REV-nnnnn`).
8. Nothing is deleted. To retire a record, move it to the archive state and give a reason.

## Work in small, finished pieces (so that a session limit never costs the work)
- Pick one task from `docs/contribute/ai-tokens.md` > "Task menu". Commit it before starting a second.
- Write output to a file **after every 10 to 20 records**, not at the end. Run `python3 scripts/validate.py` after each file.
- Keep a journal at `docs/research-gaps/session-journal.md`. Append one line per finished chunk: what, where, next step. If a session ends, the next one resumes from the journal.
- Stop when about 20% of the budget remains. Use the remainder to validate, commit and write the journal line. Never start a batch that cannot be finished.
- Fetch one page and extract it fully rather than skimming ten.

## Before committing
- `python3 scripts/validate.py` passes.
- `node scripts/tests/dadi_unit_test.js` and `node scripts/tests/dadi_translate_test.js` pass if `website/dadi/` was changed.
- If words were changed, run `node scripts/build_dadi_seed.js` so the app's offline copy updates.
- The description states what was done, what was not verified and what comes next.

## Varieties and preferred forms (2026-10-10)
- siṭaiṅga and Rohingya are recorded as one language with varieties (steward decision, `docs/decisions/rohingya-merge.md`). Tag every record's `variety` (`chittagong` or `rohingya`) and keep its `source`. Merged records point to their original with `variant_of`; attestation records point to the entries they repeat with `attests`.
- Record every variant form and spelling. Never skip a duplicate: a repeated form is a new attestation, not noise.
- **Attestation rule:** if the same form appears identically in three distinct, independent sources at different times, it becomes the preferred form. Among variants, the most-attested form is preferred. Votes break ties or inform review. `scripts/consensus.py` computes this; see `EVIDENCE_POLICY.md`.

