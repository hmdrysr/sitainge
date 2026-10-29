# Newcomer research pass, October 30, 2026 (RAW, unverified)

The owner asked for the language to be researched "as a newbie following the project's instructions". An AI assistant read `AGENTS.md`, `EVIDENCE_POLICY.md`, both `ai-use-policy.md` files, `docs/decisions/rohingya-merge.md` and every note in `docs/research-gaps/`. It then rechecked the open sources the repository already lists and searched the web for new reusable ones. No speaker took part. Every record is `RAW`, evidence `unassessed`, consent `research-only`, with its source and `licence_note`. Nothing was invented, respelled or transliterated by the AI.

## What was added

| File | Records | Ids | Variety | Source |
|---|---|---|---|---|
| `lexicon/raw/2026-10-30-wiktionary-chittagonian.jsonl` | 21 | CTG-LEX-RAW-15000 to 15020 | chittagong | SRC-WIKT-CTG-2026-10-30 |
| `lexicon/raw/2026-10-30-wiktionary-rohingya.jsonl` | 228 | CTG-LEX-RAW-15100 to 15327 | rohingya | SRC-WIKT-RHG-2026-10-30 |
| `lexicon/raw/2026-10-30-rohingyalanguage-org-sample.jsonl` | 489 | CTG-LEX-RAW-15500 to 15988 | rohingya | SRC-RHG-RLORG-500 |
| `corpus/texts/2026-10-30-wiktionary-usage.jsonl` | 1 sentence (ãi gom achi, "I am well.") | CTG-TXT-RAW-00200 | chittagong | SRC-WIKT-CTG-2026-10-30 |

Total: 738 lexicon records and 1 sentence. Eight source rows were added to `sources/sources.jsonl` (three checked, five pointers), and their independence groups were added to `schemas/consensus_rules.json`. `scripts/consensus.py` and `scripts/build_dadi_seed.js` were rerun.

### Variants and attestation
- Following the attestation rule, a form that already exists is added as a new record, not skipped. 176 of the 738 records repeat an existing written form with an overlapping English gloss. They carry `attests` (the earlier ids) and the form note "attestation record". Same-spelling records with an unrelated gloss are listed in `notes` as possible homographs and are not linked.
- Attestation counts by independent source group for the new forms, counted by identical written form across the lexicon: 480 forms in 1 group, 207 in 2, 34 in 3 and 17 in 4 or more. Forms now attested in 3 or more groups include ãi (I, 4), ãr (my, 3), gom (good, 5), lal (red, 5), bát (rice, 4), gór (house, 4), hala (black, 4), nam (name, 4), dui, tin, sair, no (numerals, 4), tui (you, 3), ki (what, 3) and hon (who, 3). These counts are by form only; they do not decide preferred forms. `scripts/consensus.py` does that.
- Alternative spellings given by a source were kept as their own records: bisoin/bisein (hand fan), holom/kholom (pen), házar/ázar (thousand), háñt/cáñt (seven), dec/dhec (country). Multi-option cells such as "Kriccen or giriza" keep the cell as written, and each option is in `spellings`.

## Sources checked

