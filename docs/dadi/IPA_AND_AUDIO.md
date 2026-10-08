# IPA and audio in Dadi

Lessons make no sound of their own (D-050). A lesson shows a listen button only when a public recording exists. Outside lessons (IPA keyboard and chart, translator, word sheets, dictionary) Dadi offers sound-alike text-to-speech (D-057), which is an approximation and not a pronunciation guide. No machine voice can say siṭaiṅga correctly.

## IPA

The IPA keyboard and chart help contributors write a pronunciation. They show symbol names and neighbouring sounds. Typed IPA is recorded with its source, for example `speaker-chosen-by-ear`, and is never evidence by itself.

## Recordings

An entry plays sound only when both conditions hold:

1. Its `recording` field is an https address of an audio file, or a path inside the repository such as `audio/public/CTG-REC-00001.mp3`. Supported types are mp3, wav, ogg, opus, m4a, aac, flac and webm.
2. Its `consent` is `public`.

When both hold, the word sheet and the lesson screens show a Listen button, and the word sheet adds a Slower button. When either fails, no sound control is drawn.

Audio files stay out of Git by default (`schemas/recording.schema.json`), so a recording normally lives at a hosted address. Register the file in `recordings/`, record the speaker and consent in `speakers/` and `sessions/`, then set `recording` on the lexicon entry. Follow `docs/protocols/recording-checklist.md`.

## Not yet done

- No recording exists, so the Listen button has not been tested against a real file.
