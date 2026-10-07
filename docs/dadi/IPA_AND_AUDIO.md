# IPA and audio in Dadi

## What the sound engine is
`js/synth.js` is a small source-filter (formant) synthesizer written for this project: a voiced pulse source and noise, three or four resonators set from vowel F1-F3 values, a nasal zero/pole pair, a frication band, and trill modulation. It renders at 22,050 Hz and can export WAV. It runs in the browser and in Node.

Why not eSpeak-NG: it is GPL (the repository is CC0), it is large to ship, and it cannot be tapped per symbol with predictable results. The choice is recorded as D-021. It can be revisited if licensing and size allow.

## Honest limits
- It is a teaching aid, not a native voice. It sounds synthetic.
- Vowels are modelled from published average formant values, not from Chittagonian speakers.
- Implosives, clicks, ejectives, tones and some others are approximated by a nearby sound (`APPROX`). The keyboard says so when a key is approximated.
- Nobody has listened to it with a Chittagonian ear yet. Treat all output as unreviewed.

## Keyboard
Layout: QWERTY rows; tapping a Roman letter shows its IPA family (e.g. t: t ʈ ʔ θ...). Each tap plays the sound. If the word has a symbol the speaker is unsure about, "Not quite? Try instead of X" lists neighbours (same manner, place or voicing) and plays the whole word with each swap so the speaker can choose by ear. Modifiers: length ː, aspiration ʰ ʱ, nasal ◌̃, stress ˈ, syllable break, palatalized ʲ, labialized ʷ.
Result: `ipa` text with status `speaker-chosen-by-ear` if the person picked by ear, `speaker-described` if they described it, `ai-drafted-unverified` if it came from "Suggest from my spelling".

## Adding a symbol or sound
Edit `ipa-data.js` (`VOWELS` or `CONSONANTS`), add its row to `ROWS`/`FAMILIES`, run `node scripts/tests/dadi_unit_test.js` (it checks every symbol renders finite, non-clipping audio). Measure real recordings before changing numbers; do not tune by feel alone.

## Recordings (planned)
Real clips beat synthesis. Use the existing audio consent and catalogue in `audio/`. When a recording exists for an entry, `audio.js` should play it first. Never ship a clip without its consent record.
