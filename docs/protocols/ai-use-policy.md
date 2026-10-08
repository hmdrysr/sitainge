# AI use policy for protocols

This note applies the project's AI rules to fieldwork and records. It adds detail to, and does not replace, `EVIDENCE_POLICY.md` and `docs/methodology/ai-use-policy.md`. If any wording differs, the stricter rule applies.

## Rules

1. **Consent first.** A speaker's recording is given to a computer tool only when consent choice (e) is yes. The default is no. The session record states the choice.
2. **Suggest, never decide.** AI may draft a transcript for a person to correct, find duplicates and near-spellings, convert formats, build indexes and flag empty coverage cells. It may not supply, complete or "improve" a Chittagonian form, a gloss, IPA, a grammatical analysis or an example sentence.
3. **Labelled.** Every AI-derived field carries `ai_assisted: true` and the label `AI-assisted / unverified` until a named human reviewer clears it. The reviewer's name is recorded.
4. **Never a source.** AI output is not evidence and is not cited. An AI cannot verify another AI's output, and it cannot act as a speaker.
5. **No promotion.** AI cannot move a record to ACCEPTED, raise an evidence level above `unassessed`, or resolve a disagreement between speakers.
6. **No Bangla or Rohingya as Chittagonian.** A form from either language is not recorded as Chittagonian because a model produced it.
7. **No ranking of spellings.** AI does not choose the orthography.
8. **Prompts stay in English.** Files in `prompts/` contain English only. Anyone drafting them with AI checks every line, and the origin is recorded.
9. **Honest reporting.** Say what was checked and what was not. If AI helped with a document, the document's notes say so.

## The removal test

Removing every AI-assisted field must leave the evidence record intact. If it does not, a rule above was broken, and the record is returned to RAW.

## Tool vendors and data

Before using an external service on audio or transcripts, check where the data goes, who keeps it and for how long. Do not send audio from speakers who answered no to (e). Record the service used in the session notes.
