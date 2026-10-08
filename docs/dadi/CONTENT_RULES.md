# Content rules for Dadi

1. Only text that a person supplied, or that is already in the repository, is shown as Chittagonian. Generated Chittagonian is never shown.
2. English glosses are for teaching. Bangla script stays in the Rosetta layer.
3. Unverified material is allowed; hidden status is not. Every item shows its source state and IPA status. The word "verified" is used only for `phonetician-verified` IPA or accepted-state entries.
4. Machine readings are labelled approximate and are not saved as facts. If a spelling has characters that the reader cannot handle, Dadi says so and plays nothing for the missing part.
5. Consent is respected: private, withdrawn and restricted records never appear. Contributors confirm that they are 18 or older and accept CC0 before sending.
6. Images and icons: one monochrome icon family only (Tabler Icons, outline, MIT; see `docs/dadi/icon-coverage.md`). No decorative illustration, mascot, gradient art or colour pictograms. A concept picture appears only when the icon index has a strict match; otherwise the entry shows no picture. Photographs come only from Wikimedia Commons under the licences in `docs/contribute/moderators.md`, with credit.
7. No spelling is flagged as wrong. Variants are stored side by side.
8. Interface text uses Canadian spelling, plain words, sentence case and short sentences.

## Manual check before a release
- Open the Pages URL on a phone and install it. Turn on airplane mode. The Learn tab should load and a lesson should run.
- Tap each IPA key. The sound should play, and "Hear it" should play the word.
- Queue an item in Teach and export it by copy. Paste it into `scripts/ingest_interview.py` (dry run) and confirm that there are no errors.
- Sign in with a test account, send an item, confirm that the issue appears, and delete it.
- Me > Download backup. Open the file and confirm that it contains no token.
- Me > Restore the backup into a fresh browser profile.
