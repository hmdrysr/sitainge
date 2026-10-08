# Hand-off addendum, October 8, 2026

- **Live data.** The project site, Dadi, the dictionary and the translator read repository files first and fall back to shipped copies. To correct a fact, edit the file (`website/data/*.json`, `lexicon/`, `corpus/`); no page change is needed. Rebuild the offline copy with the Dadi tools task `rebuild-seed`.
- **Region.** Chittagong District and Cox's Bazar District. Data and caveats: `docs/research-gaps/admin-data-notes.md`. Figures follow Wikipedia and have not been checked against the census tables.
- **Icons.** Tabler Icons (MIT), built by the `rebuild-icons` task (requires npm). Matching is strict, so many words have no picture; see `docs/dadi/icon-coverage.md`.
- **Learning design.** `docs/dadi/LEARNING_DESIGN.md` is the specification; `learn.js` implements it. Listening and ear-training exercises are deliberately absent until recordings exist.
- **Tools.** Dictionary: `docs/dictionary.md`. Translator and extension: `docs/browser-extension.md`.
- **Known gaps.** Harvested spellings with diacritics are not all playable until `g2p.js` covers them. All videos are unvetted. The extension is on no store, and Firefox is untested.
