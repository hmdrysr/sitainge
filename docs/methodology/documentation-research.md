# Documentation research: evidence summary

Status: draft for review, 8 October 2026. Purpose: ground the documentation plan (`documentation-plan.md`) in the language-documentation literature, and be plain about what was and was not checked.

## How to read the status column

- **V (verified)**: the bibliographic record (title, authors, year, DOI or URL) was read on the date above from Crossref, arXiv or the publisher's own page. This does not mean the full text was read. Claims in the "applies here" column are this project's reasoning from the well-known thesis of the work, not quotations.
- **P (pointer, unchecked)**: named in the research brief or known from the field, but no record was read in this session. No DOI or page number is given. Per `EVIDENCE_POLICY.md`, these belong in the source register as "pointer, unchecked" and must not be cited as support until someone checks them.
- A rate limit on the lookup service stopped verification partway through. The P rows are therefore a work list, not a judgement on the sources.

## A. Verified sources

| Principle | Citation | Status | How it applies to siṭaiṅga |
|---|---|---|---|
| Documentation is a field in its own right: a lasting, multipurpose record of a language (primary data: recordings and their annotation), distinct from description (grammar, dictionary) | Himmelmann, N. P. 1998. Documentary and descriptive linguistics. *Linguistics* 36(1): 161-195. https://doi.org/10.1515/ling.1998.36.1.161 | V | Separate the primary record (audio, consented sessions) from analysis (lexical entries, grammar notes). The repository currently mixes them: typed words and sentences sit in `lexicon/` with no recording behind them. |
| Seven portability dimensions: content, format, discovery, access, citation, preservation, rights | Bird, S. & Simons, G. 2003. Seven dimensions of portability for language documentation and description. *Language* 79(3): 557-582. https://doi.org/10.1353/lan.2003.0149 (preprint: https://arxiv.org/abs/cs/0204020) | V | The best single checklist for the repository: open formats (JSONL, WAV, plain text), stable citable IDs, discoverable metadata, explicit rights per item, and an external archive copy. Used as the audit frame in the plan. |
| Archive metadata and discovery across institutions (OLAC) | Simons, G. & Bird, S. 2003. Building an Open Language Archives Community on the OAI foundation. *Library Hi Tech* 21(2): 210-218. https://doi.org/10.1108/07378830310479848 | V | Use Dublin Core / OLAC-compatible fields and ISO 639-3 `ctg` on each deposited recording so aggregators can find it. |
| Descriptive fieldwork methods, planning, ethics, elicitation | Chelliah, S. L. & de Reuse, W. J. 2011. *Handbook of Descriptive Linguistic Fieldwork*. Springer. https://doi.org/10.1007/978-90-481-9026-3 | V (book record) | Source for elicitation workflow design and for treating the fieldworker's own role and bias as recorded metadata. Chapter-level claims need checking before being cited. |
| Language endangerment, revitalization, community-led work | Austin, P. K. & Sallabank, J. (eds) 2011. *The Cambridge Handbook of Endangered Languages*. Cambridge University Press. https://doi.org/10.1017/CBO9780511975981 | V (book record; the registry shows a different year than the print date, so confirm on the title page) | Context for community-led work. siṭaiṅga is widely spoken, so the endangerment framing is mostly not applicable; the methods chapters are. |
| Basic-vocabulary list designed for cross-linguistic comparison and borrowability | Tadmor, U., Haspelmath, M. & Taylor, B. 2012. Borrowability and the notion of basic vocabulary. In *Quantitative Approaches to Linguistic Diversity*, Benjamins. https://doi.org/10.1075/bct.46.04tad | V | Confirms the Leipzig-Jakarta list is a published, documented 100-item list. Use as a Phase 1 prompt set; do not use it to claim genealogical relationships. |
| Interlinear glossing conventions | Comrie, B., Haspelmath, M. & Bickel, B. Leipzig Glossing Rules (last change 31 May 2015). https://www.eva.mpg.de/lingua/resources/glossing-rules.php | V | Already adopted in `RESEARCH_STANDARDS.md`. Needs a project abbreviation list and a rule for glossing before a morphological analysis exists (see plan, section 8). |
| Indigenous data governance: Collective benefit, Authority to control, Responsibility, Ethics | Carroll, S. R. et al. 2020. The CARE Principles for Indigenous Data Governance. *Data Science Journal* 19: 43. https://doi.org/10.5334/dsj-2020-043 | V (DOI resolves to the journal; article text not read in this session) | siṭaiṅga is not an Indigenous-peoples case in the narrow sense, but the principles are a useful stance: speakers keep authority over their recordings (withdrawal, access tiers), and benefit returns to the community (Dadi, public lexicon). Say "informed by", not "compliant with". |

## B. Pointers, not yet checked

These are the sources the research brief asked about. Each is real as far as the author knows, but needs a bibliographic check before citation.

