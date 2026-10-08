# siṭaiṅga Dictionary (website/dictionary/)

A static, searchable dictionary of siṭaiṅga (Chittagonian). No build step; vanilla JS; CC0. It reuses the Dadi scripts (`../dadi/js/`) and seed, so it must be deployed beside `dadi/`.

## How the data is live
On load it shows the last saved copy (or `dadi/data/seed.json`) at once, then reads the repository file tree from GitHub and the matching record files (`D.WANTED` in `dadi/js/data.js`) with a 6 second limit. A good read is cached in the browser. The footer line says "Live from GitHub, updated …" or "Offline copy from …". Nothing is hard-coded; archived records are hidden.

## How to correct an entry
Edit the record file in the repository (each entry page has "Edit this record on GitHub" and "Suggest a correction", a prefilled issue naming the entry id). The page picks the change up on the next load. Evidence levels are shown as recorded; "Unassessed" means unchecked.

## Honesty notes
"Hear it" is a computer voice reading IPA or the spelling. No speaker recordings exist, and the page says so. Pictures are loose keyword matches (decorative only). AI output is never evidence.
