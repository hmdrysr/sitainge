# Session log

Purpose: one record for every documentation session, completed during or straight after the session. It becomes a line in `sessions/*.jsonl` (schema: `schemas/session.schema.json`). Consent is recorded here, once, and every record from the session inherits it.

## Before the session

1. Assign the next session ID, `CTG-SES-nnnnn`.
2. Confirm the consent choices (a) to (e) with the speaker using `consent-form.md`. Record the answers. If the speaker declines (a), do not record.
3. Choose the prompt sets from `prompts/` and note their names.

## Fields

| Field | What to write |
|---|---|
| `id` | `CTG-SES-nnnnn` |
| `date` | ISO date, for example 2026-11-14 |
| `interviewer` | Pseudonymous ID or role. No full name unless the person has agreed. |
| `place` | District and upazila only. Do not write the street, village or building. |
| `style` | `wordlist`, `conversation`, `narrative`, `verification` or `other`. Add `group` to the notes when more than one speaker is present, because speakers influence one another. |
| `device` | Phone or recorder class and microphone, for example "phone, built-in microphone". |
| `speaker_ids` | Pseudonymous speaker IDs, `CTG-SPK-nnnnn`. |
| `prompt_sets` | Names of sets used, for example `leipzig-jakarta-100`. |
| `consent` | The five choices: `record`, `research_archive`, `publish_cc0`, `credit` (`named` or `pseudonymous`), `ai_processing`. Add `oral_consent_recorded` and `guardian_consent_and_assent` when they apply. |
| `entry_consent` | The consent value that records from this session inherit: `public`, `research-only`, `restricted`, `private` or `permission pending`. `public` requires `publish_cc0` to be yes. |
| `recording_ids` | Added once the files are registered. |
| `notes` | Anything that affects interpretation: noise, interruptions, a speaker's comment about a word, self-recording. |

## After the session

1. Copy the originals to the archive, calculate their SHA-256 hashes, and create the recording records (see `recording-checklist.md`).
2. Register the speaker if new. Keep the full register private; publish only the coarse record.
3. Run `python3 scripts/validate.py`. Fix errors before the session is considered logged.
4. If the speaker withdraws later, set `withdrawn` and `withdrawn_on` and update every related record. Withdrawal removes the items from public pages and is logged, never silently deleted.

## Example (placeholder values only)

```json
{"id": "CTG-SES-00001", "date": "2099-01-01", "interviewer": "interviewer-A", "place": {"district": "[district]", "upazila": "[upazila]"}, "style": "wordlist", "device": "phone, built-in microphone", "speaker_ids": ["CTG-SPK-00001"], "prompt_sets": ["leipzig-jakarta-100"], "consent": {"record": true, "research_archive": true, "publish_cc0": false, "credit": "pseudonymous", "ai_processing": false}, "entry_consent": "research-only"}
```
