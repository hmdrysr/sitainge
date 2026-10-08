# siṭaiṅga Translator (browser extension, v0.1.0)

Draft translation of web pages into siṭaiṅga (Chittagonian) using only the words and phrases held in the open project dictionary (github.com/hmdrysr/sitainge). CC0. No build step, no tracking, no accounts.

**It looks words up; it does not do grammar.** Anything not in the dictionary stays in English. Every replaced word is underlined, and hovering shows the English original and its evidence level. Nearly all entries are unassessed, so treat the output as an unverified draft, never as correct siṭaiṅga.

## Privacy
**Page text is never sent anywhere.** All matching runs inside the page on your device. The only network request is a fetch of the public dictionary file (`glossary.json`) from raw.githubusercontent.com, at most once a day; a cached copy lives in `storage.local` and a bundled copy (`data/glossary.json`) works offline. The `api.github.com` host permission is declared but not used by this version.

## Use
Toolbar button: **Translate this page**, **Translate selection**, **Undo**. Right-click menu: translate selection or page. Undo restores the original text nodes exactly. Dynamic pages are handled with a throttled MutationObserver. Skipped: script, style, textarea, input, select, code, pre, svg, iframe, editable areas.

## Install (not in any store)
Not submitted to the Chrome Web Store or Firefox Add-ons, and not signed; both need developer accounts. Install by hand:
- **Chrome / Edge / Brave**: unzip the package, open `chrome://extensions`, turn on Developer mode, Load unpacked, choose the folder.
- **Firefox (128+)**: `about:debugging#/runtime/this-firefox`, Load Temporary Add-on, choose `manifest.json`. Temporary add-ons vanish on restart; permanent install needs signing. Firefox may need host access granted under the add-on's Permissions tab.

## Files
`manifest.json` (MV3; both `service_worker` and `scripts` background keys; Gecko id `dadi@sitainge.invalid`), `background.js`, `content.js`, `popup.*`, `lib/translate.js` (copied from `website/dadi/js/translate.js`, the same lookup logic as Dadi), `lib/glossary.js`, `data/glossary.json`, `icons/` (original glyph).
