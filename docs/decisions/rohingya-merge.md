# Decision: merge the Rohingya records into the siṭaiṅga lexicon as variety records

- **Decided by:** Hamid Yasir, project steward and native speaker of siṭaiṅga
- **Date:** 2026-10-10
- **Status:** Accepted by the steward. Implemented on branch `variants-merge-2026-10-10`.

## Decision
The Rohingya words and sentences collected in `corpus/rohingya/` (and mirrored in `website/data/rohingya-seed.json`) are added to the siṭaiṅga lexicon as variant records tagged `variety: "rohingya"`, each pointing to its original record through `variant_of` and keeping its own `source`. Nothing is deleted: the original Rohingya files stay exactly where they are, unchanged.

## Rationale (the steward's own reasoning)
1. **One language, two forms.** In the steward's judgement, siṭaiṅga and Rohingya are one language in a purer and a more mixed form. He compares them to Metropolitan French and Quebec French, where Quebec French mixed less with other languages than the metropolitan form did. The relationship is one of varieties, not of separate languages.
2. **Broad mutual intelligibility.** Speakers of the two forms largely understand one another. Wikipedia's article on the Chittagonian language (https://en.wikipedia.org/wiki/Chittagonian_language) gives supporting context: it describes Rohingya as closely related to Chittagonian. This is background, not evidence for any single word.
3. **Both are preserved.** Merging as tagged variants keeps every Rohingya form, spelling and source intact and visible, alongside the Chittagong forms, rather than forcing one to replace the other.
4. **A small evidence base stays together.** Keeping two separate lexicons would split an already small base of speakers and sources. One lexicon lets a form attested in both varieties count as attested in more independent places.
5. **The community decides the preferred forms.** Which variant is preferred is settled by the attestation rule (`EVIDENCE_POLICY.md`: a form recorded identically in three independent sources at different times becomes preferred; otherwise the most-attested form) and by community votes, which break ties and inform review. No variant is preferred by decree.

## What does not change
- Every merged record is `RAW`, evidence `unassessed`. Resemblance between a Rohingya and a Chittagong form is still not enough on its own to treat them as the same word; a reviewer decides that.
- Licences travel with the records (`licence_note`); CC BY sources keep their attribution.
- The Latin-script-only checks for Rohingya data (`scripts/rohingya_check.py`) and the rule that Bangla is never an authority stay in force.
- Nothing is deleted. The originals in `corpus/rohingya/` are kept.
