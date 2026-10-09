/* Dadi app shell: screens, routing and glue (CC0). Logic lives in the other files so it can be tested without a browser.
   Every string shown from data is inserted as text, never as HTML. Only the project's own bundled icons use innerHTML.
   Lesson logic is in js/learn.js; the specification is docs/dadi/LEARNING_DESIGN.md. */
(function () {
  'use strict';
  const CFG = Object.assign({ repo: 'hmdrysr/sitainge', branch: 'main', contactEmail: '', creator: 'Hamid Yasir', repoUrl: 'https://github.com/hmdrysr/sitainge' }, window.DADI_CONFIG || {});
  const Store = DadiStore.create();
  const S = () => Store.state;
  const audio = DadiAudio.create({ settings: () => S().settings });
  const gh = DadiGitHub.create({ clientId: CFG.githubClientId, relayUrl: CFG.relayUrl, repo: CFG.repo });
  const Data = DadiData, Srs = DadiSrs, Icons = DadiIcons;
  const pic = (g) => { try { return Icons.find(g); } catch (e) { return null; } };
  let index = Data.buildIndex([]), repoInfo = { from: 'none', at: null, errors: [], err: null };
  const main = document.getElementById('app'), layer = document.getElementById('layer'), dock = document.getElementById('kbdock');
  const kb = DadiKeyboard.create({ audio: { play: (t) => audio.play(t), playSymbol: (t) => audio.playSymbol(t) }, close: () => closeKeyboard(), suggest: (w) => wordSuggestions(w) });


  /* ---------- small helpers ---------- */
  function h(tag, props) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === 'class') e.className = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') e.innerHTML = v;
      else if (v === true) e.setAttribute(k, '');
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    for (const kid of Array.prototype.slice.call(arguments, 2).flat(Infinity)) {
      if (kid == null || kid === false) continue;
      e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return e;
  }
  function put(parent, ...kids) { parent.append(...kids.flat(Infinity).filter((k) => k != null && k !== false)); return parent; }
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const when = (iso) => { try { return new Date(iso).toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' }); } catch (e) { return iso; } };
  const uid = () => 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const signedIn = () => !!(S().auth && S().auth.token);

  let toastTimer = null;
  function toast(msg) {
    const old = document.querySelector('.toast'); if (old) old.remove();
    const t = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(t);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 4200);
  }

  /* one sheet at a time */
  let sheetClose = null;
  function sheet(content, opts) {
    closeSheet();
    const back = h('div', { class: 'backdrop' });
    const box = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': (opts && opts.label) || 'Details' }, h('div', { class: 'grab' }), content);
    layer.append(back, box); document.body.classList.add('sheet-open');
    const close = () => { back.remove(); box.remove(); sheetClose = null; document.body.classList.remove('sheet-open'); if (opts && opts.onClose) opts.onClose(); };
    back.addEventListener('click', close); sheetClose = close;
    box.setAttribute('tabindex', '-1'); box.style.outline = 'none'; box.focus({ preventScroll: true });
    return { close, box };
  }
  function closeSheet() { if (sheetClose) sheetClose(); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });


  function ask(title, body, yes, no) {
    return new Promise((resolve) => {
      const s = sheet(h('div', null, h('h2', null, title), body,
        h('div', { class: 'row', style: 'margin-top:14px' },
          h('button', { class: 'btn', type: 'button', onclick: () => { s.close(); resolve(true); } }, yes || 'Yes'),
          h('button', { class: 'btn ghost', type: 'button', onclick: () => { s.close(); resolve(false); } }, no || 'No'))), { label: title, onClose: () => resolve(false) });
    });
  }

  const LEVEL_TEXT = { A: 'A: directly recorded or documented', B: 'B: confirmed by several speakers or sources', C: 'C: strongly supported', D: 'D: proposed', E: 'E: unknown', unassessed: 'Not yet assessed' };


  /* ---------- data ---------- */
  function setEntries(entries) {
    index = Data.buildIndex(entries.map((e) => { const c = Object.assign({}, e); delete c._fold; delete c._pron; delete c._trust; return c; }));
    rebuildUnits();
  }
  /* ---------- whole-word suggestions for the keyboard ---------- */
  const foldW = (t) => String(t || '').normalize('NFD').toLowerCase().replace(/[̀-ͯ]/g, '').replace(/ɡ/g, 'g').replace(/[ːˑʰʱʲʷˈˌ.'’\-]/g, '').replace(/[^\p{L}]/gu, '');
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) { const cur = [i]; let best = i; for (let j = 1; j <= b.length; j++) { const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); cur.push(v); if (v < best) best = v; } if (best > max) return max + 1; prev = cur; }
    return prev[b.length];
  }
  let sugCache = { key: -1, list: [] };
  function wordSuggestions(word) {
    const w = foldW(word); if (w.length < 2) return [];
    if (sugCache.key !== index.all.length) {
      sugCache = { key: index.all.length, list: index.playable().filter((e) => e.kind === 'word' && e._pron && e._pron.complete && e._pron.ipa).map((e) => ({ id: e.id, ipa: e._pron.ipa, keys: [foldW(e._pron.ipa), foldW(e.spellings[0] || e.form)].filter(Boolean), gloss: e.gloss, rank: e._trust || 0 })) };
    }
    const max = w.length > 4 ? 2 : 1, out = [];
    for (const c of sugCache.list) {
      let best = 99;
      for (const k of c.keys) { const d = k.startsWith(w) ? (k.length - w.length) * 0.4 : lev(w, k, max); if (d < best) best = d; }
      if (best <= max + (w.length > 3 ? 1.2 : 0.2)) out.push({ c, d: best });
    }
    out.sort((a, b) => a.d - b.d || b.c.rank - a.c.rank);
    const seen = new Set(); return out.filter((x) => { if (seen.has(x.c.ipa)) return false; seen.add(x.c.ipa); return true; }).slice(0, 6).map((x) => ({ ipa: x.c.ipa, gloss: x.c.gloss }));
  }
  /* Live data: the project's own files on GitHub first, so a correction in the repository shows up without a new release.
     The last good copy is kept on this device and the bundled copy is the fallback. */
  async function repoJSON(path, local) {
    const key = 'dadi.cache.' + path, one = async (u, ms) => { const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms); try { const r = await fetch(u, { signal: ac.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); } };
    if (navigator.onLine) { try { const j = await one('https://raw.githubusercontent.com/' + CFG.repo + '/' + CFG.branch + '/' + path, 5000); try { localStorage.setItem(key, JSON.stringify(j)); } catch (e) { /* full */ } return j; } catch (e) { /* use the saved copy */ } }
    try { const c = localStorage.getItem(key); if (c) return JSON.parse(c); } catch (e) { /* none */ }
    return one(local, 8000);
  }
  async function loadSeed() {
    try { const r = await fetch('data/seed.json'); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } catch (e) { return null; }
  }
  async function refreshRepo(opts) {
    opts = opts || {};
    try {
      const r = await Data.scrape({ repo: CFG.repo, branch: CFG.branch, token: signedIn() ? S().auth.token : null });
      if (!r.entries.length) throw new Error('the repository contains no entries');
      Store.cacheRepo({ entries: r.entries, fetchedAt: r.fetchedAt, files: r.files });
      setEntries(r.entries); repoInfo = { from: 'github', at: r.fetchedAt, errors: r.errors, err: null };
      if (!opts.quiet) toast('The word list was updated from GitHub (' + index.all.length + ' entries).');
      if (/^#\/(learn|words|teach)?$/.test(location.hash) || !location.hash) route();
    } catch (e) {
      repoInfo.err = e.message;
      if (!opts.quiet) toast('The word list could not be updated from GitHub (' + e.message + '). The saved copy is displayed.');
    }
  }


  /* ---------- router ---------- */
  const ROUTES = [
    [/^#\/learn$/, learnView], [/^#\/session(?:\/([^/?]+))?$/, sessionView], [/^#\/check$/, checkView], [/^#\/progress$/, progressView], [/^#\/words$/, wordsView], [/^#\/(?:write|type)$/, writeView], [/^#\/watch$/, watchView],
    [/^#\/teach$/, teachView], [/^#\/teach\/new(?:\?(.*))?$/, teachNew], [/^#\/me$/, meView], [/^#\/about$/, aboutView]
  ];
  function nav(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function route() {
    audio.stop(); closeSheet(); closeKeyboard();
    let hash = location.hash || '#/learn';
    if (/^#\/(lesson\/\d+|review)$/.test(hash)) { hash = '#/session'; history.replaceState(null, '', hash); }   /* links from the earlier lesson design */
    if (CFG.requireSignIn && gh.configured && !signedIn() && !sessionStorageGet('dadi.skipgate')) { gateView(); setTab(''); return; }
    let m = null, fn = null;
    for (const [re, f] of ROUTES) { m = hash.match(re); if (m) { fn = f; break; } }
    main.textContent = '';
    if (!fn) { nav('#/learn'); return; }
    const seg = hash.split('/')[1].split('?')[0];
    document.body.classList.toggle('focus', seg === 'session' || seg === 'check');
    setTab(['session', 'check', 'progress', 'watch'].includes(seg) ? 'learn' : seg === 'type' ? 'write' : seg === 'about' ? 'me' : seg);
    try { fn(main, ...m.slice(1)); } catch (err) { failView(err); }
    window.scrollTo(0, 0);
  }
  /* If a screen cannot be drawn, say so and give a way out. A blank screen tells nobody anything. */
  function failView(err, where) {
    try { console.error('Dadi screen error', err); } catch (e) { /* none */ }
    const msg = (err && err.message) ? String(err.message).slice(0, 200) : 'Unknown error';
    put(where || main, h('div', { class: 'card' }, h('h2', null, 'This screen could not be shown'),
      h('p', null, 'Part of the saved data or the word list did not match what the program expected. Your progress has not been changed.'),
      h('p', { class: 'small muted' }, 'Technical detail: ' + msg),
      h('div', { class: 'stack', style: 'margin-top:16px' },
        h('a', { class: 'btn block', href: '#/learn' }, 'Back to Learn'),
        h('button', { class: 'btn block tint', type: 'button', onclick: () => { try { localStorage.removeItem('dadi.cache.website/data/themes.json'); } catch (e) { /* none */ } refreshRepo({}); } }, 'Update word list'))));
  }
  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function setTab(t) { document.querySelectorAll('.tabs a').forEach((a) => { if (a.dataset.tab === t) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); }
  window.addEventListener('hashchange', route);


  /* ---------- look: theme and colour scheme (no account needed) ---------- */
  const SCHEMES = [['indigo', 'Indigo', '#3447c9'], ['forest', 'Forest', '#1f7a50'], ['ocean', 'Ocean', '#0b6f8c'], ['plum', 'Plum', '#7a3b98'], ['contrast', 'High contrast', '#000000']];
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyLook() {
    const s = S().settings, t = s.theme || 'system', eff = t === 'system' ? (mq && mq.matches ? 'dark' : 'light') : t;
    const el = document.documentElement; el.setAttribute('data-theme', eff); el.setAttribute('data-scheme', s.scheme || 'indigo');
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', getComputedStyle(document.body).backgroundColor);
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', () => applyLook());
  function lookSheet() {
    let sh; const box = h('div');
    const set = (k, v) => { Store.update((st) => { st.settings[k] = v; }, 'settings', k + ' ' + v); applyLook(); redraw(); };
    function redraw() {
      const cur = S().settings; box.textContent = '';
      put(box, h('h2', null, 'Appearance'), h('p', { class: 'muted small' }, 'Saved on this device.'),
        h('h3', null, 'Theme'),
        h('div', { class: 'segc', role: 'group', 'aria-label': 'Theme' }, [['system', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']].map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String((cur.theme || 'system') === v), onclick: () => set('theme', v) }, t))),
        h('h3', null, 'Accent colour'),
        h('div', { class: 'swatches', role: 'group', 'aria-label': 'Accent colour' }, SCHEMES.map(([v, t, c]) => h('button', { type: 'button', class: 'swatch', 'aria-pressed': String((cur.scheme || 'indigo') === v), onclick: () => set('scheme', v) }, h('i', { style: 'background:' + c }), t))),
        h('button', { class: 'btn block', type: 'button', style: 'margin-top:24px', onclick: () => sh.close() }, 'Close'));
    }
    redraw(); sh = sheet(box, { label: 'Appearance' });
  }



  /* ---------- Write: sound keyboard and translator ---------- */
  let writeMode = 'keys', trText = '';
  function writeView(root) {
    put(root, h('h1', { class: 'title' }, 'Write'),
      h('p', { class: 'lede' }, writeMode === 'keys' ? 'Build a word from its sounds. Each key plays its sound when tapped.' : writeMode === 'chart' ? 'The International Phonetic Alphabet (IPA) chart. Tap a symbol to hear it.' : 'Replace English words with siṭaiṅga words from the project word list.'),
      h('div', { class: 'segc', role: 'group', 'aria-label': 'Mode' }, [['keys', 'Keyboard'], ['chart', 'Chart'], ['translate', 'Translate']].map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(writeMode === v), onclick: () => { writeMode = v; route(); } }, t))));
    const body = h('div', { class: 'sec' }); root.append(body);
    if (writeMode === 'keys') keysPane(body); else if (writeMode === 'chart') body.append(DadiChart.build({ play: (t) => audio.playSymbol(t) })); else translatePane(body);
  }
  function keysPane(body) {
    const field = h('textarea', { class: 'input ipa typebox', rows: '3', placeholder: 'Tap a key to start', 'aria-label': 'Sound input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const out = h('p', { class: 'muted small', 'aria-live': 'polite', style: 'margin-top:12px' });
    field.addEventListener('click', () => { if (dock.hidden) openKeyboard(field); });
    put(body, field,
      h('div', { class: 'row', style: 'margin-top:12px' },
        h('button', { class: 'btn', type: 'button', onclick: async () => { if (!field.value.trim()) { out.textContent = 'Enter a word first.'; return; } const r = await audio.play(field.value.trim()); out.textContent = r.ok ? (r.how === 'dadi' ? 'Played with the built-in synthesizer. This is an approximation.' : 'Played by a device or clear voice reading a similar-sounding spelling. This is an approximation.') : (r.reason || 'The sound could not be played.'); } }, 'Play word'),
        h('button', { class: 'btn tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(field.value); toast('Copied.'); } catch (e) { toast('The text could not be copied. Please select it and copy it manually.'); } } }, 'Copy'),
        h('a', { class: 'btn tint', href: '#/teach/new', onclick: (e) => { e.preventDefault(); nav('#/teach/new?ipa=' + encodeURIComponent(field.value.trim())); } }, 'Add as contribution')),
      out,
      h('div', { class: 'note' }, 'If you are unsure of a sound, tap the closest key. The strip above the keys offers neighbouring sounds; tap one to substitute it, then play the word. Sounds chosen this way are recorded as "chosen by ear", and reviewers treat them as leads rather than facts.'));
    openKeyboard(field);
  }
  let glossCache = null;
  const glossary = () => { const n = index.all.length; if (!glossCache || glossCache.n !== n) glossCache = { n, G: DadiTranslate.load(DadiTranslate.makeGlossary(index.all)) }; return glossCache.G; };
  function bookmarklet() {
    const base = new URL('./', location.href).href;
    return "javascript:(function(){var s=document.createElement('script');s.src='" + base + "js/translate.js';s.onload=function(){DadiTranslate.pageFromUrl('" + base + "data/glossary.json').catch(function(e){alert(e.message)})};document.body.appendChild(s)})()";
  }
  function translatePane(body) {
    const T = DadiTranslate, G = glossary();
    const input = h('textarea', { class: 'input', rows: '4', placeholder: 'Enter English text', 'aria-label': 'English text', autocapitalize: 'sentences' }, trText);
    const result = h('div', { class: 'card', hidden: true, 'aria-live': 'polite' }), aiBox = h('div');
    let last = null;
    function paint() {
      trText = input.value; aiBox.textContent = '';
      if (!trText.trim()) { result.hidden = true; last = null; return; }
      last = T.translate(trText, G); result.hidden = false; result.textContent = '';
      const out = h('div', { class: 'tr-out' }); last.parts.forEach((p) => out.append(p.t === 'hit' ? h('mark', { title: p.s + ' (' + (p.level === 'unassessed' ? 'evidence level not yet assessed' : 'evidence level ' + p.level) + ')' }, p.out) : p.s));
      const pct = Math.round(last.coverage * 100);
      put(result, out, h('div', { class: 'meter', role: 'img', 'aria-label': pct + '% of words replaced' }, h('i', { style: 'width:' + pct + '%' })),
        h('p', { class: 'small muted' }, last.hits + ' of ' + last.words + ' words replaced from the project word list. Highlighted words are unverified. All other words remain in English.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn small tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(T.plain(last)); toast('Copied.'); } catch (e) { toast('The text could not be copied.'); } } }, 'Copy'),
          h('button', { class: 'btn small tint', type: 'button', onclick: () => aiRun() }, DadiAI.ready(DadiAI.load()) ? 'Ask connected AI' : 'Copy AI prompt')));
    }
    async function aiRun() {
      const cfg = DadiAI.load(), prompt = DadiAI.buildPrompt(trText, last.parts.filter((p) => p.t === 'hit'), {});
      if (!DadiAI.ready(cfg)) { try { await navigator.clipboard.writeText(prompt); toast('Prompt copied. You can paste it into an AI service.'); } catch (e) { toast('The prompt could not be copied.'); } return; }
      aiBox.textContent = ''; aiBox.append(h('p', { class: 'muted small' }, h('span', { class: 'spin' }), 'Waiting for the AI service…'));
      try { const t = await DadiAI.ask(cfg, prompt); aiBox.textContent = ''; put(aiBox, h('div', { class: 'card', style: 'margin-top:12px' }, h('p', { class: 'small muted' }, 'AI draft, unverified. It is not evidence.'), h('div', { class: 'tr-out' }, t))); }
      catch (e) { aiBox.textContent = ''; aiBox.append(h('p', { class: 'err' }, e.message)); }
    }
    input.addEventListener('input', paint);
    const bm = h('textarea', { class: 'input', readonly: true, rows: '3', 'aria-label': 'Bookmarklet code', style: 'font-size:12px;font-family:ui-monospace,Menlo,monospace' }, bookmarklet());
    put(body, input, h('div', { class: 'stack', style: 'margin-top:12px' }, result, aiBox),
      h('div', { class: 'group-title' }, 'Translate a web page'),
      h('div', { class: 'card stack' },
        h('p', { class: 'small', style: 'margin:0' }, 'Create a bookmark whose address is the code below. Open a web page and select the bookmark, and the words on the page are replaced from the project word list; the Undo button restores the page. Some sites block bookmarklets. If a site does, paste its text into the box above instead.'),
        bm, h('button', { class: 'btn small tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(bm.value); toast('Code copied.'); } catch (e) { bm.select(); toast('Select the code and copy it manually.'); } } }, 'Copy bookmark code')),
      h('p', { class: 'group-foot' }, 'The translator replaces words one at a time. It does not apply siṭaiṅga grammar, so word order and endings remain those of English. Coverage will grow as speakers contribute words.'));
    paint();
  }



  /* ---------- first-time tour ---------- */
  const TOUR = [
    ['About Dadi', 'Dadi is a learning program from the siṭaiṅge project. It teaches siṭaiṅga, the Chittagonian language, using a word list that speakers are still reviewing.', ''],
    ['Learn', 'Each session takes 8 to 10 minutes. Reviews that are due come first, followed by up to five new items from a single unit.', 'learn'],
    ['Words', 'A searchable list of all entries, each with its verification status and source.', 'words'],
    ['Write', 'A sound keyboard that suggests whole words, the IPA chart, and a translator that uses only words from the project word list.', 'write'],
    ['Teach', 'Contribute a word, an alternative form or a correction. Nothing leaves this device until you choose to send it.', 'teach'],
    ['Me', 'Voice, appearance, backups and data. Everything is stored on this device, and signing in with GitHub is optional.', 'me']
  ];
  function tour(start) {
    let i = start || 0; const box = h('div'); let sh;
    const hl = (t) => { document.querySelectorAll('.tour-hl').forEach((n) => n.classList.remove('tour-hl')); const n = t ? document.querySelector('.tabs a[data-tab="' + t + '"]') : null; if (n) n.classList.add('tour-hl'); };
    const finish = () => { hl(''); Store.update((st) => { st.settings.tourDone = true; }, 'settings', 'tour done'); if (sh) sh.close(); };
    function draw() {
      const [title, text, target] = TOUR[i]; hl(target); box.textContent = '';
      put(box, h('p', { class: 'small muted' }, (i + 1) + ' of ' + TOUR.length), h('h2', null, title), h('p', null, text),
        h('div', { class: 'stack', style: 'margin-top:16px' },
          i < TOUR.length - 1 ? h('button', { class: 'btn block', type: 'button', onclick: () => { i++; draw(); } }, 'Continue') : h('button', { class: 'btn block', type: 'button', onclick: finish }, 'Close'),
          h('div', { class: 'row' }, i > 0 ? h('button', { class: 'link', type: 'button', onclick: () => { i--; draw(); } }, 'Back') : null,
            i < TOUR.length - 1 ? h('button', { class: 'link', type: 'button', onclick: finish }, 'Skip') : null)));
    }
    draw(); sh = sheet(box, { label: 'Tour', onClose: () => { hl(''); Store.update((st) => { st.settings.tourDone = true; }, 'settings', 'tour closed'); } });
  }


  /* ---------- keyboard dock ---------- */
  function openKeyboard(field, onChange) {
    dock.hidden = false; document.body.classList.add('kb-open');
    kb.mount(dock, field);
    if (onChange) field.addEventListener('input', onChange);
    field.focus({ preventScroll: true }); field.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function closeKeyboard() { dock.hidden = true; dock.textContent = ''; document.body.classList.remove('kb-open'); kb.unmount(); }



  /* ---------- units and learning state ---------- */
  const L = DadiLearn;
  let themes = null, units = [], poolCache = { n: -1, list: [] };
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));
  const dot = (t) => (/[.!?]$/.test(t) ? t + ' ' : t + '. ');
  const learnState = () => S().learn;
  const itemOf = (id) => (S().learn.items[id]) || {};
  const entryName = (e) => L.display(e);
  function ico(name, size) { return h('span', { class: 'ic s' + (size || 24), 'aria-hidden': 'true', html: Icons.ui(name) || '' }); }
  function icoSlug(slug, size) { return h('span', { class: 'ic s' + (size || 24), 'aria-hidden': 'true', html: (slug && Icons.get(slug)) || Icons.ui('dictionary') || '' }); }
  function teachable() {
    if (poolCache.n !== index.all.length) poolCache = { n: index.all.length, list: index.all.filter((x) => x.kind !== 'text' && !L.hasBlank(x) && L.display(x).length <= 60 && x.gloss.length <= 60) };
    return poolCache.list;
  }
  function rebuildUnits() {
    units = themes ? L.buildUnits(themes, index.byId) : [];
    if (!units.length) {                                    /* no theme file reachable: plain sets of ten, in the order of the word list */
      const words = teachable().filter((e) => e.kind === 'word'); const out = [];
      for (let i = 0; i < words.length; i += 10) out.push({ id: 'set-' + (i / 10 + 1), title: 'Words, set ' + (i / 10 + 1), stage: 1, icon: 'book', pictures: false, summary: '', items: words.slice(i, i + 10).map((e) => e.id) });
      units = out;
    }
  }
  async function loadThemes() {
    try { const r = await fetch('../data/themes.json'); if (r.ok) themes = await r.json(); } catch (e) { themes = themes || null; }
    rebuildUnits();
    repoJSON('website/data/themes.json', '../data/themes.json').then((j) => {         /* the repository copy wins when it differs */
      if (j && Array.isArray(j.units) && JSON.stringify(j) !== JSON.stringify(themes)) { themes = j; rebuildUnits(); if (/^#\/learn$/.test(location.hash || '#/learn')) route(); }
    }).catch(() => { /* the bundled copy stays */ });
  }
  const stageName = (n) => 'Stage ' + n + '. ' + ((themes && themes.stages && themes.stages[n]) || '');
  const unitById = (id) => units.find((u) => u.id === id);
  const unitStrength = (u) => { const now = new Date(); const cs = u.items.map((id) => Srs.retrievability(S().cards[id], now)); return cs.reduce((a, b) => a + b, 0) / (cs.length || 1); };
  const lroute = () => S().learn.route;
  const knownMap = () => (lroute() === 'some' ? Object.fromEntries(Object.keys(S().learn.items).filter((id) => S().learn.items[id].known).map((id) => [id, true])) : {});
  const minutesFor = (plan) => Math.max(2, Math.min(10, Math.round((plan.reviews.length + plan.fresh.length * 5 + plan.interleave.length) * 12 / 60)));
  const makePlan = (unitId) => L.buildSession({ cards: S().cards, items: S().learn.items, units, byId: index.byId, unitId: unitId || null, now: new Date() });
  const dueCount = () => L.totals(S().learn.items, S().cards, new Date(), index.byId).due;

  /* ---------- family notes, suggested spellings, paused items ---------- */
  function noteSheet(e) {
    const prior = S().learn.notes.filter((n) => n.entryId === e.id);
    const fam = h('input', { class: 'input ipa', id: 'n-form', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const txt = h('textarea', { class: 'input', id: 'n-note' });
    let sh;
    sh = sheet(h('div', null, h('h2', null, 'This differs in my family'),
      h('p', { class: 'muted' }, entryName(e) + ', "' + e.gloss + '". Your note is kept as data and is not treated as an error.'),
      h('label', { class: 'f', for: 'n-form' }, 'How your family says or writes it', h('span', { class: 'f-hint' }, 'Optional')), fam,
      h('label', { class: 'f', for: 'n-note' }, 'Note', h('span', { class: 'f-hint' }, 'For example, who says it this way, or where.')), txt,
      prior.length ? h('p', { class: 'small muted', style: 'margin-top:12px' }, plural(prior.length, 'earlier note') + ' on this entry.') : null,
      h('div', { class: 'stack', style: 'margin-top:24px' },
        h('button', { class: 'btn block', type: 'button', onclick: () => {
          if (!fam.value.trim() && !txt.value.trim()) { toast('Enter a form or a note first.'); return; }
          Store.update((st) => { st.learn.notes.push({ id: uid(), entryId: e.id, form: entryName(e), gloss: e.gloss, family: fam.value.trim(), note: txt.value.trim(), t: new Date().toISOString() }); }, 'learn-note', e.id, e.id);
          sh.close(); toast('Note saved on this device.');
        } }, 'Save note'),
        h('button', { class: 'link', type: 'button', onclick: () => sh.close() }, 'Cancel'))), { label: 'This differs in my family' });
  }
  function suggestSpelling(e, typed) {
    Store.update((st) => { st.learn.suggestions.push({ id: uid(), entryId: e.id, form: entryName(e), gloss: e.gloss, typed, t: new Date().toISOString() }); }, 'learn-suggestion', typed, e.id);
    toast('Spelling saved on this device. It can be exported from Me.');
  }
  function leechSheet(e) {
    const txt = h('textarea', { class: 'input', id: 'l-note', 'aria-label': 'Memory note' }); let sh;
    sh = sheet(h('div', null, h('h2', null, 'This item is paused'),
      h('p', null, 'You have missed ' + entryName(e) + ' (' + e.gloss + ') ' + L.SESSION.leechLapses + ' times, so its reviews are paused. You may add a memory note or skip this step. The item can be resumed from Words.'),
      h('label', { class: 'f', for: 'l-note' }, 'Memory note', h('span', { class: 'f-hint' }, 'Optional. For example, a word or image that it brings to mind.')), txt,
      h('div', { class: 'stack', style: 'margin-top:24px' },
        h('button', { class: 'btn block', type: 'button', onclick: () => { const v = txt.value.trim(); if (v) Store.update((st) => { st.learn.items[e.id].note = v; }, 'learn-memory-note', v, e.id); sh.close(); } }, 'Save note'),
        h('button', { class: 'link', type: 'button', onclick: () => sh.close() }, 'Skip'))), { label: 'Item paused' });
  }

  /* ---------- Learn ---------- */
  let videosCache = null;
  async function loadVideos() {
    if (videosCache) return videosCache;
    try { videosCache = (await repoJSON('website/data/videos.json', '../data/videos.json')).filter((v) => !['rejected', 'flagged', 'unavailable'].includes(v.status)); } catch (e) { videosCache = []; }
    const lvl = { beginner: 0, general: 1, intermediate: 1 };
    videosCache.sort((a, b) => (a.featured_rank || 99) - (b.featured_rank || 99) || (lvl[a.level] == null ? 1 : lvl[a.level]) - (lvl[b.level] == null ? 1 : lvl[b.level]) || (a.status === 'approved' ? 0 : 1) - (b.status === 'approved' ? 0 : 1));
    return videosCache;
  }
  const videoSub = (v) => v.channel + (v.status === 'approved' ? '' : '. Not yet checked by a moderator');
  function videoRow(v) {
    const fallback = h('span', { class: 'vrow-ic' }, ico('play'));
    const img = h('img', { class: 'vimg', src: 'https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/mqdefault.jpg', alt: '', width: '112', height: '63', loading: 'lazy', decoding: 'async' });
    const thumb = h('span', { class: 'vth' }, img, h('span', { class: 'vplay', 'aria-hidden': 'true' }, ico('play', 16)));
    img.addEventListener('error', () => thumb.replaceWith(fallback));
    return h('button', { class: 'cell go vcell', type: 'button', onclick: () => videoSheet(v) }, thumb,
      h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, v.label || v.title), h('span', { class: 'cell-s' }, videoSub(v))));
  }
  function learnView(root) {
    const st = S(), plan = makePlan(null), todo = plan.reviews.length + plan.fresh.length;
    put(root, h('p', { class: 'eyebrow' }, 'siṭaiṅge'), h('h1', { class: 'title' }, 'Learn'), h('p', { class: 'lede' }, 'Practise siṭaiṅga in sessions of 8 to 10 minutes. Reviews come first, followed by up to five new items.'));
    const vsec = h('section', { class: 'sec', style: 'margin-top:0', hidden: true }); root.append(vsec);
    loadVideos().then((vs) => {
      if (!vsec.isConnected || !vs.length) return; vsec.hidden = false; vsec.textContent = '';
      put(vsec, h('div', { class: 'sh' }, h('h2', null, 'Watch'), vs.length > 3 ? h('a', { href: '#/watch' }, 'See all ' + vs.length) : null), h('div', { class: 'group' }, vs.slice(0, 3).map(videoRow)),
        h('p', { class: 'group-foot' }, 'Videos by speakers and teachers. They are loaded from YouTube only when you tap play.'));
    });
    if (!st.learn.route) {
      put(root, h('div', { class: 'card', style: 'margin-top:16px' }, h('h2', null, 'Where are you starting?'),
        h('p', { class: 'muted second' }, 'This choice affects only how much is shown before you are tested. You can change it later in Me.'),
        h('div', { class: 'stack' },
          h('button', { class: 'btn tint block', type: 'button', onclick: () => chooseRoute('some') }, 'I understand some'),
          h('button', { class: 'btn tint block', type: 'button', onclick: () => chooseRoute('zero') }, 'I am starting from zero'))));
    }
    const total = L.totals(st.learn.items, st.cards, new Date(), index.byId);
    if (todo) {
      put(root, h('div', { class: 'today' }, h('h2', null, 'Next session'),
        h('p', null, [plural(plan.reviews.length, 'review'), plural(plan.fresh.length, 'new item')].join(', ') + '. About ' + plural(minutesFor(plan), 'minute') + '.' +
          (plan.paused ? ' New items are paused because ' + plan.dueTotal + ' reviews are due.' : '') + (plan.dueTotal > plan.reviews.length ? ' ' + (plan.dueTotal - plan.reviews.length) + ' more reviews are waiting for the next session.' : '')),
        h('a', { class: 'btn block', href: '#/session' }, 'Start session')));
    } else if (!units.length) {
      put(root, h('div', { class: 'today' }, h('h2', null, 'No items to learn yet'), h('p', null, 'The word list is empty. Please check your connection, or contribute words from the Teach tab.'), h('a', { class: 'btn block', href: '#/teach/new' }, 'Add a word')));
    } else {
      const next = Object.values(st.cards).map((c) => new Date(c.due)).sort((a, b) => a - b)[0];
      put(root, h('div', { class: 'today' }, h('h2', null, 'Nothing to practise now'), h('p', null, next ? 'The next review is due in ' + Srs.label(next, new Date()) + '. You may also open any unit below.' : 'Open any unit below.')));
    }
    if (units.length) {
      put(root, h('div', { class: 'stat-row', style: 'margin-top:16px' },
        h('div', { class: 'stat' }, h('b', null, String(total.met)), h('span', null, 'items met')),
        h('div', { class: 'stat' }, h('b', null, String(total.twice)), h('span', null, 'recalled on two days')),
        h('div', { class: 'stat' }, h('b', null, String(total.due)), h('span', null, 'due now'))));
      const rec = L.recommendedUnit(units, st.learn.items, st.cards);
      for (const stg of [1, 2, 3, 4]) {
        const us = units.filter((u) => u.stage === stg); if (!us.length) continue;
        put(root, h('div', { class: 'group-title' }, stageName(stg)), h('div', { class: 'group' }, us.map((u) => {
          const p = L.unitProgress(u, st.learn.items, st.cards), s = unitStrength(u);
          return h('button', { class: 'cell go', type: 'button', onclick: () => unitSheet(u) }, h('span', { class: 'cell-ic' }, icoSlug(u.icon)),
            h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, u.title),
              h('span', { class: 'cell-s' }, plural(p.total, 'item') + '. ' + (p.done ? 'Done.' : p.met ? p.met + ' met, ' + p.twice + ' recalled on two days.' : 'Not started.') + (rec && rec.id === u.id ? ' Recommended next.' : ''))),
            p.met ? h('span', { class: 'unit-meter', role: 'img', 'aria-label': 'Strength estimate ' + Math.round(s * 100) + '%' }, h('span', { class: 'meter' }, h('i', { style: 'width:' + Math.round(s * 100) + '%' }))) : null);
        })));
      }
      put(root, h('div', { class: 'group', style: 'margin-top:24px' }, h('a', { class: 'cell go', href: '#/progress' }, h('span', { class: 'cell-ic' }, ico('chart')), h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, 'Progress and history')))));
    }
    put(root, h('p', { class: 'footnote' }, 'The word list is still under review. If an entry differs from the way your family speaks, please ', h('a', { href: '#/teach/new?action=report' }, 'tell us'), '.'));
  }
  function chooseRoute(r) {
    Store.update((st) => { st.learn.route = r; }, 'learn-route', r);
    if (r === 'some') {
      const s = sheet(h('div', null, h('h2', null, 'Quick check'), h('p', null, 'Twenty items, about three minutes. Items you answer correctly will skip the preview step in lessons. Nothing is scored against you.'),
        h('div', { class: 'stack', style: 'margin-top:24px' }, h('button', { class: 'btn block', type: 'button', onclick: () => { s.close(); nav('#/check'); } }, 'Start the check'), h('button', { class: 'link', type: 'button', onclick: () => { s.close(); route(); } }, 'Not now'))), { label: 'Quick check' });
    } else route();
  }
  function unitSheet(u) {
    const st = S(), p = L.unitProgress(u, st.learn.items, st.cards), s = unitStrength(u);
    sheet(h('div', null, h('h2', null, u.title), u.summary ? h('p', { class: 'muted' }, u.summary) : null,
      h('p', { class: 'second' }, plural(p.total, 'item') + '. ' + p.met + ' met, ' + p.twice + ' recalled correctly on two different days. A unit is complete when 80% of its items have been recalled on two days.'),
      p.met ? h('p', { class: 'small muted' }, 'Strength: about ' + Math.round(s * 100) + '% (estimate, based on your answers).') : null,
      h('div', { class: 'group', style: 'margin:16px 0 24px' }, u.items.map((id) => {
        const e = index.byId.get(id), it = itemOf(id), n = (it.days || []).length;
        return h('div', { class: 'cellwrap' }, h('div', { class: 'ipa', style: 'font-size:20px;font-weight:600' }, entryName(e)), h('div', { class: 'muted second' }, e.gloss),
          h('div', { class: 'small muted' }, (it.suspended ? 'Paused. ' : '') + (n >= 2 ? 'Recalled on two days.' : st.cards[id] || it.seen ? 'Met.' : 'Not met yet.') + ' ' + L.verification(e).label + '.'));
      })),
      h('a', { class: 'btn block', href: '#/session/' + encodeURIComponent(u.id), onclick: () => closeSheet() }, 'Study this unit')), { label: u.title });
  }
  function videoSheet(v) {
    const frame = h('div', { class: 'vframe' }, h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?rel=0&playsinline=1', title: v.label || v.title, allow: 'encrypted-media; picture-in-picture', allowfullscreen: '', referrerpolicy: 'strict-origin-when-cross-origin' }));
    sheet(h('div', null, frame, h('h2', { style: 'margin-top:16px' }, v.label || v.title), h('p', { class: 'muted second' }, v.channel + '. ' + (v.status === 'approved' ? 'Checked by a moderator.' : 'Not yet checked by a moderator.') + ' The video loads from YouTube (privacy-enhanced player) only after you tap play.'),
      h('div', { class: 'row' }, h('button', { class: 'btn small tint', type: 'button', onclick: () => { closeSheet(); reportSheet({ kind: 'video', id: v.id, label: v.label || v.title }); } }, 'Report a problem'), h('a', { class: 'btn small tint', href: 'https://www.youtube.com/watch?v=' + encodeURIComponent(v.id), target: '_blank', rel: 'noopener noreferrer' }, 'Open on YouTube'))), { label: v.label || v.title });
  }
  async function watchView(root) {
    put(root, h('h1', { class: 'title' }, 'Watch'), h('p', { class: 'lede' }, 'Videos by people who speak or teach siṭaiṅga. Each video is checked by a moderator. Please report any that are incorrect.'));
    const g = h('div', { class: 'group' }); root.append(g);
    const vs = await loadVideos(); if (!g.isConnected) return;
    if (!vs.length) { g.replaceWith(h('div', { class: 'card' }, 'No videos are available. Please check your connection and try again.')); return; }
    vs.forEach((v) => g.append(videoRow(v)));
  }
  /* Reports: a video, a photo or any entry. Signed in: sent as an issue. Otherwise: a prefilled GitHub page or copied text. */
  function reportSheet(what) {
    what = what || { kind: 'content', id: '', label: '' };
    const reasons = what.kind === 'video' ? [['low-quality', 'Poor quality or hard to follow'], ['wrong-language', 'Not siṭaiṅga, or mostly another language'], ['inaccurate', 'Teaches incorrect forms'], ['unsuitable', 'Unsuitable or offensive'], ['broken', 'Does not play'], ['other', 'Other']] : [['inaccurate', 'Contains an error'], ['low-quality', 'Poor quality'], ['unsuitable', 'Unsuitable or offensive'], ['other', 'Other']];
    const why = h('select', { class: 'input', id: 'r-why' }, reasons.map(([v, t]) => h('option', { value: v }, t)));
    const note = h('textarea', { class: 'input', id: 'r-note', rows: '3' });
    const title = '[' + (what.kind === 'video' ? 'Video' : 'Content') + ' report] ' + (what.id || what.label || 'general');
    const text = () => title + '\n\nItem: ' + (what.label || '') + (what.id ? ' (' + what.id + ')' : '') + '\nProblem: ' + why.value + '\nDetails: ' + (note.value.trim() || 'none') + '\n';
    let sh;
    const box = h('div', null, h('h2', null, 'Report a problem'), h('p', { class: 'muted second' }, what.label ? 'About: ' + what.label : 'Describe the content that should be corrected or removed.'), h('label', { class: 'f', for: 'r-why' }, 'Problem'), why, h('label', { class: 'f', for: 'r-note' }, 'Details', h('span', { class: 'f-hint' }, 'Optional. Include anything that would help a moderator.')), note,
      h('div', { class: 'stack', style: 'margin-top:24px' },
        signedIn() ? h('button', { class: 'btn block', type: 'button', onclick: async () => { try { await gh.createIssue(S().auth.token, { title, body: text() }); sh.close(); toast('Report sent.'); } catch (e) { toast('The report was not sent: ' + e.message); } } }, 'Send report') : null,
        h('a', { class: 'btn block' + (signedIn() ? ' tint' : ''), target: '_blank', rel: 'noopener noreferrer', href: CFG.repoUrl + '/issues/new?labels=' + (what.kind === 'video' ? 'video-report' : 'content-report') + '&title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(text()), onclick: () => { Store.update((st) => { st.stats.reports = (st.stats.reports || 0) + 1; }, 'report', what.kind + ' ' + (what.id || '')); } }, 'Open on GitHub'),
        h('button', { class: 'btn block tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(text()); toast('Report copied. You can now send it to a moderator.'); } catch (e) { toast('The report could not be copied.'); } } }, 'Copy report')),
      h('p', { class: 'group-foot' }, 'Reports are public on GitHub. Please do not include personal details.'));
    sh = sheet(box, { label: 'Report a problem' });
  }

  /* ---------- sessions ---------- */
  function sessionView(root, unitId) {
    const plan = makePlan(unitId ? decodeURIComponent(unitId) : null);
    const steps = L.planSteps(plan, { known: knownMap() });
    if (!steps.length) {
      put(root, h('h1', { class: 'title' }, 'Nothing to practise'), h('p', { class: 'lede' }, plan.paused ? 'Too many reviews are waiting, so new items are paused.' : 'No reviews are due and this unit has no new items left.'), h('a', { class: 'btn', href: '#/learn' }, 'Back to Learn'));
      return;
    }
    const u = unitById(plan.unitId);
    runSession(root, steps, { plan, title: unitId && u ? u.title : 'Session', kind: 'session' });
  }
  function checkView(root) {
    const ids = []; for (const u of units) for (const id of u.items) { const e = index.byId.get(id); if (e && L.canType(e) && !S().cards[id]) ids.push(id); }
    const pick = shuffle(ids.slice(0, 40)).slice(0, 20);
    if (!pick.length) { nav('#/learn'); return; }
    runSession(root, pick.map((id) => ({ t: 'check', id })), { plan: { fresh: [], reviews: [], unitId: null }, title: 'Quick check', kind: 'check' });
  }

  function runSession(root, steps, meta) {
    let pos = 0, total = steps.length, ended = false;
    const t0 = new Date(), rated = new Set(), seen = new Map(), counts = { fresh: new Set(meta.plan.fresh), review: new Set(), graded: 0, first: 0 };
    const thread = h('span', { class: 'thread', role: 'progressbar', 'aria-label': 'Progress', 'aria-valuemin': '0', 'aria-valuemax': '100' }, h('i', { style: 'width:0%' }));
    const stage = h('div', { class: 'stage', tabindex: '-1' });
    const leave = () => { endSession(false); nav('#/learn'); };
    put(root, h('div', { class: 'lesson-top' }, h('button', { class: 'x', type: 'button', onclick: leave }, ico('close', 20), 'Leave'), thread, h('span', { class: 'small muted', 'aria-live': 'off' }, meta.title)), stage);
    const progress = () => { const v = Math.min(100, Math.round(pos / total * 100)); thread.firstChild.style.width = v + '%'; thread.setAttribute('aria-valuenow', String(v)); };
    const newN = () => Array.from(seen.keys()).filter((id) => counts.fresh.has(id)).length;
    function endSession(done) {
      if (ended) return; ended = true;
      if (meta.kind === 'check') { Store.update((st) => { st.learn.checked = new Date().toISOString(); }, 'learn-check', done ? 'finished' : 'left early'); return; }
      if (!seen.size) return;
      Store.update((st) => { st.learn.sessions.push({ start: t0.toISOString(), end: new Date().toISOString(), newItems: newN(), reviews: seen.size - newN(), items: seen.size, completed: !!done, unit: meta.plan.unitId || '' }); }, 'learn-session', (done ? 'finished: ' : 'left early: ') + seen.size + ' items');
    }
    function next() {
      try { step(); } catch (err) { failView(err, stage); stage.append(h('button', { class: 'link', type: 'button', onclick: () => { try { next(); } catch (e2) { /* stays on the message */ } } }, 'Skip this item')); }
    }
    function step() {
      audio.stop(); stage.textContent = ''; progress();
      if (pos >= steps.length) return finish();
      const s = steps[pos++], e = index.byId.get(s.id); if (!e) return next();
      stage.dataset.step = s.t;
      const done = (res) => { record(s, e, res); if (!res.correct && s.t !== 'check') { steps.splice(Math.min(steps.length, pos + 3), 0, { t: 'again', id: s.id, kind: res.kind }); total++; } leechCheck(e); next(); };
      if (s.t === 'preview') previewStep(stage, e, () => { markSeen(e.id); next(); });
      else if (s.t === 'check') exercise(stage, 'meaning', e, false, done);
      else if (s.t === 'meaning') exercise(stage, 'meaning', e, false, done);
      else if (s.t === 'second') exercise(stage, pictureFor(e) ? 'picture' : 'g2f', e, false, done);
      else if (s.t === 'produce') exercise(stage, produceKind(e, false), e, false, done);
      else if (s.t === 'delayed') exercise(stage, produceKind(e, true), e, true, done);
      else if (s.t === 'again') exercise(stage, s.kind || 'meaning', e, false, done);
      else { counts.review.add(e.id); exercise(stage, reviewKind(e), e, true, done); }
      if (s.t !== 'preview') { const f = stage.querySelector('input.field'); if (f) f.focus({ preventScroll: true }); }
    }
    function markSeen(id) { Store.update((st) => { const it = ensureItem(st, id); if (!it.seen) it.seen = new Date().toISOString(); }, 'learn-seen', id, id); }
    function ensureItem(st, id) { return st.learn.items[id] || (st.learn.items[id] = { seen: '', days: [], lapses: 0, builds: 0 }); }
    function leechCheck(e) {
      const c = S().cards[e.id], it = itemOf(e.id);
      if (c && !it.suspended && (c.lapses || 0) - (it.leechBase || 0) >= Srs.LEECH_LAPSES) {
        Store.update((st) => { ensureItem(st, e.id).suspended = true; }, 'learn-leech', 'paused after ' + c.lapses + ' lapses', e.id); leechSheet(e);
      }
    }
    function record(s, e, res) {
      const graded = !!res.graded && s.t !== 'again', now = new Date(), day = L.dayOf(now.toISOString());
      const rating = graded ? L.ratingFor(res) : '';
      const first = res.correct && res.attempts === 1 && !res.hint;
      let state = '';
      Store.update((st) => {
        const it = ensureItem(st, e.id);
        if (!it.seen) it.seen = now.toISOString();
        if (s.t === 'check') { it.known = !!first; return; }
        if (res.kind === 'build' && res.correct) it.builds = (it.builds || 0) + 1;
        if (graded && !rated.has(e.id)) {
          rated.add(e.id); st.cards[e.id] = Srs.review(st.cards[e.id], rating, now); state = st.cards[e.id].state;
          it.lapses = st.cards[e.id].lapses || 0;
          if (res.correct && res.attempts === 1) { it.days = it.days || []; if (it.days.indexOf(day) < 0) it.days.push(day); }
        }
      }, 'learn-answer', (res.kind || '') + (res.correct ? ' correct' : ' missed'), e.id);
      Store.logReview([e.id, now.toISOString(), res.kind || '', res.correct ? 1 : 0, L.timeBucket(res.ms || 0), res.hint ? 1 : 0, rating, state]);
      if (s.t === 'check') return;
      const prev = seen.get(e.id);
      if (!prev || (graded && !prev.graded)) seen.set(e.id, { graded: graded || (prev && prev.graded), first: first, correct: res.correct });
      else if (prev && !first) prev.first = false;
      if (graded && rated.has(e.id)) { counts.graded++; if (first) counts.first++; }
    }
    function finish() {
      endSession(true);
      if (meta.kind === 'check') {
        const known = steps.filter((x) => x.t === 'check' && itemOf(x.id).known).length, n = steps.filter((x) => x.t === 'check').length;
        put(stage, h('div', { class: 'body' }, h('h1', { class: 'title' }, 'Check complete'), h('p', { class: 'lede' }, known + ' of ' + n + ' answered correctly on the first try. Those items will skip the preview step; the rest will be taught in full.')),
          h('div', { class: 'actions' }, h('a', { class: 'btn block', href: '#/learn' }, 'Back to Learn')));
        return;
      }
      const rows = Array.from(seen.entries()).map(([id, r]) => { const e = index.byId.get(id); return h('div', { class: 'cell' }, h('span', { class: r.first ? 'ok' : 'muted' }, ico(r.first ? 'check' : 'info')),
        h('span', { class: 'cell-main' }, h('span', { class: 'cell-t ipa' }, entryName(e)), h('span', { class: 'cell-s' }, dot(e.gloss) + (r.first ? 'Recalled on the first try.' : r.correct ? 'Recalled after a hint or a second attempt.' : 'Missed. It will return shortly.')))); });
      const dues = Array.from(seen.keys()).map((id) => S().cards[id]).filter(Boolean).map((c) => new Date(c.due)).sort((a, b) => a - b);
      put(stage, h('div', { class: 'body' }, h('h1', { class: 'title' }, 'Session complete'),
        h('p', { class: 'lede' }, plural(seen.size, 'item') + ' practised: ' + newN() + ' new, ' + (seen.size - newN()) + ' reviewed. ' + (counts.graded ? counts.first + ' of ' + counts.graded + ' graded answers were correct on the first attempt.' : '')),
        rows.length ? h('div', { class: 'group' }, rows) : null,
        dues.length ? h('p', { class: 'group-foot' }, 'Next review: in ' + Srs.label(dues[0], new Date()) + '. Scheduling is an estimate based on your answers.') : null,
        h('p', { class: 'footnote' }, 'The word list is still under review. If an entry differs from the way your family speaks, please tell us.')),
        h('div', { class: 'actions' }, h('a', { class: 'btn block', href: '#/learn' }, 'Done'), h('a', { class: 'link', href: '#/progress' }, 'See progress')));
    }
    next();
  }

  /* ---------- exercises ---------- */
  const pictureFor = (e) => { const u = L.unitOf(units, e.id); return u && u.pictures ? Icons.find(e.gloss) : null; };
  const previewPicture = (e) => Icons.find(e.gloss);
  function produceKind(e, delayed) {
    if (!L.canType(e)) return 'build';
    return lroute() === 'some' || (itemOf(e.id).builds || 0) >= 2 ? 'type' : 'build';
  }
  function reviewKind(e) {
    const it = itemOf(e.id), c = S().cards[e.id];
    if (L.canType(e) && (lroute() === 'some' || (it.builds || 0) >= 2 || (it.days || []).length >= 2)) return 'type';
    if (!L.canType(e)) return (c && (c.reps || 0) % 2) ? 'build' : 'meaning';
    return (c && (c.reps || 0) % 2) ? 'g2f' : 'meaning';
  }
  /* Lessons never use a computer voice. A Listen button appears only when the entry has a public recording by a speaker. */
  const hearButton = (e) => audio.has(e)
    ? h('button', { class: 'btn small tint', type: 'button', onclick: () => audio.playRecording(e) }, ico('volume', 20), 'Listen') : null;
  const statusLabel = (e) => h('span', { class: 'vlabels' }, h('span', { class: 'vlabel' }, L.verification(e).label), consBadges(e));

  function previewStep(stage, e, next) {
    const pic = previewPicture(e), alt = e.spellings.slice(1);
    const ipaLine = h('p', { class: 'ipa second', hidden: true }, '/' + (e.ipa || '') + '/ ', h('span', { class: 'small muted' }, 'IPA from a contributor. Unverified.'));
    const ipaBtn = e.ipa ? h('button', { class: 'link small', type: 'button', onclick: () => { ipaLine.hidden = !ipaLine.hidden; ipaBtn.textContent = ipaLine.hidden ? 'Show IPA' : 'Hide IPA'; } }, 'Show IPA') : null;
    put(stage, h('div', { class: 'body' }, h('p', { class: 'kind' }, 'New item'),
      pic ? h('div', { class: 'picbox', html: pic }) : null,
      h('div', { class: 'word' + (entryName(e).length > 24 ? ' long' : '') }, entryName(e)),
      h('p', { class: 'meaning' }, e.gloss + (e.formNote && e.formNote.length <= 30 ? ' (' + e.formNote + ')' : '')),
      h('p', null, statusLabel(e)),
      alt.length ? h('p', { class: 'second muted' }, 'Also written: ' + alt.join(', ')) : null,
      e.example ? h('p', { class: 'second' }, 'Example: ' + e.example) : null,
      ipaBtn, ipaLine, hearButton(e)),
      h('div', { class: 'actions' }, h('button', { class: 'btn block', type: 'button', onclick: next }, 'Continue'), h('button', { class: 'link', type: 'button', onclick: () => noteSheet(e) }, 'This differs in my family')),
      h('p', { class: 'footnote' }, 'The word list is still under review. If an entry differs from the way your family speaks, please tell us.'));
  }

  /* One function for every exercise. kind: meaning | picture | g2f | build | type. Calls done({ correct, attempts, hint, ms, kind, graded }). */
  function exercise(stage, kind, e, graded, done) {
    const t0 = Date.now(), pool = teachable(), u = L.unitOf(units, e.id), unitItems = u ? u.items : [];
    let attempts = 0, hint = false, over = false;
    const body = h('div', { class: 'body' }), actions = h('div', { class: 'actions' }), live = h('div', { 'aria-live': 'polite' });
    const labels = { meaning: 'Meaning', picture: 'Picture match', g2f: 'Choose the form', build: 'Build the ' + (e.spellings[0] && /\s/.test(entryName(e)) ? 'phrase' : 'word'), type: 'Type the word' };
    put(body, h('p', { class: 'kind' }, labels[kind]));
    const finish = (correct) => { over = true; done({ correct, attempts, hint, ms: Date.now() - t0, kind, graded }); };
    const fb = (good, title, lines) => {
      live.textContent = '';
      put(live, h('div', { class: 'fb ' + (good ? 'good' : 'neutral') }, ico(good ? 'success' : 'info'), h('div', null, h('b', null, title), (lines || []).filter(Boolean).map((l) => h('p', null, l)))));
    };
    const nextBtn = (good) => { actions.textContent = ''; put(actions, h('button', { class: 'btn block', type: 'button', onclick: () => finish(good) }, 'Continue'), h('button', { class: 'link', type: 'button', onclick: () => noteSheet(e) }, 'This differs in my family')); const b = actions.querySelector('.btn'); if (b) b.focus({ preventScroll: true }); };
    const firstLetter = (t) => { const g = L.graphemes(t.replace(/^[^\p{L}\p{N}]+/u, ''))[0]; return g || ''; };
    const reveal = () => { fb(false, 'Answer: ' + entryName(e) + ', "' + e.gloss + '"', ['This item will return shortly.']); nextBtn(false); };
    const extraLine = () => (e.spellings.length > 1 ? 'Also written: ' + e.spellings.slice(1).join(', ') : null);
    const correctNow = () => { fb(true, 'Correct.', [extraLine()]); nextBtn(true); };

    if (kind === 'meaning' || kind === 'picture' || kind === 'g2f') {
      const byForm = kind !== 'meaning', n = kind === 'g2f' ? 3 : 2;
      const ds = L.pickDistractors(e, pool, n, { unitItems, byForm, kind: e.kind === 'word' ? 'word' : undefined });
      const options = shuffle([e].concat(ds)).map((x) => ({ x, ok: x.id === e.id, text: byForm ? entryName(x) : x.gloss }));
      const pic = kind === 'picture' ? Icons.find(e.gloss) : null;
      if (kind === 'meaning') put(body, h('div', { class: 'word' + (entryName(e).length > 24 ? ' long' : '') }, entryName(e)), h('p', { class: 'prompt' }, 'What does this mean?'), hearButton(e));
      else { if (pic) put(body, h('div', { class: 'picbox', html: pic })); put(body, h('p', { class: 'prompt' }, byForm ? 'Which form means "' + e.gloss.replace(/\.$/, '') + '"?' : '')); }
      const list = h('div', { class: 'opts', role: 'group', 'aria-label': 'Answers' });
      options.forEach((o) => {
        const b = h('button', { class: 'opt' + (byForm ? ' form' : ''), type: 'button' }, o.text);
        b.addEventListener('click', () => {
          if (over || b.disabled) return; attempts++;
          if (o.ok) { b.classList.add('right'); Array.from(list.children).forEach((c) => { c.disabled = true; }); correctNow(); return; }
          b.disabled = true; b.classList.add('miss');
          if (attempts === 1) {
            hint = true; const p2 = kind === 'meaning' ? previewPicture(e) : null;
            fb(false, 'Not quite. Please try again.', ['Hint: the answer starts with "' + firstLetter(byForm ? entryName(e) : e.gloss) + '".']);
            if (p2) live.firstChild.querySelector('div').append(h('div', { class: 'picbox', style: 'margin:12px 0 0', html: p2 }));
          } else {
            Array.from(list.children).forEach((c) => { c.disabled = true; if (c.textContent === (byForm ? entryName(e) : e.gloss)) c.classList.add('right'); });
            reveal();
          }
        });
        list.append(b);
      });
      put(body, list, live);
      actions.append(h('button', { class: 'link', type: 'button', onclick: () => { if (over) return; attempts = 2; hint = true; Array.from(list.children).forEach((c) => { c.disabled = true; if (c.textContent === (byForm ? entryName(e) : e.gloss)) c.classList.add('right'); }); reveal(); } }, 'Show answer'));
    } else if (kind === 'type') {
      put(body, h('p', { class: 'meaning', style: 'font-weight:600' }, e.gloss), h('p', { class: 'prompt' }, 'Type the siṭaiṅga word.'));
      const input = h('input', { class: 'field', type: 'text', id: 'ans', 'aria-label': 'Your answer', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'done', lang: 'x-sitainga' });
      const check = h('button', { class: 'btn block', type: 'button' }, 'Check');
      const submit = () => {
        if (over || input.disabled) return;
        const m = L.matchAnswer(input.value, e, pool);
        if (m.result === 'empty') { toast('Enter an answer first.'); return; }
        attempts++;
        if (m.correct) {
          input.disabled = true;
          if (m.result === 'also' || m.result === 'alt') fb(true, 'Also correct.', ['This word has more than one written form.', 'Forms on record: ' + Array.from(new Set([entryName(e), m.matched].concat(m.other ? [entryName(m.other)] : []))).join(', ')]);
          else if (m.result === 'folded') fb(true, 'Correct.', ['Written form: ' + entryName(e) + (extraLine() ? '. ' + extraLine() : '')]);
          else correctNow();
          nextBtn(true); return;
        }
        if (attempts === 1) { hint = true; fb(false, 'Not quite. Please try again.', ['Hint: it starts with "' + firstLetter(entryName(e)) + '".']); input.select(); return; }
        input.disabled = true;
        const typed = input.value.trim();
        fb(false, 'Answer: ' + entryName(e), ['That form is not in the word list. It may be a valid spelling that has not yet been recorded.', 'This item will return shortly.']);
        nextBtn(false);
        const sg = h('button', { class: 'link', type: 'button', onclick: () => { suggestSpelling(e, typed); sg.disabled = true; sg.textContent = 'Spelling saved'; } }, 'Suggest this spelling'); actions.prepend(sg);
      };
      check.addEventListener('click', submit); input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); submit(); } });
      put(body, input, live); actions.append(check, h('button', { class: 'link', type: 'button', onclick: () => { if (over) return; attempts = 2; hint = true; input.disabled = true; reveal(); } }, 'Show answer'));
    } else if (kind === 'build') {
      const B = L.buildTiles(e, pool); const placed = [];
      put(body, h('p', { class: 'meaning', style: 'font-weight:600' }, e.gloss), h('p', { class: 'prompt' }, B.byWord ? 'Tap the words in order.' : 'Tap the letters in order.'));
      const slots = h('div', { class: 'slots', 'aria-label': 'Your answer', 'aria-live': 'polite' }), bank = h('div', { class: 'bank', role: 'group', 'aria-label': 'Available tiles' });
      const check = h('button', { class: 'btn block', type: 'button', disabled: true }, 'Check');
      const paint = () => {
        slots.textContent = ''; bank.textContent = '';
        placed.forEach((i, k) => slots.append(h('button', { class: 'tilebtn', type: 'button', 'aria-label': 'Remove ' + B.tiles.find((x) => x.i === i).t, onclick: () => { if (over) return; placed.splice(k, 1); paint(); } }, B.tiles.find((x) => x.i === i).t)));
        B.tiles.forEach((tl) => { if (placed.indexOf(tl.i) < 0) bank.append(h('button', { class: 'tilebtn', type: 'button', onclick: () => { if (over) return; placed.push(tl.i); paint(); } }, tl.t)); });
        check.disabled = !placed.length;
      };
      check.addEventListener('click', () => {
        if (over || !placed.length) return;
        const built = placed.map((i) => B.tiles.find((x) => x.i === i).t).join(B.byWord ? ' ' : ''); attempts++;
        const m = L.matchAnswer(built, e, pool);
        if (m.correct) { slots.querySelectorAll('button').forEach((b) => { b.disabled = true; }); bank.querySelectorAll('button').forEach((b) => { b.disabled = true; }); correctNow(); check.hidden = true; return; }
        if (attempts === 1) { hint = true; fb(false, 'Not quite. Please try again.', ['Hint: it starts with "' + firstLetter(B.parts[0]) + '".']); return; }
        bank.querySelectorAll('button').forEach((b) => { b.disabled = true; }); slots.querySelectorAll('button').forEach((b) => { b.disabled = true; }); check.hidden = true; reveal();
      });
      paint(); put(body, slots, bank, live);
      actions.append(check, h('button', { class: 'link', type: 'button', onclick: () => { if (over) return; placed.length = 0; paint(); } }, 'Clear'), h('button', { class: 'link', type: 'button', onclick: () => { if (over) return; attempts = 2; hint = true; check.hidden = true; bank.querySelectorAll('button').forEach((b) => { b.disabled = true; }); reveal(); } }, 'Show answer'));
    }
    put(stage, body, actions);
  }

  /* ---------- Words (word list) ---------- */
  let wordFilter = { q: '', kind: 'all', ipaOnly: false };
  function wordsView(root) {
    const input = h('input', { class: 'search', type: 'search', placeholder: 'Search words and meanings', 'aria-label': 'Search the word list', value: wordFilter.q, autocomplete: 'off' });
    const list = h('div', { class: 'group' }), count = h('p', { class: 'group-foot', 'aria-live': 'polite' });
    const chip = (label, key, val, pressed) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(pressed), onclick: () => { if (key === 'ipaOnly') wordFilter.ipaOnly = !wordFilter.ipaOnly; else wordFilter.kind = val; paint(); chips.replaceWith((chips = makeChips())); } }, label);
    const makeChips = () => h('div', { class: 'chips' }, chip('All', 'kind', 'all', wordFilter.kind === 'all'), chip('Words and phrases', 'kind', 'word', wordFilter.kind === 'word'),
      chip('Sentences', 'kind', 'text', wordFilter.kind === 'text'), chip('With IPA', 'ipaOnly', null, wordFilter.ipaOnly));
    let chips = makeChips();
    function paint() {
      wordFilter.q = input.value;
      let r = index.search(wordFilter.q);
      if (wordFilter.kind === 'word') r = r.filter((e) => e.kind === 'word'); else if (wordFilter.kind === 'text') r = r.filter((e) => e.kind !== 'word');
      if (wordFilter.ipaOnly) r = r.filter((e) => e.ipa);
      r = r.slice().sort((a, b) => a.gloss.toLowerCase() < b.gloss.toLowerCase() ? -1 : 1);
      list.textContent = '';
      r.slice(0, 200).forEach((e) => {
        list.append(h('button', { class: 'entry', type: 'button', onclick: () => detail(e) }, h('span', { class: 'pic', 'aria-hidden': 'true', html: pic(e.gloss) || '' }),
          h('span', { class: 'txt' }, h('span', { class: 'form' }, DadiLearn.display(e)), h('span', { class: 'gloss' }, dot(e.gloss) + DadiLearn.verification(e).label + (consOf(e) && consOf(e).auto ? '. Auto-confirmed by consensus' : '')))));
      });
      count.textContent = r.length + (r.length === 1 ? ' entry' : ' entries') + (r.length > 200 ? '. Showing the first 200. Narrow the search to see the rest.' : '');
      if (!r.length) list.append(h('div', { class: 'cellwrap' }, h('p', null, wordFilter.q ? 'No entries match "' + wordFilter.q + '". Check the spelling or try a shorter search.' : 'No entries match this filter. Clear the filter to see all entries.'),
        wordFilter.q ? h('a', { class: 'btn small', href: '#/teach/new?gloss=' + encodeURIComponent(wordFilter.q) }, 'Add this word') : null));
    }
    input.addEventListener('input', paint);
    const src = repoInfo.from === 'github' ? 'Loaded from GitHub on ' + when(repoInfo.at) : (Store.cachedRepo() ? 'Saved copy from ' + when(Store.cachedRepo().fetchedAt) : 'Copy included with the program');
    put(root, h('h1', { class: 'title' }, 'Words'), h('p', { class: 'lede' }, 'Every entry in the project word list, with its verification status.'), input, chips, list, count,
      h('p', { class: 'group-foot' }, src + '. ', h('button', { class: 'link small', type: 'button', onclick: () => refreshRepo() }, 'Update now')));
    paint();
  }
  function detail(e) {
    const p = e._pron, can = p.complete, it = itemOf(e.id), card = S().cards[e.id];
    const how = e.ipa ? 'IPA supplied by a contributor (' + p.status + '). Unverified.' : p.how === 'reading' ? 'Machine reading of the spelling. No one has confirmed how this word is said.' : 'No sound reading is available: ' + p.status + '.';
    const facts = h('dl', { class: 'facts' });
    const row = (k, v) => { if (v) facts.append(h('dt', null, k), h('dd', null, v)); };
    row('Meaning', e.gloss); row('Type', e.kind === 'word' ? 'Word or phrase' : e.kind === 'sentence' ? 'Sentence' : 'Longer text or saying'); row('Form', e.formNote);
    row('Region', e.region); row('Verification', DadiLearn.verification(e).label); row('Consensus', consText(e)); row('Evidence level', LEVEL_TEXT[e.level] || e.level); row('Review state', e.state.toLowerCase()); row('Speaker confidence', e.confidence); row('Note', e.notes);
    row('Source', e.source);
    if (e.path) facts.append(h('dt', null, 'File'), h('dd', null, h('a', { href: CFG.repoUrl + '/blob/' + CFG.branch + '/' + e.path, rel: 'noopener noreferrer', target: '_blank' }, e.path)));
    row('ID', e.id);
    const pc = pic(e.gloss), notes = S().learn.notes.filter((n) => n.entryId === e.id);
    sheet(h('div', null, h('div', { class: 'row', style: 'flex-wrap:nowrap' }, pc ? h('div', { class: 'picbox', style: 'width:64px;height:64px;margin:0;flex:none', html: pc }) : null,
      h('div', null, h('div', { class: 'word' + (DadiLearn.display(e).length > 24 ? ' long' : ''), style: 'font-size:28px' }, DadiLearn.display(e)), h('div', { class: 'muted' }, e.gloss))),
      e.spellings.length > 1 ? h('p', { class: 'second', style: 'margin-top:12px' }, 'Also written: ' + e.spellings.slice(1).join(', ')) : null,
      h('p', { style: 'margin-top:12px' }, h('span', { class: 'vlabel' }, DadiLearn.verification(e).label)),
      e.ipa ? h('p', { class: 'ipa' }, '/' + e.ipa + '/') : null, h('p', { class: 'small muted' }, how),
      audio.has(e) ? h('div', { class: 'row' }, h('button', { class: 'btn small tint', type: 'button', onclick: () => audio.playRecording(e) }, ico('volume', 20), 'Listen to a speaker'), h('button', { class: 'btn small tint', type: 'button', onclick: () => audio.playRecording(e, { speed: 0.7 }) }, 'Slower')) : null,
      can ? h('div', { class: 'row' }, h('button', { class: 'btn small tint', type: 'button', onclick: () => audio.play(p.ipa) }, ico('volume', 20), 'Device voice (approximate)'), h('button', { class: 'btn small tint', type: 'button', onclick: () => audio.play(p.ipa, { speed: 0.6 }) }, 'Slower')) : null,
      facts,
      voteBlock(e),
      (card || it.seen) ? h('p', { class: 'second' }, (card ? 'Next review: ' + when(card.due) + '. ' : '') + ((it.days || []).length ? 'Recalled correctly on ' + plural((it.days || []).length, 'day') + '.' : '')) : null,
      it.suspended ? h('div', { class: 'card', style: 'margin:12px 0' }, h('p', { class: 'second' }, 'Reviews of this item are paused after repeated misses.' + (it.note ? ' Your note: ' + it.note : '')),
        h('button', { class: 'btn small tint', type: 'button', onclick: () => { Store.update((st) => { st.learn.items[e.id].suspended = false; st.learn.items[e.id].leechBase = (st.cards[e.id] && st.cards[e.id].lapses) || 0; }, 'learn-resume', 'resumed', e.id); closeSheet(); toast('Reviews resumed.'); } }, 'Resume reviews')) : null,
      notes.length ? h('p', { class: 'small muted' }, plural(notes.length, 'family note') + ' saved on this device.') : null,
      h('h3', null, 'Improve this entry'),
      h('div', { class: 'stack' },
        h('button', { class: 'btn small tint block', type: 'button', onclick: () => { closeSheet(); noteSheet(e); } }, 'This differs in my family'),
        h('a', { class: 'btn small tint block', href: '#/teach/new?action=variant&rel=' + encodeURIComponent(e.id) }, 'Add another form'),
        h('a', { class: 'btn small tint block', href: '#/teach/new?action=ipa&rel=' + encodeURIComponent(e.id) }, 'Correct pronunciation'),
        h('a', { class: 'btn small tint block', href: '#/teach/new?action=report&rel=' + encodeURIComponent(e.id) }, 'Report a problem'))), { label: e.gloss });
  }

  /* ---------- Progress ---------- */
  function progressView(root) {
    const st = S(), now = new Date(), t = L.totals(st.learn.items, st.cards, now, index.byId), wk = L.weekRecall(Store.reviews(), now);
    put(root, h('p', { class: 'eyebrow' }, h('a', { href: '#/learn', style: 'text-decoration:none' }, 'Learn')), h('h1', { class: 'title' }, 'Progress'),
      h('p', { class: 'lede' }, 'These figures are calculated on this device from your answers and are not sent anywhere.'),
      h('div', { class: 'stat-row' }, h('div', { class: 'stat' }, h('b', null, String(t.met)), h('span', null, 'items met')), h('div', { class: 'stat' }, h('b', null, String(t.twice)), h('span', null, 'recalled on two days')), h('div', { class: 'stat' }, h('b', null, String(t.due)), h('span', null, 'due now'))),
      h('p', { class: 'second', style: 'margin-top:16px' }, wk.reviewed ? 'Of the items you reviewed in the past 7 days, you remembered ' + wk.remembered + ' of ' + wk.reviewed + '.' : 'No items were reviewed in the past 7 days.'));
    const ids = Object.keys(st.learn.items).filter((id) => index.byId.has(id) && (st.cards[id] || st.learn.items[id].seen));
    const mix = {}; ids.forEach((id) => { const k = L.verification(index.byId.get(id)).key; mix[k] = (mix[k] || 0) + 1; });
    const checked = (mix.one_speaker || 0) + (mix.community || 0);
    if (ids.length) put(root, h('p', { class: 'second' }, 'Of the items you have learned, ' + checked + ' have been checked by a speaker and ' + (mix.unverified || 0) + ' are unverified' + (mix.disputed ? ', and ' + mix.disputed + ' are disputed' : '') + '.'));
    if (units.length) {
      put(root, h('div', { class: 'group-title' }, 'Strength by unit'), h('div', { class: 'group' }, units.map((u) => {
        const p = L.unitProgress(u, st.learn.items, st.cards), s = unitStrength(u);
        return h('div', { class: 'cellwrap' }, h('div', { class: 'row', style: 'justify-content:space-between;flex-wrap:nowrap' }, h('b', null, u.title), h('span', { class: 'muted second' }, p.met ? Math.round(s * 100) + '%' : 'Not started')),
          p.met ? h('div', { class: 'meter', role: 'img', 'aria-label': 'Strength estimate ' + Math.round(s * 100) + '%' }, h('i', { style: 'width:' + Math.round(s * 100) + '%' })) : null);
      })), h('p', { class: 'group-foot' }, 'Strength is an estimate of how likely you are to recall each item now, based on your answers.'));
    }
    const sess = st.learn.sessions.slice(-30).reverse();
    put(root, h('div', { class: 'group-title' }, 'Session history'), sess.length ? h('div', { class: 'group' }, sess.map((x) => {
      const mins = Math.max(1, Math.round((new Date(x.end) - new Date(x.start)) / 60000));
      return h('div', { class: 'cellwrap' }, h('b', null, when(x.start)), h('div', { class: 'muted second' }, plural(x.items, 'item') + ' (' + x.newItems + ' new, ' + x.reviews + ' reviewed). ' + plural(mins, 'minute') + (x.completed ? '.' : '. Left early.')));
    })) : h('div', { class: 'card muted' }, 'No sessions yet. Sessions appear here once you have started one from Learn.'),
      h('div', { class: 'group-title' }, 'Notes and spellings'),
      h('div', { class: 'group' }, h('button', { class: 'cell go', type: 'button', onclick: notesExport }, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, 'Family notes and suggested spellings'), h('span', { class: 'cell-s' }, plural(st.learn.notes.length, 'note') + ', ' + plural(st.learn.suggestions.length, 'suggested spelling'))))));
  }
  function notesExport() {
    const st = S(), data = { app: 'dadi', kind: 'notes-and-spellings', exported: new Date().toISOString(), notes: st.learn.notes, suggestions: st.learn.suggestions };
    const txt = JSON.stringify(data, null, 1);
    sheet(h('div', null, h('h2', null, 'Family notes and suggested spellings'), h('p', { class: 'muted' }, 'These are stored on this device and included in full backups. Exporting creates a file that you can share with the project. Nothing is sent automatically.'),
      h('p', null, plural(st.learn.notes.length, 'family note') + ' and ' + plural(st.learn.suggestions.length, 'suggested spelling') + '.'),
      h('div', { class: 'stack', style: 'margin-top:16px' },
        h('button', { class: 'btn block', type: 'button', onclick: () => saveFile('dadi-notes-' + today() + '.json', txt, 'application/json') }, 'Download file'),
        h('button', { class: 'btn block tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(txt); toast('Copied.'); } catch (e) { toast('The text could not be copied.'); } } }, 'Copy as text'))), { label: 'Family notes and suggested spellings' });
  }
  function saveFile(name, text, type) {
    const blob = new Blob([text], { type: type || 'text/plain' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }


  /* ---------- Teach (contribute) ---------- */
  function wantedWords() {
    const have = new Set(index.all.map((e) => Data.fold(e.gloss)));
    const out = [];
    (window.SitaingeItems ? window.SitaingeItems.BLOCKS : []).forEach((b) => b.items.forEach((it) => {
      if (b.kind !== 'word') return;
      const g = it.ctx ? it.en + ' (' + it.ctx + ')' : it.en;
      if (!have.has(Data.fold(it.en)) && !out.includes(g)) out.push(g);
    }));
    return out;
  }

  /* ---------- consensus labels and voting ----------
     Three separate ideas. Verified: a speaker or phonetician checked it. Auto-confirmed by consensus: several independent sources give the same
     form (a machine rule, computed in the repository, never a speaker's check). Community consensus: enough GitHub accounts voted the same way.
     None of them changes an entry's evidence level. */
  let consensus = {};
  async function loadConsensus() {
    try { const j = await repoJSON('website/data/consensus.json', '../data/consensus.json'); consensus = (j && j.entries) || {}; if (/^#\/words/.test(location.hash)) route(); } catch (e) { /* no consensus data yet */ }
  }
  const consOf = (e) => consensus[e.id] || null;
  function consBadges(e) {
    const c = consOf(e), out = []; if (!c) return out;
    if (c.auto) out.push(h('span', { class: 'vlabel auto', title: 'Several independent sources give the same form. This is a machine rule, not a speaker\'s check.' }, 'Auto-confirmed by consensus'));
    if (c.community) { const s = c.community.status; out.push(h('span', { class: 'vlabel ' + (s === 'contested' ? 'contested' : 'comm') }, s === 'community-consensus' ? 'Community consensus' : s === 'contested' ? 'Contested by voters' : 'Voting open: ' + plural(c.community.voters || 0, 'voter'))); }
    return out;
  }
  const consText = (e) => { const c = consOf(e), out = []; if (!c) return ''; if (c.auto) out.push('Auto-confirmed: ' + plural((c.auto.groups || []).length, 'independent source group') + ' agree' + ((c.auto.groups || []).length === 1 ? 's' : '') + '. This is not a speaker\'s check.'); if (c.community) out.push('Votes: ' + c.community.agree + ' agree, ' + c.community.disagree + ' differ' + (c.community.preferred_spelling ? '; preferred spelling "' + c.community.preferred_spelling + '"' : '') + '.'); return out.join(' '); };
  const voteList = () => (S().learn.votes || []);
  const myVote = (e, kind) => voteList().filter((v) => v.entryId === e.id && v.kind === kind).pop() || null;
  function castVote(e, kind, spelling) {
    Store.update((st) => {
      st.learn.votes = st.learn.votes || []; const V = st.learn.votes, now = new Date().toISOString();
      if (kind === 'agree' || kind === 'disagree') { const other = kind === 'agree' ? 'disagree' : 'agree'; for (let i = V.length - 1; i >= 0; i--) if (V[i].entryId === e.id && V[i].kind === other && V[i].status === 'queued') V.splice(i, 1); }
      const v = V.find((x) => x.entryId === e.id && x.kind === kind && x.status === 'queued');
      if (v) { v.spelling = spelling || null; v.t = now; } else V.push({ id: uid(), entryId: e.id, kind, spelling: spelling || null, t: now, status: 'queued' });
    }, 'vote', kind + (spelling ? ' ' + spelling : ''), e.id);
  }
  /* One-tap voting for one entry. onChange runs after each tap. */
  function voteBlock(e, onChange) {
    const box = h('div', { class: 'vote' });
    function draw() {
      box.textContent = '';
      const a = myVote(e, 'agree'), d = myVote(e, 'disagree'), sp = myVote(e, 'spelling');
      const mk = (label, on, fn) => h('button', { type: 'button', 'aria-pressed': String(!!on), onclick: () => { fn(); draw(); if (onChange) onChange(); } }, label);
      put(box, h('p', { class: 'kind' }, e.kind === 'word' ? 'Do you say it this way?' : 'Would you say this sentence this way?'),
        h('div', { class: 'segc', role: 'group', 'aria-label': 'Your vote' }, mk('Yes, we say it this way', a && a.status === 'queued' || a && a.status === 'sent', () => castVote(e, 'agree')), mk('We say it differently', d, () => castVote(e, 'disagree'))));
      if (e.spellings.length > 1) put(box, h('p', { class: 'kind', style: 'margin-top:12px' }, 'Which spelling do you use?'),
        h('div', { class: 'chips' }, e.spellings.map((s) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(!!sp && sp.spelling === s), onclick: () => { castVote(e, 'spelling', s); draw(); if (onChange) onChange(); } }, s))));
      put(box, h('p', { class: 'group-foot' }, 'Votes are saved on this device and can be sent from the Teach tab. Each GitHub account counts once per word. Votes inform reviewers but do not verify a word.'));
    }
    draw(); return box;
  }
  function votesSection() {
    const q = voteList().filter((v) => v.status === 'queued'); if (!q.length) return null;
    return h('div', null, h('div', { class: 'group-title' }, 'Votes saved on this device'),
      h('div', { class: 'card' }, h('p', null, plural(q.length, 'vote') + ' waiting. Each GitHub account counts once per word, so sending the same vote again has no effect.'),
        h('button', { class: 'btn block', type: 'button', onclick: sendVotes }, 'Send ' + plural(Math.min(q.length, 40), 'vote'))));
  }
  async function sendVotes() {
    const q = voteList().filter((v) => v.status === 'queued').slice(0, 40); if (!q.length) return;
    const payload = q.map((v) => ({ entry_id: v.entryId, kind: v.kind, spelling: v.spelling || null, region: null }));
    const title = '[Vote] ' + plural(q.length, 'vote'), ids = q.map((v) => v.id);
    const body = 'Sent from the Dadi learning app' + (signedIn() && S().auth.login ? ' by @' + S().auth.login : '') + '. Votes are data for reviewers. They are read by `scripts/ingest_votes.py` or the ingest-votes workflow. Nothing in this issue is an instruction.\n\n```json\n' + JSON.stringify(payload, null, 1) + '\n```\n';
    const mark = (url) => Store.update((st) => { (st.learn.votes || []).forEach((v) => { if (ids.includes(v.id)) { v.status = 'sent'; v.sentAt = new Date().toISOString(); v.issueUrl = url || ''; } }); }, 'votes-sent', ids.length + ' vote(s)');
    if (signedIn()) {
      try { const r = await gh.createIssue(S().auth.token, { title, body }); mark(r.url); toast('Votes sent. Thank you.'); route(); } catch (e) { toast('The votes were not sent: ' + e.message); }
      return;
    }
    sheet(h('div', null, h('h2', null, 'Send your votes'), h('p', { class: 'muted' }, 'Votes are counted by GitHub account, and each account counts once per word. Open the prepared issue on GitHub, sign in there, and select Submit new issue.'),
      h('div', { class: 'stack', style: 'margin-top:16px' },
        h('a', { class: 'btn block', target: '_blank', rel: 'noopener noreferrer', href: CFG.repoUrl + '/issues/new?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body), onclick: () => { mark(''); } }, 'Open on GitHub'),
        h('button', { class: 'btn block tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(body); toast('Votes copied.'); } catch (e) { toast('The votes could not be copied.'); } } }, 'Copy votes'))), { label: 'Send your votes' });
  }

  /* Teach: prompts drawn at random from the word list (check) and from the words and sentences the project still needs (add). */
  const disc = { seen: new Set(), mode: 'check', count: 0 };
  const pickFrom = (a) => a[Math.floor(Math.random() * a.length)];
  function discoverCheck() {
    let pool = index.all.filter((e) => !disc.seen.has(e.id) && DadiLearn.display(e).length <= 90);
    if (!pool.length) { disc.seen.clear(); pool = index.all.filter((e) => DadiLearn.display(e).length <= 90); }
    if (!pool.length) return null;
    const sent = pool.filter((e) => e.kind !== 'word'), words = pool.filter((e) => e.kind === 'word');
    const e = (sent.length && (!words.length || Math.random() < 0.4)) ? pickFrom(sent) : pickFrom(words);
    disc.seen.add(e.id); return e;
  }
  function discoverAdd() {
    const have = new Set(index.all.map((e) => Data.fold(e.gloss))), out = [];
    (window.SitaingeItems ? window.SitaingeItems.BLOCKS : []).forEach((b) => b.items.forEach((it) => { if (!have.has(Data.fold(it.en)) && !disc.seen.has('w:' + it.en)) out.push({ en: it.en, ctx: it.ctx || '', kind: b.kind }); }));
    if (!out.length) { Array.from(disc.seen).filter((k) => k.startsWith('w:')).forEach((k) => disc.seen.delete(k)); return null; }
    const sent = out.filter((x) => x.kind !== 'word'), words = out.filter((x) => x.kind === 'word');
    const x = (sent.length && (!words.length || Math.random() < 0.3)) ? pickFrom(sent) : pickFrom(words); disc.seen.add('w:' + x.en); return x;
  }
  function discoverCard() {
    const box = h('section', { class: 'disc', 'aria-label': 'Help build the word list' });
    let cur = null;
    function draw() {
      box.textContent = '';
      const seg = h('div', { class: 'segc', role: 'group', 'aria-label': 'Kind of prompt' },
        h('button', { type: 'button', 'aria-pressed': String(disc.mode === 'check'), onclick: () => { disc.mode = 'check'; cur = null; draw(); } }, 'Vote on a word'),
        h('button', { type: 'button', 'aria-pressed': String(disc.mode === 'add'), onclick: () => { disc.mode = 'add'; cur = null; draw(); } }, 'Add a word'));
      put(box, h('div', { class: 'sh' }, h('h2', null, 'Help build the word list'), h('button', { class: 'link small', type: 'button', onclick: () => { cur = null; draw(); } }, ico('refresh', 18), ' Another')), seg);
      if (disc.mode === 'check') {
        cur = cur || discoverCheck();
        if (!cur) { put(box, h('p', { class: 'muted' }, 'The word list is empty, so there is nothing to vote on yet.')); return; }
        const e = cur, alt = e.spellings.slice(1);
        put(box, h('div', { class: 'word' + (DadiLearn.display(e).length > 24 ? ' long' : '') }, DadiLearn.display(e)),
          h('p', { class: 'meaning' }, e.gloss),
          h('p', { class: 'vlabels' }, h('span', { class: 'vlabel' }, DadiLearn.verification(e).label), consBadges(e)),
          alt.length ? h('p', { class: 'second muted' }, 'Also written: ' + alt.join(', ')) : null,
          voteBlock(e, () => { disc.count++; }),
          h('div', { class: 'stack', style: 'margin-top:12px' },
            h('a', { class: 'btn block tint', href: '#/teach/new?action=variant&rel=' + encodeURIComponent(e.id), onclick: (ev) => { ev.preventDefault(); nav('#/teach/new?action=variant&rel=' + encodeURIComponent(e.id)); } }, 'Add how I say it'),
            h('button', { class: 'btn block', type: 'button', onclick: () => { cur = null; draw(); } }, 'Next word')));
      } else {
        cur = cur || discoverAdd();
        if (!cur) { put(box, h('p', { class: 'muted' }, 'Every prompt in the project list now has an entry. Use "Add a word or sentence" below to contribute anything else.')); return; }
        const x = cur, href = '#/teach/new?gloss=' + encodeURIComponent(x.en.replace(/ \(.*\)$/, '')) + (x.ctx ? '&ctx=' + encodeURIComponent(x.ctx) : '');
        put(box, h('p', { class: 'kind' }, x.kind === 'word' ? 'How do you say this in siṭaiṅga?' : 'How would you say this sentence?'),
          h('div', { class: 'word' + (x.en.length > 24 ? ' long' : '') }, x.en), x.ctx ? h('p', { class: 'meaning' }, x.ctx) : null,
          h('div', { class: 'stack' },
            h('a', { class: 'btn block', href, onclick: (ev) => { ev.preventDefault(); nav(href); } }, 'I know how to say it'),
            h('button', { class: 'link', type: 'button', onclick: () => { cur = null; draw(); } }, 'Skip')));
      }
    }
    draw(); return box;
  }
  function teachView(root) {
    const queued = S().queue.filter((q) => q.status === 'queued'), sent = S().queue.filter((q) => q.status === 'sent' || q.status === 'exported');
    const want = wantedWords();
    put(root, h('h1', { class: 'title' }, 'Teach'),
      h('p', { class: 'lede' }, 'If you speak siṭaiṅga, you can add words and sentences as you say them, using the spelling you would normally use. Reviewers read every contribution, and nothing is accepted automatically.'),
      discoverCard(), votesSection(),
      h('a', { class: 'btn block', href: '#/teach/new' }, 'Add a word or sentence'),
      h('div', { class: 'group-title' }, 'Saved on this device'));
    if (!queued.length) put(root, h('div', { class: 'card muted' }, 'No contributions are waiting. Contributions are saved on this device until you send them.'));
    else {
      const qg = h('div', { class: 'group' }); root.append(qg);
      queued.forEach((q) => put(qg, h('div', { class: 'cellwrap' }, h('b', null, (q.action === 'report' ? 'Report: ' : '') + (q.form || q.gloss)), ' ', h('span', { class: 'muted' }, q.gloss && q.form ? q.gloss : ''),
        q.ipa ? h('div', { class: 'ipa small' }, '/' + q.ipa + '/') : null,
        h('button', { class: 'link small', type: 'button', onclick: async () => { if (await ask('Remove this contribution?', h('p', null, 'The removal is recorded in the history log.'), 'Remove', 'Keep')) { Store.update((st) => { const t = st.queue.find((x) => x.id === q.id); if (t) t.status = 'withdrawn'; }, 'queue-withdrawn', q.form || q.gloss, q.id); route(); } } }, 'Remove'))));
      put(root, h('div', { class: 'stack', style: 'margin-top:16px' }, h('button', { class: 'btn block', type: 'button', onclick: sendFlow }, 'Send ' + plural(queued.length, 'contribution')),
        signedIn() ? h('p', { class: 'small ok' }, 'Signed in' + (S().auth.login ? ' as ' + S().auth.login : '')) : h('button', { class: 'btn block tint', type: 'button', onclick: signInSheet }, 'Sign in with GitHub')));
    }
    if (want.length) {
      put(root, h('div', { class: 'group-title' }, 'Words still needed'));
      const box = h('div', { class: 'chips' });
      want.slice(0, 30).forEach((g) => box.append(h('a', { class: 'chip', href: '#/teach/new?gloss=' + encodeURIComponent(g.replace(/ \(.*\)$/, '')) + (/\(/.test(g) ? '&ctx=' + encodeURIComponent(g.replace(/^.*\(|\)$/g, '')) : '') }, g)));
      put(root, box);
    }
    if (sent.length) put(root, h('p', { class: 'group-foot', style: 'margin-top:24px' }, plural(sent.length, 'contribution') + ' sent. Thank you.'));
  }

  function teachNew(root, qs) {
    const p = new URLSearchParams(qs || ''), action = ['add', 'variant', 'ipa', 'report'].includes(p.get('action')) ? p.get('action') : 'add';
    const rel = p.get('rel') ? index.byId.get(p.get('rel')) : null;
    const f = { kind: rel ? rel.kind : (p.get('kind') || 'word'), gloss: rel ? rel.gloss : (p.get('gloss') || ''), form: action === 'ipa' && rel ? (rel.spellings[0] || rel.form) : '', variants: [''],
      ipa: p.get('ipa') || (action === 'ipa' && rel && rel.ipa ? rel.ipa : ''), ipaStatus: 'speaker-chosen-by-ear', register: '', confidence: '', note: p.get('ctx') ? 'Context: ' + p.get('ctx') : '' };
    const titles = { add: 'Add a word or sentence', variant: 'Add another form', ipa: 'Correct pronunciation', report: 'Report a problem' };
    const err = h('p', { class: 'err', role: 'alert' });
    const inp = (id, o) => h('input', Object.assign({ id, class: 'input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' }, o || {}));
    const gloss = inp('f-gloss', { value: f.gloss, readonly: !!rel || null, placeholder: 'For example: water, or Let\'s go.' });
    const form = inp('f-form', { value: f.form, placeholder: 'Enter the word as you would write it', readonly: action === 'ipa' || null });
    const varBox = h('div');
    const addVar = (v) => { const i = inp('', { value: v || '', placeholder: 'Another form (optional)', 'aria-label': 'Another form' }); varBox.append(i); return i; };
    addVar();
    const ipa = inp('f-ipa', { class: 'input ipa', value: f.ipa, placeholder: 'Optional. Use the IPA keyboard to build it by ear.', 'aria-label': 'IPA' });
    ipa.className = 'input ipa';
    const ipaStatus = h('select', { class: 'input', id: 'f-ipastatus', 'aria-label': 'How you got the IPA' },
      h('option', { value: 'speaker-chosen-by-ear' }, 'Chosen by ear with the IPA keyboard'), h('option', { value: 'speaker-described' }, 'Written by me, from knowledge of IPA'), h('option', { value: 'ai-drafted-unverified' }, 'Generated from the spelling; not checked'));
    let manual = false; ipaStatus.addEventListener('change', () => { manual = true; });
    ipa.addEventListener('input', () => { if (!manual && ipaStatus.value === 'ai-drafted-unverified') ipaStatus.value = 'speaker-chosen-by-ear'; });
    const ipaBox = h('div', { hidden: action === 'report' },
      h('label', { class: 'f', for: 'f-ipa' }, 'Pronunciation in IPA', h('span', { class: 'f-hint' }, 'Knowledge of IPA is not required. Open the keyboard, tap sounds to hear them, then play the whole word to check it.')), ipa,
      h('div', { class: 'row', style: 'margin-top:8px' },
        h('button', { class: 'btn small', type: 'button', onclick: () => { openKeyboard(ipa); } }, 'IPA keyboard'),
        h('button', { class: 'btn small tint', type: 'button', onclick: () => { if (ipa.value.trim()) audio.play(ipa.value); else toast('Enter or build some sounds first.'); } }, 'Play word'),
        h('button', { class: 'btn small tint', type: 'button', onclick: () => {
          const g = DadiG2P.g2p(form.value || ''); if (!g.complete || !g.ipa) { toast('The spelling reader does not recognize these characters: ' + (g.unknown.join(' ') || 'no spelling entered')); return; }
          ipa.value = g.ipa; manual = false; ipaStatus.value = 'ai-drafted-unverified'; audio.play(g.ipa); toast('This is a machine reading of your spelling. Adjust it until it matches how you say the word.');
        } }, 'Suggest from spelling')),
      h('label', { class: 'f', for: 'f-ipastatus' }, 'Source of this IPA'), ipaStatus);
    const conf = h('select', { class: 'input', id: 'f-conf' }, h('option', { value: '' }, 'Not stated'), h('option', { value: 'sure' }, 'Certain'), h('option', { value: 'fairly' }, 'Fairly certain'), h('option', { value: 'unsure' }, 'Uncertain'));
    const reg = h('select', { class: 'input', id: 'f-reg' }, h('option', { value: '' }, 'Not stated'), h('option', { value: 'everyday' }, 'Everyday speech'), h('option', { value: 'respectful' }, 'Respectful (to elders or strangers)'), h('option', { value: 'dictionary' }, 'Formal or dictionary form'), h('option', { value: 'friends' }, 'Informal (with friends)'));
    const note = h('textarea', { class: 'input', id: 'f-note', placeholder: action === 'report' ? 'What is incorrect, and what do you say instead?' : 'Where it is used and who says it. Optional.' }, f.note);
    const kindSeg = h('div', { class: 'segc', role: 'group', 'aria-label': 'Type' });
    ['word', 'sentence'].forEach((k) => kindSeg.append(h('button', { type: 'button', 'aria-pressed': String(f.kind === k), disabled: !!rel || null, onclick: (ev) => { f.kind = k; kindSeg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === ev.currentTarget))); } }, k === 'word' ? 'Word' : 'Sentence')));
    const save = h('button', { class: 'btn block', type: 'button', style: 'margin-top:24px' }, 'Save on this device');
    save.addEventListener('click', () => {
      err.textContent = '';
      const g = gloss.value.trim(), fm = form.value.trim(), nt = note.value.trim(), iv = ipa.value.trim();
      if (action !== 'report' && !g) { err.textContent = 'Enter the English meaning.'; gloss.focus(); return; }
      if (action === 'report' && !nt) { err.textContent = 'Describe what is incorrect.'; note.focus(); return; }
      if ((action === 'add' || action === 'variant') && !fm) { err.textContent = 'Enter the word as you say it.'; form.focus(); return; }
      if (action === 'ipa' && !iv) { err.textContent = 'Build the pronunciation with the IPA keyboard first.'; ipa.focus(); return; }
      const vs = Array.from(varBox.querySelectorAll('input')).map((i) => i.value.trim()).filter(Boolean);
      const q = { id: uid(), action, kind: f.kind, gloss: g || (rel && rel.gloss) || '', form: fm, variants: vs, ipa: iv, ipaStatus: iv ? ipaStatus.value : '', note: nt, confidence: conf.value, register: reg.value,
        relatedId: rel ? rel.id : '', relatedForm: rel ? (rel.spellings[0] || rel.form) : '', status: 'queued', createdAt: new Date().toISOString() };
      Store.update((st) => { st.queue.push(q); }, 'queue-add', action + ': ' + (fm || g), q.id);
      closeKeyboard(); toast('Saved on this device.'); nav('#/teach');
    });
    put(root, h('h1', { class: 'title' }, titles[action]),
      rel ? h('p', { class: 'muted' }, action === 'report' ? 'About: ' : 'Existing entry: ', h('b', { class: 'ipa' }, (rel.spellings[0] || rel.form)), ' = ' + rel.gloss) : null,
      action === 'report' ? null : h('div', null, h('label', { class: 'f', for: 'f-gloss' }, 'English meaning'), gloss, !rel ? h('div', { style: 'margin-top:8px' }, kindSeg) : null),
      action === 'report' || action === 'ipa' ? null : h('div', null, h('label', { class: 'f', for: 'f-form' }, 'Siṭaiṅga form', h('span', { class: 'f-hint' }, 'Use any spelling, in Roman (Latin) letters.')), form,
        h('label', { class: 'f' }, 'Other forms'), varBox, h('button', { class: 'link small', type: 'button', onclick: () => addVar().focus() }, 'Add another form')),
      action === 'ipa' ? h('div', null, h('label', { class: 'f', for: 'f-form' }, 'Spelling'), form) : null,
      ipaBox,
      action === 'report' ? null : h('div', null, h('label', { class: 'f', for: 'f-reg' }, 'Type of speech'), reg, h('label', { class: 'f', for: 'f-conf' }, 'How certain are you?'), conf),
      h('label', { class: 'f', for: 'f-note' }, action === 'report' ? 'What is incorrect?' : 'Notes'), note, err, save,
      h('p', { class: 'small muted', style: 'margin-top:10px' }, 'Saved contributions stay on this device until you send them from the Teach tab. Anything you send enters the public domain (CC0) if reviewers use it.'));
  }




  /* ---------- sending ---------- */
  const AGE = [['', 'Not stated'], ['under-18', 'Under 18 (a parent or guardian must help)'], ['18-29', '18 to 29'], ['30-49', '30 to 49'], ['50-69', '50 to 69'], ['70+', '70 or older']];
  function profileForm(onSaved, needConsent) {
    const p = S().profile;
    const box = h('div');
    const chk = (id, label, val) => h('label', { class: 'check', for: id }, h('input', { type: 'checkbox', id, checked: !!val }), h('span', null, label));
    const adult = chk('p-adult', 'I am 18 or older, or a parent or guardian is helping me.', p.adult);
    const cc0 = chk('p-cc0', 'I understand that what I send becomes public domain under CC0 1.0 if reviewers use it, and that this cannot be taken back.', p.cc0);
    const loc = h('input', { class: 'input', id: 'p-loc', value: p.locality, placeholder: 'For example: the town or area where you learned it', autocomplete: 'off' });
    const age = h('select', { class: 'input', id: 'p-age' }, AGE.map(([v, t]) => h('option', { value: v, selected: p.age === v }, t)));
    const other = h('input', { class: 'input', id: 'p-other', value: p.otherLanguages, placeholder: 'For example: English, French', autocomplete: 'off' });
    const credit = h('select', { class: 'input', id: 'p-credit' }, h('option', { value: 'anonymous', selected: p.credit === 'anonymous' }, 'Anonymous'), h('option', { value: 'name', selected: p.credit === 'name' }, 'Use my name'), h('option', { value: 'id', selected: p.credit === 'id' }, 'Contributor ID only'));
    const cname = h('input', { class: 'input', id: 'p-cname', value: p.creditName, placeholder: 'Name to display', autocomplete: 'off' });
    const err = h('p', { class: 'err', role: 'alert' });
    box.append(adult, cc0,
      h('label', { class: 'f', for: 'p-loc' }, 'Where is your siṭaiṅga from?', h('span', { class: 'f-hint' }, 'Optional. This helps to show regional differences.')), loc,
      h('label', { class: 'f', for: 'p-age' }, 'Age group (optional)'), age,
      h('label', { class: 'f', for: 'p-other' }, 'Other languages you speak (optional)'), other,
      h('label', { class: 'f', for: 'p-credit' }, 'How should you be credited?'), credit, h('div', { id: 'p-cn' }, h('label', { class: 'f', for: 'p-cname' }, 'Name'), cname),
      err, h('button', { class: 'btn block', type: 'button', style: 'margin-top:16px', onclick: () => {
        if (needConsent && (!adult.querySelector('input').checked || !cc0.querySelector('input').checked)) { err.textContent = 'Select both boxes to send contributions.'; return; }
        if (credit.value === 'name' && !cname.value.trim()) { err.textContent = 'Enter the name to display.'; return; }
        Store.update((st) => { Object.assign(st.profile, { adult: adult.querySelector('input').checked, cc0: cc0.querySelector('input').checked, locality: loc.value.trim(), age: age.value, otherLanguages: other.value.trim(), credit: credit.value, creditName: credit.value === 'name' ? cname.value.trim() : '', languageName: 'Sitainge' }); }, 'profile', 'details saved');
        toast('Saved.'); if (onSaved) onSaved();
      } }, needConsent ? 'Save and continue' : 'Save'));
    const sync = () => { box.querySelector('#p-cn').hidden = credit.value !== 'name'; }; credit.addEventListener('change', sync); sync();
    return box;
  }

  async function sendFlow() {
    const prof = S().profile;
    if (!prof.adult || !prof.cc0) { const s = sheet(h('div', null, h('h2', null, 'Before you send'), h('p', null, 'Two confirmations are required. They will be saved for next time.'), profileForm(() => { s.close(); sendFlow(); }, true)), { label: 'Before you send' }); return; }
    let batches; try { batches = await DadiSubmit.build(S().queue, prof); } catch (e) { toast('The contributions could not be prepared: ' + e.message); return; }
    if (!batches.length) { toast('Nothing to send.'); return; }
    const errors = batches.flatMap((b) => b.errors);
    if (errors.length) { sheet(h('div', null, h('h2', null, 'Correct these first'), h('ul', null, errors.map((e) => h('li', null, e))), h('button', { class: 'btn', type: 'button', onclick: closeSheet }, 'Close')), { label: 'Correct these first' }); return; }
    const pii = batches.flatMap((b) => b.pii);
    if (pii.length) {
      const okay = await ask('Check for personal details', h('div', null, h('p', null, 'These items may contain personal information. Everything you send becomes public.'), h('ul', null, pii.map((x) => h('li', null, x.where + ': ' + x.kind)))), 'Send anyway', 'Edit first');
      if (!okay) return;
    }
    if (signedIn()) return sendBatches(batches);
    exportSheet(batches);
  }

  async function sendBatches(batches) {
    const s = sheet(h('div', null, h('h2', null, 'Sending'), h('p', null, h('span', { class: 'spin' }), 'Sending to the project on GitHub. Please keep this page open.')), { label: 'Sending' });
    const done = [];
    try {
      for (const b of batches) {
        const r = await gh.createIssue(S().auth.token, { title: b.title, body: DadiSubmit.issueBody(b, S().auth.login) });
        Store.update((st) => { st.queue.forEach((q) => { if (b.ids.includes(q.id)) { q.status = 'sent'; q.sentAt = new Date().toISOString(); q.issueUrl = r.url; } }); }, 'queue-sent', b.ids.length + ' contribution(s) sent as issue #' + r.number);
        done.push(r);
      }
      s.close();
      sheet(h('div', null, h('h2', null, 'Contributions sent. Thank you.'), h('p', null, 'A reviewer will check each contribution. You can follow progress on GitHub:'), h('ul', null, done.map((r) => h('li', null, h('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, r.url)))), h('button', { class: 'btn', type: 'button', onclick: () => { closeSheet(); route(); } }, 'Done')), { label: 'Sent' });
    } catch (e) {
      s.close();
      if (e.code === 'expired') Store.update((st) => { st.auth = null; }, 'signout', 'sign-in expired');
      sheet(h('div', null, h('h2', null, done.length ? 'Some contributions were sent' : 'Not sent'), h('p', { class: 'err' }, e.message), h('p', null, 'Nothing has been lost. The remaining contributions are still saved on this device.'),
        h('div', { class: 'row' }, e.code === 'expired' ? h('button', { class: 'btn', type: 'button', onclick: signInSheet }, 'Sign in again') : null, h('button', { class: 'btn ghost', type: 'button', onclick: () => { closeSheet(); exportSheet(batches); } }, 'Send another way'))), { label: 'Not sent' });
    }
  }

  /* No GitHub account (or not signed in): export the same text by copy, file, email or share. */
  function exportSheet(batches) {
    const text = batches.map((b) => b.text).join('\n');
    const file = () => new File([text], 'dadi-contribution-' + today() + '.txt', { type: 'text/plain' });
    const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(file()); a.download = file().name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); };
    const ta = h('textarea', { class: 'input', readonly: true, rows: '6', 'aria-label': 'Your contribution text' }, text);
    const mark = async () => { if (await ask('Mark as sent?', h('p', null, 'Mark the contribution as sent only if you have emailed, shared or posted the text. Otherwise it remains in the queue.'), 'Mark as sent', 'Not yet')) { Store.update((st) => { st.queue.forEach((q) => { if (batches.some((b) => b.ids.includes(q.id))) { q.status = 'exported'; q.sentAt = new Date().toISOString(); } }); }, 'queue-exported', 'marked as sent outside GitHub'); closeSheet(); route(); } };
    const s = sheet(h('div', null, h('h2', null, 'Send another way'),
      h('p', null, gh.configured ? 'You are not signed in. Sign in to send directly, or use one of the options below.' : 'GitHub sign-in is not set up in this copy of Dadi. Use one of the options below. The text shown is the complete contribution.'),
      gh.configured ? h('button', { class: 'btn block', type: 'button', onclick: signInSheet, style: 'margin-bottom:10px' }, 'Sign in with GitHub') : null,
      h('div', { class: 'row' },
        h('button', { class: 'btn small', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(text); toast('Copied.'); } catch (e) { ta.select(); toast('Select the text and copy it manually.'); } } }, 'Copy'),
        h('button', { class: 'btn small', type: 'button', onclick: download }, 'Save as file'),
        CFG.contactEmail ? h('button', { class: 'btn small', type: 'button', onclick: () => { if (text.length > 1500) { download(); toast('File saved. Please attach it to the email.'); } location.href = 'mailto:' + CFG.contactEmail + '?subject=' + encodeURIComponent('Dadi contribution') + '&body=' + encodeURIComponent(text.length > 1500 ? 'My Dadi contribution is attached (dadi-contribution-' + today() + '.txt).' : text); } }, 'Email it') : null,
        navigator.canShare && navigator.canShare({ files: [file()] }) ? h('button', { class: 'btn small', type: 'button', onclick: () => navigator.share({ files: [file()], title: 'Dadi contribution' }).catch(() => {}) }, 'Share') : null),
      ta, h('p', { class: 'small muted' }, 'GitHub is the preferred destination: ', h('a', { href: CFG.repoUrl + '/issues/new?template=interview-submission.yml', target: '_blank', rel: 'noopener noreferrer' }, 'open a new issue'), ' and paste the text. If that is not possible, email it or give it to someone who can submit it on your behalf.'),
      h('button', { class: 'link', type: 'button', onclick: mark }, 'Mark as sent')), { label: 'Send another way' });
    return s;
  }




  /* ---------- sign-in ---------- */
  function signInSheet() {
    closeSheet();
    if (!gh.configured) {
      sheet(h('div', null, h('h2', null, 'Sign-in is not set up'), h('p', null, 'This copy of Dadi has no GitHub sign-in connected. Lessons, the word list and contribution drafts still work. To send a contribution, copy the text, email it or share it.'),
        h('p', { class: 'small muted' }, 'Project owners: see docs/dadi/AUTH_SETUP.md.'), h('button', { class: 'btn', type: 'button', onclick: closeSheet }, 'Close')), { label: 'Sign-in not set up' });
      return;
    }
    const ac = new AbortController();
    const body = h('div', null, h('h2', null, 'Sign in with GitHub'), h('p', null, h('span', { class: 'spin' }), 'Requesting a code…'));
    const s = sheet(body, { label: 'Sign in with GitHub', onClose: () => ac.abort() });
    (async () => {
      try {
        const dev = await gh.deviceStart();
        body.textContent = '';
        body.append(h('h2', null, 'Sign in with GitHub'), h('p', null, 'Open GitHub, enter this code and approve Dadi. Dadi is permitted only to open issues in the project repository.'),
          h('div', { class: 'codebox', 'aria-label': 'Your code' }, dev.userCode),
          h('div', { class: 'row' }, h('a', { class: 'btn', href: dev.url, target: '_blank', rel: 'noopener noreferrer' }, 'Open GitHub'),
            h('button', { class: 'btn ghost', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(dev.userCode); toast('Code copied.'); } catch (e) { toast('Select the code and copy it manually.'); } } }, 'Copy code')),
          h('p', { class: 'muted small', style: 'margin-top:12px' }, h('span', { class: 'spin' }), 'Waiting for approval. This page will continue automatically.'));
        const r = await gh.devicePoll(dev, ac.signal);
        let login = null; try { const w = await gh.whoami(r.token); login = w && w.login; } catch (e) { /* signed in anyway */ }
        Store.update((st) => { st.auth = { token: r.token, login, at: new Date().toISOString() }; }, 'signin', login ? 'signed in as ' + login : 'signed in');
        sheetClose = null; s.box.remove(); layer.textContent = ''; toast('Signed in' + (login ? ' as ' + login : '') + '.'); route();
      } catch (e) {
        if (ac.signal.aborted) return;
        body.textContent = ''; body.append(h('h2', null, 'Sign-in failed'), h('p', { class: 'err' }, e.message), h('button', { class: 'btn', type: 'button', onclick: signInSheet }, 'Try again'));
      }
    })();
  }

  function gateView() {
    main.textContent = '';
    main.append(h('h1', { class: 'title' }, 'Sign in'), h('p', { class: 'lede' }, 'Sign in with GitHub so that contributions are attributed to your account.'),
      h('button', { class: 'btn block', type: 'button', onclick: signInSheet }, 'Sign in with GitHub'),
      h('p', { class: 'small muted', style: 'margin-top:16px' }, 'GitHub accounts are free. ', h('button', { class: 'link', type: 'button', onclick: () => { try { sessionStorage.setItem('dadi.skipgate', '1'); } catch (e) { /* ignore */ } route(); } }, 'Not now')));
  }



  /* ---------- Me ---------- */
  const goCell = (t, o) => h('button', { class: 'cell go', type: 'button', onclick: o.onclick }, o.icon ? h('span', { class: 'cell-ic' }, ico(o.icon)) : null, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, t), o.s ? h('span', { class: 'cell-s' }, o.s) : null), o.end ? h('span', { class: 'cell-end' }, o.end) : null);
  const actCell = (t, onclick, danger, icon) => h('button', { class: 'cell', type: 'button', onclick }, icon ? h('span', { class: 'cell-ic', style: danger ? 'color:var(--alert)' : '' }, ico(icon)) : null, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t', style: 'color:' + (danger ? 'var(--alert)' : 'var(--accent)') }, t)));
  const selCell = (label, id, opts, val, on) => { const s = h('select', { id, 'aria-label': label }, opts.map(([v, t]) => h('option', { value: v, selected: String(val) === String(v) }, t))); s.addEventListener('change', () => on(s.value)); return h('label', { class: 'cell', for: id }, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, label)), s); };
  const setting = (k, v, note) => Store.update((s2) => { s2.settings[k] = v; }, 'settings', note || (k + ' ' + v));
  const ENGINES = [['auto', 'Automatic'], ['device', 'Device voice'], ['clear', 'Clear voice'], ['dadi', 'Built-in sound']];
  const ROUTE_TEXT = { some: 'I understand some', zero: 'Starting from zero', '': 'Not set' };


  function voiceSheet() {
    let sh; const box = h('div');
    function draw() {
      const info = audio.engineInfo(), st = S().settings; box.textContent = '';
      const dv = info.deviceVoices;
      put(box, h('h2', null, 'Voice'),
        h('p', { class: 'muted small' }, 'No recordings exist yet, so every voice here reads an approximation and may be wrong for siṭaiṅga. Choose the one you find clearest. Recordings will replace these voices as speakers contribute them.'),
        h('div', { class: 'group', style: 'margin-top:16px' },
          selCell('Word voice', 's-engine', ENGINES, st.engine || 'auto', (v) => { setting('engine', v); draw(); }),
          selCell('Speed', 's-speed', [[0.8, 'Slower'], [1, 'Normal'], [1.2, 'Faster']], st.speed || 1, (v) => setting('speed', Number(v))),
          selCell('Pitch', 's-pitch', [['low', 'Lower'], ['mid', 'Middle'], ['high', 'Higher']], st.pitch || 'mid', (v) => setting('pitch', v))),
        h('p', { class: 'group-foot' }, 'Automatic uses the device voice if a suitable one is installed, then the clear voice if it is turned on, and otherwise the built-in sound.'),
        h('div', { class: 'group-title' }, 'Device voice'),
        h('div', { class: 'group' }, dv.length
          ? selCell('Voice', 's-dev', [['', 'Best match']].concat(dv.map((v) => [v.uri, v.name + ' (' + v.lang + ')'])), st.deviceVoice || '', (v) => setting('deviceVoice', v))
          : h('div', { class: 'cellwrap small muted' }, 'This device has no suitable voice installed, so another voice is used instead.')),
        h('p', { class: 'group-foot' }, 'The device reads a similar-sounding spelling of each word. Voices installed through the device settings appear here.'),
        h('div', { class: 'group-title' }, 'Clear voice'),
        h('div', { class: 'group' },
          selCell('Voice', 's-clear', DadiEspeak.VOICES, st.clearVoice || 'f3', (v) => setting('clearVoice', v)),
          h('label', { class: 'cell', for: 's-clearon' }, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, 'Use automatically')), h('input', { type: 'checkbox', id: 's-clearon', checked: !!st.clearOn, onchange: (e) => setting('clearOn', e.target.checked) })),
          actCell(st.clearReady ? 'Clear voice is saved on this device' : 'Download the clear voice (18 MB)', async () => {
            if (st.clearReady) return; toast('Downloading…');
            try { await audio.prepareClear(); setting('clearReady', true, 'clear voice ready'); toast('Clear voice saved. It now works offline.'); draw(); } catch (e) { toast(e.message); }
          })),
        h('p', { class: 'group-foot' }, 'Based on eSpeak NG, free software under the GPL. It runs on this device and works offline after a one-time download.'),
        h('div', { class: 'stack', style: 'margin-top:24px' },
          h('button', { class: 'btn block tint', type: 'button', onclick: async () => { const r = await audio.play('hana'); toast(r.ok ? 'Played with: ' + ({ device: 'the device voice', clear: 'the clear voice', dadi: 'the built-in sound' }[r.how] || 'a voice') + '.' : (r.reason || 'The sound could not be played.')); } }, 'Play a test word'),
          h('button', { class: 'btn block', type: 'button', onclick: () => sh.close() }, 'Close')));
    }
    draw(); sh = sheet(box, { label: 'Voice' });
  }


  function aiSheet() {
    let sh; const cfg = DadiAI.load(); const box = h('div');
    function draw() {
      box.textContent = ''; const k = DadiAI.KINDS[cfg.kind];
      const field = (key, label, ph, type) => h('label', { class: 'cell', style: 'display:grid;grid-template-columns:1fr;gap:4px;padding:12px 16px' }, h('span', { class: 'cell-s' }, label), h('input', { class: 'input', style: 'padding:0;min-height:28px;background:transparent', type: type || 'text', value: cfg[key] || '', placeholder: ph || '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', oninput: (e) => { cfg[key] = e.target.value; } }));
      put(box, h('h2', null, 'AI connection'),
        h('p', { class: 'muted small' }, 'Optional. This allows the translator to send its output to an AI service of your choice. The key stays in this browser, is never included in backups, and is sent only to the address you enter. AI answers are always labelled as unverified drafts.'),
        h('div', { class: 'group', style: 'margin-top:16px' }, selCell('Service', 'ai-kind', Object.keys(DadiAI.KINDS).map((x) => [x, DadiAI.KINDS[x].label]), cfg.kind, (v) => { cfg.kind = v; if (!cfg.endpoint || Object.values(DadiAI.KINDS).some((x) => x.endpoint === cfg.endpoint)) cfg.endpoint = DadiAI.KINDS[v].endpoint || ''; draw(); })),
        cfg.kind === 'copy' ? h('p', { class: 'group-foot' }, 'Without a connection, the translator offers a prompt that you can paste into any AI service. No key is needed.') :
          h('div', { class: 'group', style: 'margin-top:12px' }, k.needs.includes('endpoint') ? field('endpoint', 'Address', k.endpoint) : null, field('model', 'Model name', 'For example: gpt-4o-mini'), k.needs.includes('key') ? field('key', 'API key', 'Stored on this device only', 'password') : null),
        h('div', { class: 'stack', style: 'margin-top:24px' },
          h('button', { class: 'btn block', type: 'button', onclick: () => { DadiAI.save(cfg); toast('Saved on this device.'); sh.close(); } }, 'Save'),
          cfg.kind !== 'copy' ? h('button', { class: 'btn block tint', type: 'button', onclick: async () => { DadiAI.save(cfg); if (!DadiAI.ready(cfg)) { toast('Please complete every field first.'); return; } toast('Testing…'); try { await DadiAI.ask(cfg, 'Reply with the single word: ready'); toast('Connected.'); } catch (e) { toast(e.message); } } }, 'Test the connection') : null,
          h('button', { class: 'btn block danger', type: 'button', onclick: () => { DadiAI.forget(); toast('Removed from this device.'); sh.close(); } }, 'Remove from this device')));
    }
    draw(); sh = sheet(box, { label: 'AI connection' });
  }

  const profileSheet = () => { let sh; sh = sheet(h('div', null, h('h2', null, 'About you'), h('p', { class: 'muted small' }, 'Used when you send contributions. All fields are optional except the two confirmations.'), profileForm(() => sh.close(), false)), { label: 'About you' }); };
  function historySheet() {
    const hist = Store.history().slice(-60).reverse();
    sheet(h('div', null, h('h2', null, 'History on this device'), h('p', { class: 'muted small' }, 'Every change is recorded. Newest first.'), hist.length ? h('div', { class: 'group', style: 'margin-top:12px' }, hist.map((e) => h('div', { class: 'cellwrap small' }, h('b', null, e.type), e.detail ? ' ' + e.detail : '', h('div', { class: 'muted' }, when(e.t))))) : h('p', { class: 'muted' }, 'No changes recorded.')), { label: 'History' });
  }

  function routeSheet() {
    let sh; const cur = S().learn.route;
    const pick = (r) => { Store.update((st) => { st.learn.route = r; }, 'learn-route', r); sh.close(); route(); };
    sh = sheet(h('div', null, h('h2', null, 'Starting point'),
      h('p', { class: 'muted' }, '"I understand some" skips the preview for items you answered correctly in the quick check and asks for more typing. "Starting from zero" shows every new item in full.'),
      h('div', { class: 'stack', style: 'margin-top:16px' },
        h('button', { class: 'btn tint block', type: 'button', 'aria-pressed': String(cur === 'some'), onclick: () => pick('some') }, 'I understand some' + (cur === 'some' ? ' (selected)' : '')),
        h('button', { class: 'btn tint block', type: 'button', 'aria-pressed': String(cur === 'zero'), onclick: () => pick('zero') }, 'I am starting from zero' + (cur === 'zero' ? ' (selected)' : '')),
        cur === 'some' ? h('a', { class: 'btn ghost block', href: '#/check', onclick: () => closeSheet() }, 'Take the quick check') : null)), { label: 'Starting point' });
  }
  function meView(root) {
    const st = S(); const eng = audio.engineInfo();
    const file = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    file.addEventListener('change', async () => { const f = file.files[0]; if (!f) return; const r = Store.importAll(await f.text()); toast(r.ok ? 'Backup merged with the data on this device.' : r.error); if (r.ok) route(); });
    const aiOn = DadiAI.ready(DadiAI.load());
    put(root, h('h1', { class: 'title' }, 'Me'), h('p', { class: 'lede' }, 'Settings and data. Everything is stored on this device.'),
      h('div', { class: 'group' },
        goCell('GitHub', { icon: 'link', end: signedIn() ? (st.auth.login || 'Signed in') : 'Not signed in', onclick: () => { if (signedIn()) ask('Sign out?', h('p', null, 'Drafts stay on this device.'), 'Sign out', 'Stay signed in').then((y) => { if (y) { Store.update((s2) => { s2.auth = null; }, 'signout', 'signed out'); route(); } }); else signInSheet(); } }),
        goCell('About you', { icon: 'user', onclick: profileSheet })),
      h('p', { class: 'group-foot' }, 'Signing in is optional. Lessons and contribution drafts work without an account, and signing in allows you to send contributions directly.'),
      h('div', { class: 'group-title' }, 'Learning'),
      h('div', { class: 'group' },
        goCell('Starting point', { icon: 'target', end: ROUTE_TEXT[st.learn.route || ''], onclick: routeSheet }),
        goCell('Progress and history', { icon: 'chart', onclick: () => nav('#/progress') }),
        goCell('Family notes and suggested spellings', { icon: 'edit', s: plural(st.learn.notes.length, 'note') + ', ' + plural(st.learn.suggestions.length, 'suggested spelling'), onclick: notesExport })),
      h('div', { class: 'group-title' }, 'Sound and appearance'),
      h('div', { class: 'group' },
        goCell('Voice', { icon: 'headphones', end: (ENGINES.find((x) => x[0] === (st.settings.engine || 'auto')) || ENGINES[0])[1], s: eng.device ? 'A device voice is available' : null, onclick: voiceSheet }),
        goCell('Appearance', { icon: 'palette', end: ((st.settings.theme || 'system') === 'system' ? 'Automatic' : st.settings.theme === 'dark' ? 'Dark' : 'Light') + ', ' + (SCHEMES.find((x) => x[0] === (st.settings.scheme || 'indigo')) || SCHEMES[0])[1], onclick: lookSheet })),
      h('div', { class: 'group-title' }, 'Tools'),
      h('div', { class: 'group' }, goCell('AI connection', { icon: 'sparkle', end: aiOn ? 'On' : 'Off', onclick: aiSheet })),
      h('div', { class: 'group-title' }, 'Data'),
      h('div', { class: 'group' },
        actCell('Download a backup', () => saveFile('dadi-backup-' + today() + '.json', Store.exportAll(), 'application/json'), false, 'download'),
        actCell('Restore from a backup', () => file.click(), false, 'upload'), file,
        actCell('Update the word list from GitHub', () => refreshRepo(), false, 'refresh'),
        goCell('History of changes', { icon: 'history', onclick: historySheet }),
        actCell('Delete all data on this device', async () => { if (await ask('Delete all data on this device?', h('p', null, 'This removes progress, drafts, notes, sign-in and the AI key from this device. Contributions already sent remain on GitHub. Only a backup file can restore the data. The deletion is recorded in the history log.'), 'Delete', 'Cancel')) { DadiAI.forget(); Store.wipe(); toast('Data deleted.'); route(); } }, true, 'trash')),
      h('p', { class: 'group-foot' }, Store.persistent ? 'Data is saved on this device with two automatic backups. Nothing is sent unless you choose to send it.' : 'This browser has blocked storage, so changes will be lost when the page closes. Please download a backup before you leave.'),
      h('div', { class: 'group-title' }, 'Help'),
      h('div', { class: 'group' },
        goCell('Show the tour', { icon: 'help', onclick: () => tour(0) }),
        goCell('Report a problem with content', { icon: 'flag', onclick: () => reportSheet({ kind: 'content', id: '', label: '' }) }),
        goCell('About Dadi', { icon: 'info', onclick: () => nav('#/about') })));
  }
  const applyTheme = () => applyLook();

  function aboutView(root) {
    put(root, h('div', { class: 'about' }, h('p', { class: 'eyebrow' }, h('a', { href: '#/me', style: 'text-decoration:none' }, 'Me')), h('h1', { class: 'title' }, 'About Dadi'),
      h('p', null, 'Dadi is a learning and contribution program from the siṭaiṅge project. It teaches siṭaiṅga, the Chittagonian language, and was created by ', h('b', null, CFG.creator), '.'),
      h('p', null, 'The name is a word for grandmother used by many Chittagonians. It was chosen because many people learn the language from their grandparents.'),
      h('h2', null, 'Where the words come from'),
      h('p', null, 'Entries are read from the project\'s public files on GitHub (', h('a', { href: CFG.repoUrl, target: '_blank', rel: 'noopener noreferrer' }, CFG.repo), '). Contributions are sent back as issues for review. Nothing is accepted automatically, and every entry starts as unverified. The program does not raise an entry\'s status.'),
      h('h2', null, 'How the sounds are made'),
      h('p', null, 'There are no recordings yet. Words can be read aloud in three ways: by the device\'s own voice, by an optional clear voice (eSpeak NG, free software) that runs on the device, or by a small built-in synthesizer, which also produces the key sounds. All three read an approximation written for other languages and may be wrong for siṭaiṅga. They are used for the keyboard, the IPA chart and the word sheets, and the device voice is labelled "Device voice (approximate)". Lessons never use them. When a speaker consents to the publication of a recording, a Listen button appears on that entry; until then, lessons show no sound button. Listening exercises will be added once recordings from several speakers exist.'),
      h('h2', null, 'How sessions work'),
      h('p', null, 'A session takes 8 to 10 minutes. Reviews that are due come first, followed by up to five new items from one unit. Each new item is shown, then tested with a meaning match, a second recognition task and a first production task, and is tested again later in the same session. Review timing comes from FSRS, an open scheduler (MIT licence, Open Spaced Repetition project), set to 90% desired retention and a maximum interval of 180 days. The design is described in docs/dadi/LEARNING_DESIGN.md.'),
      h('p', null, 'Dadi has no streaks, points, hearts or leaderboards. Unit order uses a hand-set frequency rank, not a corpus count.'),
      h('h2', null, 'Licence and privacy'),
      h('p', null, 'The program code is dedicated to the public domain (CC0 1.0). Icons are Tabler Icons (MIT licence). Dadi has no tracking, cookies or advertising. Progress stays on this device. Contributions you send become public once reviewers use them.'),
      h('p', null, h('a', { href: CFG.repoUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Project on GitHub'), CFG.contactEmail ? [' or write to ', h('a', { href: 'mailto:' + CFG.contactEmail }, CFG.contactEmail)] : null, '.')));
  }


  /* ---------- start ---------- */
  async function boot() {
    applyLook(); audio.ready();
    Icons.load('data/icons.json').then((ok) => { if (ok && /^#\/(learn|words)?$/.test(location.hash || '#/learn')) route(); });
    const net = document.getElementById('net'); const upd = () => { net.textContent = navigator.onLine ? '' : 'Offline. Changes are saved on this device.'; }; upd(); window.addEventListener('online', upd); window.addEventListener('offline', upd);
    if (Store.restoredFrom) toast('Saved data was restored from ' + Store.restoredFrom + ' because the main copy was damaged.');
    const cached = Store.cachedRepo();
    if (cached && cached.entries && cached.entries.length) { setEntries(cached.entries); repoInfo = { from: 'cache', at: cached.fetchedAt, errors: [], err: null }; }
    else { const seed = await loadSeed(); if (seed && seed.entries) { setEntries(seed.entries); repoInfo = { from: 'seed', at: seed.builtAt, errors: [], err: null }; } }
    try { await loadThemes(); } catch (e) { /* the bundled units stay */ }
    loadConsensus();
    route();
    if (!S().settings.tourDone) setTimeout(() => tour(0), 600);
    if (window.ResizeObserver) new ResizeObserver(() => { document.documentElement.style.setProperty('--kb-h', (dock.hidden ? 0 : dock.offsetHeight) + 'px'); }).observe(dock);
    if (navigator.onLine) refreshRepo({ quiet: true });
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { /* works without it */ });
  }
  window.DadiApp = { route, nav, get index() { return index; }, Store, refreshRepo, setEntries };
  boot();
})();
