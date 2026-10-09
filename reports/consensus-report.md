# Consensus report

Generated 2026-10-09T22:16:36Z by `scripts/consensus.py` (rules version 1). Do not edit by hand; rerun the script.

Consensus is a machine-computed label. It is not verification, it is not endorsement, and it never changes an evidence level, a state or an IPA status. See `docs/protocols/voting-and-consensus.md`.

## Counts

| Measure | Count |
|---|---|
| Records read | 7584 |
| Records skipped (archived, private, withdrawn or restricted) | 0 |
| Clusters auto-confirmed | 51 |
| Entries auto-confirmed by consensus | 112 |
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
| rhg:gatitos + solo-ipa-langmap | 10 |
| rhg:gatitos + rhg:learnrohingya | 9 |
| rhg:gatitos + wikivoyage | 7 |
| rhg:gatitos + solo-ipa-rjoe | 4 |
| owner-speaker + rhg:gatitos | 2 |
| rhg:wikipedia-article + wikipedia | 2 |
| solo-ipa-kaikki + wikipedia | 2 |
| compiled-chatgaiyya-benchmark + rhg:learnrohingya | 1 |
| hamid-yasir-2019-list + rhg:gatitos + rhg:learnrohingya | 1 |
| hamid-yasir-2019-list + rhg:gatitos + solo-ipa-langmap | 1 |
| hamid-yasir-2019-list + rhg:learnrohingya | 1 |
| hoque-2015 + rhg:gatitos | 1 |
| owner-speaker + rhg:gatitos + wikipedia | 1 |
| rhg:gatitos + rhg:learnrohingya + solo-ipa-langmap | 1 |
| rhg:gatitos + solo-ipa-langmap + wikivoyage | 1 |
| rhg:gatitos + wikipedia + wikivoyage | 1 |
| rhg:learnrohingya + solo-ipa-langmap | 1 |
| rhg:learnrohingya + solo-ipa-langmap + wikipedia | 1 |
| rhg:learnrohingya + solo-ipa-rjoe | 1 |
| rhg:learnrohingya + wikipedia | 1 |
| solo-ipa-kaikki + solo-ipa-langmap | 1 |
| solo-ipa-kaikki + wikipedia + wikivoyage | 1 |

## Largest clusters

| Cluster | Gloss | Groups | Records | Forms (shared by several groups in bold) |
|---|---|---|---|---|
| CTG-CLU-1dc2bc29 | mother | rhg:gatitos, rhg:learnrohingya, solo-ipa-langmap | 3 | **ma**, **maa** |
| CTG-CLU-6ba6b1c4 | my | solo-ipa-kaikki, wikipedia, wikivoyage | 3 | **ãr** |
| CTG-CLU-80896186 | what | hamid-yasir-2019-list, rhg:gatitos, rhg:learnrohingya | 3 | **Ki**, **ki**, **kí** |
| CTG-CLU-ab66f106 | name | hamid-yasir-2019-list, rhg:gatitos, solo-ipa-langmap | 3 | **Namm**, **nam** |
| CTG-CLU-ba6620a2 | rice | owner-speaker, rhg:gatitos, wikipedia | 3 | **bát** |
| CTG-CLU-ce517835 | and | rhg:gatitos, wikipedia, wikivoyage | 3 | **ar** |
| CTG-CLU-d653fa61 | red | rhg:gatitos, solo-ipa-langmap, wikivoyage | 3 | **Lal**, **lal** |
| CTG-CLU-df756818 | i | rhg:learnrohingya, solo-ipa-langmap, wikipedia | 3 | **Aááí**, **ãi** |
| CTG-CLU-86dda4e4 | im | rhg:gatitos, wikivoyage | 3 | **Añi ______**, **Añí** |
| CTG-CLU-a0a7126f | you | rhg:learnrohingya, solo-ipa-langmap | 3 | **tui**, **tũi** |
| CTG-CLU-03fef49d | hand | rhg:gatitos, solo-ipa-langmap | 2 | **at**, **át** |
| CTG-CLU-04ba549d | star | rhg:gatitos, solo-ipa-langmap | 2 | **tara** |
| CTG-CLU-08e1980f | sleepy | rhg:gatitos, rhg:learnrohingya | 2 | **zurar**, **zúrar** |
| CTG-CLU-0a4e57b6 | wednesday | rhg:gatitos, wikivoyage | 2 | Buidbar, Buitbar |
| CTG-CLU-0edaec71 | those | rhg:gatitos, rhg:learnrohingya | 2 | **uin**, **uiín** |
| CTG-CLU-113b1c7a | house home | hamid-yasir-2019-list, rhg:learnrohingya | 2 | **Gor**, **gór** |
| CTG-CLU-16d6e2ed | water | rhg:gatitos, solo-ipa-langmap | 2 | **fani**, **faní** |
| CTG-CLU-1f5c2b19 | one | rhg:gatitos, solo-ipa-rjoe | 2 | **uggwá**, **ugwa** |
| CTG-CLU-20543ecf | salt | rhg:gatitos, solo-ipa-langmap | 2 | **nun** |
| CTG-CLU-219ac378 | wire | rhg:wikipedia-article, wikipedia | 2 | **Tar gán** |
| CTG-CLU-21f0ded6 | house | rhg:gatitos, solo-ipa-langmap | 2 | **gor**, **gór** |
| CTG-CLU-259e814d | not | owner-speaker, rhg:gatitos | 2 | **no** |
| CTG-CLU-2835b08e | father | rhg:gatitos, solo-ipa-langmap | 2 | **baf** |
| CTG-CLU-28f3d709 | forbidden | rhg:gatitos, wikivoyage | 2 | **Mana**, **maná** |
| CTG-CLU-3123243b | please | rhg:gatitos, wikivoyage | 2 | Mērbani gori, meérbanigorí |

## Caveats

- Independence is judged from source metadata (`schemas/consensus_rules.json`, `source_groups`) and can be wrong. Two datasets may share an upstream that the metadata does not show; two sources judged independent may have copied one another.
- A match means that two sources give the same English gloss and a similar form. It does not mean that either is correct, that a speaker said it, or that the gloss is right.
- Similarity is computed on lowercased text with diacritics removed and doubled letters collapsed. That deliberately ignores differences that matter in the Hamidian Script and in IPA, so two different words can be matched. Review before relying on a cluster.
- Forms in different scripts (Bangla script, Latin, IPA) are never matched with one another, so cross-script agreement is missed.
- Chittagonian sentence entries are matched exactly only; near-identical sentences are not clustered.
- Glosses are compared as whole strings after removing bracketed context and a leading to, a, an or the. Glosses with several senses separated by semicolons will not match a single-sense gloss.
- Records from the same group never count twice, even if they differ in spelling.
- Votes are a count of GitHub accounts. They are not evidence and do not change any status other than the community label.
