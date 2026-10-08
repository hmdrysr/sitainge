# siṭaiṅga dictionary (website/dictionary/)

The dictionary is a static, searchable dictionary of siṭaiṅga (Chittagonian). It uses vanilla JavaScript, needs no build step and is CC0. It reuses the Dadi scripts (`../dadi/js/`) and seed, so it must be deployed beside `dadi/`.

## How the data stays current
On load, the page shows the last saved copy (or `dadi/data/seed.json`) at once. It then reads the repository file tree from GitHub and the matching record files (`D.WANTED` in `dadi/js/data.js`), with a 6 second limit. A successful read is cached in the browser. The footer line says "Live from GitHub, updated …" or "Offline copy from …". Nothing is hard-coded, and archived records are hidden.

## How to correct an entry
Edit the record file in the repository. Each entry page has "Edit this record on GitHub" and "Suggest a correction", which is a prefilled issue naming the entry id. The page picks up the change on the next load. Evidence levels are shown as recorded; "Unassessed" means unchecked.

## Notes on accuracy
"Hear it" is a computer voice reading IPA or the spelling. No speaker recordings exist, and the page says so. Pictures are loose keyword matches and are decorative only. AI output is never evidence.
