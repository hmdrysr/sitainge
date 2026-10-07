# Content rules for Dadi

1. Only text a person supplied or that is already in the repository is shown as Chittagonian. No generated Chittagonian, ever.
2. English glosses are for teaching. Bangla script stays in the Rosetta layer.
3. Unverified is allowed; hidden is not. Every item shows its source state and IPA status. Words like "verified" are used only for `phonetician-verified` IPA or accepted-state entries.
4. Machine readings are labelled approximate and are not saved as facts. If a spelling has characters the reader cannot handle, Dadi says so and plays nothing for the missing part.
5. Respect consent: private, withdrawn and restricted records never appear. Contributors confirm 18+ and CC0 before sending.
6. Images and icons: original SVGs only. If you add outside art, it must be CC0 or public domain, stored in the repo (not hotlinked), with its source and licence recorded in `docs/dadi/ASSETS.md`.
7. No spelling is flagged as wrong. Variants are stored side by side.
8. Interface text: Canadian spelling, plain words, sentence case, short.

## Manual check before a release
- Open the Pages URL on a phone; install it; turn on airplane mode; the Learn tab loads and a lesson runs.
- Tap each IPA key: sound plays; "Hear it" plays the word.
- Queue an item in Teach; export by copy; paste into `scripts/ingest_interview.py` (dry run) and confirm no errors.
- Sign in with a test account; send; confirm the issue; delete it.
- Me > Download backup; open the file; confirm there is no token in it.
- Me > Restore the backup into a fresh browser profile.
