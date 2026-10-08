# Elicitation guide

For interviewers working with a speaker who may offer 20 to 30 minutes, once. Prompt sheets are in `prompts/` and are written in English only. The interviewer never supplies a Chittagonian form, a spelling or a grammatical judgement.

## Principles

1. **The speaker is the authority on what they say.** Record what is said, not what we expect.
2. **Prompt in English, or with licence-clear pictures.** Pictures reduce the influence of English and work well for concrete nouns and actions.
3. **Easiest first.** Order a sheet from concrete and familiar items to abstract ones.
4. **No leading.** Do not offer a candidate word, a Bangla equivalent or a Rohingya form. If the speaker cannot answer, record "no answer" and move on.
5. **Record register.** Note whether the form is everyday or respectful, and whether the speaker says other people say it differently.
6. **Two takes at most** per item.
7. **Pace.** Stop when the speaker is tired. A short session done well is worth more than a long one.

## A 30-minute session

| Minutes | Activity | Material |
|---|---|---|
| 0 to 5 | Consent, session header, a test recording | `consent-form.md`, `session-log.md` |
| 5 to 20 | Word list | 25 to 40 prompts from `prompts/leipzig-jakarta-100.jsonl` or one domain from `prompts/semantic-domains.jsonl` |
| 20 to 25 | Grammar checklist, selected items | `prompts/grammar-checklist.jsonl` |
| 25 to 28 | Free speech: a short story or a description of the speaker's day | None |
| 28 to 30 | Thank the speaker; confirm withdrawal rights and how to reach the project | None |

## Prompt sets

- **Leipzig-Jakarta 100** (`prompts/leipzig-jakarta-100.jsonl`): a published list of 100 basic meanings ranked by stability, used here as the first target for core vocabulary. Its source is recorded in `sources/sources.jsonl` as `SRC-PROMPT-LJ100`; see the note there about what has and has not been checked.
- **Semantic domains** (`prompts/semantic-domains.jsonl`): ten domains with eight English prompts each. The set was drafted for this project and has not been reviewed by a speaker or a linguist. Run one domain per sitting.
- **Grammar checklist** (`prompts/grammar-checklist.jsonl`): English question prompts for a first look at tense, negation, questions, person, number, possession and politeness. A linguist should revise it.

## Group sessions

Group sessions of three to five speakers are faster for vocabulary but speakers influence one another. Mark the session `group` in its notes and treat items from it as single-source until a second, independent speaker confirms them.

## Self-recorded sessions

When a speaker records themselves against prompts, mark the session as `self_recorded` in its notes. The audio quality gate (G2) still applies.

## After the session

Transcription happens later and by a person (see `docs/methodology/documentation-plan.md`, section 8). Any computer draft is labelled `AI-assisted / unverified`, and it is used only if the speaker chose yes for AI-assisted processing.
