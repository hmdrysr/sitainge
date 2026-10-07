#!/usr/bin/env python3
"""Refresh website/data/media.json with freely licensed photos from Wikimedia Commons (CC0).

Pictures are hotlinked from upload.wikimedia.org (never copied into the repository) and always credited.
Only these licences are kept: CC0, public domain, CC BY (any version), CC BY-SA (any version). Anything with NC or ND is dropped.
New photos enter with status "auto" (shown, awaiting a moderator). A moderator changes a status to "approved" or "rejected" by
editing the file; this script never overwrites a moderator's decision and never re-adds a rejected photo.
Every change is appended to website/data/media-log.jsonl.

Usage: python3 scripts/update_media.py [--dry-run] | --selftest
"""
import json, re, sys, time, html, urllib.request, urllib.parse, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEDIA = ROOT / 'website' / 'data' / 'media.json'
LOG = ROOT / 'website' / 'data' / 'media-log.jsonl'
API = 'https://commons.wikimedia.org/w/api.php'
QUERIES = [('Chittagong port Karnaphuli', 'Chittagong'), ('Patenga beach Chittagong', 'Patenga'), ('Foy\'s Lake Chittagong', "Foy's Lake"),
           ('Chittagong Hill Tracts landscape', 'Chittagong Hill Tracts'), ("Cox's Bazar beach", "Cox's Bazar"), ('Sitakunda Chittagong', 'Sitakunda'),
           ('Kaptai Lake Rangamati', 'Rangamati'), ('Chittagong old city street', 'Chittagong')]
MAX_ITEMS = 16
OK_LICENCE = re.compile(r'^(CC0|Public domain|PD|CC[ -]BY(?:[ -]SA)?[ -]\d)', re.I)
BAD_LICENCE = re.compile(r'\b(NC|ND)\b', re.I)


def strip_tags(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()


def usable(meta):
    lic = strip_tags((meta.get('LicenseShortName') or {}).get('value', ''))
    return bool(lic) and bool(OK_LICENCE.match(lic)) and not BAD_LICENCE.search(lic), lic


def to_item(page, place):
    ii = (page.get('imageinfo') or [None])[0]
    if not ii or not ii.get('thumburl') or not ii.get('thumburl').startswith('https://upload.wikimedia.org/'):
        return None
    meta = ii.get('extmetadata') or {}
    ok, lic = usable(meta)
    if not ok:
        return None
    if ii.get('mime') not in ('image/jpeg', 'image/png', 'image/webp'):
        return None
    title = page.get('title', '')
    desc = strip_tags((meta.get('ImageDescription') or {}).get('value', ''))
    return {'id': 'commons:' + title, 'src': ii['thumburl'], 'width': ii.get('thumbwidth'), 'height': ii.get('thumbheight'),
            'alt': (desc[:140] or re.sub(r'^File:|\.\w+$', '', title)), 'place': place,
            'author': strip_tags((meta.get('Artist') or {}).get('value', '')) or 'Unknown author',
            'licence': lic, 'licence_url': strip_tags((meta.get('LicenseUrl') or {}).get('value', '')) or 'https://commons.wikimedia.org/wiki/Commons:Licensing',
            'page': ii.get('descriptionurl') or ('https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_'))),
            'status': 'auto', 'added': datetime.date.today().isoformat()}


def search(query, fetch=None):
    params = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrnamespace': '6', 'gsrlimit': '12', 'gsrsearch': query + ' filetype:bitmap',
              'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': '640', 'origin': '*'}
    url = API + '?' + urllib.parse.urlencode(params)
    if fetch:
        return fetch(url)
    req = urllib.request.Request(url, headers={'User-Agent': 'sitainge-media-update (+https://github.com/hmdrysr/sitainge)'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def merge(current, found):
    """Keep every existing item (moderator decisions win); add new, never re-add rejected; cap the shown list."""
    by_id = {i['id']: i for i in current}
    added = []
    for it in found:
        if it['id'] not in by_id:
            by_id[it['id']] = it; added.append(it)
    items = list(by_id.values())
    keep = [i for i in items if i.get('status') != 'rejected']
    rejected = [i for i in items if i.get('status') == 'rejected']
    keep.sort(key=lambda i: (i.get('status') != 'approved', i.get('added', '')))
    return keep[:MAX_ITEMS] + rejected, added


def selftest():
    sample = {'query': {'pages': {'1': {'title': 'File:Karnaphuli.jpg', 'imageinfo': [{'thumburl': 'https://upload.wikimedia.org/x/640px-K.jpg', 'thumbwidth': 640, 'thumbheight': 400, 'mime': 'image/jpeg',
              'descriptionurl': 'https://commons.wikimedia.org/wiki/File:Karnaphuli.jpg', 'extmetadata': {'LicenseShortName': {'value': 'CC BY-SA 4.0'}, 'Artist': {'value': '<a href="x">Jane Roe</a>'}, 'ImageDescription': {'value': 'River &amp; boats'}}}]},
              '2': {'title': 'File:NC.jpg', 'imageinfo': [{'thumburl': 'https://upload.wikimedia.org/y.jpg', 'mime': 'image/jpeg', 'extmetadata': {'LicenseShortName': {'value': 'CC BY-NC 4.0'}}}]},
              '3': {'title': 'File:Evil.jpg', 'imageinfo': [{'thumburl': 'https://evil.example/y.jpg', 'mime': 'image/jpeg', 'extmetadata': {'LicenseShortName': {'value': 'CC0'}}}]}}}}
    items = [to_item(p, 'Chittagong') for p in sample['query']['pages'].values()]
    good = [i for i in items if i]
    assert len(good) == 1 and good[0]['author'] == 'Jane Roe' and good[0]['alt'] == 'River & boats', good
    cur = [{'id': 'commons:File:Old.jpg', 'status': 'rejected'}, dict(good[0], status='approved')]
    merged, added = merge(cur, good + [dict(good[0], id='commons:File:Old.jpg', status='auto')])
    assert not added and any(i['id'] == 'commons:File:Karnaphuli.jpg' and i['status'] == 'approved' for i in merged)
    print('selftest ok')


def main(argv):
    if '--selftest' in argv:
        selftest(); return 0
    data = json.loads(MEDIA.read_text(encoding='utf-8')) if MEDIA.exists() else {'items': []}
    found, failures = [], 0
    for q, place in QUERIES:
        try:
            res = search(q)
        except Exception as e:
            failures += 1; print('search failed for %r: %s' % (q, e)); continue
        for page in ((res.get('query') or {}).get('pages') or {}).values():
            it = to_item(page, place)
            if it:
                found.append(it)
        time.sleep(1)
    if failures == len(QUERIES):
        print('Commons could not be reached. Nothing changed.'); return 1
    items, added = merge(data.get('items', []), found)
    data['items'] = items
    for a in added:
        print('added', a['id'], a['licence'])
    if '--dry-run' in argv:
        print('dry run: nothing written'); return 0
    MEDIA.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    if added:
        with LOG.open('a', encoding='utf-8') as f:
            for a in added:
                f.write(json.dumps({'t': datetime.date.today().isoformat(), 'id': a['id'], 'event': 'added', 'licence': a['licence'], 'author': a['author']}, ensure_ascii=False) + '\n')
    print('%d photo(s) added, %d total.' % (len(added), len(items)))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
