# Hamidian Script v0 (working specification)

Status: **Proposed.** No letter-to-sound mapping is fixed. A mapping requires Chittagonian phonological evidence, which has not yet been gathered.

## Principles
- Pronunciation is fixed; spelling is flexible in the everyday register. The formal register is written in IPA.
- Write naturally, preserve the pronunciation, and avoid confusion.
- No single spelling is mandatory. All variants with the same pronunciation and meaning, and no serious ambiguity, are accepted. A reference form exists for indexing only.
- A contributor's original spelling is never silently overwritten. The record stores the original form, variant, pronunciation, reference form and meaning.

## Two registers (proposed October 7, 2026, decision D-014)

The Hamidian Script proposal has two registers. Both are official. Diversity of writing is accepted as long as forms remain interoperable and the wider community understands them.

| Register | Use | Written as | Spelling |
|---|---|---|---|
| Formal | Court papers, news, legal and official documents | IPA | Fixed by pronunciation |
| Everyday | Social media, texts, informational use | Romanized, mass-adapted | Not fixed; every spelling accepted |

- Every lexical entry can hold both forms. Everyday spellings are stored as typed (see D-003, D-015). The IPA form is the formal reference, and several everyday spellings can point to one IPA form.
- **IPA needs a source.** Contributors are not asked for IPA. It comes from recordings transcribed by a trained person, or from sound descriptions given by a speaker. The status of each IPA form is recorded in `ipa_status` (see `schemas/lexical_entry.schema.json`). An AI may draft IPA only as `ai-drafted-unverified` and may not enter it as fact (D-016).
- **Not yet decided:** whether the formal register replaces the Latin letters of the Core and Precision layers below, or sits beside them with a mapping. The letter-to-sound mapping stays unfixed until phonological evidence exists. Whether the IPA is broad (phonemic) or narrow (phonetic) is also undecided.

## Design constraints
The script must work with ordinary Latin keyboards and mobile typing. It must be readable, searchable and Unicode-based (NFC). It uses minimal diacritics, which are optional wherever omission creates no real ambiguity. It is not a copy of Turkish, English or any other orthography.

## Proposed v0 structure
- **Core layer:** basic Latin letters only. Everything must be writable and searchable with this layer alone.
- **Precision layer (optional):** diacritics for contrasts that the evidence shows matter. Which contrasts qualify is **Unknown** until the phonology is documented.
- **2019 draft symbols** (ç, ğ, ı, ş, ö, ü and accented vowels): kept as proposals, sourced to the 2019 draft, to be tested against evidence and keyboard cost.
- **Search normalization:** a documented fold from precision-layer forms to core-layer forms, so that users who skip accents still find entries.

## Change process
A proposal must give its linguistic justification, speaker evidence, examples, usability analysis, digital compatibility, alternatives considered and expected consequences. The decision goes in the orthographic decision log. No individual can alter the alphabet unilaterally.

## Stability
After a mature release, a versioned core (Hamidian Script 1.0) is frozen. New evidence is recorded as variants, and changes become versions 1.1, 2.0 and so on. Older material stays readable.

## Needed before v0 is finalized
- Recorded minimal pairs and a phoneme inventory
- A regional pronunciation survey
- Phone usability testing
- Unicode and font checks
- A survey of the Latin spellings that Chittagonian speakers already use
