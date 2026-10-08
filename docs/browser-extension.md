# Browser extension and translator page

Two tools, one lookup engine (`website/dadi/js/translate.js`), CC0, no build step.

**Translator page** (`website/translate/`): English in, siṭaiṅga out, live as you type. Hits show the English original, source entry and evidence level on tap or hover; unknown words are marked; coverage reads "X of Y words found, the rest stay in English". Copy, Listen (device voice reading the spelling approximately; honest label, not a speaker), and Suggest a missing word (prefilled GitHub issue). The dictionary is built in the browser from the repo's files with Dadi's scrape (api.github.com file list, then raw.githubusercontent.com, 5 s limit per request), cached in localStorage, with `../dadi/data/glossary.json` as fallback. Strict CSP (`script-src 'self'`, no inline).

**Translate a web page from the page**: not possible by URL, because browsers block cross-site fetches (CORS) and routing page text through a server would break the privacy rule. The page offers a bookmarklet (loads `dadi/js/translate.js`; sites with a strict CSP may block it) and the extension instead.

**Extension** (`extension/`, zip in `website/downloads/`): see its README. Chrome MV3 verified; Firefox is untested here. Firefox notes: the manifest lists `scripts` for event-page use and `service_worker` for Chrome (Firefox ignores the latter, Chrome ignores the former with a warning at most); Gecko id is a placeholder `dadi@sitainge.invalid`; AMO needs an account, review and a real id; host permissions are user-granted in Firefox.

**Not done**: store submission, signing, Firefox testing, an options page. Rules kept: nothing invented, AI output is never evidence, page text never leaves the device.
