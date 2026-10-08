# Changelog

## Unreleased
- Rohingya romanized corpus (4,708 unverified records) in its own layer with a dictionary switch (D-060); Bandarban and other districts removed from map and facts (D-058); sentences classified correctly in Dadi (D-059); Rosetta sentence pairs added (about 10,800), with licence cautions in `docs/research-gaps/`.
- Voting and consensus (D-055, D-056): Dadi votes arrive as `[Vote]` GitHub issues and are recorded in `votes/votes.jsonl` by `scripts/ingest_votes.py`. `scripts/consensus.py` computes two separate labels into `website/data/consensus.json`: auto-confirmed by consensus (two independent source groups agree) and community consensus (5 voters, 80% agreement). Neither is verification or endorsement, and neither changes an evidence level. Rules and source independence groups are in `schemas/consensus_rules.json`; policy in `docs/protocols/voting-and-consensus.md`.
- Dadi tools workflow gains `ingest-votes` and `consensus` tasks; `consensus` also runs after `unpack-zip` and `ingest-votes`. `validate.py` checks vote rows and the rules file.
- Lessons in Dadi play no computer voice (D-050, amended by D-057). Sound-alike text-to-speech is restored for the IPA keyboard and chart, translator, word sheets and dictionary. A listen button appears in lessons only when a public recording exists.
- Dictionary rebuilt with typo-tolerant search, a detail sheet, filters and a browse mode (D-051).
- Teach tab gains a discovery card with random words and sentences to check or add (D-052). Answers are local family notes, not verification.
- The site's colour theme is now a day and night button in the header instead of a footer control (D-053). Videos show YouTube thumbnails, with a plain tile when the image cannot load (D-054).
- Project site reorganized: region and map first, one aligned header with a Menu sheet on narrow screens, brighter blue palette (D-049).
- Copy rewritten in Canadian academic and professional English across the site, Dadi, extension and documentation (D-045). Project header reads siṭaiṅge.
- One icon family, Tabler Icons; decorative illustration and `art.js` removed (D-046).
- Dadi learning path redesigned from teaching research: theme units, retrieval-first lesson flow, honest progress (D-047).
- Research documents added: teaching, documentation methodology, interface design, style guide, icon coverage.
- Additive repository structure for sessions, recordings, speakers, sources, prompts and reports, with schemas, protocols and a coverage report (D-048).
- Site redesign (D-039, D-040): journal-style landing page; live data from the repository; map of Chittagong and Cox's Bazar districts with unions, municipalities, City Corporation wards and metropolitan police areas.
- Dictionary site, translator page and Chrome/Firefox extension (D-044).
- Dadi: videos first, IPA chart, whole-word keyboard suggestions, picture icons, smoother device voice (D-041 to D-043).
- Dadi redesign (D-032): five tabs, large titles, grouped lists and shelves, sheets, five colour schemes with light and dark, fixed-proportion IPA keyboard, tested from 320 to 1280 px.
- Voices (D-033): device voice, optional clear offline voice (eSpeak NG, GPL, vendored and removable), and Dadi's own synthesizer; choose in Me > Voice. Fixed hiss and clicks in the synthesizer.
- Translator and "connect your own AI" in Dadi (D-037). Bookmarklet translates ordinary web pages from the project's words.
- Landing page (D-034, D-035): why the project exists, how to use Dadi, how to contribute, interactive map of Chittagong Division, administrative divisions, local government, history, videos and photos.
- Video and photo vetting: weekly Dadi tools task, in-app reports, moderators' guide (D-036).
- AI contribution guide and `AGENTS.md` (D-038).
- Dadi learning and contribution app (`website/dadi/`, PWA): listen/repeat/recall lessons, FSRS review, dictionary scraped from the repository, IPA keyboard that sounds each key, GitHub sign-in contribution, offline backups (D-019 to D-027). Relay in `dadi-worker/`, docs in `docs/dadi/`, optional ingest workflow text.
- Schema: `ipa_status` gains `speaker-chosen-by-ear`.
- Two registers proposed: formal (IPA) and everyday (romanized, any spelling) (D-014, D-015, D-016; OD-004, OD-005). Marked Proposed.
- Schema: `ipa_status`, `ipa_source`, `spellings`, `form_note`.
- First native-speaker session data ingested as RAW: 8 entries (`lexicon/raw/2026-10-07-owner-session-1.jsonl`, D-017).
- AI Test Log 1 (`docs/methodology/ai-test-2026-10-07.md`): failure modes of unverified AI guesses; proposed working-paper changes.
- 24 candidate sources (`docs/research-gaps/starter-sources.md`); S001 dead link noted; S006 added.
- CONTRIBUTING: spelling and IPA note.

## 0.1.0 — 2026-10-07 (first release)
First versioned release of the Chittagonian Language Project scaffold.
- Governance, evidence policy, ethics, privacy and research standards.
- Licence: CC0 1.0 for the whole repository (D-006).
- Data schema, structural validator, 18 issue forms with CC0 dedication, CODEOWNERS (placeholders), PR template.
- 2019 starter list (30 entries), 2 sentences and UDHR Article 1 rendering ingested as RAW. No entries accepted.
- Source register (4 checked sources, remaining marked as unchecked pointers).
- Hamidian Script v0 working specification (proposed; no letter-to-sound mapping).
- AI working paper v0.1.
- Optional voice recording on the web page (separate audio consent, per-clip fingerprints, zip bundle), reviewer ingest for audio, audio catalogue validation, gitignored audio staging.
- Contribution web page for GitHub Pages (`website/`): offline-capable, no sign-up, nothing sent without the contributor's action, consent gate, personal-information scan, fingerprinted export.
- Contribute-by-interview kit: chatbot interview prompt, submission format, issue form and reviewer ingest script (`contribute/`, `scripts/ingest_interview.py`).
- Language names register (`docs/language/names.md`); native name Sitainge added to README and citation metadata.
See `docs/releases/0.1.0.md` for limitations and gaps.
