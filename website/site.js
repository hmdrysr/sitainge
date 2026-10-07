/* siṭaiṅga landing page script (CC0): loads the map, history, facts and videos from data/*.json. No tracking, no third-party scripts. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const h = (tag, props, ...kids) => { const e = document.createElement(tag); for (const k in (props || {})) { if (k === 'class') e.className = props[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), props[k]); else if (props[k] != null && props[k] !== false) e.setAttribute(k, props[k]); } kids.flat(Infinity).forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); }); return e; };
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const num = (n) => new Intl.NumberFormat('en-CA').format(n);
  const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
  const srcLinks = (s) => [].concat(s || []).map((u, i) => h('a', { href: u, rel: 'noopener noreferrer' }, '[' + (i + 1) + ']'));
  const HOME = { 'Chittagong': 1, "Cox's Bazar": 1 };

  function drawMap(map, facts) {
    const svg = $('map'); svg.setAttribute('viewBox', map.viewBox.join(' '));
    map.context.forEach((c) => svg.append(sv('path', { d: c.d, class: 'ctx' })));
    const byName = {}; facts.districts.forEach((d) => { byName[d.name] = d; });
    const chips = $('district-chips'); const nodes = {}, chipEls = {};
    function show(name) {
      const d = byName[name]; if (!d) return;
      Object.keys(nodes).forEach((n) => { nodes[n].setAttribute('aria-pressed', String(n === name)); chipEls[n].setAttribute('aria-pressed', String(n === name)); });
      const p = $('panel'); p.textContent = '';
      p.append(h('h3', null, name + (name === 'Chittagong' ? ' District' : ' District')),
        h('dl', null, h('dt', null, 'Headquarters'), h('dd', null, d.hq), h('dt', null, 'Population'), h('dd', null, num(d.population) + ' (' + d.census + ' census)'), h('dt', null, 'Area'), h('dd', null, num(Math.round(d.area_km2)) + ' km²'), d.upazilas ? [h('dt', null, 'Upazilas'), h('dd', null, String(d.upazilas))] : null),
        d.note ? h('p', null, d.note) : null,
        h('p', { class: 'small' }, 'Sources ', srcLinks(d.sources)));
    }
    map.division.forEach((d) => {
      const path = sv('path', { d: d.d, class: 'd' + (HOME[d.name] ? ' home' : ''), tabindex: '0', role: 'button', 'aria-pressed': 'false', 'aria-label': d.name + ' district' });
      path.addEventListener('click', () => show(d.name));
      path.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(d.name); } });
      nodes[d.name] = path; svg.append(path);
    });
    map.division.forEach((d) => { const t = sv('text', { x: d.cx, y: d.cy }); t.textContent = d.name; svg.append(t); });
    facts.districts.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((d) => {
      const c = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => show(d.name) }, d.name); chipEls[d.name] = c; chips.append(c);
    });
    $('map-credit').textContent = map.credit + ' Darker districts are where siṭaiṅga is the main everyday language.';
    show('Chittagong');
  }

  function drawText(f) {
    $('timeline').append(...f.timeline.map((t) => h('li', null, h('b', null, t.when), t.text + ' ', srcLinks(t.source))));
    const g = f.government;
    $('gov').append(h('ul', { class: 'tiers' }, g.tiers.map(([a, b]) => h('li', null, h('b', null, a), b))), h('p', null, g.national), h('p', null, g.hill), h('p', { class: 'small' }, 'Sources ', srcLinks(g.sources)));
    $('facts').append(...f.facts.map((x) => h('li', null, x.text + ' ', srcLinks(x.source))));
    const place = $('place').querySelector('.wrap');
    place.insertBefore(h('div', { class: 'note', id: 'naming' }, h('p', null, h('b', null, 'A note on the name')), h('p', null, f.naming.text + ' '), h('p', { class: 'small' }, 'Sources ', srcLinks(f.naming.sources))), $('gallery-wrap'));
    $('credits').append(' Language facts: ', h('a', { href: f.language.status_source, rel: 'noopener noreferrer' }, 'Glottolog'), ' (code ' + f.language.iso_639_3 + ', ' + f.language.glottocode + '). ' + f.language.speakers_note);
  }

  function drawVideos(list, repo) {
    const box = $('videos'); const ok = list.filter((v) => !['rejected', 'flagged', 'unavailable'].includes(v.status));
    if (!ok.length) { box.append(h('p', null, 'No videos yet.')); return; }
    ok.forEach((v) => {
      const frame = h('div', { class: 'frame' });
      const btn = h('button', { class: 'play', type: 'button', 'aria-label': 'Play: ' + v.label }, (() => { const s = sv('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }); s.append(sv('path', { d: 'M6 4l14 8-14 8z' })); return s; })());
      btn.addEventListener('click', () => { frame.textContent = ''; frame.append(h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?rel=0', title: v.label, loading: 'lazy', allow: 'encrypted-media; picture-in-picture', allowfullscreen: '', referrerpolicy: 'strict-origin-when-cross-origin' })); });
      frame.append(btn);
      const rep = 'https://github.com/' + repo + '/issues/new?labels=video-report&title=' + encodeURIComponent('[Video report] ' + v.id) + '&body=' + encodeURIComponent('Video: https://www.youtube.com/watch?v=' + v.id + '\n\nWhat is wrong (low quality, wrong language, unsuitable, broken)?\n');
      box.append(h('article', { class: 'vid' }, frame, h('div', { class: 'meta' }, h('b', null, v.label), h('span', null, v.channel + (v.status === 'approved' ? '' : ' · awaiting review')), h('br'), h('a', { class: 'rep', href: rep, rel: 'noopener noreferrer' }, 'Report a problem'))));
    });
  }

  function drawGallery(media) {
    const items = (media.items || []).filter((m) => m.status !== 'rejected'); if (!items.length) return;
    $('gallery-wrap').hidden = false; const g = $('gallery');
    items.slice(0, 12).forEach((m) => {
      const img = h('img', { src: m.src, alt: m.alt || '', loading: 'lazy', width: m.width, height: m.height });
      img.addEventListener('error', () => { img.closest('figure').remove(); });
      g.append(h('figure', null, img, h('figcaption', null, (m.place ? m.place + '. ' : '') + 'Photo: ' + m.author + ', ', h('a', { href: m.licence_url, rel: 'noopener noreferrer' }, m.licence), ', ', h('a', { href: m.page, rel: 'noopener noreferrer' }, 'source'))));
    });
  }

  const repo = 'hmdrysr/sitainge';
  Promise.all([get('data/facts.json'), get('data/map.json')]).then(([f, m]) => { drawText(f); drawMap(m, f); }).catch(() => { $('panel').textContent = 'The map could not load. Check your connection and refresh.'; });
  get('data/videos.json').then((v) => drawVideos(v, repo)).catch(() => { $('videos').textContent = 'Videos could not load.'; });
  get('data/media.json').then(drawGallery).catch(() => { /* no images is fine */ });
})();