| Principle | Pointer | Status | How it would apply |
|---|---|---|---|
| Documentation as a primary-data record of linguistic practices | Himmelmann 2006, "Language documentation: What is it and what is it good for?" in Gippert, Himmelmann & Mosel (eds), *Essentials of Language Documentation* (Mouton de Gruyter, 2006) | P | Corpus-first design: aim for varied, spontaneous, multi-speaker recordings with metadata and translation, not only word lists. |
| Defining documentary linguistics | Woodbury 2003 (in *Language Documentation and Description* vol. 1); Woodbury 2011 (chapter in the Austin & Sallabank handbook) | P | Community role in setting goals; record who decided what. |
| Orthography development | Cahill & Rice (eds) 2014, *Developing Orthographies for Unwritten Languages* (SIL / Language Documentation & Conservation Special Publication, as understood); Eira 1998; Seifart 2006 (chapter in *Essentials of Language Documentation*) | P | Working-group steps in the plan; test candidate spellings with readers and writers before anything is called standard. |
| Typological questionnaire | Comrie & Smith 1977, "Lingua Descriptive Studies: Questionnaire", *Lingua* 42 | P | Grammar elicitation checklist, used selectively. |
| Typological database | Dryer & Haspelmath (eds), *WALS Online* (https://wals.info, Max Planck Institute) | P | Feature checklist for deciding which grammar questions to ask first. Record the project's answers as Proposed until evidence exists. |
| Rapid Word Collection | Moe, R., SIL; *Dictionary Development Process* | P | Semantic-domain elicitation in group workshops: a fast way to gather many lexical items, each still needing a recording and confirmation. |
| Lexical data models | SIL FLEx; LIFT (Lexicon Interchange FormaT); Lexical Markup Framework (ISO 24613) | P | Entry/sense/example structure and export compatibility. LIFT export is a goal, not a storage format. |
| Metadata standards | ISO 639-3 (code `ctg` for Chittagonian); Glottolog; OLAC | P | Language codes and archive discovery. Confirm the Glottolog code before use. |
| FAIR principles | Wilkinson et al. 2016, *Scientific Data* | P | Findable, Accessible, Interoperable, Reusable; overlaps with Bird and Simons. |
| Archives and consent practice | ELAR (SOAS), PARADISEC, AILLA, Kaipuleohone (University of Hawaii) | P | Models for access levels, depositor agreements and deposit packaging. Read their current forms before drafting ours. |
| Ethics statement | Linguistic Society of America, statement on ethics / language documentation | P | Locate the current text; do not cite from memory. |
| Variationist sampling and interviews | Labov (sociolinguistic interview, 1972); Tagliamonte 2006, *Analysing Sociolinguistic Variation*; Trudgill, dialect geography; Chambers & Trudgill, *Dialectology* | P | Sampling design for district-level variation (plan, section 5). |
| Phonetic documentation | Ladefoged; Himmelmann on recording practice | P | Recording standards: lossless audio, quiet room, separate microphone, wordlist plus spontaneous speech. |
| Crowd-sourced precedents | Wiktionary, Tatoeba, Mozilla Common Voice, Wikitongues, Living Dictionaries (Living Tongues Institute), Endangered Languages Project | P | Product precedents for contribution, audio capture and moderation. Learn from them; do not assume their data are reliable for siṭaiṅga. |

## C. What the evidence supports, and what it does not

**Established (from the verified rows)**
- A durable record is made of primary data with metadata, not only of analysis (Himmelmann 1998).
- Reuse over decades depends on open formats, citation, discovery, preservation and rights (Bird & Simons 2003).
- Metadata standards exist so that archives can be found together (Simons & Bird 2003).
- Glossing has an agreed convention (Leipzig rules).

**Uncertain**
- Which published guidance best fits a large, non-endangered, unstandardised language with a literate majority writing in another script. The handbook literature is mostly framed around small or endangered languages.
- How far CARE applies when the community is large and the project owner is a community member.

**Missing**
- Any check of the P rows above.
- Any field evidence about siṭaiṅga variation across Chittagong and Cox's Bazar districts. The sampling design in the plan is a hypothesis-testing design, not a statement that particular dialect boundaries exist.

**Required**
- Check each P row; move verified ones to `docs/research-gaps/source-register.md`.
- Read the current ELAR, PARADISEC and AILLA consent forms and the LSA statement before finalising the consent form.

**Open questions**
- Which archive will host the audio, and does it accept CC0 for speaker recordings or require an access-level scheme?
- Does the project want LIFT or LMF export, and from which record format?

**Future research**
- Compare the repository's actual coverage against WALS features and the Leipzig-Jakarta list once Phase 1 is complete.

## D. Evidence grading applied to these sources

The project's A to E levels grade claims about siṭaiṅga, not literature. For literature, use the existing source hierarchy: items 4 to 6 (research, peer-reviewed work, books). General method literature (item 9) never overrides siṭaiṅga evidence. A method paper can justify how the project works; it cannot justify what a word means.
