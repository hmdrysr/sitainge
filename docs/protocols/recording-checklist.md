# Recording checklist

Audio is evidence, so it is handled carefully. Audio files stay out of Git. Git holds only the record about each file (`recordings/*.jsonl`, schema `schemas/recording.schema.json`).

## Before recording

- [ ] Consent choice (a) is yes and is logged in the session record.
- [ ] Quiet room. Fans, televisions and generators off or far away. No bystanders in range; if there are any, move.
- [ ] Phone in flight mode or do-not-disturb. Notifications silent.
- [ ] Recording settings: WAV or another lossless format, 44.1 or 48 kHz, 16 bit or higher; mono is fine for one speaker.
- [ ] Microphone about 15 to 20 cm from the mouth, held still. No handling noise.
- [ ] Battery above half and enough storage for the session.

## During recording

- [ ] Say the session ID aloud at the start.
- [ ] Read each prompt aloud on a separate pass or note it in the log so that the prompt is not confused with the answer.
- [ ] Ask for each item twice at most: once, then once again at normal speed.
- [ ] Do not suggest an answer. Do not correct the speaker.
- [ ] Note anything the speaker says about an item (for example "my grandmother said it differently").
- [ ] Close with about two minutes of free speech if the speaker agrees.

## After recording

- [ ] Keep the original file untouched. Work on copies only.
- [ ] Calculate the SHA-256 hash of each original and store it in the record.
- [ ] Listen for clipping, noise and gaps. Mark `quality` as `good`, `fair` or `poor`, and explain in `quality_note`. A poor file is kept and marked, not deleted.
- [ ] Copy the original to the archive location and write that location in `archive_location`.
- [ ] Set `access_tier` to follow the session consent. A recording may be heard but not reused if the speaker so chose.
- [ ] Add the recording ID to the session record.
- [ ] Run `python3 scripts/validate.py`.

## Quality gates (from the documentation plan)

G1 Intake: file opens, hash stored, session log complete, consent present. G2 Audio: speech clear, no clipping, low noise, one speaker per file unless flagged. Any failure is recorded and the file is kept.
