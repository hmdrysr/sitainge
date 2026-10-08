# siṭaiṅge: the Chittagonian language project

*siṭaiṅga* is the name of the language in its own written form, as given by the project owner. *Sitainge* is the spelling used for the repository and in web addresses, and is a widely used variant of the same name. *Chittagonian* is the English name of the language. See `docs/language/names.md`.

siṭaiṅge is an open, evidence-governed project to document, preserve, teach and strengthen Chittagonian as a language that belongs to its speakers.

> The language already exists. The project does not invent it. The project documents it.

## Status

Release 0.1.0 is the first version. The repository holds the research standards, governance, schemas, tooling and four public tools, together with raw, unverified material: the 2019 starter list (see `datasets/`), records from the project owner's first session, and records harvested from public web pages (see `docs/research-gaps/`). **Nothing here is yet accepted reference data.** No entry has been checked by a second speaker, and the application labels every entry accordingly.

The language's home region is Chittagong District and Cox's Bazar District in south-eastern Bangladesh. Chittagong Division is a government grouping and is not treated as the language area.

## Tools

All four tools read the files in this repository, so a correction made once appears in each of them. None uses tracking or third-party scripts.

| Tool | Path | Purpose |
|---|---|---|
| Project site | `website/index.html` | Method, live counts, evidence levels, recent changes, map of the two districts down to unions and City Corporation wards, videos |
| Dadi | `website/dadi/` | Offline-first learning app: theme units, spaced retrieval, IPA keyboard and chart, contribution flow |
| Dictionary | `website/dictionary/` | Search by English, spelling or IPA; each entry shows its evidence level, source and a correction link |
| Translator | `website/translate/` | Word-for-word draft from the project's own entries; unknown words stay in English |
| Browser extension | `extension/` | Chrome and Firefox (Manifest V3) page translation with undo; page text stays on the device |

## Method

- Documentation follows the plan in [`docs/methodology/documentation-plan.md`](docs/methodology/documentation-plan.md), which rests on the sources in [`documentation-research.md`](docs/methodology/documentation-research.md). The plan is a proposal; its additive parts are in place (see [`docs/methodology/STRUCTURE.md`](docs/methodology/STRUCTURE.md)).
- Teaching design follows [`docs/dadi/LEARNING_DESIGN.md`](docs/dadi/LEARNING_DESIGN.md), derived from the evidence in [`teaching-research.md`](docs/methodology/teaching-research.md). Interface rules are in [`docs/dadi/UX_RESEARCH.md`](docs/dadi/UX_RESEARCH.md).
- Written text follows [`docs/style/canadian-style-guide.md`](docs/style/canadian-style-guide.md).
- Protocols for consent, sessions, recording, elicitation, verification, AI use and the orthography working group are in [`docs/protocols/`](docs/protocols/).

## How the project establishes authority

evidence + transparency + native-speaker participation + scholarly research + provenance + reproducibility + long-term preservation

The project does not declare authority. Every entry must show why it is documented, who uses it, where, what evidence supports it, which variants exist, and who reviewed it and when.

## Contribute

People without technical experience can use a chatbot instead. The chatbot interviews the contributor, records exactly what they say and produces a file to submit. Start at [`contribute/README.md`](contribute/README.md), or use the contribution page described in [`website/README.md`](website/README.md).

**Dadi** (`website/dadi/`, by Hamid Yasir) is a lesson and contribution app that reads this repository. It suits people who want to learn or practise the language. Developer notes are in [`docs/dadi/HANDOFF.md`](docs/dadi/HANDOFF.md). The project page is `website/index.html`, which is published as the site's front page. Setup steps are in [`docs/dadi/SETUP.md`](docs/dadi/SETUP.md). Contributors who want to use their own AI account should read [`docs/contribute/ai-tokens.md`](docs/contribute/ai-tokens.md). AI assistants start from [`AGENTS.md`](AGENTS.md). Moderators should read [`docs/contribute/moderators.md`](docs/contribute/moderators.md).

## Core rules

1. Document the language; do not invent it. Unknown stays "Unknown."
2. Contribution is not acceptance. The flow is proposal, evidence, review, decision, publication.
3. Raw evidence, curated data, reference data and research data are separate layers.
4. Variants are recorded, not penalized. Record first, evaluate second.
5. Bangla appears only in the Rosetta Stone layer. Rohingya is comparative evidence only.
6. AI output is never evidence. It is marked `AI-assisted / unverified` until a human reviews it.

## Licence

Everything published here is dedicated to the public domain under **CC0 1.0**. See `LICENSE` and `LICENSING.md`, which also state what CC0 does not cover.

## Layout

| Path | Purpose |
|---|---|
| `docs/` | Language description, script specification, methodology, protocols, style guide, research gaps, Dadi documentation |
| `lexicon/` | Entries by data state: `raw`, `review`, `accepted`, `archived` |
| `corpus/`, `audio/`, `cultural/` | Texts, transcripts, recordings catalogue, heritage material (existing layout; see `docs/methodology/STRUCTURE.md` for the planned consolidation) |
| `sessions/`, `recordings/`, `speakers/`, `sources/`, `prompts/`, `reports/` | Session logs, one record per recording, pseudonymous speaker identifiers, source register, elicitation sheets, generated coverage reports |
| `comparative/rohingya/` | Comparative layer (R0 to R4) |
| `rosetta/` | Chittagonian / English / Bangla reference |
| `schemas/`, `scripts/` | Data schemas, validation, coverage report, build scripts, tests |
| `website/`, `extension/` | Public pages, Dadi, dictionary, translator, browser extension |
| `dadi-worker/`, `workflows-to-install/` | Sign-in relay; the one workflow file to install by hand |
| `.github/` | Issue templates, CODEOWNERS |

Adaptation note: the lexicon folders follow the four data states in the master prompt, not the suggested `accepted / under-review / proposed / rejected / regional` split. "Regional" is a field on each entry, not a folder. See `docs/hamidian-script/orthographic-decision-log.md` and `docs/governance/decision-log.md`.
