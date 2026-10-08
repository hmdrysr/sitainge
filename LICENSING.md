# Licensing

**Decision (D-006, 2026-10-07): everything published in this repository is dedicated to the public domain under CC0 1.0 Universal.** Software, documentation, schemas, templates, lexical data, corpus text, and any recordings or images that their rights holders choose to deposit here.

Full legal text: https://creativecommons.org/publicdomain/zero/1.0/legalcode

## What CC0 means here
- Anyone may copy, change, redistribute and use the material, including commercially and including for AI training, without asking and without attribution.
- **It is irrevocable in practice.** Once data is public under CC0, it cannot be taken back. Withdrawal can stop future publication and remove material from this repository's current version, but copies already made remain free to use.
- CC0 cannot require credit. The project asks users to cite the release (see `CITATION.cff`) as a norm, not a legal condition. Contributor credit inside the project (name, contributor ID, anonymous) still works.

## What CC0 does not cover
1. **Third-party material.** Text the project does not own and has not been given the right to dedicate, such as quotations from published works or the English source text of the UDHR, stays under its own terms. Such items are labelled in their records.
2. **Rights that cannot be waived.** Privacy, personality and moral rights, and cultural or community sensitivities. Dedicating copyright does not make it ethical to publish a person's identity or a restricted tradition.
3. **Anything a contributor does not have the right to dedicate.**

## Consequence for recordings, speakers and sensitive material
Because CC0 is permanent, only material that its owner and speaker are content to make permanently public belongs in this repository.
- Speaker identity stays out. Use speaker IDs only; private metadata is held elsewhere.
- Recordings with consent status research-only, restricted, private, withdrawn or permission pending are **not** deposited here. They stay in the independent long-term archive under that archive's terms. Those terms are separate from this repository's licence.
- A contributor who is unsure should choose "discuss first" on the submission form, and nothing will be published.

## Third-party software shipped with the site
`website/dadi/vendor/espeak-ng/` is eSpeak NG (GPL-3.0-or-later), compiled to WebAssembly, with its licence and notice beside it. It is an optional voice, separate from the CC0 material, and can be removed by deleting that folder and `website/dadi/js/espeak.js` (D-033). `website/dadi/js/fsrs.umd.js` is ts-fsrs (MIT). Map outlines come from geoBoundaries and OCHA ROAP (CC BY 3.0 IGO), credited on the landing page. Photos are Wikimedia Commons files under their own licences, hotlinked and credited, not copied into the repository.

## Contributor dedication
By submitting a contribution through the public forms, the contributor confirms that they wrote or recorded it (or have the right to share it) and dedicate it to the public domain under CC0 1.0. This replaces the earlier plan for per-material licences. A plain-language contributor agreement must still be drafted (what is submitted, how it may be used, withdrawal limits, archival preservation, AI use).

## Open items
- Confirm that Hamid Yasir, author of the 2019 materials, agrees to dedicate them under CC0 (see decision log).
- `LICENSE`: the repository's official CC0 text (added through GitHub) stays as is; do not overwrite it.
- Decide whether the long-term archive deposits also use CC0 or its own terms.

## Third-party material added on 2026-10-08
| Material | Where | Licence |
|---|---|---|
| Fluent Emoji Flat pictures (Microsoft) | `website/dadi/data/icons.json` | MIT |
| emojibase-data (word index from Unicode CLDR) | same | MIT |
| Lucide icons (UI) | `website/dadi/index.html` | ISC |
| geoBoundaries gbOpen Bangladesh ADM2-4 | `website/data/map-admin.json` | CC BY 3.0 IGO (credit shown on the map) |
| nuhil/bangladesh-geocode, aiFdn/Postcodes-of-Bangladesh | `website/data/admin.json` | MIT |
| Facts from Wikipedia | `website/data/*.json` | CC BY-SA 4.0 (facts only, each source linked) |
| eSpeak NG (optional) | `website/dadi/vendor/espeak-ng/` | GPL-3.0-or-later, separate from the CC0 dedication |
