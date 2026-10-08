# Voting and consensus

Status: draft, October 8, 2026. The thresholds below are starting values chosen by the project and recorded in `schemas/consensus_rules.json`; they can be changed there. Decisions D-055 and D-056 in `docs/governance/decision-log.md` record the reasons.

## What this document covers

People who speak siṭaiṅga often write the same word in several ways and sometimes disagree about whether a word is used at all. This document describes two ways of seeing where agreement lies:

1. **Community voting.** Signed-in people say that they agree or disagree with an entry, or choose a spelling.
2. **Automatic reasoning.** A script notices that several independent sources already give a similar word for the same meaning.

Both produce labels. Neither produces evidence, and neither changes an entry's evidence level or state.

## Four labels that are kept apart

| Label | Who or what sets it | Where it is recorded | What it means |
|---|---|---|---|
| Verified | A speaker or a phonetician checked the entry | The entry's `verification` and `ipa_status` fields, set by people (`docs/protocols/verification-session.md`) | A person with the right knowledge looked at this entry. Dadi shows "Checked by one speaker" or "Community verified" for this. This feature does not touch it. |
| Endorsed | A reviewer | The entry's `provenance.reviewer`, `review_date` and `decision_history`, and its move from RAW to REVIEW or ACCEPTED | A reviewer made a recorded decision in the repository's review process. |
| Auto-confirmed by consensus | A script (`scripts/consensus.py`) | `website/data/consensus.json` only | Records from at least two independent source groups give the same meaning and a similar form. It is a machine rule. It is not verification and it is not endorsement. |
| Community consensus | A tally of votes (`scripts/consensus.py`) | `website/data/consensus.json` only | Enough distinct GitHub accounts have voted, and a large share agree. It is not verification and it is not endorsement. |

A note on the word "endorsed". `GOVERNANCE.md` does not use that word. Its terms are community review, linguistic review and editorial decision, and the data states RAW, REVIEW, ACCEPTED and ARCHIVED. In this document "endorsed" is shorthand for a reviewer's recorded decision in that process, whether an evidence level was assigned in REVIEW or the editorial decision to ACCEPT an entry. A reviewer name and a decision-history line are what make an entry endorsed. Consensus never creates either.

Consensus status is also separate from the evidence levels A to E. An entry can be auto-confirmed and still be `unassessed`. An entry with a strong community vote can still sit in RAW. See `EVIDENCE_POLICY.md`.

## How voting works for users

In Dadi, a person who is signed in with GitHub can, on any entry:

- tap **Agree** or **Disagree**, meaning that this is how they know the word, or that it is not;
- choose the spelling they use, or type another one, and optionally add a region note such as north, south, city or rural.

Dadi sends each vote as a GitHub issue titled `[Vote] <entry id>` with a short JSON block in the body. A scheduled or manually started task (`ingest-votes` in the Dadi tools workflow) checks each issue with `scripts/ingest_votes.py`, appends a line to `votes/votes.jsonl`, comments on the issue and closes it. Then the `consensus` task recomputes the labels.

The rules for counting:

- **One account, one vote.** The voter is always the GitHub account that opened the issue. A name written inside the issue is ignored. Accounts whose login ends in `[bot]` are ignored.
- **One vote per entry and kind.** The kinds are agree, disagree and spelling. A later vote from the same account replaces the earlier one.
- **Changing your mind counts once.** If an account first agrees and later disagrees, only the later vote counts.
- **Votes without an identity are ignored.** A row with no voter, or with a voter that is not a GitHub account, is not counted. The reason is simple: without an identity, one person could cast any number of votes. Using GitHub accounts as the identity gives each person one vote and lets a reviewer trace and exclude an abusive account.
- **Logins are public.** The login is stored in `votes/votes.jsonl` in plain text. Speaker records elsewhere in the repository use hashed ids, and this is a deliberate exception: a vote is only meaningful if it can be traced to an account. The voting screen should say so before sending.

## Thresholds

| Result | Rule (defaults) |
|---|---|
| Collecting | Fewer than 5 distinct voters, or 5 or more voters with agreement between 60% and 80% |
| Community consensus | At least 5 distinct voters and at least 80% agreement |
| Contested | At least 5 distinct voters and agreement of 60% or less |
| Preferred spelling | At least 5 spelling votes, and the top spelling has at least 60% of them |
| Auto-confirmed | At least 2 independent source groups agree on the item |

Agreement is agree votes divided by agree plus disagree votes. A spelling can be preferred whether or not the entry itself has reached community consensus. A contested entry stays visible, together with the competing spellings, as `GOVERNANCE.md` requires for disputed forms.

## Automatic reasoning and its limits

