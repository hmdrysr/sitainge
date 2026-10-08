# Dataset pull, October 8, 2026

The owner listed 40 datasets, dictionaries and papers and asked for as much as possible to be extracted.

## What could be retrieved

The build environment can reach GitHub but not Mendeley Data, Hugging Face, PubMed Central, ResearchGate, the Mozilla Data Collective or nahid.org. The ChatgaiyyaBench GitHub repository holds a compiled copy of five of the listed datasets, so the data was read from there.

| Added | Count | Where |
|---|---|---|
| Chittagonian sentences in Latin spelling with English translations (Vashantor, one ChatgaiyyaAlap row) | 2,463 | `lexicon/raw/2026-10-08-vashantor-romanized-sentences.jsonl` |
| Chittagonian words, clauses and sentences in Bangla script with English glosses (ONUBAD, BD-Dialect, ChatgaiyyaAlap) | 4,253 | `rosetta/2026-10-08-dataset-bangla-script-forms.jsonl` |

Of 2,498 Vashantor sentences, 35 were skipped as repeats after case and punctuation were removed.

## What was not retrieved

Kothon, the 20,101-word lexicon, ChattoBan, the Chittagonian Speech Corpus, the Mozilla corpus, the Vulgar Lexicon and all printed dictionaries are recorded as pointers in `sources/sources.jsonl`. Nothing was taken from them. The speech corpus matters most: it is the only listed source that could support audio-based IPA.

## Cautions

- No new IPA was added. The conversion workflow the owner supplied forbids inventing IPA, and none of these sources supplies it.
- The Latin spellings are contributors' own informal spellings. They are kept as submitted and are not a project standard.
- The Vashantor dataset gives English translations of the sentences; they were not word-glossed.
- The compiled copy was not compared with the originals. Some ONUBAD glosses look loose.
- The CC BY 4.0 terms require attribution; compatibility with the CC0 dedication is unconfirmed.
- The Bangla-script forms stay in the Rosetta layer; Dadi and the dictionary do not read them.
