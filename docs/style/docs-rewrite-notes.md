# Documentation rewrite notes, October 8, 2026

Scope: prose documents rewritten into Canadian academic and professional English under `docs/style/canadian-style-guide.md`. Facts, numbers, paths, commands, code blocks, links and table structure were preserved. Dates in prose were converted to "October 8, 2026" form; ISO dates were kept in the orthographic decision log table (data). Automated check: every URL, number and inline code span in each original appears in its rewrite (dates compared after normalization).

## Files rewritten
- `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `ETHICS.md`, `PRIVACY.md`: neutral third person, contributor-directed second person removed. Verified from the earlier attempt and lightly kept.
- `GOVERNANCE.md`, `EVIDENCE_POLICY.md`: full sentences, sentence-case headings.
- `LICENSING.md`: licence tables and decision references intact.
- `CODE_OF_CONDUCT.md`: project-authored, so rewritten.
- `contribute/README.md`: addressed to contributors in neutral wording; the language name is now siṭaiṅga.
- `docs/contribute/ai-tokens.md`, `docs/contribute/moderators.md`: second person reduced.
- `docs/dadi/AUTH_SETUP.md`, `CONTENT_RULES.md`, `HANDOFF.md`, `HANDOFF-addendum.md`, `IPA_AND_AUDIO.md`, `SETUP.md`.
- `docs/dictionary.md`, `docs/browser-extension.md`.
- `docs/hamidian-script/spec-v0.md`, `orthographic-decision-log.md` (heading only).
- `docs/language/names.md`.
- `docs/methodology/ai-use-policy.md`, `ai-test-2026-10-07.md`, `ai-working-paper-v0.md` (headings, naming line and phrasing only; worked examples and system prompt left intact because they quote project forms).
- `docs/releases/0.1.0.md`.
- `docs/research-gaps/`: `admin-data-notes.md`, `audit-2019-materials.md`, `source-register.md`, `starter-sources.md` (first person changed to "the compiler"; issue-form field labels kept verbatim), `videos-round2.md`, `web-harvest-2026-10-08.md`, `web-harvest-2026-10-08-round2.md`.
- `RESEARCH_STANDARDS.md`: not produced (another agent replaces it).

## Possibly stale, not changed (correct facts not in this repository copy)
- `docs/dadi/HANDOFF.md`: describes lessons as "6 items" and `lessons(index, 6)`, and an icon set of original SVGs (`art.js`). The icon work noted in `HANDOFF-addendum.md` (Fluent Emoji, `rebuild-icons`) and any revised lesson structure in `docs/dadi/LEARNING_DESIGN.md` are not reflected in the file tree or the data-flow section.
- `docs/dadi/CONTENT_RULES.md` rule 6 ("original SVGs only") conflicts with `LICENSING.md`, which lists Fluent Emoji (MIT) and Lucide (ISC) icons.
- `docs/dadi/IPA_AND_AUDIO.md` and `HANDOFF.md` refer to `docs/dadi/ASSETS.md`, which was not checked for existence.
- `docs/hamidian-script/spec-v0.md`, `docs/language/names.md` and `docs/research-gaps/source-register.md` still use "Sitainge" in places where it quotes owner statements or the project name; the language name siṭaiṅga is used elsewhere.
- Project-wide figures (30 raw entries, 3 corpus items in `docs/releases/0.1.0.md`) predate the web harvests (200 records by round 2) and the release notes were not updated.
- `docs/dadi/SETUP.md` still names `sitainge-v0.1.0.zip`.
- Not in scope and not touched: `.github/pull_request_template.md`, `dadi-worker/README.md`, `rosetta/README.md`.
- `docs/research-gaps/admin-data-notes.md` "Regenerate" block contains a scratchpad path from the build environment; kept verbatim.
