# Research Standards

Claim, evidence, source, analysis, editorial decision: every major conclusion must be traceable through that chain. Interlinear glossing follows the Leipzig Glossing Rules (MPI-EVA and University of Leipzig; last change 31 May 2015) unless a deviation is documented. Each chapter ends with: Established / Uncertain / Missing / Required fieldwork / Open questions / Future research.

## Where the rules live

| Topic | Document |
|---|---|
| What counts as evidence, levels A to E, source hierarchy, the ban on invention | [EVIDENCE_POLICY.md](EVIDENCE_POLICY.md) |
| What to collect, how, from whom, and in what order | [docs/methodology/documentation-plan.md](docs/methodology/documentation-plan.md) |
| The literature behind the plan, with each item marked verified (V) or pointer, unchecked (P) | [docs/methodology/documentation-research.md](docs/methodology/documentation-research.md) |
| Where files live, what is canonical, what must not be renamed, migration order | [docs/methodology/STRUCTURE.md](docs/methodology/STRUCTURE.md) |
| Fieldwork protocols: [consent form](docs/protocols/consent-form.md), [session log](docs/protocols/session-log.md), [recording checklist](docs/protocols/recording-checklist.md), [elicitation guide](docs/protocols/elicitation-guide.md), [verification session](docs/protocols/verification-session.md), [working group charter](docs/protocols/working-group-charter.md), [AI use for protocols](docs/protocols/ai-use-policy.md) | `docs/protocols/` |
| AI use in general | [docs/methodology/ai-use-policy.md](docs/methodology/ai-use-policy.md) |
| Spelling and tone of user-facing text | [docs/style/canadian-style-guide.md](docs/style/canadian-style-guide.md) |

## Standards in brief

1. **Evidence before assertion.** Nothing is recorded as Chittagonian unless a speaker or a checked source supplied it. Unknown stays "Unknown."
2. **Levels apply to fields as well as entries.** A form, a gloss and an IPA transcription may each stand at a different evidence level. The draft entry schema (`schemas/lexical_entry_v2.schema.json`) has an `evidence` object for this; until it is adopted, record the difference in `notes`.
3. **Sources are cited only when checked.** Unchecked leads are marked `pointer, unchecked` in `sources/sources.jsonl`. Say what was opened and what was not.
4. **Consent belongs to the session.** Records inherit the session's consent. Withdrawal removes items from public layers and is logged.
5. **Confirmation is by speaker, not by count.** Record each speaker's response. Popularity is not evidence.
6. **Neither Bangla nor Rohingya is an authority** over Chittagonian. A Bangla equivalent is never recorded as a Chittagonian form.
7. **AI suggests; people decide.** AI output is labelled `AI-assisted / unverified` and is never a source.
8. **Nothing is lost.** Records are corrected by adding to their history, not by silent edits. Deletions are recorded in [docs/governance/decision-log.md](docs/governance/decision-log.md).
9. **Checks.** `python3 scripts/validate.py` checks structure only. It never decides linguistic truth. `python3 scripts/coverage_report.py` reports what exists in [reports/coverage.md](reports/coverage.md).
10. **Spelling of the project's names.** The language is written siṭaiṅga and the project siṭaiṅge in prose. The city and region are written Chittagong.
