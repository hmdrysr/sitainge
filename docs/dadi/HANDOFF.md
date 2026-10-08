# Dadi: hand-off for future developers and AI

Read this first. Hamid Yasir created Dadi. It is CC0 (public domain), like the rest of the repository.

## What Dadi is
Dadi is a learning and contribution app for the Chittagonian language (siṭaiṅga). "Dadi" is the word most young Chittagonians use for their grandmother, and the language is mostly learned from her.
The app is a static web page and an installable PWA. It lives in `website/dadi/` and is published by the existing Pages workflow (`.github/workflows/main.yml`, which deploys everything under `website/`). Address: `https://<owner>.github.io/sitainge/dadi/`.

It does four jobs:
1. **Learn.** Videos first (when any exist), then theme units taught in the session flow of `docs/dadi/LEARNING_DESIGN.md`: preview, retrieval attempts, production, delayed retrieval and interleaved review, at most five new items per session. FSRS schedules review (desired retention 0.90, maximum interval 180 days).
2. **Dictionary.** Words and sentences that the app finds in the repository, each with a trust label.
3. **Teach (contribute).** Native speakers and learners add words, spellings, variants, IPA and reports. Nothing leaves the device until the person sends it.
4. **Write.** A sound keyboard (QWERTY plus every IPA symbol; each key states its sound) and a translator that looks English up in the project's own words (`translate.js`). The translator comes with a bookmarklet for ordinary web pages and an optional connection to the person's own AI (`ai.js`).

The app also includes an IPA chart and keyboard suggestions of whole words, **Watch and listen** (vetted videos, tap to play, report button), a first-time tour (`tour()`), Me > Appearance (brightness and five colour schemes, no account needed) and Me > Voice (device voice, clear offline voice, Dadi sound). Design rules are in `DESIGN.md`.

## Non-negotiable rules (from the project and the owner)
- No invented Chittagonian. The app never writes a Chittagonian form or IPA that a person did not supply. Machine readings of a spelling are labelled "approximate" and are saved with `ai-drafted-unverified`.
- Offline first, mobile first, open source and open standards only. The app has no tracking, no ads, and no third-party scripts or fonts. The only outside content is a YouTube video after the person taps play (privacy-enhanced embed) and, on the landing page, credited Wikimedia Commons photos.
- Data is never lost silently. The app keeps checksummed saves, two rolling backups, an append-only history of every change and deletion, and export and import.
- No spelling is wrong (D-015). Two registers are official: formal IPA, and everyday romanized writing (D-014).
- Bangla script appears only in the Rosetta layer, not in Dadi's Chittagonian content.
- State plainly what is verified and what is not. Do not label something verified because it sounds right.
- Writing style for visible text: Canadian academic and professional English as set out in `docs/style/canadian-style-guide.md`; "Roman letters (Latin script)" and "Bangla script"; short, plain sentences, no marketing language or exclamation marks.

