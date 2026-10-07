#!/usr/bin/env python3
"""Vet the learning videos listed in website/data/videos.json (CC0).

What it does, and nothing more:
  - asks YouTube's public oEmbed service whether each video still exists and may be embedded (no key, no sign-up);
  - records the check date, and refreshes the title and channel name from YouTube;
  - marks a video "unavailable" if it is gone or cannot be embedded, and "flagged" if three or more open reports name it;
  - never approves anything. "approved" and "rejected" are set only by a human moderator (docs/contribute/moderators.md);
  - writes every change it makes to website/data/video-log.jsonl.
Status values: unvetted (shown, labelled), approved (shown), flagged (hidden until a moderator decides), unavailable (hidden),
rejected (hidden for good). A moderator may move flagged or unavailable videos back to approved by editing the file.

Usage: python3 scripts/check_videos.py [--reports reports.json] [--dry-run]
reports.json is the output of: gh issue list --search '"[Video report]" in:title' --json title,number
"""
import json, re, sys, time, urllib.request, urllib.error, urllib.parse, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIDEOS = ROOT / 'website' / 'data' / 'videos.json'
LOG = ROOT / 'website' / 'data' / 'video-log.jsonl'
FLAG_AT = 3


def oembed(video_id, fetch=None):
    """Return ('ok', info) | ('gone', None) | ('blocked', None) | ('error', message)."""
    url = 'https://www.youtube.com/oembed?format=json&url=' + urllib.parse.quote('https://www.youtube.com/watch?v=' + video_id, safe='')
    try:
        if fetch:
            return fetch(url)
        req = urllib.request.Request(url, headers={'User-Agent': 'sitainge-video-check (+https://github.com/hmdrysr/sitainge)'})
        with urllib.request.urlopen(req, timeout=20) as r:
            return 'ok', json.load(r)
    except urllib.error.HTTPError as e:
        if e.code in (404, 410, 400):
            return 'gone', None
        if e.code in (401, 403):
            return 'blocked', None
        return 'error', 'HTTP %d' % e.code
    except Exception as e:  # network trouble must never change a video's status
        return 'error', str(e)


def count_reports(reports):
    n = {}
    for r in reports or []:
        m = re.search(r'\[Video report\]\s*([A-Za-z0-9_-]{11})', r.get('title', ''))
        if m:
            n[m.group(1)] = n.get(m.group(1), 0) + 1
    return n


def run(videos, reports=None, today=None, fetch=None, sleep=0.3):
    today = today or datetime.date.today().isoformat()
    reps = count_reports(reports)
    changes = []
    for v in videos:
        before = dict(v)
        kind, info = oembed(v['id'], fetch)
        if kind == 'ok':
            v['embeddable_checked'] = today
            if info.get('title'):
                v['title'] = info['title']
            if info.get('author_name'):
                v['channel'] = info['author_name']
            if v.get('status') == 'unavailable':
                v['status'] = 'unvetted'
        elif kind in ('gone', 'blocked') and v.get('status') not in ('rejected',):
            v['status'] = 'unavailable'
            v['embeddable_checked'] = today
        # kind == 'error': leave everything as it was and say so in the log
        if reps.get(v['id'], 0) >= FLAG_AT and v.get('status') in ('unvetted', 'approved'):
            v['status'] = 'flagged'
        v['open_reports'] = reps.get(v['id'], 0)
        if kind == 'error':
            changes.append({'t': today, 'id': v['id'], 'event': 'check-failed', 'detail': info})
        if v.get('status') != before.get('status'):
            changes.append({'t': today, 'id': v['id'], 'event': 'status', 'from': before.get('status'), 'to': v.get('status'), 'reports': reps.get(v['id'], 0)})
        time.sleep(sleep)
    return changes


def main(argv):
    reports = None
    if '--reports' in argv:
        p = pathlib.Path(argv[argv.index('--reports') + 1])
        reports = json.loads(p.read_text()) if p.exists() else []
    videos = json.loads(VIDEOS.read_text(encoding='utf-8'))
    changes = run(videos, reports)
    for c in changes:
        print(json.dumps(c, ensure_ascii=False))
    if '--dry-run' in argv:
        print('dry run: nothing written'); return 0
    VIDEOS.write_text(json.dumps(videos, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    if changes:
        with LOG.open('a', encoding='utf-8') as f:
            for c in changes:
                f.write(json.dumps(c, ensure_ascii=False) + '\n')
    print('%d video(s) checked, %d change(s) logged.' % (len(videos), len(changes)))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
