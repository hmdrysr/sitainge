# siṭaiṅge website

The `website/` folder holds the project's public pages. They are static files with no server, no sign-up, no tracking, no cookies and no third-party requests.

| Page | Path | Purpose |
|---|---|---|
| Landing page | `index.html` | Project summary, live counts, research method, map of Chittagong District and Cox's Bazar District, videos |
| Dictionary | `dictionary/` | Searchable entries with evidence levels |
| Translator | `translate/` | Word-for-word draft from the project dictionary |
| Contribution form | `contribute.html` | Offline form that exports a submission file |
| Dadi | `dadi/` | Learning app (documented in `docs/dadi/`) |

All pages share `site.css` (spacing, type and colour scales, header, controls) and the header navigation. Icons are Tabler Icons (outline set, MIT licence) read from the Dadi icon pack by `ui-icons.js`; mark a place with `<span data-icon="name"></span>`.

Live address once published: `https://hmdrysr.github.io/sitainge/`

## Publication (about 5 minutes, works from a phone browser)

1. In the repository, open **Settings > Pages**. Under **Build and deployment > Source**, choose **GitHub Actions**.
2. Select **Add file > Create new file**. Name it exactly `.github/workflows/pages.yml`. Paste the contents of `website/deploy-workflow.yml.txt` and commit to `main`. The file is not in the release zip on purpose, because GitHub does not allow the unzip workflow to create workflow files.
3. Open the **Actions** tab, select **Deploy site**, and choose **Run workflow**. Wait for the green tick.
4. Open the live address. Test the whole flow once on a phone, then once in airplane mode after a first visit.
5. Edit `website/config.js` and set `contactEmail` to the address that should receive submissions from people without GitHub accounts. While it is empty, the email button stays hidden.

After this, every change under `website/` redeploys automatically.

## Safeguards in the contribution form

| Risk | Safeguard |
|---|---|
| Data sent without consent | The page never sends anything. Sharing is the contributor's own action (share sheet, download, copy, email or GitHub). The Content-Security-Policy blocks all outside connections except the site itself. |
| Uninformed consent | A required gate: confirmation of age 18 or older (or a guardian), a plain-language CC0 statement that includes "cannot be undone", a choice to publish or discuss first, and a choice of credit. |
| Minors and privacy | Adult or guardian confirmation; warnings against names, phone numbers and addresses; an automatic scan for emails, phone and ID numbers and links before export, with a required confirmation. |
| Leading the speaker | Prompts are in English only. The form never shows siṭaiṅga forms, suggestions or corrections. |
| Altered speech | The form records exactly what was typed. Autocorrect, autocapitalize and spellcheck are off in answer boxes. Any script is accepted. Variants and "we don't say this" are first-class answers. |
| Damaged or tampered files | A SHA-256 fingerprint of the items is written into the file, and the reviewer script rejects a mismatch. A receipt code is shown to the contributor. |
| Lost work | Autosave to the device, offline operation, and export at any time. |
| Shared devices | Saving can be switched off, "Delete my draft" is always visible, and the draft is wiped on request. |
| Script injection | No inline scripts, no inline styles, no innerHTML with user text, a strict CSP, and no external libraries or fonts. |
| Evidence contamination | Output is marked `capture_method: web_form`. Every record enters as RAW with evidence level `unassessed`. Nothing is accepted automatically. |
| Song lyrics and rights | The prompt limits "song" items to traditional oral songs. For songs by known composers, only the title and performer are requested. |
| Voice identifiability | Separate audio consent (research only, publish under CC0, or none). Recordings cannot be published while the text is set to "discuss first". Recording starts only on a button press, the microphone stops when the contributor leaves the screen, and nothing records in the background. |
| Audio damaged or swapped | Each clip has its own SHA-256 inside the file. The reviewer script rejects a mismatch or a missing clip. |
| Audio leaking into the public repository | The reviewer script writes audio only to `audio/staging/` (gitignored). Non-public audio is never allowed in the repository tree, and a validator checks the audio catalogue. |
| Oversized or spam content | Field and item limits apply. Reviewers validate, and nothing is published automatically. |

## Limits

- Recordings are one clip per answer (up to 90 seconds), for words and sentences. Heritage items (proverbs, songs, stories) are text only for now.
- Browsers record in whatever format they support (WebM/Opus on most phones, M4A on iPhones). Quality depends on the phone and the room.
- A bundle with many clips can be several megabytes. Some email services reject files over about 20 MB; contributors can use Share or send the bundle in two parts.
- The GitHub issue route carries text only. Recordings must be sent as the downloaded file.
- A static page cannot receive data. Contributors without a GitHub account must send the exported file by share sheet or email. A person with no way to send a file or an email is not yet served.
- The page cannot stop a determined person from submitting false data. Review, not the page, is the safeguard.
- A fully anonymous direct-submit button would need a form service or a small server, which brings trade-offs in privacy, cost and data handling. It is not included by default.
- The CSP is set by a meta tag, because GitHub Pages cannot add HTTP security headers.

## Reviewer side

Exported files use the same format as the chatbot interview. See `contribute/README.md` and `scripts/ingest_interview.py`.

## Tests

`node scripts/tests/website_core_test.js` builds a submission from placeholder data and checks the output.