## Files
```
website/dadi/
  index.html        shell, CSP meta, script order (order matters, no bundler)
  style.css         tokens, dark mode, components, keyboard
  config.js         the only file a deployer edits (see below)
  manifest.webmanifest, sw.js, icon*.svg/png
  data/seed.json    offline copy of repo content (rebuild: node scripts/build_dadi_seed.js)
  data/icons.json   icon paths and word index (rebuild: Dadi tools task rebuild-icons)
  ../data/themes.json   theme units and hand-set frequency ranks (edit in the repository)
  js/
    ipa-data.js     vowels (F1-F3), consonants (manner/place/voice), approximations, key layout
    synth.js        formant synthesizer, WAV export (pure JS, runs in Node for tests)
    espeak.js       optional clear offline voice outside lessons (D-057) (eSpeak NG, GPL, vendor/espeak-ng/, removable)
    translate.js    English to siṭaiṅga lookup from the project's words; page bookmarklet
    ai.js           connect your own AI (key stays in the browser, never exported)
    native-tts.js   device voice: IPA to a sound-alike script (Bangla or Devanagari) that a device voice can read
    g2p.js          spelling to approximate IPA (rules table)
    audio.js        WebAudio playback, caching, pitch/speed
    keyboard.js     the IPA keyboard
    data.js         JSONL/YAML readers, normalizing, trust, index, lessons, GitHub scrape
    store.js        local storage with backups and history log
    srs.js + fsrs.umd.js   FSRS wrapper and vendored ts-fsrs 5.4.2 (MIT)
    github.js       device sign-in and issue creation
    submit.js       turns the contribution queue into the repo's submission format
    icons.js        Tabler icon pack reader: DadiIcons.find(gloss) (strict match or null), DadiIcons.ui(name)
    learn.js        answer matching, session builder, theme units, progress counts
    chart.js        IPA chart built from ipa-data.js
    app.js          routes, screens, lesson engine, flows
dadi-worker/relay.js           sign-in relay (no secrets)
workflows-to-install/dadi-tools.yml   the one workflow (install once; see SETUP.md)
scripts/dadi_ingest_issue.py   contribution issue to RAW records, automatic speaker id
scripts/build_dadi_seed.js     seed and glossary builder
scripts/check_videos.py        weekly video vetting (never approves)
scripts/update_media.py        photos from Wikimedia Commons (never approves)
scripts/ingest_interview.py    reviewer ingest (reads Dadi submissions, incl. IPA + status)
scripts/tests/dadi_*.js        tests
docs/dadi/                     this documentation (DESIGN.md, SETUP.md, IPA_AND_AUDIO.md, AUTH_SETUP.md, CONTENT_RULES.md)
docs/contribute/               ai-tokens.md, moderators.md
website/index.html, site.css, site.js, data/*.json   the project landing page and its data + optional ingest workflow text
```

## `config.js`
```js
repo, branch            "hmdrysr/sitainge", "main"
githubClientId          GitHub App Client ID ("" = sign-in off)
relayUrl                the Cloudflare Worker address ("" = sign-in off)
requireSignIn           false by default (D-025). true = people must sign in before sending
contactEmail, creator, repoUrl
```
Edit the file on GitHub (the pencil icon works on a phone). Pages redeploys in about a minute. With the two sign-in values empty, the app still works fully, and sending falls back to copy, save file, email and share.

## Data flow
1. **Load.** `boot()` shows the cached repository data or `data/seed.json` at once. Then `refreshRepo()` asks the GitHub tree API for the branch and downloads the files matching `DadiData.WANTED` from raw.githubusercontent.com. Results are cached locally. Errors never block the app.
2. **Normalize.** Each record becomes an entry with gloss, form, spellings, kind (word or sentence), evidence level, state (raw, review or accepted), ipa and ipaStatus, and consent.
3. **Filter.** Records with private, withdrawn or restricted consent are dropped.
4. **Rank.** `trust()` scores level plus state, subtracts 2 if the record is AI-made, and adds bonuses for native-speaker confidence, speaker, audio or phonetician IPA, and public consent. Higher-trust items appear first and are used first in lessons. Unverified items are included on purpose (D-020) and carry a visible label.
5. **Pronounce.** `pronunciation(entry)` uses stored IPA first. Otherwise it uses `g2p` of the first spelling. If neither exists, it returns nothing, and the app shows this plainly and plays nothing.
6. **Learn.** `learn.js` builds a session from `website/data/themes.json` and the entries that exist: due reviews first, then at most five new items. Each card keeps its FSRS state in the store, and every review is appended to an append-only log.
7. **Contribute.** Teach builds queue items in the store. `DadiSubmit.build` uses `SitaingeCore.buildSubmission` (the same format and fingerprint as the website form) and batches up to 40 items. It then sends each batch as a GitHub issue titled `[Dadi] ...` (signed in) or offers the text for copy, file, email or share.
8. **Ingest.** A steward assigns a speaker ID and runs `scripts/ingest_interview.py` (or the optional workflow). The output is RAW records; IPA lines are split into `ipa` and `ipa_status`. The tool never accepts anything.

