/* siṭaiṅge project site script (CC0). Everything shown is read from the repository's files (raw.githubusercontent.com), with a saved copy and a bundled copy as fallbacks.
   A record is corrected by editing its file in the repository; this page does not need to change. No tracking, no third-party scripts. */
(function () {
  'use strict';
  const REPO = 'hmdrysr/sitainge', BRANCH = 'main';
  const $ = (id) => document.getElementById(id);
  const h = (tag, props, ...kids) => { const e = document.createElement(tag); for (const k in (props || {})) { if (k === 'class') e.className = props[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), props[k]); else if (props[k] != null && props[k] !== false) e.setAttribute(k, props[k]); } kids.flat(Infinity).forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); }); return e; };
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const num = (n) => (n == null ? 'not known' : new Intl.NumberFormat('en-CA').format(n));
  const dateLong = (d) => new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const srcLinks = (s) => [].concat(s || []).map((u, i) => h('a', { href: u, rel: 'noopener noreferrer' }, '[' + (i + 1) + ']'));
  let liveCount = 0, totalCount = 0;

  /* Repo first (5 s), then the last good copy, then the file shipped with the site. */
  async function repoJSON(path, local) {
    totalCount++;
    const key = 'site.cache.' + path;
    const one = async (u, ms) => { const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms); try { const r = await fetch(u, { signal: ac.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); } };
    if (navigator.onLine !== false) { try { const j = await one('https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/' + path, 5000); liveCount++; try { localStorage.setItem(key, JSON.stringify(j)); } catch (e) { /* storage full */ } return j; } catch (e) { /* fall through */ } }
    try { const c = localStorage.getItem(key); if (c) return JSON.parse(c); } catch (e) { /* none */ }
    return one(local, 8000);
  }
  function liveNote() {
    const n = $('live-note'); if (!n) return;
    const on = liveCount > 0; n.classList.toggle('on', on);
    n.textContent = on ? 'Figures read from the repository on ' + dateLong(Date.now()) + '. They follow the files held there.' : 'The repository could not be reached, so this page shows its saved copy.';
  }

  /* ---------- numbers and evidence ---------- */
  const LEVELS = [['A', 'Directly documented', '--ea'], ['B', 'Independently confirmed', '--eb'], ['C', 'Strongly supported', '--ec'], ['D', 'Proposed', '--ed'], ['E', 'Unknown', '--ee'], ['unassessed', 'Not yet assessed', '--ef']];
  /* Level colours come from the stylesheet (classes lv-A to lv-unassessed) so they follow the colour theme. */
  function stats(seed) {
    const es = (seed.entries || []).filter((e) => e.state !== 'ARCHIVED');
    const by = {}; es.forEach((e) => { const l = e.level || 'unassessed'; by[l] = (by[l] || 0) + 1; });
    $('s-all').textContent = num(es.length);
    $('s-words').textContent = num(es.filter((e) => e.kind === 'word').length);
    $('s-sent').textContent = num(es.filter((e) => e.kind !== 'word').length);
    $('s-ipa').textContent = num(new Set(es.map((e) => e.source).filter(Boolean)).size);
    $('s-ver').textContent = num((by.A || 0) + (by.B || 0));
    const bar = $('ev'), key = $('ev-key'); bar.textContent = ''; key.textContent = '';
    LEVELS.forEach(([k, name]) => {
      const n = by[k] || 0; if (!n) return;
      const seg = h('i', { class: 'lv-' + k, title: name + ': ' + n }); seg.style.width = (100 * n / es.length) + '%'; bar.append(seg);
      const sw = h('i', { class: 'sw lv-' + k });
      key.append(h('li', null, sw, h('b', null, num(n)), (k === 'unassessed' ? '' : 'Level ' + k + ': ') + name.toLowerCase()));
    });
    bar.setAttribute('aria-label', 'Entries by evidence level: ' + LEVELS.filter(([k]) => by[k]).map(([k, n]) => by[k] + ' ' + n.toLowerCase()).join(', '));
  }
  function changes(list) {
    const ol = $('changes'); ol.textContent = '';
    list.slice(0, 8).forEach((c) => {
      const msg = (c.commit.message || '').split('\n')[0].slice(0, 110);
      ol.append(h('li', null, h('a', { href: c.html_url, rel: 'noopener noreferrer' }, msg), h('span', { class: 'when' }, dateLong(c.commit.author.date))));
    });
    if (!list.length) ol.append(h('li', { class: 'small' }, 'No commits have been recorded.'));
  }
  async function loadChanges() {
    const key = 'site.cache.commits';
    try { const r = await fetch('https://api.github.com/repos/' + REPO + '/commits?per_page=8', { headers: { Accept: 'application/vnd.github+json' } }); if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); try { localStorage.setItem(key, JSON.stringify(j)); } catch (e) { /* ignore */ } return changes(j); } catch (e) { /* cached */ }
    try { const c = JSON.parse(localStorage.getItem(key) || 'null'); if (c) return changes(c); } catch (e) { /* none */ }
    $('changes').textContent = ''; $('changes').append(h('li', { class: 'small' }, 'GitHub did not respond. The full history is available on GitHub.'));
  }

  /* ---------- text from facts.json ---------- */
  function drawText(f) {
    $('timeline').append(...f.timeline.map((t) => h('li', null, h('b', null, t.when), t.text + ' ', srcLinks(t.source))));
    $('facts').append(...f.facts.map((x) => h('li', null, x.text + ' ', srcLinks(x.source))));
    $('naming').append(h('p', null, h('b', null, 'Note on the spelling Chittagong')), h('p', null, f.naming.text + ' '), h('p', { class: 'small' }, 'Sources: ', srcLinks(f.naming.sources)));
  }

  /* ---------- map ---------- */
  const LAYERS = [['upz', 'Upazilas', true], ['un', 'Unions', false], ['mu', 'Municipalities', false], ['wd', 'City wards', false], ['th', 'Police areas in the city', false]];
  function atlas(adm, map) {
    const svg = $('map'), R = {}, byName = (list) => { const o = {}; list.forEach((x) => { o[x.name] = x; }); return o; };
    adm.regions.forEach((r) => { R[r.name] = r; });
    const srcById = {}; adm.sources.forEach((s) => { srcById[s.id] = s; });
    const upz = {}; adm.regions.forEach((r) => r.upazilas.forEach((u) => { upz[u.name] = u; }));
    const vb0 = map.viewBox.slice(); let vb = vb0.slice(), anim = 0;
    svg.setAttribute('viewBox', vb.join(' '));
    const layers = {}; ['dist', 'upz', 'un', 'mu', 'wd', 'th'].forEach((k) => { layers[k] = sv('g', { 'data-l': k }); svg.append(layers[k]); });
    const labels = sv('g', {}); svg.append(labels);
    let sel = { level: 'home' };
    const nodes = [], unionNodes = [];
    function mk(layer, cls, d, label, onpick, extra) {
      const p = sv('path', Object.assign({ d, class: cls, tabindex: '0', role: 'button', 'aria-label': label }, extra || {}));
      p.addEventListener('click', onpick); p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onpick(); } });
      const t = sv('title', {}); t.textContent = label; p.append(t); layers[layer].append(p); nodes.push(p); return p;
    }
    map.districts.forEach((d) => layers.dist.append(sv('path', { d: d.d, class: 'dist' + (d.name === "Cox's Bazar" ? ' cox' : '') })));
    const mkp = {};
    map.upazilas.forEach((u) => { mkp['u:' + u.name] = mk('upz', 'upz', u.d, u.name + ' upazila', () => pick({ level: 'upazila', name: u.name })); });
    map.unions.forEach((u) => { const q = mk('un', 'un', u.d, u.name + ' union, ' + u.upazila, () => pick({ level: 'union', name: u.name, upazila: u.upazila })); mkp['n:' + u.upazila + '/' + u.name] = q; unionNodes.push([q, u.upazila]); });
    map.municipalities.forEach((m) => { mkp['m:' + m.name] = mk('mu', 'mu', m.d, m.name + ' municipality', () => pick({ level: 'municipality', name: m.name, upazila: m.upazila })); });
    map.city_corporation_wards.forEach((w) => { mkp['w:' + w.ward] = mk('wd', 'wd', w.d, 'City ward ' + w.ward, () => pick({ level: 'ward', ward: w.ward })); });
    map.metro_thanas.forEach((t) => { mkp['t:' + t.name] = mk('th', 'th', t.d, t.name + ' police area', () => pick({ level: 'thana', name: t.name })); });
    /* layer switches */
    const lbox = $('layers'); const on = {};
    LAYERS.forEach(([k, name, def]) => {
      on[k] = def; const i = h('input', { type: 'checkbox' }); i.checked = def;
      i.addEventListener('change', () => { on[k] = i.checked; applyLayers(); });
      lbox.append(h('label', { class: 'lay' }, i, name));
    });
    function applyLayers() {
      const u = sel.level === 'upazila' ? sel.name : sel.level === 'union' ? sel.upazila : null;
      ['upz', 'mu', 'wd', 'th'].forEach((k) => { layers[k].style.display = on[k] ? '' : 'none'; });
      /* unions of the chosen upazila always show, so a zoomed view is never empty */
      layers.un.style.display = (on.un || u) ? '' : 'none';
      unionNodes.forEach(([p, up]) => { p.style.display = (on.un || up === u) ? '' : 'none'; });
    }
    function lab() { const f = (13 * vb[2] / vb0[2]).toFixed(2) + 'px', sw = (3 * vb[2] / vb0[2]).toFixed(2) + 'px'; labels.querySelectorAll('text').forEach((t) => { t.style.fontSize = f; t.style.strokeWidth = sw; }); }
    function bbox(list) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; list.forEach((p) => { const r = p.getBBox(); a = Math.min(a, r.x); b = Math.min(b, r.y); c = Math.max(c, r.x + r.width); d = Math.max(d, r.y + r.height); }); return [a, b, c - a, d - b]; }
    function zoomTo(box) {
      if (!box) box = vb0; else { const pad = Math.max(box[2], box[3]) * 0.12; box = [box[0] - pad, box[1] - pad, box[2] + 2 * pad, box[3] + 2 * pad]; const ar = vb0[2] / vb0[3]; if (box[2] / box[3] < ar) { const w = box[3] * ar; box[0] -= (w - box[2]) / 2; box[2] = w; } else { const hh = box[2] / ar; box[1] -= (hh - box[3]) / 2; box[3] = hh; } }
      const from = vb.slice(), to = box; cancelAnimationFrame(anim);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { vb = to.slice(); svg.setAttribute('viewBox', vb.join(' ')); lab(); return; }
      const t0 = performance.now(); (function step(t) { const k = Math.min(1, (t - t0) / 380), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; vb = from.map((v, i) => v + (to[i] - v) * e); svg.setAttribute('viewBox', vb.map((v) => v.toFixed(2)).join(' ')); lab(); if (k < 1) anim = requestAnimationFrame(step); })(t0);
    }

    /* panel pieces */
    const put = (el, ...k) => el.append(...k.flat(Infinity).filter((x) => x != null && x !== false));
    const pill = (txt, fn, note) => h('li', null, fn ? h('button', { type: 'button', onclick: fn }, txt, note ? h('em', null, note) : null) : h('span', null, txt, note ? h('em', null, note) : null));
    const dl = (rows) => h('dl', null, rows.filter((r) => r[1] != null && r[1] !== '').map(([a, b]) => [h('dt', null, a), h('dd', null, b)]));
    const sources = (ids) => h('p', { class: 'small' }, 'Sources: ', (ids || []).map((id, i) => srcById[id] ? [i ? ', ' : '', h('a', { href: srcById[id].url, rel: 'noopener noreferrer' }, srcById[id].title)] : null));
    const caveats = (arr) => (arr && arr.length ? arr.map((t) => h('p', { class: 'caveat' }, t)) : null);
    const editNote = h('p', { class: 'small' }, 'To report an error, edit ', h('a', { href: 'https://github.com/' + REPO + '/blob/' + BRANCH + '/website/data/admin.json', rel: 'noopener noreferrer' }, 'the data file'), ' on GitHub or open an issue.');

    function crumbs() {
      const c = $('crumbs'); c.textContent = '';
      const part = (t, s) => c.append(h('button', { type: 'button', onclick: () => pick(s) }, t));
      part('Both districts', { level: 'home' });
      const dName = sel.district || (sel.level === 'district' ? sel.name : null);
      if (dName) { c.append(h('span', null, '›')); part(dName, { level: 'district', name: dName }); }
      const uName = sel.level === 'upazila' ? sel.name : sel.level === 'union' ? sel.upazila : null;
      if (uName) { c.append(h('span', null, '›')); part(uName, { level: 'upazila', name: uName }); }
      if (sel.level === 'union') { c.append(h('span', null, '›'), h('span', null, sel.name)); }
    }
    function districtOf(u) { return (upz[u] || {}).district; }
    function panel() {
      const p = $('panel'); p.textContent = ''; p.scrollTop = 0;
      if (sel.level === 'home') {
        put(p, h('h3', null, 'Chittagong and Cox\'s Bazar'), h('p', { class: 'sub' }, 'The two districts that make up the project\'s region.'),
          dl([['Districts', '2'], ['Upazilas', String(adm.regions.reduce((n, r) => n + r.upazilas.length, 0))], ['Unions', String(adm.regions.reduce((n, r) => n + r.upazilas.reduce((m, u) => m + (u.union_count || (u.unions || []).length), 0), 0))], ['Population (2022)', num(adm.regions.reduce((n, r) => n + (r.population_2022 || 0), 0))]]),
          h('h4', null, 'Districts'), h('ul', { class: 'pills' }, adm.regions.map((r) => pill(r.name, () => pick({ level: 'district', name: r.name }), num(r.population_2022)))),
          h('p', { class: 'small' }, 'Chittagong Division, a government grouping of 11 districts, extends beyond the project\'s region and is not shown.'));
        return;
      }
      if (sel.level === 'district') {
        const r = R[sel.name], cc = (r.city_corporations || [])[0], mp = r.metropolitan_police;
        put(p, h('h3', null, r.name + ' District'), h('p', { class: 'sub' }, 'Headquarters: ' + r.headquarters),
          dl([['Population (2022)', num(r.population_2022)], ['Area', r.area_km2 ? num(Math.round(r.area_km2)) + ' km²' : null], ['Upazilas', String(r.upazilas.length)], ['Municipalities', String((r.municipalities || []).length)], ['City corporation', cc ? cc.name + ', ' + cc.wards + ' wards' : 'none'], ['Police', mp ? mp.name + ', ' + mp.thanas_count + ' police areas' : null], ['Police stations (district)', r.thanas_total_in_district ? String(r.thanas_total_in_district) : null]]),
          h('h4', null, 'Upazilas'), h('ul', { class: 'pills' }, r.upazilas.map((u) => pill(u.name, () => pick({ level: 'upazila', name: u.name }), u.population_2022 ? num(u.population_2022) : ''))),
          (r.municipalities || []).length ? [h('h4', null, 'Municipalities'), h('ul', { class: 'pills' }, r.municipalities.map((m) => pill(m.name, () => { on.mu = true; sync(); pick({ level: 'municipality', name: m.name, upazila: m.upazila }); }, m.wards ? m.wards + ' wards' : '')))] : null,
          mp ? [h('h4', null, 'Metropolitan police areas'), h('ul', { class: 'pills' }, mp.thanas.map((t) => pill(t, map.metro_thanas.some((x) => x.name === t) ? () => { on.th = true; sync(); pick({ level: 'thana', name: t }); } : null)))] : null,
          cc ? [h('h4', null, 'Post offices in the city (' + (cc.post_offices || []).length + ')'), h('ul', { class: 'pills' }, (cc.post_offices || []).map((o) => pill(o.name, null, o.postcode)))] : null,
          caveats([r.population_note, r.city_corporation_note].filter(Boolean)), sources(r.sources), editNote);
        return;
      }
      if (sel.level === 'upazila') {
        const u = upz[sel.name];
        put(p, h('h3', null, u.name), h('p', { class: 'sub' }, 'Upazila in ' + u.district + ' District'),
          dl([['Population (2022)', num(u.population_2022)], ['Area', u.area_km2 ? num(Math.round(u.area_km2)) + ' km²' : (u.area_km2_candidates ? 'sources disagree: ' + u.area_km2_candidates.join(' or ') + ' km²' : null)], ['Unions', String(u.union_count || (u.unions || []).length)]]),
          (u.municipalities || []).length ? [h('h4', null, 'Municipalities'), h('ul', { class: 'pills' }, u.municipalities.map((m) => pill(m.name, null, m.wards ? m.wards + ' wards' : '')))] : null,
          h('h4', null, 'Unions'), h('ul', { class: 'pills' }, (u.unions || []).map((n) => pill(n, mkp['n:' + u.name + '/' + n] ? () => { pick({ level: 'union', name: n, upazila: u.name }); } : null))),
          (u.police_stations || []).length ? [h('h4', null, 'Police stations'), h('ul', { class: 'pills' }, u.police_stations.map((s) => pill(s.name, null, s.basis === 'stated_current' ? '' : 'earlier record')))] : h('p', { class: 'small' }, 'No police station is named in the sources used.'),
          (u.post_offices || []).length ? [h('h4', null, 'Post offices (' + u.post_offices.length + ')'), h('ul', { class: 'pills' }, u.post_offices.map((o) => pill(o.name, null, o.postcode)))] : h('p', { class: 'small' }, 'No post offices are listed in the dataset used.'),
          caveats(u.notes), sources(u.sources), editNote);
        return;
      }
      if (sel.level === 'union') {
        const u = upz[sel.upazila];
        put(p, h('h3', null, sel.name + ' Union'), h('p', { class: 'sub' }, sel.upazila + ' upazila, ' + u.district + ' District'), h('p', null, 'A union is the smallest rural unit of local government. Names follow English Wikipedia and the boundary file, so spellings may differ from local usage.'), editNote);
        return;
      }
      if (sel.level === 'municipality') {
        const r = R[districtOf(sel.upazila)], m = (r.municipalities || []).find((x) => x.name === sel.name) || {};
        put(p, h('h3', null, sel.name + ' Municipality'), h('p', { class: 'sub' }, sel.upazila + ' upazila'), dl([['Wards', m.wards ? String(m.wards) : 'not stated in the sources used']]), editNote);
        return;
      }
      if (sel.level === 'ward') {
        const w = map.city_corporation_wards.find((x) => x.ward === sel.ward);
        put(p, h('h3', null, 'Ward ' + sel.ward), h('p', { class: 'sub' }, 'Chittagong City Corporation'), dl([['Police area', (w.thanas || []).join(', ')]]), h('p', { class: 'caveat' }, 'The open data used does not include ward names, populations or areas. Boundaries follow the 2020 boundary file.'), editNote);
        return;
      }
      if (sel.level === 'thana') {
        const w = map.city_corporation_wards.filter((x) => (x.thanas || []).includes(sel.name)).map((x) => x.ward).sort((a, b) => a - b);
        put(p, h('h3', null, sel.name), h('p', { class: 'sub' }, 'Metropolitan police area, Chittagong'), dl([['City wards', w.join(', ') || 'none found']]), editNote);
      }
    }
    function sync() { lbox.querySelectorAll('input').forEach((i, k) => { i.checked = on[LAYERS[k][0]]; }); applyLayers(); }
    function highlight() {
      nodes.forEach((p) => p.classList.remove('on'));
      const key = sel.level === 'upazila' ? 'u:' + sel.name : sel.level === 'union' ? 'n:' + sel.upazila + '/' + sel.name : sel.level === 'municipality' ? 'm:' + sel.name : sel.level === 'ward' ? 'w:' + sel.ward : sel.level === 'thana' ? 't:' + sel.name : null;
      if (key && mkp[key]) mkp[key].classList.add('on');
    }
    function pick(s) {
      if (s.level === 'union' || s.level === 'upazila') s.district = districtOf(s.level === 'union' ? s.upazila : s.name);
      sel = s; crumbs(); panel(); highlight(); applyLayers();
      let box = null;
      if (s.level === 'district') box = bbox(map.upazilas.filter((u) => u.district === s.name).map((u) => mkp['u:' + u.name]));
      else if (s.level === 'upazila') box = bbox([mkp['u:' + s.name]]);
      else if (s.level === 'union') box = bbox([mkp['n:' + s.upazila + '/' + s.name]]);
      else if (s.level === 'municipality') box = bbox([mkp['m:' + s.name]]);
      else if (s.level === 'ward') box = bbox([mkp['w:' + s.ward]]);
      else if (s.level === 'thana') box = bbox([mkp['t:' + s.name]]);
      zoomTo(box);
    }
    map.districts.forEach((d) => { const t = sv('text', {}); const pts = d.d.match(/-?\d+\.?\d*/g).map(Number); let sx = 0, sy = 0, n = 0; for (let i = 0; i < pts.length - 1; i += 2) { sx += pts[i]; sy += pts[i + 1]; n++; } t.setAttribute('x', (sx / n).toFixed(1)); t.setAttribute('y', (sy / n).toFixed(1)); t.textContent = d.name; labels.append(t); });
    lab(); $('map-credit').textContent = map.credit;
    pick({ level: 'home' });
  }

  /* ---------- videos, photos ---------- */
  function drawVideos(list) {
    const box = $('videos'); const ok = list.filter((v) => !['rejected', 'flagged', 'unavailable'].includes(v.status));
    if (!ok.length) { box.append(h('p', null, 'No videos have been added.')); return; }
    ok.forEach((v) => {
      /* A static thumbnail from YouTube; the link opens the video on YouTube in a new tab. No iframe is embedded. */
      const watch = 'https://www.youtube.com/watch?v=' + encodeURIComponent(v.id);
      const img = h('img', { src: 'https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/hqdefault.jpg', alt: v.label, loading: 'lazy', decoding: 'async' });
      const frame = h('a', { class: 'thumb', href: watch, target: '_blank', rel: 'noopener noreferrer' }, img, h('span', { class: 'play' }, h('span', { 'data-icon': 'play', 'aria-hidden': 'true' })), h('span', { class: 'vh' }, ' (opens on YouTube in a new tab)'));
      img.addEventListener('error', () => { img.remove(); frame.classList.add('nothumb'); frame.append(h('span', { class: 'tt' }, v.label)); });
      if (window.SiteIcons) window.SiteIcons.draw(frame);
      const rep = 'https://github.com/' + REPO + '/issues/new?labels=video-report&title=' + encodeURIComponent('[Video report] ' + v.id) + '&body=' + encodeURIComponent('Video: https://www.youtube.com/watch?v=' + v.id + '\n\nWhat is wrong (low quality, wrong language, unsuitable, broken)?\n');
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

  const fail = (id, msg) => (e) => { const n = $(id); if (n && !n.childElementCount) n.textContent = msg; };
  Promise.all([repoJSON('website/dadi/data/seed.json', 'dadi/data/seed.json').then(stats).catch(fail('s-all', '–')),
    repoJSON('website/data/facts.json', 'data/facts.json').then(drawText).catch(() => {}),
    Promise.all([repoJSON('website/data/admin.json', 'data/admin.json'), repoJSON('website/data/map-admin.json', 'data/map-admin.json')]).then(([a, m]) => atlas(a, m)).catch(fail('panel', 'The map could not be loaded. Check your connection and reload the page.')),
    repoJSON('website/data/videos.json', 'data/videos.json').then(drawVideos).catch(fail('videos', 'The videos could not be loaded.')),
    repoJSON('website/data/media.json', 'data/media.json').then(drawGallery).catch(() => {})]).then(liveNote);
  loadChanges();
})();
