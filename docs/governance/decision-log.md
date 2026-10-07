# Research Decision Log

| ID | Date | Decision | Reason |
|---|---|---|---|
| D-001 | 2026-10-07 | Lexicon folders follow four data states (raw, review, accepted, archived) | Master prompt section 53; "regional" becomes a field |
| D-002 | 2026-10-07 | 2019 starter list ingested as RAW, evidence level `unassessed` | Single-source, unrecorded, unlocalized |
| D-003 | 2026-10-07 | Variants submitted together stored in one record; original forms preserved | No silent overwriting |
| D-004 | 2026-10-07 | Disagreement on Chittagonian-Bangla intelligibility recorded, not resolved | Sources conflict |
| D-005 | 2026-10-07 | Only sources actually read are "checked" in the source register | No-fabrication policy |
| D-006 | 2026-10-07 | Everything in the repository dedicated under CC0 1.0 | Owner's decision; maximizes reuse. Requires restricted material to stay out of the repository |
| D-007 | 2026-10-07 | This scaffold is designated release 0.1.0; 1.0 is reserved for a mature, reviewed reference release | Matches the versioning plan in the master prompt |
| D-008 | 2026-10-07 | Native name "Sitainge" (owner's spelling) recorded as the language's proper name; "Chittagonian" kept as the English name; variants of both kept | Owner's statement; speaker confirmation from other localities still needed |
| D-009 | 2026-10-07 | Interview contributions: interviews run in English, elicitation before verification, chatbot never supplies Sitainge, AI submission only after the speaker's explicit yes and only as a GitHub issue | Avoid Bangla priming and leading questions; keep AI from creating evidence; no AI edits to repository files |
| D-010 | 2026-10-07 | Repository LICENSE is the official CC0 text added through GitHub; the release zip does not include a LICENSE file | Avoid overwriting the official text with a notice |
| D-011 | 2026-10-07 | Contribution web page is static, sends nothing by itself, and exports a fingerprinted file; no third-party form service by default | Privacy, offline-first, no cost or account for contributors; trade-off: contributors need a way to send a file or email |
| D-012 | 2026-10-07 | Public project contact for non-GitHub contributors: ctg@hamidyasir.com | Static page cannot receive data; email is the account-free route |
| D-013 | 2026-10-07 | Audio is optional, recorded in the browser, with its own consent (research-only / public CC0 / none); non-public audio is never stored in the repository tree | Voices can identify people and CC0 is irrevocable; the master prompt makes recordings the primary heritage object |
| D-014 | 2026-10-07 | Two registers, both official: a formal register written in IPA (court papers, news, legal and official documents) and an everyday register written in romanized, mass-adapted spelling (social media, texts, informational use). Every entry may hold both. Marked Proposed pending community and expert review | Owner's statement of the Hamidian Script proposal. Diversity of writing is accepted as long as forms stay interoperable and understood |
| D-015 | 2026-10-07 | No spelling in the everyday register is marked wrong. Only a form the speaker says is not Chittagonian is marked as such. All spellings are kept as typed | Chittagonian has no established spelling (owner, native speaker). Extends D-003 |
| D-016 | 2026-10-07 | IPA is entered only with a stated source and status (speaker-described, audio-transcribed, phonetician-verified, or AI-drafted and unverified). The AI never enters IPA as fact. IPA is not required from contributors | The owner does not read IPA; the AI cannot derive IPA from Roman spellings without guessing; the project's no-invention rule |
| D-017 | 2026-10-07 | Native-speaker session with the project owner ingested as RAW, evidence level `unassessed`, one speaker, unverified by a second speaker. Respectful or dictionary forms and everyday forms are kept as separate records, with the form noted | The owner's word list gives forms like haun, zoun, non, while their sentences use hai, zai, loi. The difference is itself data |
| D-018 | 2026-10-07 | Truncated web-form submission SIT-INT-20261007-1C10 (ends at item 80, no END line, no fingerprint) not ingested; contributor asked to resubmit the complete file | The ingest script requires the fingerprint to detect damage; a partial file cannot be checked |

## Open decisions
Editorial Board membership; Project Steward; regional reviewer recruitment; confirmation from Hamid Yasir for the 2019 materials; long-term archive and persistent-identifier service; contributor agreement text; whether the formal IPA register replaces or sits under the Hamidian Script letters (D-014); who transcribes IPA and from which recordings (D-016).
