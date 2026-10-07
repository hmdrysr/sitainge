# IPA and audio in Dadi

## What the sound engine is
`js/synth.js` is a small source-filter (formant) synthesizer written for this project: a voiced pulse source and noise, three or four resonators set from vowel F1-F3 values, a nasal zero/pole pair, a frication band, and trill modulation. It renders at 22,050 Hz and can export WAV. It runs in the browser and in Node.

eSpeak NG is GPL and the repository is CC0, so it is not part of the dedication. It is shipped only as an optional, separately licensed component (D-033): `vendor/espeak-ng/` with its own NOTICE.md. Delete that folder and `js/espeak.js` to remove it. It is not used for single keyboard keys because they need predictable results; those always use `synth.js`. It can be revisited if licensing and size allow.

## Which voice plays a word
Me > Voice has a Word voice setting: **Automatic**, **Device voice**, **Clear voice** or **Dadi sound**.
- *Device voice*: the browser's own text-to-speech reads a sound-alike script made from the IPA (`native-tts.js`). The person may pick a specific installed voice. The script is only used to drive the voice and is never shown.
- *Clear voice*: eSpeak NG in WebAssembly (`espeak.js`). One download (about 18 MB), then offline. Six voice variants. Output is resampled smoothly to the device rate (Catmull-Rom).
- *Dadi sound*: `synth.js`, rendered at the device's own sample rate so the browser never resamples it.
- *Automatic*: device voice if one is suitable, then the clear voice if the person turned it on, then Dadi sound.
Single keyboard keys always use Dadi sound.

Jitter and hiss history (2026-10-08): random pitch noise, a nasal filter that kept stale state, 22.05 kHz buffers resampled by the browser, and coefficient steps every 24 samples were found and removed (coefficients now update every 2 samples; low-pass at 5.2 kHz). Nobody on the project can hear the output from the build environment, so the fix is checked with spectra and level measurements only. A native speaker's ear is the real test.

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
