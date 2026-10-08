# Dadi design notes

Why Dadi looks and behaves the way it does, so changes stay consistent.

## Principles (from established, well-regarded app design)
Sources: Apple Human Interface Guidelines (navigation and tab bars, lists, typography, layout, sheets), the Material Design 3 guidelines (touch targets, adaptive layout), the WCAG 2.2 success criteria (target size, contrast, reflow), and the plain, content-first approach of Apple's Podcasts and Books apps.

1. **Content first.** The page title is large and the interface recedes. No decoration that does not carry meaning.
2. **Few, stable destinations.** Five bottom tabs, each a noun for one job: Learn, Words, Write, Teach, Me. (Apple recommends three to five.) Anything else lives inside one of them.
3. **Group by task, not by system.** Learn holds lessons and videos. Write holds the keyboard and the translator. Me holds everything about the person and the device (voice, appearance, AI, data, help).
4. **One primary action per screen**, drawn as a filled capsule. Secondary actions are tinted. Destructive actions are plain red text, never the biggest button.
5. **Lists are grouped and inset** with hairline separators. Settings use the same pattern everywhere (label on the left, value on the right, chevron if it opens something).
6. **Shelves for browsing.** Lessons and videos scroll sideways in cards, as in Podcasts. Lists are for things you scan.
7. **Sheets for secondary tasks.** They rise from the bottom with a grabber, one at a time, and never hold another sheet.
8. **Focus mode for lessons.** The tab bar disappears and a close button and progress bar remain.
9. **Plain words.** Sentence case. Buttons say what happens. Errors say what to do.

## Numbers
- Spacing steps: 4, 8, 12, 16, 24, 32. Side margin 16 (12 below 360 px).
- Touch targets at least 44 px. Row height at least 52 px.
- Type: title 34, section 22, body 17, secondary 15, caption 13, tab label 11. Titles shrink to 30 below 360 px.
- Radii: controls 12, cards 16, hero card 20, sheets 20.
- Breakpoints: below 360 (tight), 360 to 839 (phone), 840 and up (tablet or desktop: the tab bar floats and sheets centre).
- Content never exceeds 680 px wide; the keyboard never exceeds 560 px.
- Colour: one accent colour at a time (five schemes), system light and dark. Glass (blur) only on the tab bar.

## The keyboard
Same shape as the keyboards people already know, so nothing about it is surprising:
- Ten equal columns and five rows at every width: letters, letters inset by half a key, clear + seven letters + delete, eight sound-modifier keys, space + Hear.
- Each key is a full-width cell with a smaller visible cap, so the touch area is larger than what you see and adjacent taps never miss.
- Heights come from `clamp()` on width and height, so the keyboard keeps its proportions from 320 px phones to desktop and in landscape.
- A strip above the keys offers close neighbours of the last sound. Tapping one replaces it, so people try sounds until one matches their voice.
- A popup shows the key under the finger. Every sound key says its sound.
- Single key sounds always use Dadi's own synthesizer (instant, consistent). Whole words use the voice chosen in Me > Voice.

## Voices
Three engines, one choice in Me > Voice (Automatic, Device voice, Clear voice, Dadi sound):
1. The device's own text-to-speech, reading a sound-alike script. Usually the smoothest.
2. A clear offline voice (eSpeak NG compiled to WebAssembly, downloaded once, about 18 MB).
3. Dadi's built-in synthesizer, rendered at the device's own sample rate so the browser never resamples it.
All three are approximations until real recordings exist. No online speech service is used: free public text-to-speech services do not offer a siṭaiṅga voice, require sign-ups or keys, or send what people type to a third party.

## Update 2026-10-08: learning journey and restyle
- **Learn** now follows `LEARNING_DESIGN.md`: units from `website/data/themes.json` (hand-set `frequency_rank`, not a corpus count), a session builder (reviews due first, at most 5 new items, new items paused above 25 due), lesson steps (preview, meaning match, picture match or gloss-to-form, tap-to-build or typing, delayed retrieval, interleaved review), tolerant answer matching in `js/learn.js`, and the feedback wording of section 5. There are no streaks, points, hearts or timers.
- **Progress** (Learn, then Progress and history; also Me) shows counts, a weekly recall figure, a strength estimate per unit, the verification mix and session history. Notes ("This differs in my family") and suggested spellings are stored locally, exported from Me, and included in backups.
- **Storage** is additive: `state.learn` is added to older saved states on load; the review log is a separate append-only key included in export; import merges.
- **Look**: flat surfaces, one accent, no gradients, mascot or illustrations. Tab bar icons carry text labels; list rows use Tabler icons; concept pictures appear only for strict icon matches. Device audio is labelled "Device voice (may be inaccurate)" and is off in lessons by default.
- **Not built yet** (no data or recordings): listening and ear-training exercises, per-unit Watch slot, example-sentence input step, noticing question, odd one out, speed round, read-aloud check.
