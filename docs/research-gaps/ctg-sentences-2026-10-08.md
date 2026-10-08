# Chittagonian sentence search, October 9, 2026

The owner asked for as many Chittagonian sentences as can be found in open sources. This note records what was tried, what was copied, what was left out and why. Nothing here is verified by a speaker.

## Result in one paragraph

Two public GitHub repositories yielded Chittagonian sentences, and all of them are in Bangla script, so they went to the Rosetta layer only. No new Latin-script sentences were found, so there is no new file in `lexicon/raw/`. Every record is RAW, unassessed and research-only. None of the text came through a summarising fetch: it was read directly from cloned files, and `ai_assisted` is false throughout.

## Counts

| Source | Layer | Rows read | Added | File |
|---|---|---|---|---|
| Safin thesis dataset (SRC-CTG-SIHABSAFIN-THESIS) | Rosetta | 7,663 | 3,547 | `rosetta/2026-10-08-sihabsafin-thesis-pairs.jsonl` |
| Shobuz NSU project (SRC-CTG-SHOBUZ-NSU) | Rosetta | 936 Chittagonian rows | 784 | `rosetta/2026-10-08-shobuz-nsu-dialect-pairs.jsonl` |
| Total | Rosetta | | 4,331 | ids CTG-ROS-RAW-05000 to 09330 |

Lexicon layer: 0 added.

### Why rows were not added

| Reason | Safin | Shobuz |
|---|---|---|
| Already in the repository (Rosetta, same text after whitespace and punctuation are collapsed) | 14 | 0 |
| Already in the ChatgaiyyaBench `parallel.jsonl` that the lead is adding separately | 3,933 | 0 |
| Fewer than 3 words | 61 | 89 |
| Duplicate within the same source | 21 | 0 |
| Vulgar or abusive keyword filter | 85 | 25 |
| Flagged by the source's author as auto-generated, partly fixed or kept as Standard Bangla | not applicable | 37 |
| Chittagonian column identical to the Standard Bangla column | 1 | 0 |
| Empty or no Bangla script | 1 | 1 |

How the filters worked. A pattern check for web addresses, handles, email addresses and long digit strings (phone-number shapes) removed nothing, so no personal data was found. The vulgar filter is a keyword list applied to the English gloss and to both Bangla columns. It is deliberately broad: a sample of what it caught shows that most hits were ordinary sentences containing a substring of a listed word, so many harmless sentences were probably dropped with any abusive ones. The filter was not reviewed line by line, and a few vulgar or abusive lines could remain. The owner or a steward should skim the files before promotion.

The two kept files do not overlap each other (0 shared sentences).

## What was tried

### Retrieved and copied
- `github.com/sihabsafin/bangla-chittagonian-translation`, `data/raw/dataset.csv` (commit c053384, September 23, 2026). English, Standard Bangla and Chittagonian columns. The repository's README claims native-speaker refinement and an MIT Licence; see licences below.
- `github.com/shobuz123/Bangla-dialect-translation`, `shobuz_cse445.xlsx`, sheet `Dialect_Dataset` (commit c8b97e2, September 26, 2026). Only rows labelled Chittagonian were read.

### Retrieved and rejected
- `github.com/twistedninja02/DialectLoop` (MIT). Its `data/dialectloop_gold_annotated_1200.csv` has 280 Chittagong rows, but they contain only 4 distinct sentences repeated under different speaker ids, and the README says the corpus is not distributed in the snapshot. Treated as illustrative, not as evidence, and not copied.

### Checked with a negative result
- eBible `translations.csv` (1,362 translations): no Chittagonian entry.
- Tatoeba-Challenge data README and FLORES+ README: no Chittagonian or ctg mention.
- GitHub topic pages for chittagonian, chattogram, bangla-dialect and bengali-dialects: empty. The chittagong topic lists only unrelated projects.
- Wikipedia, Wikivoyage and Omniglot pages: already harvested on October 8; not repeated.

### Blocked or not retrievable
- Mendeley Data sets (Kothon, Chattogram sent, ChattoBan, Dwadash, ANUBHUTI, the dialect-bias parallel corpus, the regional dialects speech data) and the Kaggle RegSpeech12 set: the shell reaches only GitHub, and a summarising fetch cannot return thousands of sentences verbatim. Recorded as pointers.
- PubMed Central pages (Kothon and BanglaDial articles) returned a browser-check page and could not be read.
- An arXiv page (2608.12018) was rate limited and was not read.
- GitHub search pages and user repository lists are blocked by robots.txt for the fetch tool, and the GitHub search API is closed to this session. Repository discovery therefore relied on web search, which finds few GitHub repositories for this language.
- Hugging Face pages: not reachable from the shell. The ChatgaiyyaBridge Space was fetched through the summariser; it printed rule notation only, with no sentences.
- Two papers (BLP 2025 paper 26, RegSpeech12) were read through a summarising fetch. The first printed no labelled Chittagonian examples. The second's two printed Chittagong lines came out with garbled characters, so they were not copied. No text from either entered the data.

## Licences and the CC0 dedication

- Safin thesis dataset. README: MIT Licence. No LICENSE file exists in the clone, and the README does not say whether the dataset itself is covered. The sentences are said to come from unnamed public online resources, and about half also appear in ChatgaiyyaBench (CC BY 4.0 per its README). MIT and CC BY both require attribution, so neither is the same as CC0. The upstream terms are unknown. Marked research-only.
- Shobuz project. No licence. README: 'This project is for academic and research purposes.' This is not a grant that allows redistribution, so the records are research-only and should not be published or promoted beyond research use without the author's written permission. If the owner prefers a stricter reading, remove the single file `rosetta/2026-10-08-shobuz-nsu-dialect-pairs.jsonl` and its source record.
- DialectLoop: MIT, but nothing was copied.

## Reliability

- Both datasets are student or thesis projects. Neither names where the Chittagonian came from. Some Chittagonian renderings may be translations made from Standard Bangla by the compilers or by software, and the Safin README says only that native speakers refined them. The usual caution applies: a Bangla-script sentence in a dataset is not evidence of natural usage until a speaker confirms it.
- The English glosses and the Standard Bangla column are the compilers'. The Standard Bangla column is stored in a separate field, `standard_bangla`, and is never a Chittagonian form.
- Spellings vary between and within sources (for example the nasalised pronoun written with and without chandrabindu). Nothing was normalised.
- Because about half of the Safin rows duplicate ChatgaiyyaBench, that source shares the `compiled-chatgaiyya-benchmark` consensus group.

## Follow-ups

1. Ask the Shobuz author about licence and origin; ask the Safin author which public resources the triples came from and whether the dataset is MIT-licensed.
2. Have a Chittagonian speaker spot-check a random sample of 100 records from each file and record the error rate.
3. Skim both files for abusive or personal content before any promotion.
4. Obtain the Mendeley sets (Kothon, Chattogram sent, ChattoBan, Dwadash) by download on a machine with web access, then run the same filters.
5. Look for romanized (Latin-script) Chittagonian: none was found on GitHub, so owner-supplied or speaker-recorded sentences are the likelier route.
6. Ids CTG-ROS-RAW-05000 upward are used by this batch. Any other batch that also starts at 05000 must be renumbered.
