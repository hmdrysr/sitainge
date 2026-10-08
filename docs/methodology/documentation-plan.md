# Documentation plan and proposed repository structure

Status: proposal, 8 October 2026. Nothing here is implemented. Sources are in `documentation-research.md`; "V" and "P" refer to its status column. Language: siṭaiṅga. No example forms are given below, because none have been verified.

## 1. Principles

1. **Recording first.** A word typed without a recording is a claim, not a record. Recordings are the primary data (Himmelmann 1998, V); entries are derived from them.
2. **Small, complete, citable units.** Every record can be cited, traced to a session and a speaker, and withdrawn (Bird & Simons 2003, V).
3. **Few fields, always filled.** A minimum viable record that is always complete beats a rich schema that is mostly empty.
4. **Coverage by design, not by accident.** Decide which words, texts and places are needed and track them.
5. **Speakers keep authority.** Consent is per session, revocable, and recorded (CARE, informed by; V).

## 2. What to collect, in order

| Phase | Aim | Content | Output |
|---|---|---|---|
| 0. Foundations | Decide the rules | Consent form, speaker register (private), session log, recording checklist, working-group charter, project glossing abbreviations | Docs only; no linguistic claims |
| 1. Core lexicon | 300 to 500 everyday items from 6 to 10 speakers | Leipzig-Jakarta 100 list (V), then a semantic-domain list (body, kin, food, house, water, farming, trade, weather, numbers, time) | Recorded wordlist sessions |
| 2. Sentence frames | Grammar skeleton | WALS-informed checklist (P): word order, case, agreement, negation, questions, tense and aspect, politeness levels, pronouns, demonstratives, classifiers, numerals | Recorded, translated sentences with glosses |
| 3. Connected speech | Natural usage | Narratives, procedures ("how to cook"), conversation, pear-story style picture descriptions, 20 to 40 minutes per speaker | Transcribed, translated texts |
| 4. Variation | Dialect and register | Same elicitation set across locations and age bands; formal and everyday registers | Comparative tables with counts |
| 5. Heritage and ethnography | Culture-bound items | Proverbs, songs, place names, oral history | Items with speaker-controlled access |

Rule: do not start Phase 4 before Phase 1 has 6 or more speakers with recordings and Phase 0 is signed off.

## 3. Efficient elicitation with small time budgets

Assume a speaker offers 20 to 30 minutes, once, by phone or in person.

