# Consensus report

Generated 2026-10-29T20:38:16Z by `scripts/consensus.py` (rules version 1). Do not edit by hand; rerun the script.

Consensus is a machine-computed label. It is not verification, it is not endorsement, and it never changes an evidence level, a state or an IPA status. See `docs/protocols/voting-and-consensus.md`.

## Counts

| Measure | Count |
|---|---|
| Records read | 8973 |
| Records skipped (archived, private, withdrawn or restricted) | 0 |
| Clusters auto-confirmed | 241 |
| Entries auto-confirmed by consensus | 534 |
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
| rhg:gatitos + rhg:wiktionary | 88 |
| rhg:gatitos + rhg:rohingyalanguage-org | 72 |
| rhg:gatitos + rhg:rohingyalanguage-org + rhg:wiktionary | 9 |
| rhg:gatitos + rhg:learnrohingya | 8 |
| rhg:gatitos + rhg:wiktionary + solo-ipa-langmap | 8 |
| rhg:gatitos + wikivoyage | 6 |
| rhg:learnrohingya + rhg:wiktionary | 5 |
| rhg:rohingyalanguage-org + rhg:wiktionary | 5 |
| owner-speaker + rhg:gatitos | 4 |
| rhg:gatitos + solo-ipa-rjoe | 4 |
| owner-speaker + rhg:gatitos + rhg:rohingyalanguage-org | 2 |
| rhg:wikipedia-article + wikipedia | 2 |
| compiled-chatgaiyya-benchmark + rhg:learnrohingya | 1 |
| hamid-yasir-2019-list + rhg:gatitos + rhg:learnrohingya + rhg:wiktionary | 1 |
| hamid-yasir-2019-list + rhg:gatitos + rhg:wiktionary + solo-ipa-langmap | 1 |
| hamid-yasir-2019-list + rhg:learnrohingya | 1 |
| hamid-yasir-2019-list + rhg:rohingyalanguage-org + rhg:wiktionary | 1 |
| hamid-yasir-2019-list + rhg:wiktionary | 1 |
| hoque-2015 + rhg:gatitos | 1 |
| owner-speaker + rhg:gatitos + rhg:wiktionary | 1 |
| owner-speaker + rhg:gatitos + rhg:wiktionary + wikipedia | 1 |
| owner-speaker + rhg:gatitos + solo-ipa-langmap | 1 |
| owner-speaker + rhg:learnrohingya + solo-ipa-kaikki + solo-ipa-langmap + wikipedia | 1 |
| owner-speaker + solo-ipa-kaikki + wikipedia | 1 |
| rhg:gatitos + rhg:learnrohingya + rhg:wiktionary | 1 |
| rhg:gatitos + rhg:learnrohingya + solo-ipa-langmap | 1 |
| rhg:gatitos + rhg:rohingyalanguage-org + rhg:wiktionary + solo-ipa-langmap + wikivoyage | 1 |
| rhg:gatitos + rhg:rohingyalanguage-org + rhg:wiktionary + wikivoyage | 1 |
| rhg:gatitos + rhg:rohingyalanguage-org + solo-ipa-langmap | 1 |
| rhg:gatitos + solo-news-latin-deyang | 1 |
| rhg:gatitos + wikipedia + wikivoyage | 1 |
| rhg:learnrohingya + rhg:wiktionary + solo-ipa-langmap | 1 |
| rhg:learnrohingya + rhg:wiktionary + solo-ipa-rjoe | 1 |
| rhg:learnrohingya + wikipedia | 1 |
| rhg:rohingyalanguage-org + wikivoyage | 1 |
| rhg:wiktionary + solo-ipa-kaikki | 1 |
| rhg:wiktionary + solo-ipa-langmap | 1 |
| solo-ipa-kaikki + solo-ipa-langmap | 1 |
| solo-ipa-kaikki + wikipedia | 1 |
| solo-ipa-kaikki + wikipedia + wikivoyage | 1 |

## Largest clusters

