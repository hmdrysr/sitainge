# siṭaiṅge Translator (browser extension, version 0.1.0)

The extension produces a draft translation of web pages into siṭaiṅga (Chittagonian). It uses only the words and phrases held in the open dictionary of the siṭaiṅge project (github.com/hmdrysr/sitainge). It is dedicated to the public domain (CC0), has no build step, and uses no tracking or accounts.

**It looks words up; it does not apply grammar.** A word that is not in the dictionary stays in English. Each replaced word is underlined, and hovering shows the English original and its evidence level. Nearly all entries are unassessed, so the output is an unverified draft and should not be treated as correct siṭaiṅga.

## Privacy

Page text is never sent anywhere. All matching runs inside the page, on the device. The only network request is a download of the public dictionary file (`glossary.json`) from raw.githubusercontent.com, at most once a day. A cached copy is kept in `storage.local`, and a bundled copy (`data/glossary.json`) works offline. The `api.github.com` host permission is declared but is not used in this version.

## Use

The toolbar button offers three actions: Translate this page, Translate selection and Undo. The right-click menu offers translation of the selection or the page. Undo restores the original text nodes exactly. Pages that change after loading are handled with a throttled MutationObserver. The extension skips script, style, textarea, input, select, code, pre, svg, iframe and editable areas.

## Installation (not in any store)

The extension has not been submitted to the Chrome Web Store or to Firefox Add-ons, and it is not signed, because both require developer accounts. It is installed manually.

- **Chrome, Edge and Brave:** unzip the package, open `chrome://extensions`, turn on Developer mode, select Load unpacked, and choose the folder.
- **Firefox (version 128 or later):** open `about:debugging#/runtime/this-firefox`, select Load Temporary Add-on, and choose `manifest.json`. A temporary add-on is removed when Firefox restarts, and a permanent installation requires signing. Firefox may require host access to be granted under the add-on's Permissions tab.

## Files

- `manifest.json`: Manifest V3. It declares both the `service_worker` and `scripts` background keys, and the Gecko identifier `dadi@sitainge.invalid`.
- `background.js`, `content.js`, `popup.*`.
- `lib/translate.js`: copied from `website/dadi/js/translate.js`, so the lookup logic matches Dadi.
- `lib/glossary.js`, `data/glossary.json`.
- `icons/`: an original glyph.