| Source | Licence | Used? | Notes |
|---|---|---|---|
| Wiktionary, Chittagonian lemmas (19 pages) | CC BY-SA 4.0 | Yes, 21 forms and 1 sentence | Headwords are in Bengali script; only the editors' `tr=` romanization and a short gloss were taken. Grouped with Kaikki for independence (same upstream). The siṭaiŋga spelling there uses ŋ; the project writes ṅ. |
| Wiktionary, Rohingya lemmas (252 pages) | CC BY-SA 4.0 | Yes, 228 Latin-titled entries | The earlier pointer SRC-RHG-WIKTIONARY had not been read. Hanifi- and Arabic-titled pages were not used. One entry (aalu) is tagged on Wiktionary for deletion as a misspelling; it is kept with a note. |
| RohingyaLanguage.org lexicon, 500-entry sample (Zenodo 10.5281/zenodo.22886278) | CC BY 4.0 | Yes, 489 of 500 rows | Downloaded file, copied by a program (`ai_assisted: false`). Hanifi column not copied. |
| RohingyaLanguage.org full lexicon (15,926 rows, Hugging Face) | CC BY 4.0 on Hugging Face and Mozilla Data Collective | No, pointer | The Zenodo README says the sample's licence "does not assert a license for the complete source dataset". Owner to decide. |
| Wikidata lexemes (119 Chittagonian, 123 Rohingya) | CC0 | No | No Latin-script lemmas; Chittagonian lexemes are Bengali script and mostly have no senses. Transliterating them would create AI-made forms. |
| Bangla-Chittagonian Parallel Dataset (Zenodo 10.5281/zenodo.18399046) | CC BY 4.0 | No, pointer | Bengali script only; the English column is Google Translate output. |
| Chittagonian text corpus (Mozilla Data Collective) | CC BY-NC-SA 4.0 | No, pointer | Non-commercial; not compatible with CC0. |
| IOM Rohingya Dictionary (rohingyadictionary.org) | CC BY-NC-SA 4.0 | No, pointer | Speaker-vetted, but non-commercial. Ask IOM for permission. |

## Held back (not recorded)

| Form | Gloss | Source | Reason |
|---|---|---|---|
| ãi tuẏanare bēśi goma lage | I love you | Wiktionary (ctg) | A mechanical transliteration (ẏ, ē, ś, final -a), not a usable romanization |
| aññi / aññí | I | Wiktionary (rhg) / RohingyaLanguage.org | Owner rule: "I" is ãi. Rohingya first-person forms held until the owner decides how they should appear |
| git, kolom, nodi, rani, rokto | song, pen, river, queen, blood | Wiktionary (rhg) | Identical to common standard-Bengali romanizations (owner rule). The owner may restore them as Rohingya-variety forms |
| Jeffrey | Jeffrey | RohingyaLanguage.org | A personal name, not vocabulary |
| (interjection with punctuation) | exclamation | RohingyaLanguage.org, row 5180 | Unclear form |
| 8 rows | sexual or anatomical terms, insults, one English slur headword | RohingyaLanguage.org, rows 699, 792, 3347, 6118, 11412, 13300, 14022, 15774 | No-vulgar rule. Forms deliberately not reproduced here |

No hello word or time-of-day greeting turned up. beinne ("morning", noun) is a word for the time of day, not a greeting.

## Open questions for the owner
1. **Licence layer.** None of the new sources is CC0: the Wiktionary sources are CC BY-SA and the RohingyaLanguage.org sample is CC BY. They follow the existing practice for GATITOS and Wikivoyage (facts only, `licence_note` kept, `research-only`). Confirm that, or move them to a separately licensed layer.
2. **Full RohingyaLanguage.org lexicon** (about 15,900 rows, reachable): ingest it under the CC BY 4.0 statements on Hugging Face and Mozilla Data Collective, or ask the publisher first? Is RohingyaLanguage.org related to the Rohingya Language Foundation (rohingyalanguage.com, all rights reserved)? If it is, the independence group should merge.
3. **Rohingya "I" forms and Bengali-identical forms** (table above): record them as Rohingya-variety forms, or keep them out?
4. **Rohingyalish orthography.** It uses letters such as c, ç and ñ and accented vowels in ways the Chittagong-variety records do not, and the sources give no sound key. The project has no mapping between it and Chittagong-variety spellings, so similar words are linked only when the spelling is identical. A reviewer could propose variant links.
5. **Wiktionary gloss quality.** Some glosses look odd (gom glossed as a verb "good"; ola glossed "he, doer. physician"). They are kept as printed.

## Not done
- Wiktionary pages for related terms and the Kaikki dumps were not walked. Kaikki is the same upstream, so it is not an independent source.
- Grierson's LSI and Uchida 1970 are still unread (see `starter-sources.md`).
- No speaker checked any record. A native speaker should look at the 21 Chittagong-variety records first.

AI assistance: the extraction scripts and this note were written with an AI assistant. Removing every AI-assisted record leaves the RohingyaLanguage.org records, which were copied by a program from the downloaded file.
