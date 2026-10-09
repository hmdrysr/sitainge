# Rosetta Stone

Columns: Chittagonian | English | Bangla.

Architecture: Chittagonian <-> English and, independently, Chittagonian <-> Bangla. Never Chittagonian -> Bangla -> English. Bangla appears nowhere else in the project.

Status: empty. The Bangla column may only be filled by a Chittagonian speaker who supplies the Bangla equivalent; a Bangla word is never recorded as a Chittagonian form.

## Additions, October 8, 2026

`2026-10-08-chatgaiyya-bangla-script-forms.jsonl` holds 170 Chittagonian forms written in Bangla script, with their spelling variants and English working glosses, from the owner's file `chittagonian_huge_vocab_grouped_ipa.json` (sources ChatgaiyyaBench and ChatgaiyyaAlap, both credited in the scrape as CC BY 4.0).

- These are Chittagonian forms in Bangla script, not Bangla words. They are kept in this layer because the project allows Bangla script nowhere else.
- No IPA was supplied for them. Dadi and the dictionary do not read this folder.
- Every record is RAW, unassessed and AI-assisted (extracted by a scrape). The English glosses are working glosses and need a speaker's check.
- The source licence (CC BY 4.0) requires attribution and has not been confirmed as compatible with the CC0 dedication, so the records are marked research-only.

## Additions, October 8, 2026 (dataset pull)

`2026-10-08-dataset-bangla-script-forms.jsonl` holds 4,253 Chittagonian words, clauses and sentences in Bangla script with English glosses, taken from the ONUBAD, BD-Dialect and ChatgaiyyaAlap data as compiled in the ChatgaiyyaBench repository. The `unit` field says whether a record is a word, clause or sentence.

- Records already present from the earlier file were skipped. Records with a Latin form went to the lexicon instead.
- Every record is RAW and unassessed. The English glosses come from the dataset compilers and some look loose; a speaker needs to check them.
- The source licence is CC BY 4.0 as stated in the ChatgaiyyaBench README. Compatibility with the CC0 dedication is not confirmed.

## Additions, October 8, 2026 (sentence pairs)

- `2026-10-08-chatgaiya-sentence-pairs.jsonl`: 6,490 Chittagonian sentences in Bangla script from the Vashantor and ChatgaiyyaAlap data, each with the compilers' Standard Bangla sentence in `standard_bangla`, an English translation where the source gives one, and, for Vashantor, the Latin spelling in `latin_form` and a `lexicon_ref` to the matching lexicon record. CC BY 4.0 per the ChatgaiyyaBench README.
- `2026-10-08-sihabsafin-thesis-pairs.jsonl` (3,547) and `2026-10-08-shobuz-nsu-dialect-pairs.jsonl` (784): Bangla-script Chittagonian and Standard Bangla sentence pairs from two public GitHub projects. The Shobuz project states only "academic and research purposes", so check its terms before any reuse and drop it if they do not fit. See `docs/research-gaps/ctg-sentences-2026-10-08.md`.
- `standard_bangla` is a Standard Bangla sentence, not Chittagonian. It sits in its own field so it cannot be mistaken for a Chittagonian form.

## Additions, October 10, 2026

`2026-10-10-wiktionary-bangla-script-forms.jsonl` holds 10 Chittagonian forms in Bangla script with short English glosses from English Wiktionary (CC BY-SA 4.0; form-gloss facts only). RAW, unassessed, AI-assisted, research-only. See `docs/research-gaps/web-harvest-2026-10-10.md`.
