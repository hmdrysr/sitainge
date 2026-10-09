/* siṭaiṅge dictionary (CC0). Reads the project's own files from GitHub; falls back to a saved copy, then the bundled seed.
   Nothing is invented here: every word shown comes from a record in the repository, with its evidence level. */
(function () {
  'use strict';
  const D = window.DadiData, FZ = window.DictFuzzy, REPO = 'hmdrysr/sitainge', CACHE_KEY = 'sitainge-dictionary-v1', PAGE = 40;
  const view = document.getElementById('view'), statusEl = document.getElementById('status');
  const S = { index: null, fz: null, q: '', kind: '', level: '', region: '', sort: 'best', letter: '', shown: PAGE, list: [], fuzzy: false, sugg: null, open: null, pushed: false, facets: null };
  const el = {};

  /* ---------- tiny DOM helper ---------- */
  function h(tag, attrs, kids) {
    const n = document.createElement(tag);
    for (const k in (attrs || {})) {
      const v = attrs[k]; if (v == null || v === false) continue;
      if (k === 'text') n.textContent = v; else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
    }
    [].concat(kids || []).forEach((c) => { if (c != null && c !== false) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  const icon = (name, cls) => { const s = h('span', { class: 'ic' + (cls ? ' ' + cls : ''), 'data-icon': name, 'aria-hidden': 'true' }); return s; };
  const draw = (root) => { if (window.SiteIcons) window.SiteIcons.draw(root); };
  const nf = (n) => n.toLocaleString('en-CA');
  const fold = (s) => FZ.normalize(s);

  /* ---------- data ---------- */
  const when = (iso) => { try { return new Date(iso).toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' }); } catch (e) { return iso; } };
  // Variant groups and the attestation rule come from website/data/consensus.json (scripts/consensus.py). Best effort only.
  S.cons = {};
  fetch('../data/consensus.json').then((r) => r.ok ? r.json() : null).then((j) => { if (j && j.entries) S.cons = j.entries; }).catch(() => {});
  const VARIETY = { rohingya: 'Rohingya variety', chittagong: 'Chittagong variety' };
  function voteHref(e, kind, spelling) {
    const b = { entry_id: e.id, kind, spelling: kind === 'spelling' ? spelling : null, region: null };
    return 'https://github.com/' + REPO + '/issues/new?title=' + encodeURIComponent('[Vote] ' + e.id) + '&body=' + encodeURIComponent('A vote is a signal, not evidence. You may add your region inside the block.\n\n```json\n' + JSON.stringify(b, null, 1) + '\n```\n');
  }
  function variantsBox(e, hd) {
    const c = S.cons[e.id] && S.cons[e.id].auto, kids = [h('h3', { text: 'Variants' })];
    if (c && c.attestation && c.attestation.length) {
      kids.push(h('p', { class: 'small', text: c.preferred_form ? 'Preferred form: ' + c.preferred_form + ' (' + ({ 'most-attested': 'attested by the most independent sources', votes: 'chosen by spelling votes' }[c.preferred_basis] || 'attested identically by three independent sources at different times') + ').' : 'No preferred form yet: the variants are tied. Your vote helps break the tie.' }));
      kids.push(h('ul', { class: 'altl' }, c.attestation.map((a) => h('li', {}, [h('span', { text: a.form + ' · ' + a.groups + (a.groups === 1 ? ' source' : ' independent sources') + (a.form === c.preferred_form ? ' · preferred' : '') + ' ' }), h('a', { class: 'pill', rel: 'noopener', href: voteHref(e, 'spelling', a.form), text: 'Vote for this spelling' })]))));
    } else {
      kids.push(h('p', { class: 'small', text: 'No other source records this word yet.' }));
      kids.push(h('a', { class: 'pill', rel: 'noopener', href: voteHref(e, 'spelling', hd), text: 'Vote for ' + hd }));
    }
    kids.push(h('p', {}, [h('a', { class: 'pill', rel: 'noopener', href: voteHref(e, 'agree'), text: 'I use this' }), ' ', h('a', { class: 'pill', rel: 'noopener', href: voteHref(e, 'disagree'), text: 'I do not use this' })]));
    kids.push(h('p', { class: 'small', text: 'Votes are counted per GitHub account. They inform review and break ties between equally attested variants; they are not evidence.' }));
    return h('div', { class: 'variants' }, kids);
  }
  function setStatus(msg) { statusEl.textContent = msg; }
  function load(data, live) {
    const entries = (data.entries || []).filter((e) => e && e.state !== 'ARCHIVED');
    S.index = D.buildIndex(entries);
    S.index.all.forEach((e) => { e._gk = glossKeys(e.gloss); e._hw = fold(e.spellings[0] || e.form); e._en = fold(e.gloss); });
    S.fz = FZ.create(S.index.all);
    S.live = live; S.built = data.fetchedAt || data.builtAt || '';
    S.facets = null;
  }
  function readCache() { try { const c = JSON.parse(localStorage.getItem(CACHE_KEY)); return c && c.entries && c.entries.length ? c : null; } catch (e) { return null; } }
  function writeCache(d) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ entries: d.entries, files: d.files, fetchedAt: d.fetchedAt })); } catch (e) { /* storage may be blocked */ } }
  async function seed() { const r = await fetch('../dadi/data/seed.json'); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  async function live() {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 6000);
    try {
      const d = await D.scrape({ repo: REPO, fetch: (u, o) => fetch(u, Object.assign({}, o, { signal: ctl.signal })) });
      if (!d.entries.length) throw new Error('no entries came back');
      if (d.truncated || d.errors.length) d.partial = true;
      return d;
    } finally { clearTimeout(timer); }
  }
  async function start() {
    let first = readCache(), from = 'saved';
    if (!first) { try { first = await seed(); from = 'seed'; } catch (e) { first = null; } }
    build();
    if (first) { load(first, false); statusFor(from, first); } else { S.index = D.buildIndex([]); S.fz = FZ.create([]); setStatus('No data could be loaded.'); }
    refresh(); syncSheet();
    try {
      const d = await live(); writeCache(d); load(d, true);
      setStatus('Loaded from GitHub on ' + when(d.fetchedAt) + (d.partial ? ' (some files could not be read)' : '') + '.');
      refresh(); syncSheet();
    } catch (e) {
      if (first) statusFor(from, first, true);
    }
  }
  function statusFor(from, d, failed) {
    const t = d.fetchedAt || d.builtAt;
    setStatus('Showing ' + (from === 'saved' ? 'a saved copy from ' : 'the copy bundled with the site, dated ') + when(t) + (failed ? '. GitHub could not be reached.' : '. Checking GitHub…'));
  }

  /* ---------- helpers ---------- */
  const STOPW = new Set(['the', 'a', 'an', 'to', 'of', 'and', 'or', 'is', 'am', 'are', 'my', 'your', 'in', 'on', 'at', 'for', 'with', 'be', 'it', 'his', 'her', 'our', 'this', 'that']);
  function glossKeys(g) { return fold(g).split(' ').filter((t) => t.length > 2 && !STOPW.has(t)); }
  const headword = (e) => e.spellings[0] || e.form;
  const shortRegion = (r) => String(r || '').replace(/\s*\(.*$/, '').trim();
  const LEVELS = {
    A: 'Level A: directly documented',
    B: 'Level B: independently confirmed',
    C: 'Level C: strongly supported; further confirmation needed',
    D: 'Level D: proposed',
    E: 'Level E: unknown'
  };
  const levelText = (l) => (l === 'unassessed' ? 'Not yet assessed' : LEVELS[l] || ('Level ' + l));
  const IPA_STATUS = {
    none: 'No IPA is recorded.',
    'ai-drafted-unverified': 'Drafted by a computer tool and not yet checked by a speaker.',
    unknown: 'The source of this IPA is not recorded.'
  };
  const ipaWords = (st) => IPA_STATUS[st] || (String(st || '').replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase()) + '.');
  const verifyLine = (e) => (e.level === 'unassessed' || !e.level ? 'Not yet verified by a speaker.' : levelText(e.level) + '. Open to correction.');
  const isLong = (e) => e.kind !== 'word' || headword(e).length > 24;
  const showIpa = (e) => e.ipa && e.kind === 'word' && fold(e.ipa) !== fold(headword(e));
  const kindText = (k) => ({ word: 'Word', sentence: 'Sentence', text: 'Text' }[k] || k);
  const letterOf = (e) => { const m = e._hw.match(/[a-z]/); return m ? m[0].toUpperCase() : '#'; };

  function facets() {
    if (S.facets) return S.facets;
    const lv = new Set(), rg = new Set();
    S.index.all.forEach((e) => { lv.add(e.level || 'unassessed'); if (e.region) rg.add(shortRegion(e.region)); });
    const order = ['A', 'B', 'C', 'D', 'E', 'unassessed'];
    return (S.facets = { levels: order.filter((l) => lv.has(l)).concat(Array.from(lv).filter((l) => order.indexOf(l) < 0)), regions: Array.from(rg).sort() });
  }
  const pass = (e) => (!S.kind || e.kind === S.kind) && (!S.level || (e.level || 'unassessed') === S.level) && (!S.region || shortRegion(e.region) === S.region);
  const filterCount = () => (S.level ? 1 : 0) + (S.region ? 1 : 0) + (S.sort !== 'best' ? 1 : 0);

  /* ---------- search ---------- */
  function compute() {
    const q = S.q.trim(); S.sugg = null; S.fuzzy = false;
    let list;
    if (q) {
      const r = S.fz.search(q, { filter: pass });
      S.fuzzy = r.fuzzy; list = r.list.map((x) => x.e);
      if (!r.list.length || r.list[0].score > 3.5) S.sugg = S.fz.suggest(q);
      if (S.sort === 'sit') list.sort((a, b) => (a._hw < b._hw ? -1 : a._hw > b._hw ? 1 : 0));
      else if (S.sort === 'en') list.sort((a, b) => (a._en < b._en ? -1 : a._en > b._en ? 1 : 0));
    } else {
      list = S.index.all.filter(pass);
      const key = S.sort === 'en' ? '_en' : '_hw';
      list.sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
      if (S.letter) list = list.filter((e) => letterOf(e) === S.letter);
    }
    S.list = list;
  }

  /* ---------- page ---------- */
  function build() {
    const input = h('input', { type: 'search', id: 'q', class: 'q', placeholder: 'Search in siṭaiṅga or English', 'aria-label': 'Search the dictionary by siṭaiṅga, English or IPA', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'search' });
    let timer = 0;
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { S.q = input.value; S.letter = ''; S.shown = PAGE; refresh(); }, 90); toggleClear(); });
    const clear = h('button', { type: 'button', class: 'clear', 'aria-label': 'Clear search', hidden: true, onclick: () => { input.value = ''; S.q = ''; S.shown = PAGE; toggleClear(); refresh(); input.focus(); } }, [icon('x')]);
    function toggleClear() { clear.hidden = !input.value; }
    const field = h('form', { class: 'field', role: 'search', onsubmit: (ev) => { ev.preventDefault(); input.blur(); } }, [icon('search', 'lead'), input, clear]);

    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Entry type' }, [['', 'All'], ['word', 'Words'], ['sentence', 'Sentences']].map(([k, t]) =>
      h('button', { type: 'button', 'data-k': k, 'aria-pressed': S.kind === k ? 'true' : 'false', text: t, onclick: () => { S.kind = k; S.letter = ''; S.shown = PAGE; refresh(); } })));
    const filterBtn = h('button', { type: 'button', class: 'pill', 'aria-haspopup': 'dialog', onclick: openFilters }, [icon('filter'), h('span', { text: 'Filter' }), h('span', { class: 'dot', hidden: true })]);
    const count = h('p', { class: 'count', role: 'status', 'aria-live': 'polite' });
    const browse = h('div', { class: 'browse' });
    const out = h('div', { class: 'out' });

    const sheet = h('dialog', { class: 'sheet', 'aria-labelledby': 'sheet-title' });
    sheet.addEventListener('click', (ev) => { if (ev.target === sheet) closeSheet(); });
    sheet.addEventListener('cancel', (ev) => { ev.preventDefault(); closeSheet(); });
    const fsheet = h('dialog', { class: 'sheet', 'aria-labelledby': 'fsheet-title' });
    fsheet.addEventListener('click', (ev) => { if (ev.target === fsheet) fsheet.close(); });

    view.replaceChildren(
      h('div', { class: 'head' }, [h('h1', { text: 'Dictionary' }), h('p', { class: 'lede', text: 'Words and sentences in siṭaiṅga (Chittagonian), drawn from contributor records.' })]),
      h('div', { class: 'sticky' }, [field, h('div', { class: 'tools' }, [seg, filterBtn])]),
      count, browse, out, sheet, fsheet);
    Object.assign(el, { input, clear, seg, filterBtn, count, browse, out, sheet, fsheet, toggleClear });
    if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) input.focus();
    draw(view); wireSheet();
  }

  function refresh() {
    if (!S.index) return;
    compute();
    el.seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.getAttribute('data-k') === S.kind ? 'true' : 'false'));
    const fc = filterCount(); const dot = el.filterBtn.querySelector('.dot'); dot.hidden = !fc; dot.textContent = fc ? String(fc) : '';
    el.filterBtn.setAttribute('aria-label', 'Sort and filter' + (fc ? ', ' + fc + ' applied' : ''));
    renderBrowse(); renderList();
  }

  function renderBrowse() {
    const b = el.browse;
    if (S.q.trim() || !S.index.all.length) { b.replaceChildren(); b.hidden = true; return; }
    b.hidden = false;
    const have = new Set(); S.index.all.filter(pass).forEach((e) => have.add(letterOf(e)));
    const chips = ['All'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').filter((L) => have.has(L))).map((L) => {
      const v = L === 'All' ? '' : L;
      return h('button', { type: 'button', class: 'chip', 'aria-pressed': S.letter === v ? 'true' : 'false', 'aria-label': L === 'All' ? 'All letters' : L === '#' ? 'Other characters' : 'Letter ' + L, text: L, onclick: () => { S.letter = v; S.shown = PAGE; refresh(); } });
    });
    b.replaceChildren(
      h('div', { class: 'browse-top' }, [h('h2', { text: 'Browse' }), h('button', { type: 'button', class: 'pill', onclick: randomWord }, [icon('refresh'), h('span', { text: 'Random word' })])]),
      h('div', { class: 'chips', role: 'group', 'aria-label': 'Browse by first letter' }, chips));
    draw(b);
  }

  function row(e) {
    const badges = [];
    if (e.kind === 'sentence' || e.kind === 'text') badges.push(h('span', { class: 'tag', text: kindText(e.kind) }));
    if (e.level && e.level !== 'unassessed') badges.push(h('span', { class: 'tag lv', text: 'Level ' + e.level }));
    if (e.region) badges.push(h('span', { class: 'tag', text: shortRegion(e.region) }));
    return h('li', {}, [h('a', { class: 'row', href: '#/e/' + encodeURIComponent(e.id) }, [
      h('span', { class: 'rbody' }, [
        h('span', { class: 'rtop' }, [h('span', { class: 'hw' + (isLong(e) ? ' long' : ''), text: headword(e) }), showIpa(e) ? h('span', { class: 'ipa', text: e.ipa }) : null]),
        h('span', { class: 'gl', text: e.gloss }),
        badges.length ? h('span', { class: 'tags' }, badges) : null]),
      icon('chevron-right', 'go')])]);
  }

  function renderList() {
    const out = el.out, list = S.list, q = S.q.trim(), total = S.index.all.length;
    if (!total) {
      el.count.textContent = '';
      out.replaceChildren(h('div', { class: 'empty' }, [h('p', { class: 'etitle', text: 'No entries have been loaded.' }), h('p', { text: 'Check the connection and reload the page. Once the records have loaded, a saved copy will appear here on later visits.' })])); return;
    }
    el.count.textContent = q ? (list.length ? nf(list.length) + (list.length === 1 ? ' result' : ' results') + (S.fuzzy ? ' (including close spellings)' : '') : '') : (S.letter ? nf(list.length) + (list.length === 1 ? ' entry' : ' entries') + ' under ' + S.letter : nf(list.length) + (list.length === 1 ? ' entry' : ' entries'));
    if (!list.length) {
      const kids = [h('p', { class: 'etitle', text: q ? 'No match for “' + q + '”' : 'No entries match these filters' })];
      if (S.sugg) kids.push(h('p', {}, ['Did you mean ', h('button', { type: 'button', class: 'link', text: S.sugg, onclick: () => { el.input.value = S.sugg; S.q = S.sugg; el.toggleClear(); S.shown = PAGE; refresh(); } }), '?']));
      kids.push(h('p', { text: q ? 'Try the English meaning, a shorter spelling or fewer words. Variant spellings such as sh and s, or ph and f, are matched automatically. The dictionary holds only what contributors have recorded, so the word may not have been added yet.' : 'Remove a filter to see more entries.' }));
      const acts = [];
      if (S.kind || S.level || S.region) acts.push(h('button', { type: 'button', class: 'pill', text: 'Clear filters', onclick: () => { S.kind = S.level = S.region = ''; S.sort = 'best'; refresh(); } }));
      if (q) acts.push(h('a', { class: 'pill', href: 'https://github.com/' + REPO + '/issues/new?title=' + encodeURIComponent('Word request: ' + q) + '&body=' + encodeURIComponent('I looked for "' + q + '" and did not find it.\n'), rel: 'noopener', text: 'Request on GitHub' }));
      if (acts.length) kids.push(h('div', { class: 'eacts' }, acts));
      out.replaceChildren(h('div', { class: 'empty' }, kids)); return;
    }
    const ul = h('ul', { class: 'rows' });
    list.slice(0, S.shown).forEach((e) => ul.appendChild(row(e)));
    const kids = [];
    if (q && S.sugg) kids.push(h('p', { class: 'dym' }, ['Did you mean ', h('button', { type: 'button', class: 'link', text: S.sugg, onclick: () => { el.input.value = S.sugg; S.q = S.sugg; el.toggleClear(); S.shown = PAGE; refresh(); } }), '?']));
    kids.push(ul);
    kids.push(h('p', { class: 'small note', text: 'Entries without a level badge have not yet been verified by a speaker.' }));
    if (list.length > S.shown) kids.push(h('p', { class: 'more' }, [h('button', { type: 'button', class: 'btn', text: 'Show more (' + nf(list.length - S.shown) + ' remaining)', onclick: showMore })]));
    out.replaceChildren.apply(out, kids);
    draw(out);
  }
  function showMore() {
    const from = S.shown; S.shown += PAGE;
    const ul = el.out.querySelector('ul.rows'); if (!ul) return renderList();
    S.list.slice(from, S.shown).forEach((e) => ul.appendChild(row(e)));
    draw(ul);
    const more = el.out.querySelector('.more');
    if (S.list.length > S.shown) { const b = more.querySelector('button'); b.textContent = 'Show more (' + nf(S.list.length - S.shown) + ' remaining)'; b.focus(); } else { more.remove(); const last = ul.lastChild.querySelector('a'); if (last) last.focus(); }
  }
  function randomWord() {
    const pool = S.index.all.filter((e) => e.kind === 'word' && pass(e)); if (!pool.length) return;
    location.hash = '#/e/' + encodeURIComponent(pool[Math.floor(Math.random() * pool.length)].id);
  }

  /* ---------- sort and filter sheet ---------- */
  function group(title, name, opts, cur, set) {
    return h('fieldset', { class: 'grp' }, [h('legend', { text: title }), h('div', { class: 'opts' }, opts.map(([v, t]) =>
      h('button', { type: 'button', class: 'opt', 'aria-pressed': cur === v ? 'true' : 'false', text: t, onclick: (ev) => { set(v); ev.currentTarget.parentNode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === ev.currentTarget ? 'true' : 'false')); refresh(); } })))]);
  }
  function openFilters() {
    const f = facets(), d = el.fsheet;
    const body = [
      group('Sort by', 'sort', [['best', S.q.trim() ? 'Best match' : 'siṭaiṅga, A to Z'], ['sit', 'siṭaiṅga, A to Z'], ['en', 'English, A to Z']].filter((o, i, a) => !(i === 1 && !S.q.trim())), S.sort, (v) => { S.sort = v; }),
      group('Evidence level', 'level', [['', 'Any']].concat(f.levels.map((l) => [l, l === 'unassessed' ? 'Not yet assessed' : 'Level ' + l])), S.level, (v) => { S.level = v; S.letter = ''; S.shown = PAGE; })
    ];
    if (f.regions.length) body.push(group('Region', 'region', [['', 'Any']].concat(f.regions.map((r) => [r, r])), S.region, (v) => { S.region = v; S.letter = ''; S.shown = PAGE; }));
    d.replaceChildren(h('div', { class: 'shead' }, [h('h2', { id: 'fsheet-title', text: 'Sort and filter' }), h('button', { type: 'button', class: 'x', 'aria-label': 'Close', onclick: () => d.close() }, [icon('x')])]),
      h('div', { class: 'sbody' }, body.concat([h('p', { class: 'small', text: 'Evidence levels run from A (directly documented) to E (unknown). Every entry currently loaded is awaiting assessment, so the level filter may offer only one choice.' })])),
      h('div', { class: 'sfoot' }, [h('button', { type: 'button', class: 'btn', text: 'Reset', onclick: () => { S.sort = 'best'; S.level = S.region = ''; refresh(); openFilters(); } }), h('button', { type: 'button', class: 'btn primary', text: 'Done', onclick: () => d.close() })]));
    draw(d);
    if (!d.open) d.showModal();
  }

  /* ---------- entry sheet ---------- */
  function fact(dl, k, v) { if (v == null || v === '' || (Array.isArray(v) && !v.length)) return; dl.appendChild(h('dt', { text: k })); dl.appendChild(h('dd', {}, [].concat(v))); }
  function showEntry(id) {
    const d = el.sheet, e = S.index.byId.get(id);
    S.open = id;
    const close = h('button', { type: 'button', class: 'x', 'aria-label': 'Close', onclick: closeSheet }, [icon('x')]);
    if (!e) {
      d.replaceChildren(h('div', { class: 'shead' }, [h('h2', { id: 'sheet-title', text: 'Entry not found' }), close]), h('div', { class: 'sbody' }, [h('p', { text: 'The data currently loaded contains no entry with the identifier ' + id + '. It may have been renamed or archived, or it may not yet be published.' })]));
    } else {
      const hd = headword(e), others = e.spellings.filter((s) => s !== hd);
      const dl = h('dl', { class: 'facts' });
      fact(dl, 'IPA source', e.ipa ? e.ipaSource : null);
      fact(dl, 'Example', e.example);
      fact(dl, 'Part of speech', e.pos);
      fact(dl, 'Form note', e.formNote);
      if (e.variety) fact(dl, 'Variety', VARIETY[e.variety] || e.variety);
      if (e.variantOf) fact(dl, 'Original record', e.variantOf);
      if (e.attests && e.attests.length) fact(dl, 'Attests', e.attests.join(', '));
      fact(dl, 'Region', e.region || 'Not recorded');
      fact(dl, 'Source', e.source || 'Not recorded');
      fact(dl, 'Evidence', levelText(e.level));
      if (e.confidence) fact(dl, 'Confidence', e.confidence);
      fact(dl, 'Notes', e.notes);
      fact(dl, 'Record', e.id + ' (' + String(e.state || '').toLowerCase() + ', ' + kindText(e.kind).toLowerCase() + ')');
      if (e.ai) fact(dl, 'AI assistance', 'A computer tool helped prepare this record. Its output is not counted as evidence.');
      const body = body_(e, hd, others, dl);
      d.replaceChildren(h('div', { class: 'shead' }, [h('h2', { id: 'sheet-title', class: 'sr', text: hd }), close]), body,
        h('div', { class: 'sfoot' }, [
          h('a', { class: 'btn', rel: 'noopener', href: 'https://github.com/' + REPO + '/issues/new?title=' + encodeURIComponent('Correction: ' + e.id + ' ' + hd) + '&body=' + encodeURIComponent('Entry: ' + e.id + '\nRecord file: ' + (e.path || 'unknown') + '\nShown as: ' + hd + ' = ' + e.gloss + '\n\nWhat should change, and what is the basis for the change (for example, you speak it, or a source says so)?\n'), text: 'Suggest a fix' }),
          e.path ? h('a', { class: 'btn', rel: 'noopener', href: 'https://github.com/' + REPO + '/edit/main/' + e.path, text: 'Edit on GitHub' }) : null]));
    }
    draw(d);
    if (!d.open) d.showModal();
    const sb = d.querySelector('.sbody'); if (sb) sb.scrollTop = 0;
    document.title = (e ? headword(e) : 'Entry') + ' · Dictionary · siṭaiṅge';
  }
  function body_(e, hd, others, dl) {
    const kids = [
      h('p', { class: 'dhw' + (isLong(e) ? ' long' : ''), text: hd }),
      e.ipa ? h('div', { class: 'dipa' }, [h('span', { class: 'ipa', text: e.ipa }), h('p', { class: 'small', text: ipaWords(e.ipaStatus) })]) : h('p', { class: 'small', text: 'No IPA is recorded.' }),
      h('p', { class: 'dgl', text: e.gloss }),
      h('p', { class: 'verify' + (e.level === 'unassessed' || !e.level ? ' warn' : ' ok'), text: verifyLine(e) })
    ];
    if (others.length) kids.push(h('div', { class: 'alts' }, [h('p', { class: 'small', text: 'Other spellings' }), h('ul', { class: 'altl' }, others.map((s) => h('li', { text: s })))]));
    if (e.recording) {
      const r = String(e.recording), url = /^(https:\/\/|\.{0,2}\/)/.test(r);
      kids.push(h('div', { class: 'rec' }, [h('p', { class: 'small', text: 'Recording of a speaker' }), url ? h('audio', { controls: true, preload: 'none', src: r }) : h('p', { text: 'Listed as ' + r + '; it cannot be played here yet.' })]));
    }
    kids.push(variantsBox(e, hd));
    kids.push(dl);
    const rel = relatedTo(e);
    if (rel.length) kids.push(h('div', { class: 'rel' }, [h('h3', { text: 'Related entries' }), h('ul', { class: 'rows compact' }, rel.map((r) => h('li', {}, [h('a', { class: 'row', href: '#/e/' + encodeURIComponent(r.id) }, [h('span', { class: 'rbody' }, [h('span', { class: 'rtop' }, [h('span', { class: 'hw' + (isLong(r) ? ' long' : ''), text: headword(r) })]), h('span', { class: 'gl', text: r.gloss })]), icon('chevron-right', 'go')])])))]));
    return h('div', { class: 'sbody' }, kids);
  }
  function relatedTo(e) {
    if (!e._gk.length || e.kind !== 'word') return [];
    return S.index.all.filter((o) => o.id !== e.id && o.kind === 'word' && o._gk.some((k) => e._gk.indexOf(k) >= 0)).slice(0, 5);
  }
  function closeSheet() {
    if (!el.sheet.open) return;
    el.sheet.close();
  }

  /* ---------- routing: #/e/ID opens the entry sheet, so entries can be linked and the Back button closes the sheet ---------- */
  function syncSheet() {
    if (!S.index || !el.sheet) return;
    const m = location.hash.match(/^#\/e\/(.+)$/);
    if (m) { let id; try { id = decodeURIComponent(m[1]); } catch (e) { id = m[1]; } if (el.fsheet.open) el.fsheet.close(); if (!el.sheet.open || S.open !== id) showEntry(id); }
    else if (el.sheet.open) el.sheet.close();
  }
  function wireSheet() {
    el.sheet.addEventListener('close', () => {
      S.open = null; document.title = 'Dictionary · siṭaiṅge';
      if (/^#\/e\//.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; } }
      const back = el.lastLink && document.body.contains(el.lastLink) ? el.lastLink : null; if (back) back.focus();
    });
  }
  document.addEventListener('click', (ev) => { const a = ev.target.closest && ev.target.closest('a.row'); if (a) el.lastLink = a; });
  window.addEventListener('hashchange', syncSheet);
  start();
})();
