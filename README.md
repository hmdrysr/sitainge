# Sitainge: The Chittagonian Language Project

*siṭaiṅga* is the native name of the language, as given by the project owner. *Sitainge* is the name of this project and repository, a widely used variant of it. *Chittagonian* is the English name. See `docs/language/names.md`.

An open, evidence-governed project to document, preserve, teach and strengthen Chittagonian as a language belonging to its speakers.

> The language already exists. The project does not invent it. The project documents it.

## Status

Release 0.1.0 (first version). This repository holds the research standards, governance, schemas and tooling, plus one set of raw, unverified starter material from 2019 (see `datasets/`). **Nothing here is yet accepted reference data.**

## How this project earns authority

evidence + transparency + native-speaker participation + scholarly research + provenance + reproducibility + long-term preservation

Authority is never declared. Every entry must show why it is documented, who uses it, where, what evidence supports it, which variants exist, who reviewed it and when.

## Contribute

Not technical? Talk to a chatbot: it interviews you, records exactly what you say, and gives you a file to submit. Start at [`contribute/README.md`](contribute/README.md), or use the contribution page described in [`website/README.md`](website/README.md).

Want to learn or practise? **Dadi** (`website/dadi/`, by Hamid Yasir) is a lesson and contribution app that reads this repository. Developer notes: [`docs/dadi/HANDOFF.md`](docs/dadi/HANDOFF.md).

## Core rules

1. Document, do not invent. Unknown stays "Unknown."
2. Contribution is not acceptance. Flow: proposal, evidence, review, decision, publication.
3. Raw evidence, curated data, reference data and research data are separate layers.
4. Variants are recorded, not punished. Record first, evaluate second.
5. Bangla appears only in the Rosetta Stone layer. Rohingya is comparative evidence only.
6. AI output is never evidence. It is marked `AI-assisted / unverified` until a human reviews it.

## Licence

Everything published here is dedicated to the public domain under **CC0 1.0**. See `LICENSE` and `LICENSING.md`, including what CC0 does not cover.

## Layout

| Path | Purpose |
|---|---|
| `docs/` | Language description, script specification, methodology, research gaps |
| `lexicon/` | Entries by data state: `raw`, `review`, `accepted`, `archived` |
| `corpus/`, `audio/`, `cultural/` | Texts, transcripts, recordings catalogue, heritage material |
| `comparative/rohingya/` | Comparative layer (R0 to R4) |
| `rosetta/` | Chittagonian / English / Bangla reference |
| `schemas/`, `scripts/` | Data schemas and structural validation |
| `.github/` | Issue templates, CODEOWNERS |

Adaptation note: the lexicon folders follow the four data states in the master prompt instead of the suggested `accepted / under-review / proposed / rejected / regional` split. "Regional" is a field on each entry, not a folder. See `docs/hamidian-script/orthographic-decision-log.md` and `docs/governance/decision-log.md`.
