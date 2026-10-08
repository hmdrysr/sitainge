# Moderators' guide: videos, photos and reports

Moderators decide what learners see in Dadi and on the project page. The work takes a few minutes a week and requires a GitHub account with write access to the repository.

## What the automated tasks do and do not do
A scheduled task (Actions > **Dadi tools**, which runs every Monday, or `check-videos` / `update-media` run manually) does the mechanical work:
- It checks that each video still exists and can be embedded, refreshes its title and channel name, and logs the check date.
- It counts open issues titled `[Video report] <id>` and marks a video **flagged** (hidden) when three or more are open.
- It marks a video **unavailable** (hidden) when the video is gone or cannot be embedded.
- It finds new freely licensed photos on Wikimedia Commons and adds them as **auto** (shown, awaiting a moderator).
- It writes every change to `website/data/video-log.jsonl` and `website/data/media-log.jsonl`.

The task never approves anything. Only a moderator sets `approved` or `rejected`.

## Statuses
| Status | Shown to learners | Meaning |
|---|---|---|
| unvetted / auto | Yes, with an "awaiting review" label | Nobody has checked it yet |
| approved | Yes | A moderator watched or viewed it and it meets the criteria |
| flagged | No | Reports crossed the threshold; waiting for a moderator |
| unavailable | No | Gone or cannot be embedded |
| rejected | No, and never re-added | A moderator decided it does not belong |

## Reviewing a video (about five minutes each)
1. Open `website/data/videos.json` and find the video. Watch at least the first few minutes and a few later passages.
2. Approve the video only if **all** of these conditions hold:
   - The language is siṭaiṅga (not another language presented as siṭaiṅga).
   - The speaker's pronunciation and examples are plausible to the moderator as a speaker, or a native speaker the moderator trusts has confirmed them. A moderator who is not a speaker leaves the video unvetted and asks in an issue.
   - It teaches or explains something useful for learning (words, phrases, sounds, culture).
   - It is respectful: no hate, harassment, harmful stereotypes or unsuitable content.
   - It is watchable: audible, with a clear picture, and not mostly advertising.
3. Change `"status"` to `"approved"` and add `"reviewed_by": "<your GitHub name>"` and `"reviewed": "YYYY-MM-DD"`. To remove the video, use `"rejected"` and add `"reason"`.
4. Close any open `[Video report]` issues for that video with a short note on the decision. Open reports trigger flagging, so closing them matters.
5. Commit. Run Actions > **Dadi tools** > `deploy-site` to publish the change right away.

## Reviewing a photo
- Open the photo's `page` link and read the licence there. Accept only CC0, public domain, CC BY and CC BY-SA.
- Check that the photo shows what the caption says, is of good quality, and respects the people in it (no identifiable private individuals in embarrassing or unsafe situations).
- Set `"status"` to `"approved"` or `"rejected"` in `website/data/media.json`.

## Handling reports
Reports arrive as GitHub issues titled `[Video report]` or `[Content report]`. For each report, look at the item, decide, act, and close the issue with a sentence of explanation. Do not name or expose the person who made the report. If a report concerns a dictionary entry, move it into the normal review process (a `CTG-LEX-REV` record) and never edit the original entry.

## Adding a video
Add an object to `videos.json` with `id` (the 11-character YouTube id), `label` (a short plain title), `topic`, and `"status": "unvetted"`. Add only videos that allow embedding, and only videos that the moderator has at least skimmed.

## Staying fair
- Do not reject content only because the speaker's variety differs from the moderator's. siṭaiṅga varies by area. Note the area instead.
- If two moderators disagree, leave the item unvetted and discuss it in an issue.
- Moderation decisions are recorded in the logs and in the git history, so each can be reviewed.
