# Interview submission format (version 1)

Defined in `contribute/interview-prompt.txt`. Required top-level keys: `sitainge_interview_version`, `interview_id`, `consent`, `speaker`, `items`, `review`. Each item requires `n`, `type`, `prompt_english`, `status`. Allowed `status`: used, not_used, unsure, skipped. Allowed `type`: word, sentence, proverb, idiom, riddle, rhyme, song_line, place_name, story, other. `scripts/ingest_interview.py` enforces this.
