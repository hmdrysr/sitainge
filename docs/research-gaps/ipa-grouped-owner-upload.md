# Grouped vocabulary file supplied by the owner, October 8, 2026

File: `chittagonian_huge_vocab_grouped_ipa.json` (260 grouped entries, 411 forms). It repeats most of the earlier IPA scrape and adds Bangla-script forms.

## What was added
- **19 new IPA records** in `lexicon/raw/2026-10-08-ipa-grouped-owner-upload.jsonl` (`CTG-LEX-RAW-04100` to `04118`). The other IPA forms were already present from the first file and were not added twice.
- **170 Chittagonian forms in Bangla script** in `rosetta/2026-10-08-chatgaiyya-bangla-script-forms.jsonl` (`CTG-ROS-RAW-00001` to `00170`). Each record carries the source's spelling variants. The scrape marked them as canonical source forms (146) or corpus-attested forms (24); the 151 spelling variants sit inside those records.
- Three source records in `sources/sources.jsonl` (ChatgaiyyaBench, ChatgaiyyaAlap, and the Chatgaiya dictionary listed in the scrape; nothing was taken from the dictionary).

## Decisions and cautions
- **Where the Bangla-script forms went.** The project rule is that Bangla script appears only in the Rosetta layer. These are Chittagonian spellings in Bangla script rather than Bangla words, but they were kept in `rosetta/` so that the rule holds and so that Dadi, which reads `lexicon/`, does not display them. If the owner wants them in Dadi, that is a rule change and should be logged.
- **Licence.** The scrape gives CC BY 4.0 for ChatgaiyyaBench and ChatgaiyyaAlap. Attribution is required, and compatibility with the CC0 dedication is not confirmed, so the records are `research-only`. The licence was not re-checked.
- **Glosses.** The scrape says the English glosses on spelling-normalization entries are working glosses. Some are doubtful (for example 'to the hand', 'I ate; I played', "your/others'").
- **Regional labels.** Five forms carry 'South' or 'North' Chittagong labels from the paper. They are stored in `region` as the source's labels, unchecked. One pair has the same IPA in both regions.
- **Odd symbols.** Several RJOE forms contain ∧ where IPA ʌ would be expected. They are kept exactly as given.
- **One unclear gloss.** A compound whose gloss was '??' is recorded as 'unclear'.
- **Counts differ from the file's header.** The grouped file reports 260 entries; 98 of them repeat the first scrape.
