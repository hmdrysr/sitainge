# Contribution page (GitHub Pages)

A static, offline-capable page where speakers answer prompts in a browser and export a submission file. No server, no sign-up, no tracking, no cookies, no third-party requests.

Live address once published: `https://hmdrysr.github.io/sitainge/`

## Publish it (about 5 minutes, works from a phone browser)
1. Repository **Settings > Pages**. Under **Build and deployment > Source**, choose **GitHub Actions**.
2. **Add file > Create new file.** Name it exactly `.github/workflows/pages.yml`. Paste the contents of `website/deploy-workflow.yml.txt`. Commit to `main`.
   (This file is not in the release zip on purpose: GitHub does not allow the unzip workflow to create workflow files.)
3. **Actions** tab > **Deploy site** > **Run workflow**. Wait for the green tick.
4. Open the live address. Test the whole flow once on your phone, then once in airplane mode after a first visit.
5. Edit `website/config.js` (pencil icon) and set `contactEmail` to the address that should receive submissions from people without GitHub accounts. While it is empty the email button stays hidden.

After this, every change under `website/` redeploys automatically.

## Safeguards built in
| Risk | Safeguard |
|---|---|
| Data sent without consent | Nothing is ever sent by the page. Sharing is the contributor's own action (share sheet, download, copy, email, GitHub). Content-Security-Policy blocks all outside connections except the site itself. |
| Uninformed consent | Required gate: 18+ or guardian, plain-language CC0 statement including "cannot be undone", publish-or-discuss choice, credit choice. |
| Minors and privacy | Adult/guardian confirmation; warnings against names, phones, addresses; automatic scan for emails, phone/ID numbers and links before export, with a required confirmation. |
| Leading the speaker | English prompts only; never shows Sitainge forms, suggestions or corrections; no Bangla wording. |
| Altered speech | Records exactly what was typed; phone autocorrect, autocapitalize and spellcheck are off in answer boxes; Latin and Bangla script both accepted; variants and "we don't say this" are first-class answers. |
| Damaged or tampered files | SHA-256 fingerprint of the items is written into the file; the reviewer script rejects a mismatch. Receipt code shown to the contributor. |
| Lost work | Autosave to the device, works offline, can export at any time. |
| Shared devices | Opt-out of saving; "Delete my draft" always visible; draft wiped on request. |
| Script injection | No inline scripts, no innerHTML with user text, strict CSP, no external libraries or fonts. |
| Evidence contamination | Output marked `capture_method: web_form`; every record enters RAW, evidence level `unassessed`; nothing is accepted automatically. |
| Song lyrics and rights | Prompt limits "song" items to traditional oral songs; known composers: title and performer only. |
| Voice identifiability | Separate audio consent (research-only, publish under CC0, or none); recordings can never be published while the text is set to "discuss first"; recording starts only on a button press, the microphone stops when you leave the screen, and nothing records in the background. |
| Audio damaged or swapped | Each clip has its own SHA-256 inside the file; the reviewer script rejects a mismatch or a missing clip. |
| Audio leaking into the public repository | Reviewer script writes audio only to `audio/staging/` (gitignored); non-public audio is never allowed in the repository tree; validator checks the audio catalogue. |
| Oversized or spam content | Field and item limits; reviewers validate and nothing is auto-published. |

## Limits (honest)
- Recordings are one clip per answer (up to 90 seconds), for words and sentences. Heritage items (proverbs, songs, stories) are text only for now.
- Browsers record in whatever format they support (WebM/Opus on most phones, M4A on iPhones). Quality depends on the phone and the room.
- A bundle with many clips can be several MB. Some email services refuse files over about 20 MB; contributors can use Share, or send in two parts.
- The GitHub issue route carries text only; recordings must be sent as the downloaded file.
- A static page cannot receive data. Contributors without a GitHub account must send the exported file by share sheet or email. Someone with no way to send a file or email is not served yet.
- The page cannot stop a determined person from submitting false data. Review, not the page, is the safeguard.
- A fully anonymous direct-submit button would need a form service or small server, which brings privacy, cost and data-handling trade-offs. Not included by default.
- The CSP is set by a meta tag; GitHub Pages cannot add HTTP security headers.

## Reviewer side
Exported files use the same format as the chatbot interview. See `contribute/README.md` and `scripts/ingest_interview.py`.

## Tests
`node scripts/tests/website_core_test.js` builds a submission from placeholder data and checks the output.
