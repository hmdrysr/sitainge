# Web harvest, round 2, 2026-10-08 (RAW, unverified)

Collected by AI tools reading public pages, not by a speaker. Every record is RAW, evidence level unassessed, consent `research-only`. Nothing was invented; forms are copied as the fetch tool returned them, with the source's own gloss. The yield is small (64 records) because most promising sources were blocked or held no Roman-letter Chittagonian. Target of 150 to 400 records was not reachable honestly.

File: `lexicon/raw/2026-10-08-web-harvest-2.jsonl`. Validator (copy of the repo plus this file): 200 records, 0 errors, 2 warnings (the two UDHR sentences in CTG-LEX-RAW-02000/02001 duplicate CTG-LEX-RAW-00102/00103 from the first harvest; kept as instructed, a steward may merge them).

The `ipa_status` enum has no "published-source-unverified" value, so `ipa` is null everywhere and no IPA was taken in this round.

## Records by source

| Source id | Records | Ids |
|---|---|---|
| SRC-WEB-AC-1 (Omniglot, UDHR) | 2 | CTG-LEX-RAW-02000, 02001 (from harvest/academic.jsonl, unchanged) |
| SRC-WEB-AC-2 (Pargiter 1886) | 8 | CTG-LEX-RAW-02002 to 02009 (unchanged; re-checked against the existing round-1 doc, forms match) |
| SRC-WEB-H2-1 | 9 | CTG-LEX-RAW-03000 to 03008 |
| SRC-WEB-H2-2 | 45 | CTG-LEX-RAW-03009 to 03053 |
| Total | 64 | |

## New source register rows

| Source id | Citation / URL | Licence | Records | Notes |
|---|---|---|---|---|
| SRC-WEB-H2-1 | Mirror of an older English Wikipedia "Chittagonian language" revision, https://classicistranieri.com/en/c/h/i/Chittagonian_language.html (retrieved 2026-10-08) | not stated on page; Wikipedia text is normally CC BY-SA; authors unknown | 9 | Seven example phrases (nasal-vowel section) and the ar / ãr pair. Not in the current Wikipedia article. |
| SRC-WEB-H2-2 | Mirror of another old English Wikipedia revision, https://en-academic.com/dic.nsf/enwiki/2078824 (attribution line "Wikimedia Foundation. 2010.") | not stated; presumed CC BY-SA, unconfirmed | 45 | 13 phrases, 10 word-order words, 22 "Few Chittagonian words" forms. |

Cautions for reviewers:
- Both pages are mirrors of old, unreviewed wiki revisions. The two revisions disagree (Tũi honde? vs Tũi konde?; Ãi gom asi. vs Ãi gawm asi.), so spellings are unstable, and an unknown editor may have written them.
- Diacritics are unusual (ì, ĵ, Ğ, á) and were returned by a summarizing fetch tool, so the exact characters are unverified against the pages.
- The "Few Chittagonian words" forms are noun plus an ending (án, Ğín, wá, gún, lán and so on); the page gives no grammatical explanation and the pattern looks irregular, so the forms are marked "noun with ending as printed" only.
- Glosses such as "I love you" for Ãtte tuãre beshi gom lage are copied as printed and may not be literal.
- Bangla script lines were skipped, except the one Bangla line for Ítara, stored in comparative_data.

## Sources tried and not used

| Source | Result |
|---|---|
| en.wiktionary.org (category, Swadesh appendix, raw, REST, mobile) | WebFetch: "cache-only domain, cannot be fetched". curl: blocked by the egress proxy (403 on CONNECT). Not retried or routed around. |
| archive.org via curl | Same proxy 403. archive.org via WebFetch works but truncates each text to about 71,000 characters. |
| Grierson, LSI Vol. V Pt. I (archive.org id LinguisticSurveyOfIndiaVolVPartIIndoAryanFamilyEasternGroup) | Only the front matter and table of contents were readable (the Chittagong dialect is Section VII); offset reads past 71k fail. DSAL BookReader returns no text. PDF over the 30 MB fetch cap. Not harvested. |
| en.wikipedia.org (current article, Chittagonian alphabet) | Current article has no word lists (round 1). Alphabet page is cache-only. |
| Wikivoyage mirror (guides.travel.sygic.com) | Phrase list empty; wikitravel.org returned 403. Wikivoyage was harvested in round 1. |
| Omniglot chart PDF (omniglot.com/charts/chittagonian.pdf) | German-language notes; only language names in Roman letters, no glosses. |
| CIIL Sanchika items (kinship, body parts, seasons elicitation) | Item pages only; no words shown, rights not stated; recordings/transcripts not reachable from here. |
| Glosbe (glosbe.com/en/ctg) | No entries shown; licence not stated. |
| ASJP (asjp.clld.org) | No Chittagonian wordlist found by search or by guessed URL; not exhaustively checked. |
| HF Space ChatgaiyyaBridge, universeofmemory.com resource list | Bangla-script rules or links only; no Roman-letter data. |
| srichinmoybio.co.uk "To Be A Chittagonian" | Song transliterations only (not reproduced; copyrighted creative text); no word glosses. |
| Searches for open papers (Swadesh, numerals, kinship, food, body parts, verb paradigms) | Returned only unrelated languages (Bantawa, Serawai, Sikkim) or journalism; nothing citable. Earlier-listed papers (SRC-WEB-AC-8, 11, 12, 13) remain unread beyond landing pages. |
| ELAR, Commons, Wikisource | Searches turned up no Chittagonian text pages. |

## Suggestions

1. Wiktionary and the Linguistic Survey of India are the most likely rich sources. They need a fetch route that allows en.wiktionary.org and full archive.org text (or the PDF split into pages), or a steward-supplied download.
2. Learner categories asked for (kinship, body parts, food, animals, colours, days, months, common verbs, question words) are covered only by Wikivoyage (round 1) and a few phrases here; nothing new was found for animals, food, body parts or kinship.
