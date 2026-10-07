# Dadi: hand-off for future developers and AI

Read this first. Created by Hamid Yasir. CC0 (public domain), like the rest of the repository.

## What Dadi is
Dadi is a learning and contribution app for the Chittagonian language (Sitainge). "Dadi" is what most young Chittagonians call their grandmother, and the language is mostly learned from her.
It is a static web page and an installable PWA. It lives in `website/dadi/` and is published by the existing Pages workflow (`.github/workflows/main.yml`, which deploys everything under `website/`). Address: `https://<owner>.github.io/sitainge/dadi/`.

It does four jobs:
1. **Learn.** Short lessons (6 items): listen, repeat, recall. Review is scheduled by FSRS.
2. **Dictionary.** Words and sentences the app finds in the repository, with a trust label on each.
3. **Teach (contribute).** Native speakers and learners add words, spellings, variants, IPA and reports. Nothing leaves the device until the person sends it.
4. **Type tab and IPA keyboard.** The Type tab is a free keyboard; the same keyboard opens in Teach. QWERTY plus IPA symbols grouped under the Roman letter they relate to. Every key sounds when tapped, and "Hear it" plays the whole word.

Also: a first-time tour (`tour()` in `app.js`, repeatable from Me), a Look sheet for brightness and five colour schemes (no account needed), and a Word voice setting (automatic, device voice, or Dadi's own sound).

## Non-negotiable rules (from the project and the owner)
- No invented Chittagonian. The app never writes a Chittagonian form or IPA that a person did not supply. Machine readings of a spelling are labelled "approximate" and are saved with `ai-drafted-unverified`.
- Offline first, mobile first, open source and open standards only. No tracking, no ads, no third-party scripts, no fonts or images fetched from other sites.
- Data is never lost silently: checksummed saves, two rolling backups, an append-only history of every change and deletion, export and import.
- No spelling is wrong (D-015). Two registers are official: formal IPA, and everyday romanized writing (D-014).
- Bangla script appears only in the Rosetta layer, not in Dadi's Chittagonian content.
- Be plain about what is verified and what is not. Do not label something verified because it sounds right.
- Writing style for visible text: Canadian spelling; "Roman letters (Latin script)", "Bangla script"; short, plain, no filler.

## Files
```
website/dadi/
  index.html        shell, CSP meta, script order (order matters, no bundler)
  style.css         tokens, dark mode, components, keyboard
  config.js         the only file a deployer edits (see below)
  manifest.webmanifest, sw.js, icon*.svg/png
  data/seed.json    offline copy of repo content (rebuild: node scripts/build_dadi_seed.js)
  js/
    ipa-data.js     vowels (F1-F3), consonants (manner/place/voice), approximations, key layout
    synth.js        formant synthesizer, WAV export (pure JS, runs in Node for tests)
    native-tts.js   device voice: IPA to a sound-alike script (Bangla or Devanagari) that a device voice can read
    g2p.js          spelling to approximate IPA (rules table)
    audio.js        WebAudio playback, caching, pitch/speed
    keyboard.js     the IPA keyboard
    data.js         JSONL/YAML readers, normalizing, trust, index, lessons, GitHub scrape
    store.js        local storage with backups and history log
    srs.js + fsrs.umd.js   FSRS wrapper and vendored ts-fsrs 5.4.2 (MIT)
    github.js       device sign-in and issue creation
    submit.js       turns the contribution queue into the repo's submission format
    art.js          original SVG icons and the Dadi mascot
    app.js          routes, screens, lesson engine, flows
dadi-worker/relay.js           sign-in relay (no secrets)
workflows-to-install/dadi-tools.yml   the one workflow (install once; see SETUP.md)
scripts/dadi_ingest_issue.py   contribution issue to RAW records, automatic speaker id
scripts/build_dadi_seed.js     seed builder
scripts/ingest_interview.py    reviewer ingest (reads Dadi submissions, incl. IPA + status)
scripts/tests/dadi_*.js        tests
docs/dadi/                     this documentation + optional ingest workflow text
```

## `config.js`
```js
repo, branch            "hmdrysr/sitainge", "main"
githubClientId          GitHub App Client ID ("" = sign-in off)
relayUrl                the Cloudflare Worker address ("" = sign-in off)
requireSignIn           false by default (D-025). true = people must sign in before sending
contactEmail, creator, repoUrl
```
Edit it on GitHub (pencil icon works on a phone). Pages redeploys in about a minute. With the two sign-in values empty, the app still works fully; sending falls back to copy, save file, email and share.

## Data flow
1. **Load.** `boot()` shows the cached repo data or `data/seed.json` at once, then `refreshRepo()` asks the GitHub tree API for the branch and downloads the files matching `DadiData.WANTED` from raw.githubusercontent.com. Results are cached locally. Errors never block the app.
2. **Normalize.** Each record becomes an entry: gloss, form, spellings, kind (word/sentence), evidence level, state (raw/review/accepted), ipa and ipaStatus, consent.
3. **Filter.** Records with private, withdrawn or restricted consent are dropped.
4. **Rank.** `trust()` scores level + state, minus 2 if AI-made, plus bonuses for native-speaker confidence, speaker/audio/phonetician IPA, public consent. Higher trust appears first and is used first in lessons. Unverified items are included on purpose (D-020) and carry a visible label.
5. **Pronounce.** `pronunciation(entry)`: stored IPA wins; otherwise `g2p` of the first spelling; otherwise none (shown honestly, not played).
6. **Learn.** `lessons(index, 6)` chunks playable entries. Each card keeps FSRS state in the store.
7. **Contribute.** Teach builds queue items in the store. `DadiSubmit.build` uses `SitaingeCore.buildSubmission` (same format and fingerprint as the website form), batches up to 40 items, and either sends each batch as a GitHub issue titled `[Dadi] ...` (signed in) or offers the text for copy/file/email/share.
8. **Ingest.** A steward assigns a speaker id and runs `scripts/ingest_interview.py` (or the optional workflow). Output is RAW records; IPA lines are split into `ipa`, `ipa_status`; the tool never accepts anything.

## Trust and evidence
Evidence levels A-E/unassessed and the review states come from `EVIDENCE_POLICY.md`. Dadi never raises a level. `ipa_status` values: none, speaker-described, speaker-chosen-by-ear, audio-transcribed, phonetician-verified, ai-drafted-unverified (D-016, D-022).

## Privacy
- The 18+ and CC0 confirmations are required before a contribution can be built.
- A personal-information scan runs on text before export (shared with the website form).
- The sign-in token is held in local storage on the device, never exported (`exportAll` strips it), lasts 8 hours, and can only create issues in this repository.
- The service worker and app make requests only to the same origin, api.github.com, raw.githubusercontent.com and the relay (see the CSP in `index.html`).

## Tests
```
node scripts/tests/dadi_unit_test.js     storage, rollback, token not exported, g2p, every IPA symbol renders finite audio, jsonl/yaml, seed
node scripts/tests/dadi_relay_test.js    relay forwards only the two paths, checks origin and client id
node scripts/tests/website_core_test.js  shared submission format
python3 scripts/validate.py              repository records
```
Browser flow test (Playwright, mocks GitHub): not committed in this version; the steps it covered are listed in `docs/dadi/CONTENT_RULES.md` under "Manual check". Add one if you can.

## What was verified, and what was not (v0.1.0)
Verified: the code runs in a headless browser with mocked GitHub (scrape, lesson, review, queue, export, device sign-in, issue creation, backup); sound spectra were measured (formants, levels, no clipping); ingest produced 40 valid RAW records from a Dadi-made submission.
Not verified: how the voice sounds to a Chittagonian ear; a real GitHub App and relay; real phones and browsers other than headless Chromium; accessibility audit with a screen reader.

## Roadmap, in order
1. Replace synthetic voice with real speaker recordings (separate audio consent, already modelled in `audio/`). Play the recording when one exists; keep the synth for the keyboard.
2. Tune synthesizer with a phonetician. Chittagonian-specific sounds (aspiration, implosives, nasal vowels, tones) need expert review. Do not "fix" by guessing.
3. A reviewed curriculum file (`datasets/dadi-curriculum.yaml`?) so lessons can be ordered by topic, not only trust. Needs steward sign-off.
4. Reviewer view inside the app: show RAW items, record second-speaker agreement. Only after reviewers are appointed (see `GOVERNANCE.md`).
5. Replace the optional manual ingest workflow with automatic PR creation once speaker-id assignment is solved.
6. Accessibility pass; localization of interface text; larger audio and image sets.
7. Tune FSRS parameters once enough review data exists (request_retention is 0.9).
8. A second relay host option (Deno Deploy / Netlify function) in case Cloudflare is unavailable.

## Naming
The language is written siṭaiṅga in the app and in new text about it (D-028). Sitainge is the project and repository name. Chittagonian is the English name. Keep the dot below ṭ and the dot above ṅ.

## Gotchas
- Script order in `index.html` is the dependency order. There is no build step by design.
- `sw.js` caches by name `dadi-v1`; bump the version when shipping changes or old copies linger. It is network-first, so fixes appear on the next online load.
- CSP allows `style-src 'unsafe-inline'` because the app sets inline styles for the stitch patterns and layout. Do not add inline scripts.
- Pages is under `/sitainge/dadi/`; all paths are relative. Keep them relative.
- GitHub issue bodies are capped (about 65k characters); `submit.js` batches below that.
- Unknown spelling characters make `g2p` incomplete; the UI must say so rather than guess.
