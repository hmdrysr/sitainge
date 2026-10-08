# Votes

`votes.jsonl` holds one JSON object per line, one line per vote. It starts empty. Votes are added by `scripts/ingest_votes.py` from GitHub issues titled `[Vote] <entry id>`, or by a reviewer with `"origin": "manual"`.

```json
{"id":"CTG-VOTE-00001","entry_id":"CTG-LEX-RAW-04001","kind":"agree","spelling":null,"region":null,"voter":"github:example-login","date":"2026-10-08","origin":"issue#12","note":""}
```

- `kind` is `agree`, `disagree` or `spelling`. A spelling vote carries the spelling in `spelling`; the other kinds leave it `null`.
- The voter is a GitHub account. One account has one vote per entry and kind. A later vote from the same account replaces the earlier one, and someone who changes from agree to disagree is counted once. Rows without a voter are ignored.
- The file is append-only. To remove the effect of a vote, a reviewer appends a line to `exclusions.jsonl` (`vote_id` or `voter`, `reason`, `by`, `date`). Nothing is edited or deleted.
- Votes are signals, not evidence. They never change an evidence level or a state. The rules are in `docs/protocols/voting-and-consensus.md` and `schemas/consensus_rules.json`; the schemas are `schemas/vote.schema.json` and `schemas/vote_exclusion.schema.json`.
- Logins are public GitHub names and are stored here in plain text, unlike speaker ids (which are hashed). Anyone who does not want that should not vote.
