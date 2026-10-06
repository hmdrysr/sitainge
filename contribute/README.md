# Contribute by Interview (no technical skills needed)

You can help document Sitainge by talking to an AI chatbot. It asks you to translate words and sentences into the way you actually speak, records exactly what you say, and produces a file you can submit. Nothing you share is accepted automatically; project reviewers check everything.

## What you need
- A phone or computer and any AI chatbot (Claude, ChatGPT, Gemini or similar).
- 15 to 30 minutes. You can stop at any time and still get an output.
- A free GitHub account, only if you want to submit it yourself.

## Steps
1. Open [`interview-prompt.txt`](interview-prompt.txt). Select all of it and copy it.
2. Paste it into a new chat with your chatbot and send it.
3. Answer the questions in your own natural Sitainge, in Latin letters or Bangla script, however you normally write. Spelling variants are welcome. Say "skip" or "we don't say this" whenever that is true. The chatbot will not correct you and cannot tell you the right word. That is on purpose.
4. When you are done, type **finish**. The chatbot reads your answers back and produces a block of text between `=== SITAINGE SUBMISSION START ===` and `=== SITAINGE SUBMISSION END ===`.
5. Submit it, using one of these:
   - **Yourself:** open <https://github.com/hmdrysr/sitainge/issues/new?template=interview-submission.yml>, paste the block, tick the boxes, press **Submit new issue**.
   - **Let the chatbot do it:** if your chatbot can create GitHub issues, it will ask your permission first. It only posts an issue; it can never change the project's files.
   - **No GitHub account:** send the block to the project contact (to be added by the project owner).

## Good to know
- **Licence:** published contributions are dedicated to the public domain under CC0 1.0. Anyone may use them, including for AI, and this cannot be undone once published. Choose "Discuss with me first" if you are unsure.
- **Privacy:** do not give your name, phone, address or ID. Say where you speak as precisely as you like. You may be credited by name, by contributor ID, or anonymously.
- **Adults:** contributors should be 18 or older. If you are younger, ask a parent or guardian to read the output before it is submitted.
- **Your rights:** share only things you have the right to share. For songs by known composers, give the title and performer, not the lyrics. Traditional oral songs, sayings, riddles and stories are welcome.
- **Not a test:** there are no wrong answers. If your village says it differently from others, that is exactly what the project wants.

## For reviewers (project side)
Submissions arrive as issues labelled `interview` and `raw`. A steward assigns a speaker ID, saves the block to a file, and runs:

```
pip install pyyaml
python3 scripts/ingest_interview.py submission.txt --speaker-id CTG-SPK-00001
python3 scripts/validate.py
```

The script keeps a full raw copy in `datasets/interviews/` and creates RAW lexicon records in `lexicon/raw/`. Nothing is accepted automatically. All items start at evidence level `unassessed`, are marked `ai_assisted`, and go through the normal review levels.

Method notes: interviews are conducted in English so that Bangla wording does not pull answers toward Bangla forms; elicitation comes before any verification so speakers are not shown existing forms first; the chatbot never supplies Sitainge.
