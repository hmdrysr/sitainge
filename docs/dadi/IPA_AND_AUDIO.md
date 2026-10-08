# IPA and audio in Dadi

## The sound engine
`js/synth.js` is a small source-filter (formant) synthesizer written for this project. It combines a voiced pulse source and noise, three or four resonators set from vowel F1-F3 values, a nasal zero/pole pair, a frication band and trill modulation. It renders at 22,050 Hz, can export WAV, and runs in the browser and in Node.

eSpeak NG is GPL-licensed and the repository is CC0, so eSpeak NG is not part of the dedication. It is shipped only as an optional, separately licensed component (D-033): `vendor/espeak-ng/`, with its own NOTICE.md. Deleting that folder and `js/espeak.js` removes it. It is not used for single keyboard keys, because those need predictable results and always use `synth.js`. The decision can be revisited if licensing and size allow.

## Which voice plays a word
Me > Voice has a Word voice setting with four options: **Automatic**, **Device voice**, **Clear voice** and **Dadi sound**.
- *Device voice*: the browser's own text-to-speech reads a sound-alike script made from the IPA (`native-tts.js`). The user may pick a specific installed voice. The script only drives the voice and is never shown.
- *Clear voice*: eSpeak NG in WebAssembly (`espeak.js`). It requires one download (about 18 MB) and then works offline. It has six voice variants. Output is resampled smoothly to the device rate (Catmull-Rom).
- *Dadi sound*: `synth.js`, rendered at the device's own sample rate so that the browser never resamples it.
- *Automatic*: the device voice if one is suitable, then the clear voice if the user has turned it on, then Dadi sound.

Single keyboard keys always use Dadi sound.

Jitter and hiss history (October 8, 2026): the following faults were found and removed: random pitch noise, a nasal filter that kept stale state, 22.05 kHz buffers resampled by the browser, and coefficient steps every 24 samples. Coefficients now update every 2 samples, and a low-pass filter is set at 5.2 kHz. Nobody on the project can hear the output from the build environment, so the fix was checked only with spectra and level measurements. A native speaker's ear is the real test.

## Limits
- The engine is a teaching aid, not a native voice, and it sounds synthetic.
- Vowels are modelled from published average formant values, not from Chittagonian speakers.
- Implosives, clicks, ejectives, tones and some other sounds are approximated by a nearby sound (`APPROX`). The keyboard says so when a key is approximated.
- No one with a Chittagonian ear has listened to the output yet. All output should be treated as unreviewed.

## Keyboard
The layout follows QWERTY rows. Tapping a Roman letter shows its IPA family (for example, t: t ʈ ʔ θ...). Each tap plays the sound. If the word has a symbol that the speaker is unsure about, "Not quite? Try instead of X" lists neighbouring symbols (same manner, place or voicing) and plays the whole word with each swap, so that the speaker can choose by ear. Modifiers are length ː, aspiration ʰ ʱ, nasal ◌̃, stress ˈ, syllable break, palatalized ʲ and labialized ʷ.
The result is `ipa` text with the status `speaker-chosen-by-ear` if the person chose by ear, `speaker-described` if the person described the sound, or `ai-drafted-unverified` if it came from "Suggest from my spelling".

## Adding a symbol or sound
Edit `ipa-data.js` (`VOWELS` or `CONSONANTS`), add the symbol's row to `ROWS`/`FAMILIES`, and run `node scripts/tests/dadi_unit_test.js`, which checks that every symbol renders finite, non-clipping audio. Measure real recordings before changing numbers; do not tune by feel alone.

## Recordings (planned)
Real clips are better than synthesis. Use the existing audio consent and catalogue in `audio/`. When a recording exists for an entry, `audio.js` should play it first. A clip is never shipped without its consent record.
