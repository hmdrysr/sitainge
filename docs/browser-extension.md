# Browser extension and translator page

The project provides two tools that share one lookup engine (`website/dadi/js/translate.js`). Both are CC0 and need no build step.

**Translator page** (`website/translate/`): the user enters English and the page returns siṭaiṅga, updating as the user types. On tap or hover, each match shows the English original, the source entry and the evidence level. Unknown words are marked, and a coverage line reads "X of Y words found, the rest stay in English". The page offers Copy; Listen (a device voice that reads the spelling approximately, labelled as such and not presented as a speaker); and Suggest a missing word (a prefilled GitHub issue). The dictionary is built in the browser from the repository's files using Dadi's scrape (api.github.com file list, then raw.githubusercontent.com, with a 5 s limit per request) and cached in localStorage, with `../dadi/data/glossary.json` as the fallback. The page uses a strict CSP (`script-src 'self'`, no inline scripts).

**Translating a web page from the page itself** is not possible by URL, because browsers block cross-site fetches (CORS) and routing page text through a server would break the privacy rule. The translator page therefore offers a bookmarklet (it loads `dadi/js/translate.js`; sites with a strict CSP may block it) and the extension as alternatives.

**Extension** (`extension/`, zip in `website/downloads/`): see its README. The Chrome MV3 version was verified; the Firefox version has not been tested here. Notes for Firefox: the manifest lists `scripts` for event-page use and `service_worker` for Chrome (Firefox ignores the latter, and Chrome ignores the former with at most a warning). The Gecko id is a placeholder, `dadi@sitainge.invalid`. AMO requires an account, a review and a real id. Host permissions are granted by the user in Firefox.

**Not done:** store submission, signing, Firefox testing and an options page. The tools follow these rules: nothing is invented, AI output is never evidence, and page text never leaves the device.
