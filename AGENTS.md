# Instructions for AI assistants working on this repository

Read this first. It is short on purpose, so it costs few tokens. Full rules are in `EVIDENCE_POLICY.md`, `ETHICS.md` and `docs/contribute/ai-tokens.md`.

## What this project is
siṭaiṅga (the Chittagonian language) documentation. Public domain (CC0). Owned by native speakers. Everything is evidence-governed.

## Hard rules
1. **Never invent Chittagonian.** No guessed words, spellings, grammar or pronunciations. If a source does not say it, it is not in the repository.
2. **AI output is never evidence.** Anything you extract or draft enters as `RAW`, evidence `unassessed`, `ai: true`, with its source id. Humans promote it.
3. **Write the language name as siṭaiṅga.** "Sitainge" is only the project and repository name. In English, the city and region are always **Chittagong**. Never write the 2018 official respelling.
4. **Canadian English** for all English text (colour, licence for the noun, practise for the verb, neighbour). No "tick", "kindly", "do the needful".
5. Do not mention Bengali, Bangla or Bengal on the landing page (`website/index.html`). The country name Bangladesh is fine.
6. Never store personal details. Speakers are hashed ids only.
7. Do not edit another contributor's record in place. Add a new record that points to it (`CTG-LEX-REV-nnnnn`).
8. Nothing is deleted. Retire a record by moving it to the archive state with a reason.

## Work in small, finished pieces (so a session limit never costs you the work)
- Pick one task from `docs/contribute/ai-tokens.md` > "Task menu". Do not start a second until the first is committed.
- Write output to a file **after every 10 to 20 records**, not at the end. Run `python3 scripts/validate.py` after each file.
- Keep a journal at `docs/research-gaps/session-journal.md` (append one line per finished chunk: what, where, next step). If your session ends, the next one resumes from the journal.
- Stop when about 20% of your budget remains. Use it to validate, commit and write the journal line. Never start a batch you cannot finish.
- Prefer fetching one page and extracting it fully over skimming ten.

## Before you commit
- `python3 scripts/validate.py` passes.
- `node scripts/tests/dadi_unit_test.js` and `node scripts/tests/dadi_translate_test.js` pass if you touched `website/dadi/`.
- If you changed words, run `node scripts/build_dadi_seed.js` so the app's offline copy updates.
- The description says what you did, what you did not verify and what comes next.
