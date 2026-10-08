# prompts/

Elicitation sheets as data, in JSONL. Schema: `schemas/prompt.schema.json`. Guide: `docs/protocols/elicitation-guide.md`.

**English only. These files contain no Chittagonian.** A prompt is an English meaning or question; the speaker supplies the answer.

| File | Content | Provenance |
|---|---|---|
| `leipzig-jakarta-100.jsonl` | The 100 English meanings of the Leipzig-Jakarta list, with their published rank | Published list (Tadmor, Haspelmath and Taylor 2010, *Diachronica* 27(2); also in Haspelmath and Tadmor eds. 2009). All 100 meanings were read from the English Wikipedia page for the list on 8 October 2026, which names those works. Neither publication was opened, so wording such as "arm/hand" should be checked against the printed list. 100 of 100 meanings are recorded; none was added from memory. See `SRC-PROMPT-LJ100` in `sources/sources.jsonl`. |
| `semantic-domains.jsonl` | Ten domains, eight English prompts each (80) | Drafted for this project. Not reviewed by a speaker or linguist. |
| `grammar-checklist.jsonl` | Sixteen English question prompts for a first look at grammar | Drafted for this project. A linguist should revise it. |

Pictures are not supplied. When a picture set is added, it must be licence-clear and its licence recorded in `sources/`.
