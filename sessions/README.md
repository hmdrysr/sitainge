# sessions/

One record per documentation session, in JSONL (one JSON object per line), for example `sessions/2026-11-pilot.jsonl`. Schema: `schemas/session.schema.json`. Protocol: `docs/protocols/session-log.md`.

A session record holds the date, the interviewer (pseudonymous), the place at upazila level only, the style of session, the device, the prompt sets used and the **consent**. Consent lives here, and records from the session inherit it (`entry_consent`).

Status: no sessions have been recorded yet. This folder holds no data, and nothing here should be read as evidence that sessions have taken place.

Privacy: never record a street, village, building or any detail that would identify a speaker. `python3 scripts/validate.py` checks every file here against the schema.
