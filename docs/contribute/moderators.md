# Moderators' guide: videos, photos and reports

Moderators decide what learners see in Dadi and on the project page. This takes a few minutes a week. You need a GitHub account with write access to the repository.

## What the machines do and do not do
A scheduled task (Actions > **Dadi tools**, runs every Monday, or run `check-videos` / `update-media` yourself) does the mechanical work:
- It checks that each video still exists and can be embedded, refreshes its title and channel name, and logs the check date.
- It counts open issues titled `[Video report] <id>` and marks a video **flagged** (hidden) when three or more are open.
- It marks a video **unavailable** (hidden) when it is gone or cannot be embedded.
- It finds new freely licensed photos on Wikimedia Commons and adds them as **auto** (shown, awaiting you).
- It writes every change to `website/data/video-log.jsonl` and `website/data/media-log.jsonl`.

It never approves anything. Only a moderator sets `approved` or `rejected`.

## Statuses
| Status | Shown to learners | Meaning |
|---|---|---|
| unvetted / auto | Yes, with an "awaiting review" label | Nobody has checked it yet |
| approved | Yes | A moderator watched or viewed it and it meets the criteria |
| flagged | No | Reports crossed the threshold; waiting for you |
| unavailable | No | Gone or cannot be embedded |
| rejected | No, and never re-added | A moderator decided it does not belong |

## Reviewing a video (about five minutes each)
1. Open `website/data/videos.json` and find the video. Watch at least the first few minutes and a few spots after that.
2. Approve only if **all** of these hold:
   - The language is siṭaiṅga (not another language presented as it).
   - The speaker's pronunciation and examples are plausible to you as a speaker, or a native speaker you trust has confirmed it. If you are not a speaker, leave it as unvetted and ask in an issue.
   - It teaches or explains something useful for learning (words, phrases, sounds, culture).
   - It is respectful: no hate, harassment, harmful stereotypes or unsuitable content.
   - It is watchable: audible, a clear picture, not mostly advertising.
3. Change `"status"` to `"approved"` and add `"reviewed_by": "<your GitHub name>"` and `"reviewed": "YYYY-MM-DD"`. To remove it, use `"rejected"` and add `"reason"`.
4. Close any open `[Video report]` issues for that video with a short note on what you decided. Open reports are what trigger flagging, so closing them matters.
5. Commit. Run Actions > **Dadi tools** > `deploy-site` if you want it live straight away.

## Reviewing a photo
- Open the photo's `page` link and read the licence there. Accept CC0, public domain, CC BY and CC BY-SA only.
- Check that it shows what the caption says, is a good-quality picture and respects people in it (no identifiable private individuals in embarrassing or unsafe situations).
- Set `"status"` to `"approved"` or `"rejected"` in `website/data/media.json`.

## Handling reports
Reports arrive as GitHub issues titled `[Video report]` or `[Content report]`. For each: look at the item, decide, act, and close the issue with a sentence. Do not name or expose the person who reported it. If a report is about a dictionary entry, move it into the normal review process (a `CTG-LEX-REV` record), never edit the original entry.

## Adding a video
Add an object to `videos.json` with `id` (the 11-character YouTube id), `label` (a short plain title), `topic`, and `"status": "unvetted"`. Only add videos that allow embedding. Do not add videos you have not at least skimmed.

## Staying fair
- Do not reject content only because the speaker's variety differs from yours. siṭaiṅga varies by area. Note the area instead.
- If two moderators disagree, leave the item unvetted and discuss it in an issue.
- Moderation decisions are recorded in the logs and in the git history, so any of them can be reviewed.