- **Prepared sheet, one page.** 25 to 40 prompts, ordered easiest first, in English (or pictures). The speaker answers aloud; the interviewer records and fills in only the session header live. Transcription happens later.
- **Pictures over translation** for concrete nouns and actions, to reduce English influence. Use a licence-clear image set.
- **Sentence repetition**: speaker says the item, then once more at normal speed. Two takes per item at most.
- **Semantic-domain mini-sessions**: one domain per sitting (Rapid Word Collection logic, P). Group sessions of 3 to 5 speakers are faster for vocabulary but must be flagged `group` because speakers influence each other.
- **Close with 2 minutes of free speech** (a short story or a description of the speaker's day). This is the cheapest source of connected speech.
- **Async mode.** Speakers record themselves in Dadi or a phone app against prompts; the project owner reviews. Flag `self_recorded`; audio quality gate applies.
- **Verify by a second speaker**, not by the first. Verification sessions are listening tasks ("is this said where you live?"), 10 minutes, no typing.

## 4. Minimum viable records

A record is minimum viable if it has:

| Record | Required |
|---|---|
| Recording | Audio file, session ID, speaker ID, date, consent tier, prompt, device |
| Lexical entry | Form as heard or typed, English gloss, recording ID or "none", source, state, evidence level |
| Text | Audio, transcription (orthographic, as spoken), free translation, speaker, session |

Everything else (IPA, grammatical category, example, etymology, comparative data) is optional and may remain null. Null is honest; invented is not.

## 5. Dialect sampling design

Goal: document variation across Chittagong District and Cox's Bazar District without assuming where boundaries lie.

- **Unit of place.** Upazila (subdistrict) for both districts; city wards where useful. Record place at upazila level only in public data; finer locality stays private.
- **Stratification.** Cover each upazila with at least 2 speakers before adding a third anywhere. Keep a coverage grid (place by age band by gender), and fill the emptiest cell first.
- **Speaker criteria.** Grew up in the place and spent most of childhood there; both parents from the area, or note otherwise. Record years lived elsewhere. Age bands: under 30, 30 to 59, 60 and over. Gender recorded as the speaker describes it.
- **Style levels** (Labov, Tagliamonte, P): wordlist, reading (only when a reading task exists), interview, spontaneous speech. Note the style on every recording.
- **Dialect geography method** (Trudgill, Chambers & Trudgill, P): a fixed questionnaire of 50 to 100 items asked identically everywhere, so differences can be compared. Choose items from Phase 1, not from the researcher's guesses.
- **Hypothesis stance.** Variation is recorded, not ranked. No variety is "standard" or "pure" until the working group says so with evidence. Boundaries are outputs of the data, not inputs.
- **Contact and urban effects.** Record urban and rural speakers separately; note multilingual contact (Bangla, English, Urdu, Hindi, Rohingya) as speaker metadata, not as a judgement.
- **Minimum for a variation claim.** Three or more independent speakers in each place compared, same prompt, recorded. Anything less is `C` or lower.

## 6. Recording and consent protocol

**Equipment and setting**
- Phone is acceptable. Lossless or high-bitrate WAV, 44.1 or 48 kHz, 16 bit or higher; mono is fine for one speaker.
- Quiet room, no fan, microphone 15 to 20 cm from the mouth, no phone handling during recording. Say the session ID at the start.
- Record the prompt read aloud by the interviewer on a separate pass or note it in the log, so it can be heard but not confused with the response.
- Keep the original; work on copies. Hash every original (SHA-256) at intake.

**Consent**
- Plain-language form in the speaker's preferred language, read aloud, with oral consent recorded when writing is a barrier.
- Separate choices: (a) record at all; (b) keep in research archive; (c) publish publicly (CC0); (d) name or keep pseudonymous; (e) permit AI-assisted processing.
- Speaker may withdraw any time; withdrawal removes the item from public layers and is logged.
- Under-18s: guardian consent plus the child's own assent.
- Never record bystanders. Never publish exact home locality.
- Consent lives with the session, not the entry; entries inherit it. Today the schema puts consent on each entry (see section 11).

## 7. Quality gates

| Gate | Check | Fails if |
|---|---|---|
| G1 Intake | File opens; hash stored; session log complete; consent present | Any missing |
| G2 Audio | Speech clear; no clipping; low noise; one speaker per file unless flagged | Unusable audio; keep file, mark `audio_quality: poor` |
| G3 Transcription | Orthographic transcript by a speaker or trained reviewer; AI drafts labelled | Unreviewed AI text |
| G4 Review | Second speaker confirms or disputes; disagreements recorded | Silent edits |
| G5 Promotion | Evidence level meets rule below; consent permits publication | Level E or D; consent not `public` |
| G6 Release | `validate.py` passes; Dadi build reads the data; checksums match | Any |

Promotion rule: RAW to REVIEW needs G1 to G3. REVIEW to ACCEPTED needs G4 with confirmation by at least one speaker other than the source, plus audio. Every promotion and demotion is logged.

## 8. Transcription, glossing and orthography

**Glossing.** Leipzig Glossing Rules (V). Publish the project abbreviation list. Until morpheme analysis exists, gloss only at the word and free-translation level; do not segment morphemes by guesswork. Mark analyses `Proposed`.

**Orthography working group** (Cahill & Rice, Eira, Seifart, all P)
1. Charter: members (speakers from several upazilas, teachers, writers, a linguist), decision rules, and how disagreements are recorded.
2. Inventory: collect existing spellings in use (Bangla-script, Roman, mixed), with who uses them. No judgement.
3. Phonemic evidence: minimal pairs and recordings for contrasts, gathered before proposing symbols.
4. Candidate conventions: one or more proposals, each with a stated rationale, kept in `docs/hamidian-script/`.
5. Testing: readers and writers try each proposal on unseen words; record error rates and preference.
6. Decision: group decision logged with dissent; versioned; old spellings remain valid as variants.
7. Review date: revisit after a fixed interval.

Two spelling layers coexist: an everyday layer (as typed) and a reference layer (working-group proposal). Neither overwrites the other.

**Diglossia and unstandardised language.** Record register explicitly on every item. Do not "correct" toward Bangla. Keep the Rosetta layer separate.

## 9. Metadata, archiving and licensing

- **Identifiers.** Stable IDs that do not change with workflow state; separate IDs for speaker, session, recording, entry and text.
- **Language codes.** ISO 639-3 `ctg` (P, confirm); Glottolog code to be confirmed.
- **Descriptive metadata.** Dublin Core / OLAC-compatible fields (V for OLAC record) generated from the session log, not typed twice.
- **Deposit.** Choose an archive early (candidates: ELAR, PARADISEC, AILLA, Kaipuleohone; all P). Audio is large, so Git holds the catalogue, hashes and metadata, while audio lives in the archive and a mirror. Keep two independent offline copies.
- **Licensing.** CC0 for text derived from consenting speakers' public items; audio follows the consent tier (a speaker may allow a recording to be heard but not reused). `LICENSING.md` should state this difference.
- **Citation.** Each item gets a citation string and a DOI at archive deposit.

## 10. How AI may and may not help

**May** (always labelled `AI-assisted / unverified`):
- Draft a transcript from audio, for human correction.
- Find duplicates, near-spellings and inconsistent fields.
- Draft consent-form wording and prompt sheets for human review.
- Convert formats, build indexes, write tests.
- Suggest which coverage cells are empty.

**May not**:
- Supply or "complete" forms, glosses, IPA, grammar or example sentences.
- Verify another AI's output, or serve as a speaker.
- Rank spellings or decide the orthography.
- Process audio from speakers who have not agreed to AI processing.

Test of the rule: removing every AI-assisted field must leave the evidence record intact. Existing policy (`EVIDENCE_POLICY.md`, `docs/methodology/ai-use-policy.md`) already says this; the additions are the consent choice (e) and the audio restriction.

## 11. Measuring completeness and coverage

Track in `reports/coverage.json`, regenerated by script:

| Measure | Definition |
|---|---|
| Lexical coverage | Share of the Leipzig-Jakarta list and of each semantic domain with at least one recorded, confirmed entry |
| Speaker coverage | Speakers per upazila and per age and gender band |
| Recording hours | Total, transcribed, translated, glossed, reviewed |
| Verification depth | Share of entries confirmed by two or more independent speakers |
| Grammar coverage | Share of the feature checklist with at least one recorded example |
| Variant density | Number of entries with two or more recorded variants (a sign of real sampling, not of messiness) |

Report counts and denominators, never a single score. "Complete" is never claimed; coverage is stated against a named list.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Typed words without audio dominate | Phase order; coverage report shows audio share |
| Single-speaker bias (so far one native speaker's entries and archaic or translated sources) | Speaker quotas by upazila; flag single-speaker items |
| Re-identifying speakers via public metadata | Coarse place and age bands; speaker register private |
| AI-generated text entering as data | Labels, validator rule, audit sample |
| Data loss | Hashes, two independent backups, append-only logs, no history rewrites |
| Contributor fatigue; low quality submissions | Short sessions; moderator review; visible credit |
| Orthography conflict | Layered spellings; documented dissent; no forced standard |
| Colonial or historical sources treated as current usage | Source date and spelling system recorded as fields (already done for 1886 harvest) |
| Legal and licence confusion | Consent tiers; separate audio licence note |

## 13. Proposed repository structure

### Current structure, assessed

| Current | Assessment |
|---|---|
| `lexicon/{raw,review,accepted,archived}/*.jsonl` | Keep. State folders are workable and Dadi depends on them. Risk: folder and `state` field can disagree; add a validator check. |
| ID pattern `CTG-LEX-RAW-nnnnn` embeds state | Weakness. Promotion changes the ID, so citations break. Recommend state-free `CTG-LEX-nnnnn` for new records. Breaking for `validate.py` and the schema pattern; `data.js` treats `id` as opaque except that it detects texts by the `CTG-TXT` prefix or the `corpus/texts` path (line 89), so keep that prefix for text records. |
| Phrases and sentences stored as lexical entries (e.g. UDHR sentences in `lexicon/raw/`) | Weakness. Sentences are text, not lexemes. Move to `corpus/` with a text schema. |
| `corpus/texts/*.yaml` | Keep path (Dadi reads it). YAML is parsed by a minimal reader; prefer JSONL for new corpus files. |
| `corpus/{transcripts,translations,annotations}/` empty | Drop or merge: one text record should hold transcript, translation and gloss. Fewer folders. |
| `datasets/` | Keep path (Dadi reads it). Rename later to `lexicon/raw/` only with a Dadi change. |
| `audio/{metadata,catalogue}/` | Merge into `recordings/` with one record per file; audio itself stays out of Git. |
| `cultural/*` six empty folders | Keep one place for heritage items but as a `type` field in `corpus/`; six empty folders add no value yet. Drop until populated. |
| `comparative/rohingya/` | Keep, small. Generalise to `comparative/`. |
| `archive.gitkeep`, `website.gitkeep` in root | Stray files; drop. |
| `schemas/lexical_entry.schema.json` | Needs a sense structure, session-level consent, and stable ID (below). |
| `consent` on every entry | Move to session and inherit. |
| `region` free text; `confidence` free text; `recording` free text | Replace with coded `place` (upazila), enum `confidence`, and `recording_id` reference. |
| Speaker register (`lexicon/speakers.json`, per `dadi_ingest_issue.py`) | Must not be public if it carries age, place or gender. Keep only IDs and coarse bands public. |
| `EVIDENCE_POLICY.md` A to E levels | Keep. Add that levels apply per field (form, gloss, IPA) not only per entry. |
| `RESEARCH_STANDARDS.md` (two lines) | Expand: link to this plan and the research table. |

### Proposed additions

| Folder | Content | Break risk |
|---|---|---|
| `sessions/` | One JSONL per session: ID, date, interviewer, place (upazila), style, device, consent tier, prompt set | None (Dadi ignores it) |
| `recordings/` | One record per audio file: ID, session, speaker, hash, duration, format, quality, access tier, archive location | None |
| `speakers/` | Public pseudonymous IDs with coarse bands only; full register private, outside Git | Conflicts with `lexicon/speakers.json` path; migrate the writer script |
| `sources/` | Source register as data (one record per source, status `checked` or `pointer, unchecked`) | None |
| `prompts/` | Elicitation sheets (Leipzig-Jakarta, domains, grammar checklist) as data | None |
| `reports/` | Generated coverage and audit reports | None |
| `corpus/texts/` | Add sentence and narrative records (JSONL) | Dadi reads this path; new JSONL must match what its normaliser accepts |

### Record fields (proposed)

**Lexeme (core)**: `id` (state-free), `state`, `headword_as_heard`, `spellings[]`, `register`, `place` (upazila code), `senses[]` (each with `gloss_en`, `pos`, `domain`), `recording_ids[]`, `session_id`, `speaker_id`, `evidence_level` (per field where it differs), `confirmations[]` (speaker, date, outcome), `ai_assisted`, `provenance`, `decision_history`, `notes`.

**Text**: `id`, `kind` (word list, sentence, narrative, proverb, song, place name, history), `recording_id`, `transcript`, `translation_en`, `gloss`, `speaker_id`, `session_id`, `state`, `evidence_level`.

**Optional, kept null until evidenced**: `ipa` with `ipa_status` and source (already present), `etymology`, `comparative_data`, `pronunciation`.

**Drop or demote**: `generation` (replace with the speaker's age band), `confidence` as free text, per-entry `consent`.

## 14. Compatibility: what would break

| Change | Affects | Action |
|---|---|---|
| Renaming `lexicon/raw|review|accepted` | Dadi `WANTED` regex in `website/dadi/js/data.js` line 8; `scripts/validate.py` globs; unpack workflow | Do not rename. |
| Renaming `datasets/` or `corpus/texts/` | Same `WANTED` list | Do not rename without editing the regexes and tests. |
| Changing the ID pattern | Schema `pattern`, `validate.py`, `dadi_ingest_issue.py`, `data.js` line 89 (`CTG-TXT` prefix test); sort and de-duplication use `id` as a plain string | Introduce new pattern for new records; accept both during migration. |
| Adding `senses[]` | Dadi `normalize()` expects `english_gloss` | Keep `english_gloss` as a derived field, or update `normalize()` and its tests. |
| Removing `consent` from entries | Dadi `HIDDEN_CONSENT` filter hides private, withdrawn and restricted entries | Keep an inherited `consent` value on each record until Dadi reads sessions; a record with no `consent` is treated as `permission pending` (line 93), not hidden. Withdrawal must keep working. |
| Moving speaker file | `dadi_ingest_issue.py` | Update the script and its workflow together. |
| Adding new top-level folders | Nothing (Dadi filters by regex) | Safe. |

## 15. Recommended order of work

1. Add `sessions/`, `recordings/`, `sources/`, `prompts/` and their schemas. No breakage.
2. Write the consent form and session log; run a pilot of 3 speakers, 30 minutes each.
3. Add the coverage report script.
4. Decide the ID change and sense structure with the Dadi maintainer; ship both with tests.
5. Move sentences from `lexicon/raw/` to `corpus/texts/`.
6. Convene the orthography working group.
