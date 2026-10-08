# Verification session

Purpose: a second speaker, independent of the first, listens to items and says whether they recognize them and where they are said. This is how an item moves from one person's report toward confirmed evidence. It is a listening task of about 10 minutes, with no typing.

## Rules

1. **Independent speaker.** The verifier is not the person who supplied the item, and does not see the first speaker's name or details. Where possible, the verifier comes from a different upazila, so that place variation is visible.
2. **Record speaker by speaker.** Each response is a separate confirmation (`confirmations[]`: speaker ID, date, outcome). Counts of agreement, likes or votes are not evidence. A majority does not decide an item.
3. **Allowed outcomes:** `confirmed` (I say this, or I know it as said), `not recognized`, `variant offered` (I say it differently; record what they say, as an additional spelling or variant, never replacing the original) and `unsure`.
4. **Disagreement is data.** Record it; do not resolve it silently. A form that one speaker rejects stays in the record with that response.
5. **Play, do not read.** Play the recording of the item where one exists; reading a spelling aloud tests the interviewer's reading, not the language. If there is no recording, say so in the notes.
6. **No suggestion.** Do not tell the verifier what the first speaker said the item means beyond the English gloss on the sheet.
7. **Consent first.** The verifier completes a consent form as for any session. Their own recordings are logged as usual.

## Steps

1. Prepare a sheet of 20 to 30 items from the review queue, each with its recording ID and English gloss.
2. Run the session. For each item ask: "Is this said where you live? Do you say it? Do you say it differently?"
3. Log the outcome for each item in the session record (`style: verification`) and in the item's `confirmations`.
4. Promotion (from the documentation plan): REVIEW to ACCEPTED requires confirmation by at least one speaker other than the source, plus audio, and an evidence level of A to C. A named human reviewer approves; an AI cannot.
5. Log every promotion and demotion in `decision_history`.

## What a verification does not show

Confirmation by one more speaker raises confidence; it does not settle spelling, dialect boundaries or etymology. Those remain questions for the orthography working group and for further fieldwork.
