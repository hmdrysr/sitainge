# Contributing with your AI account

You can lend some of your AI usage to the project. This page shows how to do that so every token turns into saved work, even if your session ends without warning.

## The one rule
**Finish small things and save them as you go.** An AI session can stop at any time because of a usage limit. Work that is not saved to a file and committed is lost. So never ask for one huge result. Ask for many small ones, and save after each.

## Before you start (two minutes)
1. Check your remaining usage in your AI app. If you have less than about 15 minutes' worth, do a "Check" task, not a "Gather" task (see the menu).
2. Open the repository in your AI tool and tell it: "Read AGENTS.md first." That file holds the rules, so you do not repeat them.
3. Choose **one** task from the menu below and say its name.

## Task menu
Ordered from cheapest to most expensive. Pick the biggest one that fits your remaining budget.

| Task | Size | What you ask for | What gets saved |
|---|---|---|---|
| Format check | tiny | "Run the validator and fix formatting problems in the newest file." | Fixed file |
| Cross-check | small | "Compare records in `lexicon/raw/<file>` against their sources and list mismatches. Do not change meanings." | A short list in `docs/research-gaps/` |
| Source page | small | "Extract every word and phrase from this one page into RAW records. Cite the page." | One new `.jsonl` file |
| Variant finder | medium | "Find spelling variants of words already in the dictionary in these sources. Add them as new RAW records that point to the original." | One new file |
| Source sweep | large | "Work through this list of pages, one at a time, saving after each." | One file per page, plus journal lines |
| Interview | medium | Use the interview prompt in `contribute/`. A native speaker answers; the AI only asks and formats. | A submission you send from Dadi or a GitHub issue |

## How to run a task without waste
- **Chunks of 10 to 20 records.** After each chunk: save to a file, run `python3 scripts/validate.py`, then continue. If validation fails, fix it before adding more.
- **Commit early.** Commit after every file, with a message that says what and where from. Small commits can always be kept; half-written ones cannot.
- **Keep the journal.** Add one line to `docs/research-gaps/session-journal.md` after each chunk: date, task, file, what is left. The next person (or your next session) starts from there.
- **Do not repeat work.** Search the repository for a word before adding it. Duplicates cost reviewers time.
- **Stop with 20% left.** Use the last slice to validate, commit and write the journal line. Then stop. An unfinished batch is worse than a smaller finished one.
- **One page at a time.** Reading one page completely beats skimming many.
- **No guessing.** If the AI is unsure what a word means or how it is spelled, it leaves the field empty and writes a note. Empty is correct. Wrong is harmful.

## What your AI must never do
- Invent words, spellings, sounds or grammar.
- Mark anything as verified. Verification belongs to speakers and reviewers.
- Copy long passages from copyrighted works. Short quoted words with a citation are fine; whole pages are not.
- Include personal details about speakers.

## If your session ends in the middle
Nothing is lost if you followed the steps above. Whatever was saved and committed stays. The journal says where to restart. If you saved but did not commit, commit it first when you return.

## Why this matters
Native speakers are the only authority on siṭaiṅga. AI is useful for tedious work (formatting, finding variants, comparing sources) and unreliable at the language itself. These rules keep your AI doing the first and never the second.
