# Consensus report

Generated 2026-10-08T06:22:34Z by `scripts/consensus.py` (rules version 1). Do not edit by hand; rerun the script.

Consensus is a machine-computed label. It is not verification, it is not endorsement, and it never changes an evidence level, a state or an IPA status. See `docs/protocols/voting-and-consensus.md`.

## Counts

| Measure | Count |
|---|---|
| Records read | 2845 |
| Records skipped (archived, private, withdrawn or restricted) | 0 |
| Clusters auto-confirmed | 8 |
| Entries auto-confirmed by consensus | 17 |
| Entries with at least one counted vote | 0 |
| Community status: collecting | 0 |
| Community status: community consensus | 0 |
| Community status: contested | 0 |
| Entries with a preferred spelling | 0 |
| Votes read | 0 |
| Votes ignored (no usable GitHub identity) | 0 |
| Votes excluded by a reviewer | 0 |
| Effective votes (latest per voter, entry and kind) | 0 |
| Effective votes for entries not in the data read | 0 |

## Thresholds in force

- Auto-confirmed: at least 2 independent source groups; form similarity at least 0.85 after lowercasing, removing diacritics and collapsing doubled letters; forms shorter than 2 letters are never matched and forms shorter than 3 must be identical (with this threshold a single edit needs at least 7 letters, so shorter words must be identical in any case); forms of 3 or more words, or records noted as sentences, are matched exactly only.
- Community consensus: at least 5 distinct voters and at least 80% agreement. Contested: at least 5 voters and agreement of 60% or less. Anything else stays in collecting.
- Preferred spelling: at least 5 spelling votes and the top spelling at 60% or more of them.

## Source groups that confirmed one another

| Groups | Clusters |
|---|---|
| solo-ipa-kaikki + wikipedia | 2 |
| hamid-yasir-2019-list + solo-ipa-langmap | 1 |
| solo-ipa-kaikki + solo-ipa-langmap | 1 |
| solo-ipa-kaikki + wikipedia + wikivoyage | 1 |
| solo-ipa-langmap + wikipedia | 1 |
| solo-ipa-langmap + wikivoyage | 1 |
| wikipedia + wikivoyage | 1 |

## Largest clusters

| Cluster | Gloss | Groups | Records | Forms (shared by several groups in bold) |
|---|---|---|---|---|
| CTG-CLU-6ba6b1c4 | my | solo-ipa-kaikki, wikipedia, wikivoyage | 3 | **ãr** |
| CTG-CLU-115d13db | i | solo-ipa-langmap, wikipedia | 2 | **Aááí**, **ãi** |
| CTG-CLU-4ba8c49e | he | solo-ipa-kaikki, wikipedia | 2 | **Ité**, **itẽ** |
| CTG-CLU-77f08cbf | red | solo-ipa-langmap, wikivoyage | 2 | **Lal**, **lal** |
| CTG-CLU-9b6a1802 | and | wikipedia, wikivoyage | 2 | **ar** |
| CTG-CLU-9ccc3446 | we | solo-ipa-kaikki, solo-ipa-langmap | 2 | **ara**, **ãra** |
| CTG-CLU-c31f1d1e | name | hamid-yasir-2019-list, solo-ipa-langmap | 2 | **Namm**, **nam** |
| CTG-CLU-e18545e9 | she | solo-ipa-kaikki, wikipedia | 2 | **Ití**, **itĩ** |

## Caveats

- Independence is judged from source metadata (`schemas/consensus_rules.json`, `source_groups`) and can be wrong. Two datasets may share an upstream that the metadata does not show; two sources judged independent may have copied one another.
- A match means that two sources give the same English gloss and a similar form. It does not mean that either is correct, that a speaker said it, or that the gloss is right.
- Similarity is computed on lowercased text with diacritics removed and doubled letters collapsed. That deliberately ignores differences that matter in the Hamidian Script and in IPA, so two different words can be matched. Review before relying on a cluster.
- Forms in different scripts (Bangla script, Latin, IPA) are never matched with one another, so cross-script agreement is missed.
- Chittagonian sentence entries are matched exactly only; near-identical sentences are not clustered.
- Glosses are compared as whole strings after removing bracketed context and a leading to, a, an or the. Glosses with several senses separated by semicolons will not match a single-sense gloss.
- Records from the same group never count twice, even if they differ in spelling.
- Votes are a count of GitHub accounts. They are not evidence and do not change any status other than the community label.