The script groups records that denote the same item. Two records belong together when:

- their English glosses are the same after lowercasing, removing punctuation, removing bracketed context and removing a leading *to*, *a*, *an* or *the*; and
- some spelling of one is identical or similar to some spelling of the other, after lowercasing, removing diacritics and collapsing doubled letters. "Similar" means a normalised edit-distance similarity of at least 0.85, and only for forms of at least three letters; shorter forms must be identical. Forms of fewer than two letters are never matched.

Sentences, and any record described as a sentence, are matched exactly only. Every record in a group must match every other record in it; chains of near-matches are split.

A group of records is auto-confirmed when they come from at least two **independence groups**. Records from the same group count once, however many there are.

An independence group is a set of sources that are not independent of each other. `schemas/consensus_rules.json` lists every source id with its group and a note on each choice. The main rules used so far:

- Compiled copies of one upstream dataset share a group. Vashantor, ONUBAD, BD-Dialect, ChatgaiyyaAlap and the ChatgaiyyaBench sources all came through one compiled benchmark.
- Pages from one website, or a website and its mirrors, share a group.
- Two sources that print identical text (for example the same Universal Declaration sample) share a group, because identical text points to copying.
- A single person's statements and sessions share a group, since one speaker cannot confirm themselves.
- Everything else is its own group.

These limits matter:

- Independence is judged from source metadata. It can be wrong. Two sources judged independent may both have copied a third. A steward should correct the groups when this is found, and rerunning the script updates every label.
- A match shows that sources agree with each other. It does not show that they are right, or that anyone has heard the word spoken.
- Normalisation ignores differences that can matter, so two different words may be matched. Forms in different scripts are never matched.
- The label is only as good as the glosses. A loose English gloss can produce a match between different words.
- Auto-confirmation does not make an entry verified, endorsed or accepted, and it does not alter the evidence level.

## Abuse resistance

- **Sockpuppets.** Many accounts controlled by one person are the main risk. Using GitHub accounts adds friction but does not remove the risk. The thresholds need five distinct accounts, and reviewers can look at account age and activity before relying on a result.
- **Brigading.** A burst of votes from outside the community can swing an entry. Reviewers may exclude a vote, or all votes from an account, with a recorded reason. An exclusion is a new line in `votes/exclusions.jsonl` (`vote_id` or `voter`, `reason`, `by`, `date`). Votes are never edited or deleted, so every exclusion can be audited and reversed.
- **No promotion.** Votes and consensus never move an entry to ACCEPTED, never assign an evidence level and never alter `ipa_status`. Those steps stay with reviewers, which is why a captured vote cannot change what the project asserts as established. The rule in `EVIDENCE_POLICY.md` that stars, likes and majority clicks are not evidence still applies. Votes record who recognizes a form; they do not decide what is correct.
- **Regional protection.** A form that is rare in one area may be common in another. Dadi records an optional region note with each vote so that the tally can be read by area, and a minority form is never marked wrong.

## Appeals

Anyone who thinks a label is wrong can open a GitHub issue titled `[Appeal] <entry id>` and say why. Cases include a vote cast by a bot or a duplicate account, a wrongly grouped source, and a false match between two different words. A reviewer reads the appeal, and decides. If the decision changes a source group, the change goes into `schemas/consensus_rules.json`. If it excludes votes, it goes into `votes/exclusions.jsonl`, with the reason. Either way the reason is recorded in a pull request or issue comment, and the reviewer is named. Until the Editorial Board and the Project Steward are appointed (open decisions in `GOVERNANCE.md`), the repository owner acts as reviewer. A reviewer who has a conflict of interest, for example a vote of their own, recuses themselves.

## Files and commands

| Path | Purpose |
|---|---|
| `votes/votes.jsonl` | All counted-or-ignored votes, one line each, append only |
| `votes/exclusions.jsonl` | Reviewer exclusions with reasons (created when first needed) |
| `schemas/vote.schema.json`, `schemas/vote_exclusion.schema.json` | Row formats |
| `schemas/consensus_rules.json` | Thresholds and independence groups |
| `scripts/ingest_votes.py` | Turns vote issues into rows |
| `scripts/consensus.py` | Computes the labels; `--check` verifies the committed output |
| `website/data/consensus.json` | What Dadi and the site read |
| `reports/consensus-report.md` | Counts, thresholds, largest clusters and caveats |

Run `python3 scripts/consensus.py` from the repository root to recompute, and `python3 scripts/tests/test_consensus.py` to run the tests.

## What has not been verified

The thresholds are untested defaults. No real votes exist yet. The independence groups were set by reading source descriptions, not the underlying datasets. No speaker has reviewed any cluster that the script produced.
