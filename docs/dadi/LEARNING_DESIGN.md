# Dadi learning design

Status: specification, 2026-10-08. Evidence references (E#) point to rows in `docs/methodology/teaching-research.md`. Items marked **[judgement]** are our decisions without direct evidence; they should be tested, not trusted.

Dadi teaches siṭaiṅga (English name: Chittagonian), a low-resource, unstandardized language. The app is free, offline-first and mobile-first. Today there are about 200 unverified entries, no recordings, and only device text-to-speech.

## 1. Learners and goals

- **Heritage learners** (diaspora youth and adults who understand some): strong in listening, weak in reading, writing and confident speech (E21, E22).
- **Curious outsiders**: begin from zero.
- **Goal of the first release:** recognize and produce a few hundred high-frequency words and set phrases, with accurate meaning, and take the learner toward a real speaker. It does not claim fluency.
- **Placement** (optional, one screen): "I understand some", "I am starting from zero". Heritage route skips the preview step for items answered correctly in a 20-item check, and gives more reading and typing. No other profiling.

## 2. Learner path

Four stages, unlocked by mastery, never by calendar. Learners may open any theme (autonomy, E23); the app only recommends.

| Stage | Aim | Content (by `level` field) | Strand (E1) |
|---|---|---|---|
| 1 Hear and recognize | Meaning of the most frequent concrete words | level-1 nouns and set phrases (greetings, family, food, body, home) | input, language-focused |
| 2 Recall | Produce words from meaning | same items plus level-2 | output, language-focused |
| 3 Use | Short phrases in context, simple tasks | level-2 phrases, kind = phrase | output, fluency |
| 4 Extend | Wider vocabulary, variation, reading | level-3, regional variants | all four |

- **Unit sequencing:** a unit is one theme of 8 to 12 entries. Within a theme, order by frequency, then concreteness (concrete first, E2, E18). Until `level` is populated reliably, use a hand-set frequency rank and record it.
- **Session budget** **[judgement]**: 8 to 10 minutes. Maximum **5 new items per session**; hard cap 7. Reviews due are shown before new items; if more than 25 reviews are due, new items are paused that day.
- **Unit gate:** a unit is "done" when 80 percent of its items have been recalled correctly in at least two sessions on different days (E5, E6).

## 3. Lesson flow

Every new item passes through these steps in one session, then returns on later days via the scheduler.

1. **Preview** (about 20 s per item). Show picture (if concrete) plus `form` plus `gloss`. Play device audio only if the audio label passes (section 6). Show `ipa` behind a tap. One item at a time (E17, E18).
2. **Input.** Short meaningful exposure: the item inside an existing entry's example or a placeholder-free picture scene. Learner taps to hear/see; no test yet (E1).
3. **Noticing prompt.** One question per item or pair: "What do you notice about how this is written or said?" Options come from the entry's `spellings`, `ipa`, or a flagged sound note. Never ask it where there is nothing real to notice (E11).
4. **Retrieval attempts.** Two or three attempts, expanding in difficulty: recognition (pick the meaning), then cued recall from the picture or meaning (E3, E4). Attempt before feedback is shown.
5. **Production.** Type the `form`, or tap-to-build from letter or chunk tiles. Typing is the default for heritage learners; tap-to-build is the default for beginners and for small screens. Accept every attested spelling (section 5).
6. **Feedback** (section 5).
7. **Delayed retrieval within the session.** After about 3 to 5 minutes of other items, test each new item again, with no help. This is the first scheduled review (E5).
8. **Interleaved review.** Last third of the session mixes due items from older units, shuffled across themes, not grouped (E9, E10).
9. **Close.** Show what was practised, with an honest tally (section 11). No celebration animation longer than one second.

## 4. Exercise types, in the order introduced

| Order | Type | Used when | Notes |
|---|---|---|---|
| 1 | Look and listen (preview card) | first meeting | no scoring |
| 2 | Meaning match (form to gloss, 3 options) | first retrieval | distractors from the same theme, never from unverified items marked "disputed" |
| 3 | Picture match | concrete nouns | picture must be unambiguous |
| 4 | Gloss to form, choose from 4 | after one correct meaning match | distractors share first letter or length |
| 5 | Tap-to-build | beginners, first production | tiles include 2 decoys |
| 6 | Type the form | after two correct builds, or heritage route | tolerant matching (section 5) |
| 7 | Odd one out (theme) | stage 2 onward | trains category induction (E9) |
| 8 | Phrase builder (reorder chunks) | stage 3, kind = phrase | only with phrases that exist as entries |
| 9 | Read-aloud self-check | stage 3+, optional | learner records themselves locally and compares with the written form; nothing is uploaded; no scoring |
| 10 | Speed round (known items, 20 s) | fluency, stage 3+ | known items only, never new ones (E1) |

Listening exercises (hear then pick meaning) are held until real recordings exist (section 6).

## 5. Feedback wording

- First wrong answer: "Not quite. Try again." Allow one retry, with a hint (first letter or a picture reveal) (E14).
- Second wrong answer: show the correct form and gloss, then "We will bring this back soon."
- Correct: "Correct." Optionally one line of information, never praise inflation.
- Spelling mismatch that matches another attested spelling: "Also correct. This word has more than one written form." Show both, drawn from `spellings`.
- Spelling mismatch not attested: "That form is not in our list. It may be a valid spelling we do not have yet." Mark as not correct for scheduling, but offer "Suggest this spelling" (stored locally, exportable).
- Never use: "Wrong", "Failed", "You lost", red full-screen flashes, hearts or lives, loss of points.
- Feedback is textual and specific; effects of feedback on production are strongest when the learner is pushed to self-correct first (E14, E15).

## 6. Sound training

**Current state: audio is device text-to-speech only. Text-to-speech built for other languages can be systematically wrong for siṭaiṅga.** Therefore:

1. Do not label device audio "pronunciation". Label it "Device voice (may be inaccurate)". Default off for siṭaiṅga items; learner can switch on.
2. Prefer showing `ipa` (with an unverified marker where the entry is unverified) over audio.
3. **Minimal-pair / ear training and high-variability training (E19, E20)** need several real speakers. Do not build them until at least 3 contributors, with a mix of ages and sexes where possible, have recorded contrast words with consent. Until then, the feature is hidden, not faked.
4. When recordings exist: store speaker id per clip; each trial draws a random speaker; 8 to 10 pairs per set; immediate feedback; revisit contrasts across sessions. Only use contrasts that exist in entries; any new pair is proposed as `<word A> / <word B>` for a human to confirm.
5. Recording is optional for the learner and stays on-device.

## 7. Where videos fit

- Videos supply real language in context (E1 input strand). Use them only if they are community-made, with a licence, a named speaker and a transcript in `spellings`.
- Place a video in stage 1 as a "Watch" item at the start of a unit, before preview (listening first), then again at the end as a check ("How many words did you recognize?").
- Always offline-capable: ship low-bitrate and a text-only fallback. No autoplay. Captions off by default for heritage learners, on for beginners.
- Until verified videos exist, the Watch slot does not appear.

## 8. Scheduling: FSRS settings

Use the open FSRS scheduler (E27), not the older fixed-interval SM-2 family, for per-item memory modelling. Reason: FSRS models stability and retrievability per item and fits observed behaviour; I did not find an independent head-to-head in this pass, so verify on our own data (section 12).

| Setting | Value | Rationale |
|---|---|---|
| Desired retention | 0.90 | Standard default; lower (0.85) reduces workload but a small deck has few reviews to spare **[judgement]**. |
| Parameters | FSRS default weights; no per-user optimisation until at least 1,000 stored reviews | Fitting on little data overfits. |
| Learning steps (within session) | 1 min, then 10 min | Delayed retrieval in step 7 of the lesson. |
| Maximum interval | 180 days | Keeps long-unseen items from vanishing; appropriate for a growing deck. |
| Initial rating buttons | Again / Hard / Good / Easy, with labels "Forgot", "Hard", "Got it", "Easy" | Typing correctly scores Good; hints used scores Hard. |
| Leech rule | After 6 lapses, suspend and ask the learner to add a memory note or skip | Avoid endless failing cards. |
| Unverified items | Reviewed normally but display label; never rated "Easy" automatically | See section 9. |
| Fuzz | On | Prevents reviews bunching on one day. |

Cepeda's results (E6) justify expanding gaps and tolerating longer gaps over shorter ones. Kim and Webb (E7) support the same for L2 vocabulary.

## 9. Honest handling of unverified content

Each entry shows a status badge. Statuses come from the entry; the app never upgrades them.

| Label shown | Meaning |
|---|---|
| Unverified | Entered by a contributor, not yet checked by a second speaker |
| Checked by one speaker | One independent speaker agrees |
| Community verified | At least two independent speakers agree, with the date |
| Disputed | Speakers disagree; show variants |

Rules:
- Unverified items show a small, plain label on the preview card and in review. Not hidden in settings.
- A footer on every lesson: "Dadi's word list is still being checked. If something differs from how your family says it, tell us."
- Each card has "This differs in my family" (stores a local note, exportable). Treat disagreement as data, not error.
- Disputed items are taught as variants with both forms; neither is the single right answer.
- The app never claims a standard. English name is Chittagonian; the language name is siṭaiṅga.
- Do not add examples we cannot source. Where an entry has no example, show none.

## 10. What not to do

1. **No streak pressure.** No streak counters, loss warnings, or "you'll lose your streak" notifications (E23, E25).
2. **No punishment.** No lives, hearts, point loss, or red-screen failure states.
3. **No long lists.** Never more than 7 new items in a session; no "learn 50 words" screens (E2, E3).
4. **No leaderboards or public comparison.** Learners include families and elders.
5. **No false precision.** No "fluency %" or time-to-fluency claims (E24, E26).
6. **No confident wrong audio** (section 6).
7. **No strict single-spelling grading** (section 5).
8. **No grammar jargon** in the first two stages.
9. **No dark patterns:** no guilt copy, no countdown timers, no push notifications by default. Optional reminders are opt-in, once a day maximum, with neutral wording ("Ready for a short review?").

## 11. Progress display

- Show counts the learner can inspect: items met, items recalled correctly twice on different days, items due today.
- Show recall as "of the items you reviewed this week, you remembered N of M", not a mastery score.
- Show a strength bar per unit based on the scheduler's retrievability estimate, with the words "estimate" and "based on your answers".
- A history view lists each session (date, items, time). A "rest day" is not marked as failure.
- Display verification mix: "Of the items you have learned, X are checked by a speaker; Y are unverified."

## 12. Measurement that stays on device

Stored in IndexedDB on the learner's device; **no network transmission**. Export is a manual file the learner chooses to share.

- Per review: `entry_id`, timestamp, exercise type, correct/incorrect, response time bucket, hint used, rating, FSRS state.
- Per session: start, end, new items count, review count.
- Per attempt of an unattested spelling: the typed string (for the "suggest spelling" export).
- Delayed-retention probe: once a week, 10 old items with no help, to give the learner an honest check against FSRS predictions.
- Computed locally: recall rate by exercise type, by stage, by unit, by verification label; calibration of predicted vs. observed retention.
- Backups: every write to an append-only log; learner can export and import. No deletion without a recorded entry (data-never-lost rule).
- The questions to answer with this: Does typing beat tap-to-build for recall at 7 days? Do unverified items have more lapses? Are 5 new items per session too many for heritage versus beginner learners? These are tests of our own **[judgement]** settings.

## 13. Mapping to entry fields

| Field | Used for |
|---|---|
| `id` | scheduler key, review log, links to suggestions |
| `form` | the canonical display and the default answer in type/build exercises |
| `spellings` | all accepted answers; spelling feedback (section 5); noticing prompts |
| `gloss` | meaning match, picture match, odd-one-out; shown in preview |
| `ipa` | behind-a-tap hint in preview; future ear training; unverified marker shown |
| `level` | stage placement and unit ordering (section 2) |
| `kind` | exercise choice: word entries use match/type; phrase entries use phrase builder; other kinds are excluded from tap-to-build unless they have a natural chunking |

Missing fields degrade gracefully: no `ipa` hides the hint; no `spellings` accepts only `form`; no `level` places the item in the last stage until assigned. Add (as proposals, not assumptions): `verification` status, `theme`, `image_ref`, `audio_ref` with `speaker_id` and `consent`, `frequency_rank`.

## 14. Open questions for the maintainer

1. Who will verify entries, and how quickly can the first 100 be second-checked?
2. Will contributors record audio, with consent for several speakers?
3. Are images to be drawn locally or licensed? (Pictures must not be stereotyped.)
4. Is there an elder or master-apprentice link we can build toward (E28)? Dadi should encourage conversation with a real speaker.
