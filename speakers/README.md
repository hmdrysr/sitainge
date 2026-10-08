# speakers/

Public speaker records, in JSONL. Schema: `schemas/speaker.schema.json`.

A public record holds only a pseudonymous ID (`CTG-SPK-nnnnn`), a coarse age band (under 30, 30 to 59, 60 and over), gender as the speaker describes it (or not stated), and the district and upazila. The schema refuses any other field, so names, contact details, exact ages and localities cannot be added by accident.

**The full speaker register stays private, outside Git.** It links each ID to the person and holds anything finer than these bands, under the consent the speaker gave.

Existing arrangement: `scripts/dadi_ingest_issue.py` writes a hashed-login-to-ID map to `lexicon/speakers.json`. That path and script are unchanged. Moving it is a migration step listed in `docs/methodology/STRUCTURE.md` and needs the script and its workflow to change together.

Status: no speaker records have been added yet.
