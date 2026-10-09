# Native-speaker input, batch 1 (2026-10-10)

The owner shared these items in chat: an online sound-reduction post, Abu Bakar's post, the owner's Razzak sentence, a spelling proposal, a word list, a Sitakunda dialect note and Latin-script news posts (#deyang, one citing Dainik Purbokone). The sources are SRC-NATIVE-HY-2026-10-10 and SRC-NEWS-LATIN-2026-10-10.

Records added:
- `lexicon/raw/2026-10-10-native-input-latin.jsonl`: 504 Latin-script forms as written (CTG-LEX-RAW-07500..08003). 19 forms already in the lexicon were skipped.
- `lexicon/raw/2026-10-10-native-input-romanized.jsonl`: 139 forms (CTG-LEX-RAW-08100..08238). 14 use the romanization given by the post's author (section D). The other 125 are AI transliterations of source forms that were in Bangla script. Per the owner's instruction, no Bangla script is stored. 8 older nukta spellings were skipped because they romanize the same as their modern forms.
- `corpus/texts/2026-10-10-native-input-latin.jsonl`: 48 sentences (CTG-TXT-RAW-00101..00148). The names of private people in the news texts are redacted to [NAME] (ETHICS.md).

Spelling:
- `reference_form` is a search fold to the core layer: ŧ>t, đ>d, ş>sh, ʒ>zh, and diacritics, ~ and ` dropped.
- AI transliteration follows the news-text conventions: ŧ and đ for dental t and d; t and d for retroflex; ş for the sibilants; s for the c/ch series; z for j, jh and y; h for kh; f for p and ph; w; y; and a tilde on nasalized vowels. The inherent vowel is o, dropped word-finally and in some clusters. The source's ~ (length) is kept. The full rule table is in the off-repo script translit.py.

Every record is RAW, unassessed and ai_assisted. Every gloss is a working gloss. "(needs gloss)" marks a form the source gave no meaning for.

Next: the owner should review the transliterations, the inherent vowels in particular, and gloss the news vocabulary.
