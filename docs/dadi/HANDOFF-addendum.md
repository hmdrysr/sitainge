# Hand-off addendum, 2026-10-08
- **Live data.** The landing page, Dadi, the dictionary and the translator read repository files first and fall back to shipped copies. To correct a fact, edit the file (`website/data/*.json`, `lexicon/`, `corpus/`); no page change is needed. Rebuild the offline copy with the Dadi tools task `rebuild-seed`.
- **Region.** Chittagong District and Cox's Bazar District. Data and caveats: `docs/research-gaps/admin-data-notes.md`. Figures are per Wikipedia, not census-checked.
- **Icons.** `rebuild-icons` task (needs npm). Matching is by English gloss and is loose for some words.
- **Tools.** Dictionary: `docs/dictionary.md`. Translator and extension: `docs/browser-extension.md`.
- **Known gaps.** Words from the web harvest with diacritics (ñ, ò) are not all playable until `g2p.js` covers them. Videos are all unvetted. Extension is not on any store. Firefox untested.