| Cluster | Gloss | Groups | Records | Forms (shared by several groups in bold) |
|---|---|---|---|---|
| CTG-CLU-37f8fc2d | red | rhg:gatitos, rhg:rohingyalanguage-org, rhg:wiktionary, solo-ipa-langmap, wikivoyage | 5 | **Lal**, **lal** |
| CTG-CLU-4a49dd82 | i | owner-speaker, rhg:learnrohingya, solo-ipa-kaikki, solo-ipa-langmap, wikipedia | 5 | **Aááí**, **ãi** |
| CTG-CLU-926f90d9 | rice | owner-speaker, rhg:gatitos, rhg:wiktionary, wikipedia | 5 | **bat**, **bát** |
| CTG-CLU-041b7370 | name | hamid-yasir-2019-list, rhg:gatitos, rhg:wiktionary, solo-ipa-langmap | 4 | **Namm**, **nam** |
| CTG-CLU-3f5f4fa9 | what | hamid-yasir-2019-list, rhg:gatitos, rhg:learnrohingya, rhg:wiktionary | 4 | **Ki**, **ki**, **kí** |
| CTG-CLU-a6b1a3ed | black | rhg:gatitos, rhg:rohingyalanguage-org, rhg:wiktionary, wikivoyage | 4 | **Hala**, **hala** |
| CTG-CLU-56f6d028 | he | owner-speaker, solo-ipa-kaikki, wikipedia | 4 | **Ité**, **ite**, **itẽ** |
| CTG-CLU-aa8884f4 | my | solo-ipa-kaikki, wikipedia, wikivoyage | 4 | **ãr** |
| CTG-CLU-f3903df1 | you | rhg:learnrohingya, rhg:wiktionary, solo-ipa-langmap | 4 | **tui**, **tũi** |
| CTG-CLU-03b9411a | sour | owner-speaker, rhg:gatitos, rhg:rohingyalanguage-org | 3 | **horo**, **hóro**, **hõ~ro~** |
| CTG-CLU-1c6dc09c | nose | rhg:gatitos, rhg:wiktionary, solo-ipa-langmap | 3 | **nak** |
| CTG-CLU-1dc2bc29 | mother | rhg:gatitos, rhg:learnrohingya, solo-ipa-langmap | 3 | **ma**, **maa** |
| CTG-CLU-2a9f76b7 | house | rhg:gatitos, rhg:wiktionary, solo-ipa-langmap | 3 | **gor**, **gór** |
| CTG-CLU-37aa3c3d | who | owner-speaker, rhg:gatitos, rhg:wiktionary | 3 | **hon** |
| CTG-CLU-398456d8 | knife | rhg:gatitos, rhg:rohingyalanguage-org, rhg:wiktionary | 3 | **súri** |
| CTG-CLU-46471f44 | mouse | rhg:gatitos, rhg:rohingyalanguage-org, rhg:wiktionary | 3 | **undur** |
| CTG-CLU-4876c812 | tree | rhg:gatitos, rhg:rohingyalanguage-org, rhg:wiktionary | 3 | **gas** |
| CTG-CLU-5a51e2dd | three | rhg:gatitos, rhg:wiktionary, solo-ipa-langmap | 3 | **tin** |
| CTG-CLU-5b1d91ab | she | owner-speaker, rhg:gatitos, rhg:rohingyalanguage-org | 3 | **iba**, **ibá**, **íba** |
| CTG-CLU-6db9c9b8 | come | hamid-yasir-2019-list, rhg:rohingyalanguage-org, rhg:wiktionary | 3 | **Ai**, **ai** |
| CTG-CLU-6e38b1c4 | salt | rhg:gatitos, rhg:wiktionary, solo-ipa-langmap | 3 | **nun** |
| CTG-CLU-79717b9e | hand | owner-speaker, rhg:gatitos, solo-ipa-langmap | 3 | **at**, **át** |
| CTG-CLU-84e4edb9 | father | rhg:gatitos, rhg:rohingyalanguage-org, solo-ipa-langmap | 3 | **baf** |
| CTG-CLU-8ac9fbe1 | book | rhg:gatitos, rhg:learnrohingya, rhg:wiktionary | 3 | **kitab**, **kítab** |
| CTG-CLU-9c79166f | seven | rhg:gatitos, rhg:rohingyalanguage-org, rhg:wiktionary | 3 | **háñt** |

## Caveats

- Independence is judged from source metadata (`schemas/consensus_rules.json`, `source_groups`) and can be wrong. Two datasets may share an upstream that the metadata does not show; two sources judged independent may have copied one another.
- A match means that two sources give the same English gloss and a similar form. It does not mean that either is correct, that a speaker said it, or that the gloss is right.
- Similarity is computed on lowercased text with diacritics removed and doubled letters collapsed. That deliberately ignores differences that matter in the Hamidian Script and in IPA, so two different words can be matched. Review before relying on a cluster.
- Forms in different scripts (Bangla script, Latin, IPA) are never matched with one another, so cross-script agreement is missed.
- Chittagonian sentence entries are matched exactly only; near-identical sentences are not clustered.
- Glosses are compared as whole strings after removing bracketed context and a leading to, a, an or the. Glosses with several senses separated by semicolons will not match a single-sense gloss.
- Records from the same group never count twice, even if they differ in spelling.
- Votes are a count of GitHub accounts. They are not evidence and do not change any status other than the community label.
