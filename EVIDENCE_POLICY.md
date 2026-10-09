# Evidence policy

## Never invent
The project does not invent any of the following: vocabulary, grammar, phonology, pronunciation, etymology, history, speaker numbers, dialect boundaries, quotations, citations, page numbers, recordings, testimony, translations, examples or community consensus.

Status words: **Unknown.** / **Proposed.** / **Needs native-speaker verification.**

## Evidence levels

| Level | Meaning |
|---|---|
| A | Directly documented: recorded from Chittagonian speech, text or a reliable primary source |
| B | Independently confirmed by multiple independent speakers or sources |
| C | Strongly supported, needs further confirmation |
| D | Proposed: hypothesis, reconstruction or analytical proposal |
| E | Unknown: insufficient evidence |

Levels D and E are never presented as established fact. RAW records carry `unassessed` until they enter review.

## Source hierarchy
1. Direct native-speaker recordings
2. Multiple independent native-speaker confirmations
3. Primary Chittagonian texts
4. Established Chittagonian linguistic research
5. Peer-reviewed publications
6. Academic books, grammars, dissertations
7. Established language archives
8. Comparative evidence
9. General linguistic theory (never overrides Chittagonian evidence)

## Citation rule
No source is cited unless someone has checked it. Unchecked pointers go in the source register, marked `pointer, unchecked`.

## Rohingya comparison levels
The levels are R0 (Rohingya only), R1 (possible Chittagonian counterpart), R2 (Chittagonian corpus evidence), R3 (native-speaker confirmation) and R4 (repeated independent confirmation). Each relationship is classified as cognate, shared inheritance, borrowing, regional sharing, parallel development, accidental resemblance or uncertain.

## Bangla and Rohingya
Rohingya is recorded as a variety of siṭaiṅga (steward decision of 2026-10-10, `docs/decisions/rohingya-merge.md`); its records carry `variety: rohingya`. Bangla is not an authority over Chittagonian. A Bangla equivalent is never recorded as a Chittagonian form. Resemblance between a Rohingya-variety form and a Chittagong-variety form is never sufficient evidence, on its own, that they are the same word.

## AI
AI may suggest transcriptions, duplicates, similarities, formatting and search results. All AI output is `AI-assisted / unverified` until a human reviews it. An AI cannot turn its own output into a source. This rule has no exceptions.

## No popularity voting
Stars, likes and majority clicks are not evidence. Spelling votes may break a tie between equally attested variants (see the attestation rule), but they never count as evidence. The project records confirmation speaker by speaker instead (A confirmed, B confirmed, C not recognized).

## Consensus labels
Two labels describe agreement and are computed by `scripts/consensus.py`: **auto-confirmed by consensus** (records from at least two independent source groups give the same meaning and a similar form) and **community consensus** (enough distinct GitHub accounts voted and most agreed). They are orthogonal to the evidence levels A to E. They never raise or lower a level, never change a state, never change `ipa_status`, and are not verification and not endorsement. An entry can be auto-confirmed and still be `unassessed`. Only a speaker or phonetician can verify, and only a reviewer can endorse or accept. Independence between sources is a judgement from metadata and can be wrong. Votes are signals recorded by account, not evidence, which is consistent with the rule above that popularity is not evidence. See `docs/protocols/voting-and-consensus.md`.

## Attestation rule and preferred forms
Added 2026-10-10 by the steward. Every variant form and spelling of a word is recorded and linked to one variant group (in practice, a cluster computed by `scripts/consensus.py`).
1. If the same form appears identically in three distinct, independent sources at different times, it becomes the **preferred form** of its group. "Identically" means the same letters after Unicode normalization and case-folding, with diacritics kept. "Independent" means different source groups in `schemas/consensus_rules.json`. "At different times" means at least two distinct recording dates among them.
2. Otherwise, among the variants, the form attested by the most independent sources is preferred.
3. Community votes break ties or inform review. A vote is still a signal recorded by account, not evidence.
A preferred form is a display and review choice. It does not raise an evidence level, change a state or verify a form; only a speaker or reviewer can do that.