## Trust and evidence
The evidence levels A-E/unassessed and the review states come from `EVIDENCE_POLICY.md`. Dadi never raises a level. The `ipa_status` values are none, speaker-described, speaker-chosen-by-ear, audio-transcribed, phonetician-verified and ai-drafted-unverified (D-016, D-022).

## Privacy
- The 18+ and CC0 confirmations are required before a contribution can be built.
- A personal-information scan runs on text before export (shared with the website form).
- The sign-in token is held in local storage on the device and is never exported (`exportAll` strips it). It lasts 8 hours and can only create issues in this repository.
- The service worker and the app make requests only to the same origin, api.github.com, raw.githubusercontent.com and the relay (see the CSP in `index.html`).

## Tests
```
node scripts/tests/dadi_learn_test.js    answer matching, session builder, progress counts
node scripts/tests/dadi_unit_test.js     storage, rollback, token not exported, g2p, every IPA symbol renders finite audio, jsonl/yaml, seed
node scripts/tests/dadi_relay_test.js    relay forwards only the two paths, checks origin and client id
node scripts/tests/website_core_test.js  shared submission format
python3 scripts/validate.py              repository records
python3 scripts/tests/test_new_records.py  session, recording, speaker and source records
```
A browser flow test (Playwright, with GitHub mocked) is not committed in this version. The steps it covered are listed in `docs/dadi/CONTENT_RULES.md` under "Manual check". A developer who can write one should add it.

## What was verified, and what was not (v0.1.0)
Verified: the code runs in a headless browser with mocked GitHub (scrape, lesson, review, queue, export, device sign-in, issue creation, backup). Sound spectra were measured (formants, levels, no clipping). Ingest produced 40 valid RAW records from a Dadi-made submission.
Not verified: how the voice sounds to a Chittagonian ear; a real GitHub App and relay; real phones and browsers other than headless Chromium; an accessibility audit with a screen reader.

## Roadmap, in order
1. Add real speaker recordings (separate audio consent, already modelled in `audio/`). Lessons play only recordings; the synthesizer serves the keyboard, chart, translator and dictionary.
2. Tune the synthesizer with a phonetician. Chittagonian-specific sounds (aspiration, implosives, nasal vowels, tones) need expert review. Do not "fix" them by guessing.
3. Have a steward review `website/data/themes.json` (units and frequency ranks are hand-set and unreviewed), then add listening and ear-training exercises once recordings from several speakers exist.
4. Add a reviewer view inside the app that shows RAW items and records second-speaker agreement. This should follow only after reviewers are appointed (see `GOVERNANCE.md`).
5. Replace the optional manual ingest workflow with automatic PR creation once speaker-ID assignment is solved.
6. Complete an accessibility pass, localize the interface text, and add larger audio and image sets.
7. Tune the FSRS parameters once enough review data exists (request_retention is 0.9).
8. Add a second relay host option (Deno Deploy / Netlify function) in case Cloudflare is unavailable.

## Naming
The app and new text about the language write it as siṭaiṅga (D-028). siṭaiṅge is the project name in headers and prose; Sitainge is the repository name. Chittagonian is the English name. Keep the dot below ṭ and the dot above ṅ.

## Known pitfalls
- Script order in `index.html` is the dependency order. There is no build step, by design.
- `sw.js` caches under a versioned name (currently `dadi-v5`). Bump the version when shipping changes, or old copies linger. The worker is network-first, so fixes appear on the next online load.
- The CSP allows `style-src 'unsafe-inline'` because the app sets inline styles for the stitch patterns and layout. Do not add inline scripts.
- Pages serves the app under `/sitainge/dadi/`, and all paths are relative. Keep them relative.
- GitHub issue bodies are capped (about 65k characters); `submit.js` batches below that limit.
- Unknown spelling characters make `g2p` incomplete. The UI must say so rather than guess.
