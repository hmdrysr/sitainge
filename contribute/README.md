# Contribute by interview (no technical skills needed)

Contributors can help document siṭaiṅga by talking to an AI chatbot. The chatbot asks the contributor to translate words and sentences into the way they actually speak, records exactly what they say, and produces a file to submit. Nothing shared is accepted automatically; project reviewers check everything.

## Two ways to contribute
- **Web page (no chatbot, no account):** the contribution page at `https://hmdrysr.github.io/sitainge/` (once published; see `website/README.md`). It works offline and sends nothing until the contributor chooses to send.
- **Chatbot interview:** the steps below. Chatbots cannot record a voice. To add voice recordings, use the web page.

## What is needed
- A phone or computer and any AI chatbot (Claude, ChatGPT, Gemini or similar).
- 15 to 30 minutes. The contributor can stop at any time and still get an output.
- A free GitHub account, only for contributors who want to submit the output themselves.

## Steps
1. Open [`interview-prompt.txt`](interview-prompt.txt). Select all of it and copy it.
2. Paste it into a new chat with the chatbot and send it.
3. Answer the questions in your own natural siṭaiṅga, in Latin letters or Bangla script, however you normally write. Spelling variants are welcome. Say "skip" or "we don't say this" whenever that is true. The chatbot will not correct the answers and cannot supply the right word. This is deliberate.
4. When finished, type **finish**. The chatbot reads the answers back and produces a block of text between `=== SITAINGE SUBMISSION START ===` and `=== SITAINGE SUBMISSION END ===`.
5. Submit the block in one of these ways:
   - **Directly:** open <https://github.com/hmdrysr/sitainge/issues/new?template=interview-submission.yml>, paste the block, tick the boxes and press **Submit new issue**.
   - **Through the chatbot:** if the chatbot can create GitHub issues, it asks permission first. It only posts an issue; it can never change the project's files.
   - **Without a GitHub account:** email the block to ctg@hamidyasir.com.

## Good to know
- **Licence:** published contributions are dedicated to the public domain under CC0 1.0. Anyone may use them, including for AI, and the dedication cannot be undone once published. A contributor who is unsure should choose "Discuss with me first."
- **Privacy:** do not give a name, phone number, address or ID. Say where you speak as precisely as you like. A contributor may be credited by name, by contributor ID, or anonymously.
- **Adults:** contributors should be 18 or older. A younger contributor should ask a parent or guardian to read the output before it is submitted.
- **Rights:** share only material you have the right to share. For songs by known composers, give the title and performer, not the lyrics. Traditional oral songs, sayings, riddles and stories are welcome.
- **Not a test:** there are no wrong answers. If a village says a word differently from others, the project wants to record that.

## For reviewers (project side)
Submissions arrive as issues labelled `interview` and `raw`. A steward assigns a speaker ID, saves the block to a file, and runs:

```
pip install pyyaml
python3 scripts/ingest_interview.py submission.txt --speaker-id CTG-SPK-00001   # or a .zip with audio from the web page
python3 scripts/validate.py
```

The script keeps a full raw copy in `datasets/interviews/` and creates RAW lexicon records in `lexicon/raw/`. For zips with recordings, it verifies every clip's fingerprint, saves the clips in `audio/staging/` (gitignored, never committed) and writes a catalogue entry in `audio/catalogue/`. Audio leaves staging only according to its consent: research-only audio goes to the long-term archive's restricted access, and public audio goes to the archive and the release. Nothing is accepted automatically. All items start at evidence level `unassessed`, are marked `ai_assisted`, and go through the normal review levels.

Method notes: interviews are conducted in English so that Bangla wording does not pull answers toward Bangla forms. Elicitation comes before any verification, so speakers are not shown existing forms first. The chatbot never supplies siṭaiṅga.
