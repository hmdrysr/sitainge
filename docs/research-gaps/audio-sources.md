# Audio and speech sources, October 8, 2026

The owner listed four speech sources and asked that any available audio be used in Dadi.

## Status

No audio could be retrieved. The synchronized Speech Corpus (Mendeley Data n9xttk45df), the Shaip catalogue, Lipi-Ghor (Hugging Face) and the Common Voice catalogue are all unreachable from the build environment, and the repository holds no audio files. Dadi therefore has nothing to play, and no pronunciation was derived.

## Recorded

Pointer records are in `sources/sources.jsonl`. None has been read.

## What is needed to use the audio

1. The Speech Corpus is licensed CC BY 4.0 per the owner's list. Download the WAV files and the transcript sheet on a computer with access, then attach a sample or the whole set.
2. Audio must be catalogued under `recordings/` with a speaker record, following `recordings/README.md`, before Dadi can play it. Dadi reads only audio that has a catalogue entry with consent.
3. Corpus audio comes from unknown speakers. Without speaker consent records, treat it as `research-only` and keep it out of the public learner site.
4. IPA from audio needs a trained transcriber or phonetician. An AI transcription is `ai-drafted-unverified` and is never evidence.
5. Lipi-Ghor transcripts are largely automatic captions and cover several dialects. Filter to Chittagonian and verify before use.
6. The Shaip data is commercial; access depends on a licence agreement.
