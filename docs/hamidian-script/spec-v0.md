# Hamidian Script v0 (working specification)

Status: **Proposed.** No letter-to-sound mapping is fixed. A mapping needs Chittagonian phonological evidence that has not yet been gathered.

## Principles
- Pronunciation is fixed; spelling is flexible.
- Write naturally, preserve the pronunciation, avoid confusion.
- No mandatory single spelling. Variants with the same pronunciation and meaning and no serious ambiguity are all accepted. A reference form exists for indexing only.
- Never silently overwrite a contributor's original spelling. Store original form, variant, pronunciation, reference form, meaning.

## Design constraints
Ordinary Latin keyboards and mobile typing; readability; searchability; Unicode (NFC); minimal diacritics, optional wherever omission creates no real ambiguity. Not a copy of Turkish, English or any other orthography.

## Proposed v0 structure
- **Core layer:** basic Latin letters only. Everything must be writable and searchable with this layer alone.
- **Precision layer (optional):** diacritics for contrasts the evidence shows matter. Which contrasts qualify is **Unknown** until the phonology is documented.
- **2019 draft symbols** (ç, ğ, ı, ş, ö, ü and accented vowels): kept as proposals, sourced to the 2019 draft, to be tested against evidence and keyboard cost.
- **Search normalization:** a documented fold from precision-layer forms to core-layer forms so users who skip accents still find entries.

## Change process
A proposal must give: linguistic justification, speaker evidence, examples, usability analysis, digital compatibility, alternatives considered and expected consequences. The decision goes in the orthographic decision log. No individual can alter the alphabet unilaterally.

## Stability
After a mature release, a versioned core (Hamidian Script 1.0) is frozen. New evidence is recorded as variants; changes become 1.1, 2.0 and so on. Older material stays readable.

## Needed before v0 is finalized
Recorded minimal pairs and phoneme inventory; regional pronunciation survey; phone usability testing; Unicode and font checks; a survey of Latin spellings Chittagonian speakers already use.
