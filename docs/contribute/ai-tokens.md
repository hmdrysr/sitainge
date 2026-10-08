# Contributing with an AI account

Contributors can lend some of their AI usage to the project. This page explains how to do so, so that every token becomes saved work even if the session ends without warning.

## The one rule
**Finish small things and save them as you go.** An AI session can stop at any time because of a usage limit. Work that is not saved to a file and committed is lost. For that reason, do not ask for one large result. Ask for many small ones and save after each.

## Before starting (two minutes)
1. Check the remaining usage in the AI app. If less than about 15 minutes' worth remains, do a "Check" task, not a "Gather" task (see the menu).
2. Open the repository in the AI tool and tell it: "Read AGENTS.md first." That file holds the rules, so they do not need to be repeated.
3. Choose **one** task from the menu below and name it.

## Task menu
The tasks run from cheapest to most expensive. Pick the largest one that fits the remaining budget.

| Task | Size | What you ask for | What gets saved |
|---|---|---|---|
| Format check | tiny | "Run the validator and fix formatting problems in the newest file." | Fixed file |
| Cross-check | small | "Compare records in `lexicon/raw/<file>` against their sources and list mismatches. Do not change meanings." | A short list in `docs/research-gaps/` |
| Source page | small | "Extract every word and phrase from this one page into RAW records. Cite the page." | One new `.jsonl` file |
| Variant finder | medium | "Find spelling variants of words already in the dictionary in these sources. Add them as new RAW records that point to the original." | One new file |
| Source sweep | large | "Work through this list of pages, one at a time, saving after each." | One file per page, plus journal lines |
| Interview | medium | Use the interview prompt in `contribute/`. A native speaker answers; the AI only asks and formats. | A submission sent from Dadi or as a GitHub issue |

## How to run a task without waste
- **Work in chunks of 10 to 20 records.** After each chunk, save to a file and run `python3 scripts/validate.py`, then continue. If validation fails, fix the problem before adding more.
- **Commit early.** Commit after every file, with a message that states what was added and where it came from. Small commits can always be kept; half-written ones cannot.
- **Keep the journal.** After each chunk, add one line to `docs/research-gaps/session-journal.md` giving the date, task, file and what is left. The next person (or the next session) starts from there.
- **Do not repeat work.** Search the repository for a word before adding it. Duplicates cost reviewers time.
- **Stop with 20% left.** Use the last portion to validate, commit and write the journal line, then stop. An unfinished batch is worse than a smaller finished one.
- **Read one page at a time.** Reading one page completely is better than skimming many.
- **Do not guess.** If the AI is unsure what a word means or how it is spelled, it leaves the field empty and writes a note. An empty field is correct; a wrong entry is harmful.

## What the AI must never do
- Invent words, spellings, sounds or grammar.
- Mark anything as verified. Verification belongs to speakers and reviewers.
- Copy long passages from copyrighted works. Short quoted words with a citation are acceptable; whole pages are not.
- Include personal details about speakers.

## If the session ends in the middle
Nothing is lost if the steps above were followed. Whatever was saved and committed stays, and the journal says where to restart. If work was saved but not committed, commit it first on returning.

## Why this matters
Native speakers are the only authority on siṭaiṅga. AI is useful for tedious work (formatting, finding variants, comparing sources) and unreliable at the language itself. These rules keep the AI to the first kind of work and away from the second.
