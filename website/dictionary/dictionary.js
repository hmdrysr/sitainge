/* siṭaiṅge dictionary (CC0). Reads the project's own files from GitHub; falls back to a saved copy, then the bundled seed.
   Nothing is invented here: every word shown comes from a record in the repository, with its evidence level. */
(function () {
  'use strict';
  const D = window.DadiData, REPO = 'hmdrysr/sitainge', CACHE_KEY = 'sitainge-dictionary-v1', PAGE = 60;
  const view = document.getElementById('view'), statusEl = document.getElementById('status');
  const S = { index: null, q: '', dir: 'en', letter: '', kind: '', level: '', pos: '', source: '', shown: PAGE, built: '', live: false };
  let audio = null;

  /* ---------- tiny DOM helper ---------- */
  function h(tag, attrs, kids) {
    const el = document.createElement(tag);
    for (const k in (attrs || {})) {
      const v = attrs[k]; if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v; else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
    }
    [].concat(kids || []).forEach((c) => { if (c != null && c !== false) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  const fold = (s) => D.fold(s);

  /* ---------- data ---------- */
  const when = (iso) => { try { return new Date(iso).toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' }); } catch (e) { return iso; } };
  function setStatus(msg) { statusEl.textContent = msg; }
  function load(data, live) {
    const entries = (data.entries || []).filter((e) => e && e.state !== 'ARCHIVED');
    S.index = D.buildIndex(entries);
    S.index.all.forEach((e) => { e._s = fold([e.gloss].concat(e.spellings, e.ipa ? [e.ipa] : []).join(' | ')); e._gk = glossKeys(e.gloss); });
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
    if (first) { load(first, false); statusFor(from, first); } else { S.index = D.buildIndex([]); setStatus('No data could be loaded.'); }
    route();
    try {
      const d = await live(); writeCache(d); load(d, true);
      setStatus('Read from GitHub on ' + when(d.fetchedAt) + (d.partial ? ' (some files could not be read)' : '') + '.');
      const had = document.activeElement && document.activeElement.id === 'q'; route(true); if (had && document.getElementById('q')) document.getElementById('q').focus();
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
  function glossKeys(g) { return fold(g).replace(/\(.*?\)/g, ' ').split(/[^a-z]+/).filter((t) => t.length > 2 && !STOPW.has(t)); }
  const head = (e, dir) => (dir === 'en' ? e.gloss : (e.spellings[0] || e.form));
  const letterOf = (e, dir) => { const m = fold(head(e, dir)).match(/[a-z]/); return m ? m[0].toUpperCase() : '#'; };
  const LEVELS = {
    A: 'Level A: directly documented',
    B: 'Level B: independently confirmed',
    C: 'Level C: strongly supported, needs further confirmation',
    D: 'Level D: proposed',
    E: 'Level E: unknown',
    unassessed: 'Unassessed: not yet checked'
  };
  const levelText = (l) => LEVELS[l] || ('Level ' + l);
  function tier(e) { return e._trust >= 6 ? ['high', 'Higher support; open to correction'] : e._trust >= 2 ? ['mid', 'Some support'] : ['low', 'Unverified']; }
  const kindText = (k) => ({ word: 'word', sentence: 'sentence', text: 'text' }[k] || k);

  function facets() {
    if (S.facets) return S.facets;
    const f = { kind: new Set(), level: new Set(), pos: new Set(), source: new Set() };
    S.index.all.forEach((e) => { f.kind.add(e.kind); f.level.add(e.level); if (e.pos) f.pos.add(e.pos); if (e.source) f.source.add(e.source); });
    return (S.facets = f);
  }
  function matches(skipLetter) {
    const f = fold(S.q).trim(), dir = S.dir;
    let list = S.index.all.filter((e) => (!S.kind || e.kind === S.kind) && (!S.level || e.level === S.level) && (!S.pos || e.pos === S.pos) && (!S.source || e.source === S.source) && (!f || e._s.includes(f)));
    if (f) {
      const rank = (e) => { const hd = fold(head(e, dir)); return hd === f ? 0 : hd.startsWith(f) ? 1 : hd.includes(f) ? 2 : 3; };
      list = list.map((e) => [rank(e), e]).sort((a, b) => a[0] - b[0] || (fold(head(a[1], dir)) < fold(head(b[1], dir)) ? -1 : 1)).map((x) => x[1]);
    } else list = list.slice().sort((a, b) => { const x = fold(head(a, dir)), y = fold(head(b, dir)); return x < y ? -1 : x > y ? 1 : 0; });
    return skipLetter || !S.letter ? list : list.filter((e) => letterOf(e, dir) === S.letter);
  }

  /* ---------- list view ---------- */
  function listView() {
    const f = facets();
    const input = h('input', { type: 'search', id: 'q', class: 'search', placeholder: 'Search by English word, spelling or IPA', 'aria-label': 'Search the dictionary by English word, siṭaiṅga spelling or IPA', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'search', value: S.q });
    input.addEventListener('input', () => { S.q = input.value; S.letter = ''; S.shown = PAGE; results(); });
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Search direction' }, [['en', 'English → siṭaiṅga'], ['sit', 'siṭaiṅga → English']].map(([d, t]) =>
      h('button', { type: 'button', 'aria-pressed': S.dir === d ? 'true' : 'false', text: t, onclick: (ev) => { S.dir = d; S.letter = ''; S.shown = PAGE; seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === ev.currentTarget ? 'true' : 'false')); results(); } })));
    const sel = (key, label, opts, fmt) => {
      const s = h('select', { id: 'f-' + key }, [h('option', { value: '', text: 'All' })].concat(opts.map((o) => h('option', { value: o, text: fmt ? fmt(o) : o }))));
      s.value = S[key]; s.addEventListener('change', () => { S[key] = s.value; S.letter = ''; S.shown = PAGE; results(); });
      return h('label', { class: 'f' }, [label, s]);
    };
    const lvOrder = ['A', 'B', 'C', 'D', 'E', 'unassessed'];
    const filters = h('div', { class: 'row' }, [
      sel('kind', 'Kind', Array.from(f.kind).sort(), kindText),
      sel('level', 'Evidence', lvOrder.filter((l) => f.level.has(l)).concat(Array.from(f.level).filter((l) => lvOrder.indexOf(l) < 0)), (l) => (l === 'unassessed' ? 'Unassessed' : 'Level ' + l)),
      f.pos.size ? sel('pos', 'Part of speech', Array.from(f.pos).sort()) : null,
      f.source.size ? sel('source', 'Source', Array.from(f.source).sort()) : null
    ]);
    view.replaceChildren(
      h('h1', { text: 'Dictionary' }),
      h('p', { class: 'lede', text: 'Words and sentences of siṭaiṅga (Chittagonian) as recorded by contributors. Each entry shows its level of support.' }),
      h('form', { role: 'search', onsubmit: (e) => e.preventDefault() }, [input]),
      h('div', { class: 'row' }, [seg]), filters,
      h('div', { id: 'az', class: 'az', role: 'group', 'aria-label': 'Jump to letter' }),
      h('p', { id: 'count', class: 'count', 'aria-live': 'polite' }),
      h('div', { id: 'out' }));
    results();
  }
  function results() {
    const out = document.getElementById('out'); if (!out) return;
    const base = matches(true), list = S.letter ? base.filter((e) => letterOf(e, S.dir) === S.letter) : base;
    const have = new Set(base.map((e) => letterOf(e, S.dir)));
    const az = document.getElementById('az'); az.replaceChildren();
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').forEach((L) => {
      az.appendChild(h('button', { type: 'button', text: L, disabled: !have.has(L), 'aria-pressed': S.letter === L ? 'true' : 'false', 'aria-label': L === '#' ? 'Other characters' : 'Letter ' + L, onclick: () => { S.letter = S.letter === L ? '' : L; S.shown = PAGE; results(); } }));
    });
    const total = S.index.all.length;
    const nf = (n) => n.toLocaleString('en-CA'), ent = (n) => nf(n) + (n === 1 ? ' entry' : ' entries');
    document.getElementById('count').textContent = list.length === total ? ent(total) : nf(list.length) + ' of ' + ent(total);
    if (!list.length) {
      out.replaceChildren(h('div', { class: 'empty' }, [
        h('p', { text: !total ? 'No entries have been loaded.' : S.q.trim() ? 'No results for "' + S.q.trim() + '". Check the spelling or try a shorter search. The dictionary holds only what contributors have recorded, so a missing word has not been added yet.' : 'No entries match these filters. Clear a filter to see more entries.' }),
        S.q.trim() ? h('p', {}, [h('a', { href: 'https://github.com/' + REPO + '/issues/new?title=' + encodeURIComponent('Word request: ' + S.q) + '&body=' + encodeURIComponent('I looked for "' + S.q + '" and did not find it.\n'), rel: 'noopener', text: 'Request this word on GitHub' })]) : null]));
      return;
    }
    const ul = h('ul', { class: 'list' }, list.slice(0, S.shown).map((e) => {
      const a = S.dir === 'en' ? [e.gloss, e.spellings[0] || e.form] : [e.spellings[0] || e.form, e.gloss];
      const hw = S.dir === 'en' ? h('span', { text: a[0] }) : h('span', { class: 'hw', text: a[0] });
      const sec = S.dir === 'en' ? h('span', { class: 'hw', text: a[1] }) : h('span', { class: 'gl', text: a[1] });
      return h('li', {}, [h('a', { href: '#/e/' + encodeURIComponent(e.id) }, [hw, document.createTextNode(' · '), sec, h('span', { class: 'mini', text: e.level === 'unassessed' ? 'unassessed' : 'level ' + e.level }), e.kind !== 'word' ? h('span', { class: 'mini', text: kindText(e.kind) }) : null])]);
    }));
    out.replaceChildren(ul);
    if (list.length > S.shown) out.appendChild(h('p', { class: 'more' }, [h('button', { type: 'button', class: 'btn alt', text: 'Show more (' + (list.length - S.shown).toLocaleString('en-CA') + ' remaining)', onclick: () => { S.shown += PAGE; results(); } })]));
  }

  /* ---------- entry view ---------- */
  function row(dl, k, v) { if (v == null || v === '' || (Array.isArray(v) && !v.length)) return; dl.appendChild(h('dt', { text: k })); dl.appendChild(h('dd', {}, [].concat(v))); }
  function entryView(id) {
    const e = S.index.byId.get(id);
    const back = h('a', { href: '#/', class: 'back', text: '← All entries' });
    if (!e) { view.replaceChildren(back, h('div', { class: 'empty' }, [h('h1', { text: 'Entry not found' }), h('p', { text: 'No entry with the identifier ' + id + ' is in the data currently loaded. It may have been renamed, archived or not yet published.' })])); return; }
    const [tcls, ttxt] = tier(e), p = e._pron;
    const dl = h('dl', { class: 'facts' });
    row(dl, 'Spellings', e.spellings.length > 1 ? e.spellings.join(' · ') : e.spellings[0]);
    row(dl, 'IPA', e.ipa ? [h('span', { class: 'ipa', text: e.ipa }), ' (' + (e.ipaStatus || 'status unknown') + (e.ipaSource ? '; source: ' + e.ipaSource : '') + ')'] : 'None recorded.');
    row(dl, 'Meaning', e.gloss);
    row(dl, 'Part of speech', e.pos);
    row(dl, 'Form note', e.formNote);
    row(dl, 'Example', e.example);
    row(dl, 'Region', e.region || 'Not recorded.');
    row(dl, 'Evidence', [h('span', { class: 'badge ' + tcls, text: ttxt }), ' ' + levelText(e.level) + '.']);
    row(dl, 'Confidence', e.confidence);
    row(dl, 'Source', e.source || 'Not recorded.');
    row(dl, 'Record', e.id + ' (' + e.state.toLowerCase() + ', ' + kindText(e.kind) + ')');
    row(dl, 'Notes', e.notes);
    if (e.ai) row(dl, 'AI help', 'AI assisted in preparing this record. AI output is not counted as evidence.');

    const hearMsg = h('p', { class: 'note', role: 'status', 'aria-live': 'polite' });
    let hearNote;
    if (e.recording) hearNote = 'A recording is listed for this record. This page cannot yet play it.';
    else if (p.how === 'ipa') hearNote = 'No speaker recording exists for this entry. The button plays a computer voice reading the IPA. It is an approximation and may sound incorrect.';
    else if (p.how === 'reading') hearNote = 'No recording or IPA exists for this entry. The button plays a computer voice reading the spelling with the usual sounds of Latin letters. It is a rough guide, not evidence of how a speaker says the word.';
    else hearNote = 'Audio is unavailable: ' + p.status + '.';
    hearMsg.textContent = hearNote;
    const hear = h('button', { type: 'button', class: 'btn primary', disabled: p.how === 'none' || !window.DadiAudio, text: 'Play approximate sound', onclick: async () => {
      if (!audio) audio = window.DadiAudio.create({ settings: () => ({ engine: 'auto' }) });
      hear.disabled = true; const r = await audio.play(p.ipa); hear.disabled = false;
      hearMsg.textContent = hearNote + (r && r.ok ? ' Played with ' + (r.how === 'device' ? 'the device voice' : 'the built-in synthesizer') + '.' : ' Playback failed: ' + ((r && r.reason) || 'unknown reason') + '.');
    } });

    const hd = e.spellings[0] || e.form;
    const body = 'Entry: ' + e.id + '\nRecord file: ' + (e.path || 'unknown') + '\nShown as: ' + hd + ' = ' + e.gloss + '\n\nWhat should change, and how do you know (for example, you speak it, or a source says so)?\n';
    const related = relatedTo(e);
    view.replaceChildren(back, h('article', { class: 'entry' }, [
      h('h1', { text: hd }), h('p', { class: 'lede', text: e.gloss }), dl,
      h('div', { class: 'actions' }, [hear,
        h('a', { class: 'btn alt', rel: 'noopener', href: 'https://github.com/' + REPO + '/issues/new?title=' + encodeURIComponent('Correction: ' + e.id + ' ' + hd) + '&body=' + encodeURIComponent(body), text: 'Suggest a correction' }),
        e.path ? h('a', { class: 'btn alt', rel: 'noopener', href: 'https://github.com/' + REPO + '/edit/main/' + e.path, text: 'Edit this record on GitHub' }) : null]),
      hearMsg,
      related.length ? h('section', {}, [h('h2', { text: 'Related entries' }), h('ul', { class: 'list' }, related.map((r) => h('li', {}, [h('a', { href: '#/e/' + encodeURIComponent(r.id) }, [h('span', { class: 'hw', text: r.spellings[0] || r.form }), document.createTextNode(' · '), h('span', { class: 'gl', text: r.gloss })])])))]) : null]));
    document.title = hd + ' · Dictionary · siṭaiṅge';
  }
  function relatedTo(e) {
    if (!e._gk.length) return [];
    return S.index.all.filter((o) => o.id !== e.id && o._gk.some((k) => e._gk.indexOf(k) >= 0)).slice(0, 8);
  }
  /* ---------- router ---------- */
  function route(keepScroll) {
    if (!S.index) return;
    const m = location.hash.match(/^#\/e\/(.+)$/);
    document.title = 'Dictionary · siṭaiṅge';
    if (audio) audio.stop();
    if (m) { let id; try { id = decodeURIComponent(m[1]); } catch (e) { id = m[1]; } entryView(id); if (!keepScroll) window.scrollTo(0, 0); }
    else listView();
  }
  window.addEventListener('hashchange', () => route());
  start();
})();
