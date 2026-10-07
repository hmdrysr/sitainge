/* Dadi app shell: screens, routing and glue (CC0). Logic lives in the other files so it can be tested without a browser.
   Every string shown from data is inserted as text, never as HTML. Only the project's own bundled pictures use innerHTML. */
(function () {
  'use strict';
  const CFG = Object.assign({ repo: 'hmdrysr/sitainge', branch: 'main', contactEmail: '', creator: 'Hamid Yasir', repoUrl: 'https://github.com/hmdrysr/sitainge' }, window.DADI_CONFIG || {});
  const Store = DadiStore.create();
  const S = () => Store.state;
  const audio = DadiAudio.create({ settings: () => S().settings });
  const gh = DadiGitHub.create({ clientId: CFG.githubClientId, relayUrl: CFG.relayUrl, repo: CFG.repo });
  const Data = DadiData, Srs = DadiSrs, Art = DadiArt;
  let index = Data.buildIndex([]), lessonList = [], repoInfo = { from: 'none', at: null, errors: [], err: null };
  const main = document.getElementById('app'), layer = document.getElementById('layer'), dock = document.getElementById('kbdock');
  const kb = DadiKeyboard.create({ audio: { play: (t) => audio.play(t), playSymbol: (t) => audio.playSymbol(t) }, close: () => closeKeyboard() });

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
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const when = (iso) => { try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; } };
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

  function trustBadge(e) {
    const p = e._pron;
    if (e.recording) return h('span', { class: 'badge rec' }, 'Recording');
    if (p.how === 'ipa') return h('span', { class: 'badge ipa', title: p.status }, /speaker|phonetician|audio/.test(p.status) ? 'IPA from a person' : 'IPA, unchecked');
    if (p.how === 'reading') return h('span', { class: 'badge reading', title: 'The sound is a machine reading of the spelling' }, 'Machine reading');
    return h('span', { class: 'badge none', title: p.status }, 'No sound yet');
  }
  const LEVEL_TEXT = { A: 'A: directly recorded or documented', B: 'B: confirmed by several speakers or sources', C: 'C: strongly supported', D: 'D: proposed', E: 'E: unknown', unassessed: 'Not yet assessed' };

  /* ---------- data ---------- */
  function setEntries(entries) {
    index = Data.buildIndex(entries.map((e) => { const c = Object.assign({}, e); delete c._fold; delete c._pron; delete c._trust; return c; }));
    lessonList = Data.lessons(index);
  }
  async function loadSeed() {
    try { const r = await fetch('data/seed.json'); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } catch (e) { return null; }
  }
  async function refreshRepo(opts) {
    opts = opts || {};
    try {
      const r = await Data.scrape({ repo: CFG.repo, branch: CFG.branch, token: signedIn() ? S().auth.token : null });
      if (!r.entries.length) throw new Error('nothing was found in the repository');
      Store.cacheRepo({ entries: r.entries, fetchedAt: r.fetchedAt, files: r.files });
      setEntries(r.entries); repoInfo = { from: 'github', at: r.fetchedAt, errors: r.errors, err: null };
      if (!opts.quiet) toast('Updated from GitHub: ' + index.all.length + ' entries.');
      if (/^#\/(learn|words|teach)?$/.test(location.hash) || !location.hash) route();
    } catch (e) {
      repoInfo.err = e.message;
      if (!opts.quiet) toast('Could not reach GitHub (' + e.message + '). Showing the saved copy.');
    }
  }

  /* ---------- progress ---------- */
  function bumpDay() {
    Store.update((st) => {
      const t = today(); if (st.stats.lastDay === t) return;
      const y = new Date(); y.setDate(y.getDate() - 1);
      const ys = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
      st.stats.streak = st.stats.lastDay === ys ? (st.stats.streak || 0) + 1 : 1; st.stats.lastDay = t;
    }, 'streak', 'practised today');
  }
  const addXp = (n) => Store.update((st) => { st.stats.xp = (st.stats.xp || 0) + n; }, 'xp', '+' + n);
  const dueIds = () => Object.keys(S().cards).filter((id) => index.byId.has(id) && Srs.isDue(S().cards[id]));

  /* ---------- router ---------- */
  const ROUTES = [
    [/^#\/learn$/, learnView], [/^#\/lesson\/(\d+)$/, lessonView], [/^#\/review$/, reviewView], [/^#\/words$/, wordsView], [/^#\/(?:write|type)$/, writeView], [/^#\/watch$/, watchView],
    [/^#\/teach$/, teachView], [/^#\/teach\/new(?:\?(.*))?$/, teachNew], [/^#\/me$/, meView], [/^#\/about$/, aboutView]
  ];
  function nav(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function route() {
    audio.stop(); closeSheet(); closeKeyboard();
    const hash = location.hash || '#/learn';
    if (CFG.requireSignIn && gh.configured && !signedIn() && !sessionStorageGet('dadi.skipgate')) { gateView(); setTab(''); return; }
    let m = null, fn = null;
    for (const [re, f] of ROUTES) { m = hash.match(re); if (m) { fn = f; break; } }
    main.textContent = '';
    if (!fn) { nav('#/learn'); return; }
    const seg = hash.split('/')[1].split('?')[0];
    document.body.classList.toggle('focus', seg === 'lesson' || seg === 'review');
    setTab(seg === 'lesson' || seg === 'review' || seg === 'watch' ? 'learn' : seg === 'type' ? 'write' : seg === 'about' ? 'me' : seg);
    fn(main, ...m.slice(1)); window.scrollTo(0, 0);
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
      put(box, h('h2', null, 'Appearance'), h('p', { class: 'muted small' }, 'Saved on this device. No account needed.'),
        h('h3', null, 'Brightness'),
        h('div', { class: 'segc', role: 'group', 'aria-label': 'Brightness' }, [['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String((cur.theme || 'system') === v), onclick: () => set('theme', v) }, t))),
        h('h3', null, 'Colour'),
        h('div', { class: 'swatches', role: 'group', 'aria-label': 'Colour' }, SCHEMES.map(([v, t, c]) => h('button', { type: 'button', class: 'swatch', 'aria-pressed': String((cur.scheme || 'indigo') === v), onclick: () => set('scheme', v) }, h('i', { style: 'background:' + c }), t))),
        h('button', { class: 'btn block', type: 'button', style: 'margin-top:24px', onclick: () => sh.close() }, 'Done'));
    }
    redraw(); sh = sheet(box, { label: 'Appearance' });
  }

  /* ---------- Write: sound keyboard and translator ---------- */
  let writeMode = 'keys', trText = '';
  function writeView(root) {
    put(root, h('h1', { class: 'title' }, 'Write'),
      h('p', { class: 'lede' }, writeMode === 'keys' ? 'Type a word by sound. Every key says its sound.' : 'Turn English into siṭaiṅga, using only words the project holds.'),
      h('div', { class: 'segc', role: 'group', 'aria-label': 'Mode' }, [['keys', 'Keyboard'], ['translate', 'Translate']].map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(writeMode === v), onclick: () => { writeMode = v; route(); } }, t))));
    const body = h('div', { class: 'sec' }); root.append(body);
    if (writeMode === 'keys') keysPane(body); else translatePane(body);
  }
  function keysPane(body) {
    const field = h('textarea', { class: 'input ipa typebox', rows: '3', placeholder: 'Tap here, then tap keys', 'aria-label': 'Type with sounds', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const out = h('p', { class: 'muted small', 'aria-live': 'polite', style: 'margin-top:12px' });
    field.addEventListener('click', () => { if (dock.hidden) openKeyboard(field); });
    put(body, field,
      h('div', { class: 'row', style: 'margin-top:12px' },
        h('button', { class: 'btn', type: 'button', onclick: async () => { if (!field.value.trim()) { out.textContent = 'Type something first.'; return; } const r = await audio.play(field.value.trim()); out.textContent = r.ok ? (r.how === 'dadi' ? 'Played with Dadi\'s own sound, which is an approximation.' : 'Played with a device or clear voice reading a sound-alike. It is an approximation.') : (r.reason || 'Could not play.'); } }, 'Hear it'),
        h('button', { class: 'btn tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(field.value); toast('Copied.'); } catch (e) { toast('Could not copy. Select the text and copy it.'); } } }, 'Copy'),
        h('a', { class: 'btn tint', href: '#/teach/new', onclick: (e) => { e.preventDefault(); nav('#/teach/new?ipa=' + encodeURIComponent(field.value.trim())); } }, 'Add as a contribution')),
      out,
      h('div', { class: 'note' }, 'Not sure how to write a sound? Tap a key that is close. The strip above the keys offers neighbours. Tap one to swap it in, then press Hear it. What you pick is saved as "chosen by ear", which reviewers treat as a lead, not a fact.'));
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
    const input = h('textarea', { class: 'input', rows: '4', placeholder: 'Type or paste English', 'aria-label': 'English text', autocapitalize: 'sentences' }, trText);
    const result = h('div', { class: 'card', hidden: true, 'aria-live': 'polite' }), aiBox = h('div');
    let last = null;
    function paint() {
      trText = input.value; aiBox.textContent = '';
      if (!trText.trim()) { result.hidden = true; last = null; return; }
      last = T.translate(trText, G); result.hidden = false; result.textContent = '';
      const out = h('div', { class: 'tr-out' }); last.parts.forEach((p) => out.append(p.t === 'hit' ? h('mark', { title: p.s + ' (' + (p.level === 'unassessed' ? 'not yet assessed' : 'level ' + p.level) + ')' }, p.out) : p.s));
      const pct = Math.round(last.coverage * 100);
      put(result, out, h('div', { class: 'meter', role: 'img', 'aria-label': pct + ' percent of words replaced' }, h('i', { style: 'width:' + pct + '%' })),
        h('p', { class: 'small muted' }, last.hits + ' of ' + last.words + ' words replaced from the project dictionary. Highlighted words are unverified. Everything else stays in English.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn small tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(T.plain(last)); toast('Copied.'); } catch (e) { toast('Could not copy.'); } } }, 'Copy'),
          h('button', { class: 'btn small tint', type: 'button', onclick: () => aiRun() }, DadiAI.ready(DadiAI.load()) ? 'Ask my AI' : 'Copy a prompt for my AI')));
    }
    async function aiRun() {
      const cfg = DadiAI.load(), prompt = DadiAI.buildPrompt(trText, last.parts.filter((p) => p.t === 'hit'), {});
      if (!DadiAI.ready(cfg)) { try { await navigator.clipboard.writeText(prompt); toast('Prompt copied. Paste it into your AI.'); } catch (e) { toast('Could not copy.'); } return; }
      aiBox.textContent = ''; aiBox.append(h('p', { class: 'muted small' }, h('span', { class: 'spin' }), 'Asking your AI...'));
      try { const t = await DadiAI.ask(cfg, prompt); aiBox.textContent = ''; put(aiBox, h('div', { class: 'card', style: 'margin-top:12px' }, h('p', { class: 'small muted' }, 'AI draft, unverified. Nothing here is evidence.'), h('div', { class: 'tr-out' }, t))); }
      catch (e) { aiBox.textContent = ''; aiBox.append(h('p', { class: 'err' }, e.message)); }
    }
    input.addEventListener('input', paint);
    const bm = h('textarea', { class: 'input', readonly: true, rows: '3', 'aria-label': 'Bookmarklet code', style: 'font-size:12px;font-family:ui-monospace,Menlo,monospace' }, bookmarklet());
    put(body, input, h('div', { class: 'stack', style: 'margin-top:12px' }, result, aiBox),
      h('div', { class: 'group-title' }, 'Translate any web page'),
      h('div', { class: 'card stack' },
        h('p', { class: 'small', style: 'margin:0' }, 'Make a bookmark whose address is the code below. Open any page, tap the bookmark, and its words are replaced in place from the project dictionary. Undo restores the page. Some sites block bookmarklets. If yours does, paste the text above instead.'),
        bm, h('button', { class: 'btn small tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(bm.value); toast('Code copied.'); } catch (e) { bm.select(); toast('Select the code and copy it.'); } } }, 'Copy bookmark code')),
      h('p', { class: 'group-foot' }, 'This tool looks up meanings. It does not know grammar, so word order and endings follow English. It will improve as speakers add words.'));
    paint();
  }

  /* ---------- first-time tour ---------- */
  const TOUR = [
    ['Welcome to Dadi', 'Dadi helps you learn siṭaiṅga, the Chittagonian language, and lets speakers add what they know. This quick tour shows where things are. You can skip it any time.', ''],
    ['Learn', 'Short lessons. You listen, repeat, then answer before you see the answer. Words you miss come back sooner.', 'learn'],
    ['Words', 'The dictionary. Each entry shows how far it can be trusted.', 'words'],
    ['Write', 'A sound keyboard with every IPA symbol, where each key says its sound, and a translator that works from the project\'s own words.', 'write'],
    ['Teach', 'Add a word, another way people say it, or a correction. Nothing leaves your device until you press Send.', 'teach'],
    ['Me', 'Voice, appearance, your own AI, backups and sign-in with GitHub. Sign-in is optional.', 'me']
  ];
  function tour(start) {
    let i = start || 0; const box = h('div'); let sh;
    const hl = (t) => { document.querySelectorAll('.tour-hl').forEach((n) => n.classList.remove('tour-hl')); const n = t ? document.querySelector('.tabs a[data-tab="' + t + '"]') : null; if (n) n.classList.add('tour-hl'); };
    const finish = () => { hl(''); Store.update((st) => { st.settings.tourDone = true; }, 'settings', 'tour done'); if (sh) sh.close(); };
    function draw() {
      const [title, text, target] = TOUR[i]; hl(target); box.textContent = '';
      put(box, h('p', { class: 'small muted' }, (i + 1) + ' of ' + TOUR.length), h('h2', null, title), h('p', null, text),
        h('div', { class: 'stack', style: 'margin-top:16px' },
          i < TOUR.length - 1 ? h('button', { class: 'btn block', type: 'button', onclick: () => { i++; draw(); } }, 'Next') : h('button', { class: 'btn block', type: 'button', onclick: finish }, 'Start learning'),
          h('div', { class: 'row' }, i > 0 ? h('button', { class: 'btn small tint', type: 'button', onclick: () => { i--; draw(); } }, 'Back') : null,
            i < TOUR.length - 1 ? h('button', { class: 'btn small tint', type: 'button', onclick: finish }, 'Skip the tour') : null)));
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

  /* ---------- Learn ---------- */
  let videosCache = null;
  async function loadVideos() {
    if (videosCache) return videosCache;
    try { const r = await fetch('../data/videos.json'); if (!r.ok) throw new Error('HTTP ' + r.status); videosCache = (await r.json()).filter((v) => !['rejected', 'flagged', 'unavailable'].includes(v.status)); } catch (e) { videosCache = []; }
    return videosCache;
  }
  function learnView(root) {
    const st = S(), playable = index.playable(), due = dueIds().length;
    const nextIdx = lessonList.findIndex((_, i) => !st.stats.lessonsDone[i]), learned = playable.filter((e) => st.cards[e.id]).length;
    put(root, h('h1', { class: 'title' }, 'Learn'), h('p', { class: 'lede' }, 'siṭaiṅga, one small lesson at a time.'));
    if (due) put(root, h('a', { class: 'cont', href: '#/review' }, h('div', null, h('div', { class: 'k' }, 'Ready now'), h('h2', null, 'Review ' + due + ' word' + (due === 1 ? '' : 's')), h('p', null, 'Just before you would forget them.')), h('span', { class: 'go', html: PLAY })));
    else if (nextIdx >= 0) put(root, h('a', { class: 'cont', href: '#/lesson/' + nextIdx }, h('div', null, h('div', { class: 'k' }, nextIdx ? 'Up next' : 'Start here'), h('h2', null, 'Lesson ' + (nextIdx + 1)), h('p', null, 'About three minutes.')), h('span', { class: 'go', html: PLAY })));
    else if (!lessonList.length) put(root, h('div', { class: 'card', style: 'margin-top:16px' }, h('b', null, 'No lessons yet'), h('p', { class: 'muted', style: 'margin:4px 0 12px' }, 'Lessons are built from words that can be played. Add what you know and they appear.'), h('a', { class: 'btn small', href: '#/teach/new' }, 'Add a word')));
    put(root, h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('b', null, String(st.stats.streak || 0)), h('span', null, 'day streak')),
      h('div', { class: 'stat' }, h('b', null, String(st.stats.xp || 0)), h('span', null, 'points')),
      h('div', { class: 'stat' }, h('b', null, String(learned)), h('span', null, 'of ' + playable.length + ' started'))));
    if (lessonList.length) {
      const shelf = h('div', { class: 'hscroll' });
      lessonList.forEach((ids, i) => {
        const es = ids.map((id) => index.byId.get(id)).filter(Boolean), done = !!st.stats.lessonsDone[i];
        const mosaic = h('div', { class: 'mosaic' }); es.slice(0, 4).forEach((e) => mosaic.append(h('span', { html: Art.art(e.gloss) })));
        shelf.append(h('button', { class: 'tile', type: 'button', onclick: () => nav('#/lesson/' + i) }, h('div', { class: 'tile-art' + (done ? ' done' : '') }, mosaic), h('span', { class: 'tile-t' }, 'Lesson ' + (i + 1)), h('span', { class: 'tile-s' }, es.map((e) => e.gloss).slice(0, 4).join(', '))));
      });
      put(root, h('section', { class: 'sec' }, h('div', { class: 'sh' }, h('h2', null, 'Lessons')), shelf));
    }
    const vsec = h('section', { class: 'sec', hidden: true }); root.append(vsec);
    loadVideos().then((vs) => {
      if (!vs.length || !vsec.isConnected) return;
      const shelf = h('div', { class: 'hscroll' });
      vs.forEach((v) => shelf.append(videoTile(v)));
      put(vsec, h('div', { class: 'sh' }, h('h2', null, 'Watch and listen'), h('a', { href: '#/watch' }, 'See all')), shelf); vsec.hidden = false;
    });
    put(root, h('details', { class: 'note', style: 'margin-top:24px' }, h('summary', null, 'How much to trust what you hear'),
      h('ul', null,
        h('li', null, 'Machine reading: nobody has said the IPA yet. The sound comes from reading the spelling like Latin letters. It can be wrong.'),
        h('li', null, 'IPA from a person: a speaker chose the sounds. Still unreviewed, so likely rather than certain.'),
        h('li', null, 'Recording: a real speaker. None exist yet.')),
      h('p', { class: 'small', style: 'margin:8px 0 0' }, 'Everything is unverified and gets better as speakers fix it. You can fix any word from the Teach tab.')));
  }
  function videoTile(v) {
    return h('button', { class: 'tile vtile', type: 'button', onclick: () => videoSheet(v) },
      h('div', { class: 'tile-art', html: PLAY }), h('span', { class: 'tile-t' }, v.label || v.title), h('span', { class: 'tile-s' }, v.channel + (v.status === 'approved' ? '' : ' · awaiting review')));
  }
  function videoSheet(v) {
    const frame = h('div', { class: 'vframe' }, h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?rel=0&playsinline=1', title: v.label || v.title, allow: 'encrypted-media; picture-in-picture', allowfullscreen: '', referrerpolicy: 'strict-origin-when-cross-origin' }));
    sheet(h('div', null, frame, h('h2', { style: 'margin-top:16px' }, v.label || v.title), h('p', { class: 'muted small' }, v.channel + '. ' + (v.status === 'approved' ? 'Checked by a moderator.' : 'Not yet checked by a moderator.') + ' Plays from YouTube with its privacy-enhanced player, only because you tapped play.'),
      h('div', { class: 'row' }, h('button', { class: 'btn small tint', type: 'button', onclick: () => { closeSheet(); reportSheet({ kind: 'video', id: v.id, label: v.label || v.title }); } }, 'Report a problem'), h('a', { class: 'btn small tint', href: 'https://www.youtube.com/watch?v=' + encodeURIComponent(v.id), target: '_blank', rel: 'noopener noreferrer' }, 'Open on YouTube'))), { label: v.label || v.title });
  }
  async function watchView(root) {
    put(root, h('h1', { class: 'title' }, 'Watch and listen'), h('p', { class: 'lede' }, 'Videos by people who speak or teach siṭaiṅga. Moderators check each one. If something is off, report it.'));
    const g = h('div', { class: 'stack' }); root.append(g);
    const vs = await loadVideos(); if (!g.isConnected) return;
    if (!vs.length) { g.append(h('div', { class: 'card' }, 'No videos are available right now. Check your connection and try again.')); return; }
    vs.forEach((v) => g.append(h('button', { class: 'cell card', type: 'button', style: 'padding:12px 16px', onclick: () => videoSheet(v) }, h('span', { class: 'play', html: PLAY }), h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, v.label || v.title), h('span', { class: 'cell-s' }, v.channel + (v.status === 'approved' ? '' : ' · awaiting review'))))));
  }
  /* Reports: a video, a photo or any entry. Signed in: sent as an issue. Otherwise: a prefilled GitHub page or copied text. */
  function reportSheet(what) {
    what = what || { kind: 'content', id: '', label: '' };
    const reasons = what.kind === 'video' ? [['low-quality', 'Poor quality or hard to follow'], ['wrong-language', 'Not siṭaiṅga, or mostly another language'], ['inaccurate', 'Teaches things that are wrong'], ['unsuitable', 'Unsuitable or offensive'], ['broken', 'Will not play'], ['other', 'Something else']] : [['inaccurate', 'Something is wrong'], ['low-quality', 'Poor quality'], ['unsuitable', 'Unsuitable or offensive'], ['other', 'Something else']];
    const why = h('select', { class: 'input', 'aria-label': 'What is wrong' }, reasons.map(([v, t]) => h('option', { value: v }, t)));
    const note = h('textarea', { class: 'input', rows: '3', placeholder: 'Anything that helps a moderator (optional)', 'aria-label': 'Details' });
    const title = '[' + (what.kind === 'video' ? 'Video' : 'Content') + ' report] ' + (what.id || what.label || 'general');
    const text = () => title + '\n\nItem: ' + (what.label || '') + (what.id ? ' (' + what.id + ')' : '') + '\nProblem: ' + why.value + '\nDetails: ' + (note.value.trim() || 'none') + '\n';
    let sh;
    const box = h('div', null, h('h2', null, 'Report a problem'), h('p', { class: 'muted small' }, what.label ? 'About: ' + what.label : 'Tell moderators about content that should be fixed or removed.'), h('label', { class: 'f' }, 'What is wrong?'), why, h('label', { class: 'f' }, 'Details'), note,
      h('div', { class: 'stack', style: 'margin-top:16px' },
        signedIn() ? h('button', { class: 'btn block', type: 'button', onclick: async () => { try { const r = await gh.createIssue(S().auth.token, { title, body: text() }); sh.close(); toast('Report sent. Thank you.'); void r; } catch (e) { toast('Could not send: ' + e.message); } } }, 'Send report') : null,
        h('a', { class: 'btn block' + (signedIn() ? ' tint' : ''), target: '_blank', rel: 'noopener noreferrer', href: CFG.repoUrl + '/issues/new?labels=' + (what.kind === 'video' ? 'video-report' : 'content-report') + '&title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(text()), onclick: () => { Store.update((st) => { st.stats.reports = (st.stats.reports || 0) + 1; }, 'report', what.kind + ' ' + (what.id || '')); } }, 'Open on GitHub'),
        h('button', { class: 'btn block tint', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(text()); toast('Copied. Send it to a moderator.'); } catch (e) { toast('Could not copy.'); } } }, 'Copy the report')),
      h('p', { class: 'group-foot' }, 'Reports are public on GitHub. Do not include personal details.'));
    sh = sheet(box, { label: 'Report a problem' });
  }

  /* ---------- lesson engine (listen, answer, spaced re-asking) ---------- */
  function lessonView(root, i) {
    const ids = lessonList[Number(i)]; if (!ids) { nav('#/learn'); return; }
    const es = ids.map((id) => index.byId.get(id)).filter(Boolean);
    const steps = es.map((e) => ({ t: 'intro', e })).concat(shuffle(es).map((e) => ({ t: 'listen', e })), shuffle(es).map((e) => ({ t: 'recall', e })));
    runSteps(root, steps, 'Lesson ' + (Number(i) + 1), () => { Store.update((st) => { st.stats.lessonsDone[i] = true; }, 'lesson', 'lesson ' + (Number(i) + 1) + ' finished'); });
  }
  function reviewView(root) {
    const es = dueIds().slice(0, 15).map((id) => index.byId.get(id));
    if (!es.length) { put(root, h('h1', null, 'Nothing due'), h('p', null, 'Come back later. The schedule brings words back just before you would forget them.'), h('a', { class: 'btn', href: '#/learn' }, 'Back to lessons')); return; }
    runSteps(root, es.map((e) => ({ t: 'recall', e })), 'Review', null);
  }

  function runSteps(root, steps, title, onDone) {
    let pos = 0, total = steps.length, correct = 0, graded = 0;
    const thread = h('span', { class: 'thread' }, h('i', { style: 'width:0%' }));
    const stage = h('div', { class: 'stage' });
    put(root, h('div', { class: 'lesson-top' }, h('button', { class: 'x', type: 'button', 'aria-label': 'Leave', onclick: () => nav('#/learn') }, '×'), thread, h('span', { class: 'small muted' }, title)), stage);
    const progress = () => { thread.firstChild.style.width = Math.min(100, Math.round(pos / total * 100)) + '%'; };
    function next() {
      audio.stop(); clearInterval(stage._timer); stage.textContent = ''; progress();
      if (pos >= steps.length) return finish();
      const s = steps[pos++];
      if (s.t === 'intro') introStep(stage, s, next); else if (s.t === 'listen') listenStep(stage, s, next, (ok) => { if (ok) { correct++; addXp(2); } });
      else recallStep(stage, s, next, (grade) => {
        graded++; if (grade === 'good' || grade === 'easy') addXp(3);
        if (grade === 'again' || grade === 'hard') { const at = Math.min(steps.length, pos + (grade === 'again' ? 3 : 5)); steps.splice(at, 0, { t: 'recall', e: s.e }); total++; }
      });
    }
    function finish() {
      bumpDay(); if (onDone) onDone();
      put(stage, h('div', { class: 'dadi-wrap', style: 'width:120px;height:120px;margin:0 auto', html: Art.dadi() }), h('h1', null, 'Well done'),
        h('p', null, graded ? 'You answered ' + graded + ' time' + (graded === 1 ? '' : 's') + ' and the schedule will bring each word back when it is due.' : 'Lesson finished.'),
        h('a', { class: 'btn block', href: '#/learn' }, 'Back to lessons'));
    }
    next();
  }

  const playBtn = (e, slow) => h('button', { class: 'play', type: 'button', 'aria-label': slow ? 'Hear slowly' : 'Hear it', html: PLAY, onclick: () => audio.play(e._pron.ipa, slow ? { speed: 0.6 } : undefined) });
  function wordBlock(e) {
    const alt = e.spellings.slice(1);
    return [h('div', { class: 'word' + ((e.spellings[0] || e.form).length > 24 ? ' long' : '') }, e.spellings[0] || e.form),
      alt.length ? h('p', { class: 'muted small' }, 'Also written: ' + alt.join(', ')) : null,
      S().settings.showIPA ? h('div', { class: 'ipa muted' }, '/' + e._pron.ipa + '/ ', trustBadge(e)) : null];
  }
  function introStep(stage, s, next) {
    const e = s.e;
    put(stage, h('div', { class: 'bigart', html: Art.art(e.gloss) }), ...wordBlock(e), h('div', { class: 'meaning' }, e.gloss + (e.formNote && e.formNote.length <= 30 ? ' (' + e.formNote + ')' : '')),
      h('div', { class: 'row', style: 'justify-content:center' }, playBtn(e), playBtn(e, true), h('span', { class: 'small muted' }, 'Normal and slow')),
      h('p', { class: 'small', style: 'margin-top:14px' }, 'Say it out loud, then ', h('a', { href: '#/teach/new?action=variant&rel=' + encodeURIComponent(e.id) }, 'tell us if you say it differently'), '.'),
      h('button', { class: 'btn block', type: 'button', onclick: next, style: 'margin-top:10px' }, 'Next'));
    audio.play(e._pron.ipa);
  }
  function listenStep(stage, s, next, report) {
    const e = s.e;
    const others = shuffle(index.playable().filter((x) => x.gloss !== e.gloss)).slice(0, 3).map((x) => x.gloss);
    const options = shuffle(Array.from(new Set([e.gloss].concat(others))));
    const fb = h('p', { 'aria-live': 'polite', class: 'small' });
    const nextBtn = h('button', { class: 'btn block', type: 'button', onclick: next, hidden: true }, 'Next');
    const list = h('div', { class: 'choices' });
    options.forEach((o) => {
      const b = h('button', { class: 'choice', type: 'button' }, o);
      b.addEventListener('click', () => {
        if (nextBtn.hidden === false) return;
        const ok = o === e.gloss; b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) Array.from(list.children).forEach((c) => { if (c.textContent === e.gloss) c.classList.add('right'); });
        fb.textContent = ok ? 'Yes.' : 'It means: ' + e.gloss + ' (' + (e.spellings[0] || e.form) + ')'; nextBtn.hidden = false; report(ok);
      });
      list.append(b);
    });
    put(stage, h('h2', null, 'What does it mean?'), h('div', { class: 'row', style: 'justify-content:center' }, playBtn(e), playBtn(e, true)), list, fb, nextBtn);
    audio.play(e._pron.ipa);
  }
  function recallStep(stage, s, next, report) {
    const e = s.e; const card = S().cards[e.id];
    const secs = 5; let revealed = false, timer = null;
    const num = h('div', { class: 't' }, String(secs));
    const ring = h('div', { class: 'ring go', style: '--secs:' + secs + 's' }, h('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' }, h('circle', { class: 'bgc', cx: '50', cy: '50', r: '46' }), h('circle', { class: 'fgc', cx: '50', cy: '50', r: '46' })), num);
    const answer = h('div', { hidden: true });
    const show = h('button', { class: 'btn block', type: 'button' }, 'Show the answer');
    let left = secs; timer = setInterval(() => { left = Math.max(0, left - 1); num.textContent = String(left); if (!left) clearInterval(timer); }, 1000);
    show.addEventListener('click', () => {
      if (revealed) return; revealed = true; clearInterval(timer); show.hidden = true; ring.hidden = true; answer.hidden = false;
      const pv = Srs.preview(card); const now = new Date();
      const mk = (g, label) => h('button', { class: 'grade g-' + g, type: 'button', onclick: () => {
        Store.update((st) => { st.cards[e.id] = Srs.review(st.cards[e.id], g); }, 'review', g, e.id); report(g); next();
      } }, label, h('small', null, Srs.label(pv[g], now)));
      put(answer, ...wordBlock(e), h('div', { class: 'row', style: 'justify-content:center' }, playBtn(e), playBtn(e, true)),
        h('p', { class: 'muted' }, 'How well did you know it?'), h('div', { class: 'grades' }, mk('again', 'Not at all'), mk('hard', 'Barely'), mk('good', 'Knew it'), mk('easy', 'Easy')));
      audio.play(e._pron.ipa);
    });
    put(stage, h('p', { class: 'muted' }, 'Say it out loud before you look.'), h('div', { class: 'bigart', html: Art.art(e.gloss) }), h('div', { class: 'word', style: 'font-family:var(--font-ui);font-size:1.6rem' }, e.gloss), ring, show, answer);
    stage._timer = timer;
  }

  /* ---------- Words (dictionary) ---------- */
  let wordFilter = { q: '', kind: 'all', ipaOnly: false };
  function wordsView(root) {
    const input = h('input', { class: 'search', type: 'search', placeholder: 'Search', 'aria-label': 'Search the dictionary', value: wordFilter.q, autocomplete: 'off' });
    const list = h('div', { class: 'group' }), count = h('p', { class: 'group-foot', 'aria-live': 'polite' });
    const chip = (label, key, val, pressed) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(pressed), onclick: () => { if (key === 'ipaOnly') wordFilter.ipaOnly = !wordFilter.ipaOnly; else wordFilter.kind = val; paint(); chips.replaceWith((chips = makeChips())); } }, label);
    const makeChips = () => h('div', { class: 'chips' }, chip('Everything', 'kind', 'all', wordFilter.kind === 'all'), chip('Words', 'kind', 'word', wordFilter.kind === 'word'),
      chip('Sentences', 'kind', 'text', wordFilter.kind === 'text'), chip('IPA from a person', 'ipaOnly', null, wordFilter.ipaOnly));
    let chips = makeChips();
    function paint() {
      wordFilter.q = input.value;
      let r = index.search(wordFilter.q);
      if (wordFilter.kind === 'word') r = r.filter((e) => e.kind === 'word'); else if (wordFilter.kind === 'text') r = r.filter((e) => e.kind !== 'word');
      if (wordFilter.ipaOnly) r = r.filter((e) => e.ipa && /speaker|phonetician|audio/.test(e.ipaStatus));
      r = r.slice().sort((a, b) => a.gloss.toLowerCase() < b.gloss.toLowerCase() ? -1 : 1);
      list.textContent = '';
      r.slice(0, 200).forEach((e) => {
        const can = e._pron.complete;
        list.append(h('div', { class: 'entry' }, h('div', { class: 'pic', html: Art.art(e.gloss) }),
          h('button', { class: 'main', type: 'button', onclick: () => detail(e) }, h('span', { class: 'form' }, e.spellings[0] || e.form), h('span', { class: 'gloss' }, e.gloss), h('span', null, trustBadge(e))),
          h('button', { class: 'play', type: 'button', html: PLAY, disabled: !can, 'aria-label': 'Hear ' + (e.spellings[0] || e.form), onclick: () => audio.play(e._pron.ipa) })));
      });
      count.textContent = r.length + ' entr' + (r.length === 1 ? 'y' : 'ies') + (r.length > 200 ? ' (showing 200; search to narrow)' : '');
      if (!r.length) list.append(h('div', { class: 'cellwrap' }, h('p', null, 'Nothing matches. If you know this word, add it.'), h('a', { class: 'btn small', href: '#/teach/new?gloss=' + encodeURIComponent(wordFilter.q) }, 'Add it')));
    }
    input.addEventListener('input', paint);
    const src = repoInfo.from === 'github' ? 'From GitHub, updated ' + when(repoInfo.at) : (Store.cachedRepo() ? 'Saved copy from ' + when(Store.cachedRepo().fetchedAt) : 'Built-in copy');
    put(root, h('h1', { class: 'title' }, 'Words'), h('p', { class: 'lede' }, 'Everything the project holds, with how far to trust it.'), input, chips, list, count,
      h('p', { class: 'group-foot' }, src + '. ', h('button', { class: 'link', type: 'button', onclick: () => refreshRepo() }, 'Update now')));
    paint();
  }
  function detail(e) {
    const p = e._pron, can = p.complete;
    const how = p.how === 'ipa' ? 'IPA written by a person (' + p.status + ')' : p.how === 'reading' ? 'Machine reading of the spelling. Nobody has confirmed how this is said.' : 'No sound yet: ' + p.status;
    const facts = h('dl', { class: 'facts' });
    const row = (k, v) => { if (v) facts.append(h('dt', null, k), h('dd', null, v)); };
    row('Meaning', e.gloss); row('Kind', e.kind === 'word' ? 'Word' : e.kind === 'sentence' ? 'Sentence' : 'Longer text or saying'); row('Form', e.formNote);
    row('Where from', e.region); row('Evidence', LEVEL_TEXT[e.level] || e.level); row('Review state', e.state.toLowerCase()); row('Speaker confidence', e.confidence); row('Note', e.notes);
    row('Source', e.source);
    if (e.path) facts.append(h('dt', null, 'File'), h('dd', null, h('a', { href: CFG.repoUrl + '/blob/' + CFG.branch + '/' + e.path, rel: 'noopener noreferrer', target: '_blank' }, e.path)));
    row('ID', e.id);
    sheet(h('div', null, h('div', { class: 'row' }, h('div', { style: 'width:64px;height:64px', html: Art.art(e.gloss) }), h('div', null, h('div', { class: 'word' + ((e.spellings[0] || e.form).length > 24 ? ' long' : ''), style: 'font-size:1.9rem' }, e.spellings[0] || e.form), h('div', { class: 'muted' }, e.gloss))),
      e.spellings.length > 1 ? h('p', { class: 'small' }, 'Also written: ' + e.spellings.slice(1).join(', ')) : null,
      h('p', { class: 'ipa' }, can ? '/' + p.ipa + '/' : ''), h('p', { class: 'small muted' }, how),
      h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', disabled: !can, onclick: () => audio.play(p.ipa) }, 'Hear it'), h('button', { class: 'btn small tint', type: 'button', disabled: !can, onclick: () => audio.play(p.ipa, { speed: 0.6 }) }, 'Hear it slowly')),
      facts,
      h('h3', null, 'Help improve this entry'),
      h('div', { class: 'row' },
        h('a', { class: 'btn small tint', href: '#/teach/new?action=variant&rel=' + encodeURIComponent(e.id) }, 'I say it differently'),
        h('a', { class: 'btn small tint', href: '#/teach/new?action=ipa&rel=' + encodeURIComponent(e.id) }, 'Fix the pronunciation'),
        h('a', { class: 'btn small tint', href: '#/teach/new?action=report&rel=' + encodeURIComponent(e.id) }, 'Report a problem'))), { label: e.gloss });
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
  function teachView(root) {
    const queued = S().queue.filter((q) => q.status === 'queued'), sent = S().queue.filter((q) => q.status === 'sent' || q.status === 'exported');
    const want = wantedWords();
    put(root, h('h1', { class: 'title' }, 'Teach'),
      h('p', { class: 'lede' }, 'If you speak siṭaiṅga, add what you say, in any spelling you would use with a friend. Reviewers read everything first. Nothing is accepted automatically.'),
      h('a', { class: 'btn block', href: '#/teach/new' }, 'Add a word or sentence'),
      h('div', { class: 'group-title' }, 'Waiting to send'));
    if (!queued.length) put(root, h('div', { class: 'card muted' }, 'Nothing waiting. What you add is saved on this device first.'));
    else {
      const qg = h('div', { class: 'group' }); root.append(qg);
      queued.forEach((q) => put(qg, h('div', { class: 'cellwrap' }, h('b', null, (q.action === 'report' ? 'Report: ' : '') + (q.form || q.gloss)), ' ', h('span', { class: 'muted' }, q.gloss && q.form ? q.gloss : ''),
        q.ipa ? h('div', { class: 'ipa small' }, '/' + q.ipa + '/') : null,
        h('button', { class: 'link small', type: 'button', onclick: async () => { if (await ask('Remove this?', h('p', null, 'It stays in your history log as removed.'), 'Remove', 'Keep')) { Store.update((st) => { const t = st.queue.find((x) => x.id === q.id); if (t) t.status = 'withdrawn'; }, 'queue-withdrawn', q.form || q.gloss, q.id); route(); } } }, 'Remove'))));
      put(root, h('div', { class: 'stack', style: 'margin-top:16px' }, h('button', { class: 'btn block', type: 'button', onclick: sendFlow }, 'Send ' + queued.length + ' to the project'),
        signedIn() ? h('p', { class: 'small ok' }, 'Signed in' + (S().auth.login ? ' as ' + S().auth.login : '')) : h('button', { class: 'btn block tint', type: 'button', onclick: signInSheet }, 'Sign in with GitHub')));
    }
    if (want.length) {
      put(root, h('div', { class: 'group-title' }, 'Words we still need'));
      const box = h('div', { class: 'chips' });
      want.slice(0, 30).forEach((g) => box.append(h('a', { class: 'chip', href: '#/teach/new?gloss=' + encodeURIComponent(g.replace(/ \(.*\)$/, '')) + (/\(/.test(g) ? '&ctx=' + encodeURIComponent(g.replace(/^.*\(|\)$/g, '')) : '') }, g)));
      put(root, box);
    }
    if (sent.length) put(root, h('p', { class: 'group-foot', style: 'margin-top:24px' }, sent.length + ' contribution' + (sent.length === 1 ? '' : 's') + ' sent so far. Thank you.'));
  }

  function teachNew(root, qs) {
    const p = new URLSearchParams(qs || ''), action = ['add', 'variant', 'ipa', 'report'].includes(p.get('action')) ? p.get('action') : 'add';
    const rel = p.get('rel') ? index.byId.get(p.get('rel')) : null;
    const f = { kind: rel ? rel.kind : (p.get('kind') || 'word'), gloss: rel ? rel.gloss : (p.get('gloss') || ''), form: action === 'ipa' && rel ? (rel.spellings[0] || rel.form) : '', variants: [''],
      ipa: p.get('ipa') || (action === 'ipa' && rel && rel.ipa ? rel.ipa : ''), ipaStatus: 'speaker-chosen-by-ear', register: '', confidence: '', note: p.get('ctx') ? 'Context: ' + p.get('ctx') : '' };
    const titles = { add: 'Add a word or sentence', variant: 'How do you say it?', ipa: 'Fix the pronunciation', report: 'Report a problem' };
    const err = h('p', { class: 'err', role: 'alert' });
    const inp = (id, o) => h('input', Object.assign({ id, class: 'input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' }, o || {}));
    const gloss = inp('f-gloss', { value: f.gloss, readonly: !!rel || null, placeholder: 'For example: water, or Let\'s go.' });
    const form = inp('f-form', { value: f.form, placeholder: 'Write it the way you would type it', readonly: action === 'ipa' || null });
    const varBox = h('div');
    const addVar = (v) => { const i = inp('', { value: v || '', placeholder: 'Another way people say it (optional)', 'aria-label': 'Another way people say it' }); varBox.append(i); return i; };
    addVar();
    const ipa = inp('f-ipa', { class: 'input ipa', value: f.ipa, placeholder: 'Optional. Use the keyboard below to build it by ear.', 'aria-label': 'IPA' });
    ipa.className = 'input ipa';
    const ipaStatus = h('select', { class: 'input', id: 'f-ipastatus', 'aria-label': 'How you got the IPA' },
      h('option', { value: 'speaker-chosen-by-ear' }, 'I chose the sounds by ear with the keyboard'), h('option', { value: 'speaker-described' }, 'I know IPA and wrote it myself'), h('option', { value: 'ai-drafted-unverified' }, 'It came from the spelling suggestion; I have not checked it'));
    let manual = false; ipaStatus.addEventListener('change', () => { manual = true; });
    ipa.addEventListener('input', () => { if (!manual && ipaStatus.value === 'ai-drafted-unverified') ipaStatus.value = 'speaker-chosen-by-ear'; });
    const ipaBox = h('div', { hidden: action === 'report' },
      h('label', { class: 'f', for: 'f-ipa' }, 'Pronunciation in IPA', h('span', { class: 'f-hint' }, 'You do not need to know IPA. Open the keyboard, tap sounds to hear them, then tap Hear it to check the whole word.')), ipa,
      h('div', { class: 'row', style: 'margin-top:8px' },
        h('button', { class: 'btn small', type: 'button', onclick: () => { openKeyboard(ipa); } }, 'IPA keyboard'),
        h('button', { class: 'btn small tint', type: 'button', onclick: () => { if (ipa.value.trim()) audio.play(ipa.value); else toast('Type or build some sounds first.'); } }, 'Hear it'),
        h('button', { class: 'btn small tint', type: 'button', onclick: () => {
          const g = DadiG2P.g2p(form.value || ''); if (!g.complete || !g.ipa) { toast('The spelling reader does not know some characters: ' + (g.unknown.join(' ') || 'empty spelling')); return; }
          ipa.value = g.ipa; manual = false; ipaStatus.value = 'ai-drafted-unverified'; audio.play(g.ipa); toast('A machine reading of your spelling. Adjust it until it sounds like you.');
        } }, 'Suggest from my spelling')),
      h('label', { class: 'f', for: 'f-ipastatus' }, 'Where did this IPA come from?'), ipaStatus);
    const conf = h('select', { class: 'input', id: 'f-conf' }, h('option', { value: '' }, 'Not said'), h('option', { value: 'sure' }, 'I am sure'), h('option', { value: 'fairly' }, 'Fairly sure'), h('option', { value: 'unsure' }, 'Not sure'));
    const reg = h('select', { class: 'input', id: 'f-reg' }, h('option', { value: '' }, 'Not said'), h('option', { value: 'everyday' }, 'Everyday speech'), h('option', { value: 'respectful' }, 'Respectful, for elders or strangers'), h('option', { value: 'dictionary' }, 'Dictionary or formal form'), h('option', { value: 'friends' }, 'With friends'));
    const note = h('textarea', { class: 'input', id: 'f-note', placeholder: action === 'report' ? 'What is wrong, and what do you say instead?' : 'Where it is used, who says it, anything useful (optional).' }, f.note);
    const kindSeg = h('div', { class: 'segc', role: 'group', 'aria-label': 'Kind' });
    ['word', 'sentence'].forEach((k) => kindSeg.append(h('button', { type: 'button', 'aria-pressed': String(f.kind === k), disabled: !!rel || null, onclick: (ev) => { f.kind = k; kindSeg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === ev.currentTarget))); } }, k === 'word' ? 'Word' : 'Sentence')));
    const save = h('button', { class: 'btn block', type: 'button', style: 'margin-top:24px' }, 'Save on this device');
    save.addEventListener('click', () => {
      err.textContent = '';
      const g = gloss.value.trim(), fm = form.value.trim(), nt = note.value.trim(), iv = ipa.value.trim();
      if (action !== 'report' && !g) { err.textContent = 'Say what it means in English.'; gloss.focus(); return; }
      if (action === 'report' && !nt) { err.textContent = 'Say what is wrong.'; note.focus(); return; }
      if ((action === 'add' || action === 'variant') && !fm) { err.textContent = 'Write how you say it.'; form.focus(); return; }
      if (action === 'ipa' && !iv) { err.textContent = 'Build the pronunciation with the keyboard first.'; ipa.focus(); return; }
      const vs = Array.from(varBox.querySelectorAll('input')).map((i) => i.value.trim()).filter(Boolean);
      const q = { id: uid(), action, kind: f.kind, gloss: g || (rel && rel.gloss) || '', form: fm, variants: vs, ipa: iv, ipaStatus: iv ? ipaStatus.value : '', note: nt, confidence: conf.value, register: reg.value,
        relatedId: rel ? rel.id : '', relatedForm: rel ? (rel.spellings[0] || rel.form) : '', status: 'queued', createdAt: new Date().toISOString() };
      Store.update((st) => { st.queue.push(q); }, 'queue-add', action + ': ' + (fm || g), q.id);
      closeKeyboard(); toast('Saved on this device.'); nav('#/teach');
    });
    put(root, h('h1', { class: 'title' }, titles[action]),
      rel ? h('p', { class: 'muted' }, action === 'report' ? 'About: ' : 'Existing entry: ', h('b', { class: 'ipa' }, (rel.spellings[0] || rel.form)), ' = ' + rel.gloss) : null,
      action === 'report' ? null : h('div', null, h('label', { class: 'f', for: 'f-gloss' }, 'What does it mean in English?'), gloss, !rel ? h('div', { style: 'margin-top:8px' }, kindSeg) : null),
      action === 'report' || action === 'ipa' ? null : h('div', null, h('label', { class: 'f', for: 'f-form' }, 'How do you say it?', h('span', { class: 'f-hint' }, 'Any spelling is fine. Use Roman (Latin) letters.')), form,
        h('label', { class: 'f' }, 'Other ways people say it'), varBox, h('button', { class: 'link small', type: 'button', onclick: () => addVar().focus() }, 'Add another way')),
      action === 'ipa' ? h('div', null, h('label', { class: 'f', for: 'f-form' }, 'Spelling'), form) : null,
      ipaBox,
      action === 'report' ? null : h('div', null, h('label', { class: 'f', for: 'f-reg' }, 'Which kind of speech is this?'), reg, h('label', { class: 'f', for: 'f-conf' }, 'How sure are you?'), conf),
      h('label', { class: 'f', for: 'f-note' }, action === 'report' ? 'What is wrong?' : 'Anything else?'), note, err, save,
      h('p', { class: 'small muted', style: 'margin-top:10px' }, 'Saved items stay on this device until you send them from the Teach tab. Whatever you send becomes public domain (CC0) if reviewers use it.'));
  }

  /* ---------- sending ---------- */
  const AGE = [['', 'Not said'], ['under-18', 'Under 18 (a parent or guardian must help)'], ['18-29', '18 to 29'], ['30-49', '30 to 49'], ['50-69', '50 to 69'], ['70+', '70 or older']];
  function profileForm(onSaved, needConsent) {
    const p = S().profile;
    const box = h('div');
    const chk = (id, label, val) => h('label', { class: 'check', for: id }, h('input', { type: 'checkbox', id, checked: !!val }), h('span', null, label));
    const adult = chk('p-adult', 'I am 18 or older, or a parent or guardian is helping me.', p.adult);
    const cc0 = chk('p-cc0', 'I understand that what I send becomes public domain under CC0 1.0 if reviewers use it, and that this cannot be taken back.', p.cc0);
    const loc = h('input', { class: 'input', id: 'p-loc', value: p.locality, placeholder: 'For example: the town or area you learned it in', autocomplete: 'off' });
    const age = h('select', { class: 'input', id: 'p-age' }, AGE.map(([v, t]) => h('option', { value: v, selected: p.age === v }, t)));
    const other = h('input', { class: 'input', id: 'p-other', value: p.otherLanguages, placeholder: 'For example: English, French', autocomplete: 'off' });
    const credit = h('select', { class: 'input', id: 'p-credit' }, h('option', { value: 'anonymous', selected: p.credit === 'anonymous' }, 'Anonymous'), h('option', { value: 'name', selected: p.credit === 'name' }, 'Use my name'), h('option', { value: 'id', selected: p.credit === 'id' }, 'A contributor ID only'));
    const cname = h('input', { class: 'input', id: 'p-cname', value: p.creditName, placeholder: 'Name to show', autocomplete: 'off' });
    const err = h('p', { class: 'err', role: 'alert' });
    box.append(adult, cc0,
      h('label', { class: 'f', for: 'p-loc' }, 'Where is your siṭaiṅga from?', h('span', { class: 'f-hint' }, 'Optional. Helps show regional differences.')), loc,
      h('label', { class: 'f', for: 'p-age' }, 'Age group (optional)'), age,
      h('label', { class: 'f', for: 'p-other' }, 'Other languages you speak (optional)'), other,
      h('label', { class: 'f', for: 'p-credit' }, 'How should you be credited?'), credit, h('div', { id: 'p-cn' }, h('label', { class: 'f', for: 'p-cname' }, 'Name'), cname),
      err, h('button', { class: 'btn block', type: 'button', style: 'margin-top:16px', onclick: () => {
        if (needConsent && (!adult.querySelector('input').checked || !cc0.querySelector('input').checked)) { err.textContent = 'Select both boxes to send contributions.'; return; }
        if (credit.value === 'name' && !cname.value.trim()) { err.textContent = 'Type the name you want shown.'; return; }
        Store.update((st) => { Object.assign(st.profile, { adult: adult.querySelector('input').checked, cc0: cc0.querySelector('input').checked, locality: loc.value.trim(), age: age.value, otherLanguages: other.value.trim(), credit: credit.value, creditName: credit.value === 'name' ? cname.value.trim() : '', languageName: 'Sitainge' }); }, 'profile', 'details saved');
        toast('Saved.'); if (onSaved) onSaved();
      } }, needConsent ? 'Save and continue' : 'Save'));
    const sync = () => { box.querySelector('#p-cn').hidden = credit.value !== 'name'; }; credit.addEventListener('change', sync); sync();
    return box;
  }

  async function sendFlow() {
    const prof = S().profile;
    if (!prof.adult || !prof.cc0) { const s = sheet(h('div', null, h('h2', null, 'Before you send'), h('p', null, 'Two quick confirmations, then it is saved for next time.'), profileForm(() => { s.close(); sendFlow(); }, true)), { label: 'Before you send' }); return; }
    let batches; try { batches = await DadiSubmit.build(S().queue, prof); } catch (e) { toast('Could not prepare the contributions: ' + e.message); return; }
    if (!batches.length) { toast('Nothing to send.'); return; }
    const errors = batches.flatMap((b) => b.errors);
    if (errors.length) { sheet(h('div', null, h('h2', null, 'Fix this first'), h('ul', null, errors.map((e) => h('li', null, e))), h('button', { class: 'btn', type: 'button', onclick: closeSheet }, 'Close')), { label: 'Fix this first' }); return; }
    const pii = batches.flatMap((b) => b.pii);
    if (pii.length) {
      const okay = await ask('Check for personal details', h('div', null, h('p', null, 'These look like personal information. Everything you send becomes public.'), h('ul', null, pii.map((x) => h('li', null, x.where + ': ' + x.kind)))), 'Send anyway', 'Go back and edit');
      if (!okay) return;
    }
    if (signedIn()) return sendBatches(batches);
    exportSheet(batches);
  }

  async function sendBatches(batches) {
    const s = sheet(h('div', null, h('h2', null, 'Sending'), h('p', null, h('span', { class: 'spin' }), 'Sending to the project on GitHub. Keep this open.')), { label: 'Sending' });
    const done = [];
    try {
      for (const b of batches) {
        const r = await gh.createIssue(S().auth.token, { title: b.title, body: DadiSubmit.issueBody(b, S().auth.login) });
        Store.update((st) => { st.queue.forEach((q) => { if (b.ids.includes(q.id)) { q.status = 'sent'; q.sentAt = new Date().toISOString(); q.issueUrl = r.url; } }); }, 'queue-sent', b.ids.length + ' contribution(s) sent as issue #' + r.number);
        done.push(r);
      }
      s.close();
      sheet(h('div', null, h('h2', null, 'Sent. Thank you.'), h('p', null, 'Reviewers will read it. You can follow it on GitHub:'), h('ul', null, done.map((r) => h('li', null, h('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, r.url)))), h('button', { class: 'btn', type: 'button', onclick: () => { closeSheet(); route(); } }, 'Done')), { label: 'Sent' });
    } catch (e) {
      s.close();
      if (e.code === 'expired') Store.update((st) => { st.auth = null; }, 'signout', 'sign-in expired');
      sheet(h('div', null, h('h2', null, done.length ? 'Part of it was sent' : 'Not sent'), h('p', { class: 'err' }, e.message), h('p', null, 'Nothing was lost. The rest is still saved on this device.'),
        h('div', { class: 'row' }, e.code === 'expired' ? h('button', { class: 'btn', type: 'button', onclick: signInSheet }, 'Sign in again') : null, h('button', { class: 'btn ghost', type: 'button', onclick: () => { closeSheet(); exportSheet(batches); } }, 'Send another way'))), { label: 'Not sent' });
    }
  }

  /* No GitHub account (or not signed in): export the same text by copy, file, email or share. */
  function exportSheet(batches) {
    const text = batches.map((b) => b.text).join('\n');
    const file = () => new File([text], 'dadi-contribution-' + today() + '.txt', { type: 'text/plain' });
    const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(file()); a.download = file().name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); };
    const ta = h('textarea', { class: 'input', readonly: true, rows: '6', 'aria-label': 'Your contribution text' }, text);
    const mark = async () => { if (await ask('Mark as sent?', h('p', null, 'Only do this if you have emailed, shared or posted the text. Otherwise it stays waiting.'), 'Yes, I sent it', 'Not yet')) { Store.update((st) => { st.queue.forEach((q) => { if (batches.some((b) => b.ids.includes(q.id))) { q.status = 'exported'; q.sentAt = new Date().toISOString(); } }); }, 'queue-exported', 'marked as sent outside GitHub'); closeSheet(); route(); } };
    const s = sheet(h('div', null, h('h2', null, 'Send it another way'),
      h('p', null, gh.configured ? 'You are not signed in. Sign in to send in one tap, or use one of these.' : 'Sign-in is not set up here. Use one of these. The text below is the whole contribution.'),
      gh.configured ? h('button', { class: 'btn block', type: 'button', onclick: signInSheet, style: 'margin-bottom:10px' }, 'Sign in with GitHub') : null,
      h('div', { class: 'row' },
        h('button', { class: 'btn small', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(text); toast('Copied.'); } catch (e) { ta.select(); toast('Select the text and copy it.'); } } }, 'Copy'),
        h('button', { class: 'btn small', type: 'button', onclick: download }, 'Save as file'),
        CFG.contactEmail ? h('button', { class: 'btn small', type: 'button', onclick: () => { if (text.length > 1500) { download(); toast('File saved. Attach it to the email.'); } location.href = 'mailto:' + CFG.contactEmail + '?subject=' + encodeURIComponent('Dadi contribution') + '&body=' + encodeURIComponent(text.length > 1500 ? 'My Dadi contribution is attached (dadi-contribution-' + today() + '.txt).' : text); } }, 'Email it') : null,
        navigator.canShare && navigator.canShare({ files: [file()] }) ? h('button', { class: 'btn small', type: 'button', onclick: () => navigator.share({ files: [file()], title: 'Dadi contribution' }).catch(() => {}) }, 'Share') : null),
      ta, h('p', { class: 'small muted' }, 'Best place for it is GitHub: ', h('a', { href: CFG.repoUrl + '/issues/new?template=interview-submission.yml', target: '_blank', rel: 'noopener noreferrer' }, 'open a new issue'), ' and paste the text. If you cannot, send it to someone who can, or email it.'),
      h('button', { class: 'link', type: 'button', onclick: mark }, 'I have sent it')), { label: 'Send it another way' });
    return s;
  }

  /* ---------- sign-in ---------- */
  function signInSheet() {
    closeSheet();
    if (!gh.configured) {
      sheet(h('div', null, h('h2', null, 'Sign-in is not set up here'), h('p', null, 'This copy of Dadi has no GitHub sign-in connected yet. Learning, the dictionary and drafting contributions all work. To send, copy the text, email it, or share it.'),
        h('p', { class: 'small muted' }, 'Project owners: see docs/dadi/AUTH_SETUP.md.'), h('button', { class: 'btn', type: 'button', onclick: closeSheet }, 'Close')), { label: 'Sign-in not set up' });
      return;
    }
    const ac = new AbortController();
    const body = h('div', null, h('h2', null, 'Sign in with GitHub'), h('p', null, h('span', { class: 'spin' }), 'Getting a code...'));
    const s = sheet(body, { label: 'Sign in with GitHub', onClose: () => ac.abort() });
    (async () => {
      try {
        const dev = await gh.deviceStart();
        body.textContent = '';
        body.append(h('h2', null, 'Sign in with GitHub'), h('p', null, 'Open GitHub, type this code, and approve Dadi. Dadi can only open issues in the Sitainge project, nothing else.'),
          h('div', { class: 'codebox', 'aria-label': 'Your code' }, dev.userCode),
          h('div', { class: 'row' }, h('a', { class: 'btn', href: dev.url, target: '_blank', rel: 'noopener noreferrer' }, 'Open GitHub'),
            h('button', { class: 'btn ghost', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(dev.userCode); toast('Code copied.'); } catch (e) { toast('Select the code and copy it.'); } } }, 'Copy code')),
          h('p', { class: 'muted small', style: 'margin-top:12px' }, h('span', { class: 'spin' }), 'Waiting for you to approve. This page continues by itself.'));
        const r = await gh.devicePoll(dev, ac.signal);
        let login = null; try { const w = await gh.whoami(r.token); login = w && w.login; } catch (e) { /* signed in anyway */ }
        Store.update((st) => { st.auth = { token: r.token, login, at: new Date().toISOString() }; }, 'signin', login ? 'signed in as ' + login : 'signed in');
        sheetClose = null; s.box.remove(); layer.textContent = ''; toast('Signed in' + (login ? ' as ' + login : '') + '.'); route();
      } catch (e) {
        if (ac.signal.aborted) return;
        body.textContent = ''; body.append(h('h2', null, 'Could not sign in'), h('p', { class: 'err' }, e.message), h('button', { class: 'btn', type: 'button', onclick: signInSheet }, 'Try again'));
      }
    })();
  }

  function gateView() {
    main.textContent = '';
    main.append(h('h1', { class: 'title' }, 'Welcome to Dadi'), h('p', { class: 'lede' }, 'Sign in with GitHub so your lessons and contributions go to the right place automatically.'),
      h('button', { class: 'btn block', type: 'button', onclick: signInSheet }, 'Sign in with GitHub'),
      h('p', { class: 'small muted', style: 'margin-top:16px' }, 'No account yet? GitHub is free. ', h('button', { class: 'link', type: 'button', onclick: () => { try { sessionStorage.setItem('dadi.skipgate', '1'); } catch (e) { /* ignore */ } route(); } }, 'Not now')));
  }

  /* ---------- Me ---------- */
  const goCell = (t, o) => h('button', { class: 'cell go', type: 'button', onclick: o.onclick }, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t', style: o.danger ? 'color:var(--alert)' : '' }, t), o.s ? h('span', { class: 'cell-s' }, o.s) : null), o.end ? h('span', { class: 'cell-end' }, o.end) : null);
  const actCell = (t, onclick, danger) => h('button', { class: 'cell', type: 'button', onclick }, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t', style: 'color:' + (danger ? 'var(--alert)' : 'var(--accent)') }, t)));
  const selCell = (label, id, opts, val, on) => { const s = h('select', { id, 'aria-label': label }, opts.map(([v, t]) => h('option', { value: v, selected: String(val) === String(v) }, t))); s.addEventListener('change', () => on(s.value)); return h('label', { class: 'cell', for: id }, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, label)), s); };
  const setting = (k, v, note) => Store.update((s2) => { s2.settings[k] = v; }, 'settings', note || (k + ' ' + v));
  const ENGINES = [['auto', 'Automatic'], ['device', 'Device voice'], ['clear', 'Clear voice'], ['dadi', 'Dadi sound']];

  function voiceSheet() {
    let sh; const box = h('div');
    function draw() {
      const info = audio.engineInfo(), st = S().settings; box.textContent = '';
      const dv = info.deviceVoices;
      put(box, h('h2', null, 'Voice'),
        h('p', { class: 'muted small' }, 'No recordings exist yet, so every voice here reads an approximation. Pick the one you find smoothest. Real recordings will replace them as speakers contribute.'),
        h('div', { class: 'group', style: 'margin-top:16px' },
          selCell('Word voice', 's-engine', ENGINES, st.engine || 'auto', (v) => { setting('engine', v); draw(); }),
          selCell('Speed', 's-speed', [[0.8, 'Slower'], [1, 'Normal'], [1.2, 'Faster']], st.speed || 1, (v) => setting('speed', Number(v))),
          selCell('Pitch', 's-pitch', [['low', 'Lower'], ['mid', 'Middle'], ['high', 'Higher']], st.pitch || 'mid', (v) => setting('pitch', v))),
        h('p', { class: 'group-foot' }, 'Automatic uses your device voice if it has a suitable one, then the clear voice if you turned it on, then Dadi\'s own sound.'),
        h('div', { class: 'group-title' }, 'Device voice'),
        h('div', { class: 'group' }, dv.length
          ? selCell('Voice', 's-dev', [['', 'Best match']].concat(dv.map((v) => [v.uri, v.name + ' (' + v.lang + ')'])), st.deviceVoice || '', (v) => setting('deviceVoice', v))
          : h('div', { class: 'cellwrap small muted' }, 'This device has no suitable voice installed, so Dadi uses another voice.')),
        h('p', { class: 'group-foot' }, 'Your device reads a sound-alike spelling of each word. Install more voices in your device settings and they appear here.'),
        h('div', { class: 'group-title' }, 'Clear voice'),
        h('div', { class: 'group' },
          selCell('Voice', 's-clear', DadiEspeak.VOICES, st.clearVoice || 'f3', (v) => setting('clearVoice', v)),
          h('label', { class: 'cell', for: 's-clearon' }, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, 'Use automatically')), h('input', { type: 'checkbox', id: 's-clearon', checked: !!st.clearOn, onchange: (e) => setting('clearOn', e.target.checked) })),
          actCell(st.clearReady ? 'Clear voice is saved on this device' : 'Download the clear voice (18 MB)', async () => {
            if (st.clearReady) return; toast('Downloading...');
            try { await audio.prepareClear(); setting('clearReady', true, 'clear voice ready'); toast('Clear voice saved. It works offline now.'); draw(); } catch (e) { toast(e.message); }
          })),
        h('p', { class: 'group-foot' }, 'Made with eSpeak NG, free software under the GPL. It runs on your device and works offline after the one-time download.'),
        h('div', { class: 'stack', style: 'margin-top:24px' },
          h('button', { class: 'btn block tint', type: 'button', onclick: async () => { const r = await audio.play('hana'); toast(r.ok ? 'Played with: ' + ({ device: 'your device voice', clear: 'the clear voice', dadi: 'Dadi\'s own sound' }[r.how] || 'a voice') + '.' : (r.reason || 'Could not play.')); } }, 'Hear a test word'),
          h('button', { class: 'btn block', type: 'button', onclick: () => sh.close() }, 'Done')));
    }
    draw(); sh = sheet(box, { label: 'Voice' });
  }

  function aiSheet() {
    let sh; const cfg = DadiAI.load(); const box = h('div');
    function draw() {
      box.textContent = ''; const k = DadiAI.KINDS[cfg.kind];
      const field = (key, label, ph, type) => h('label', { class: 'cell', style: 'display:grid;grid-template-columns:1fr;gap:4px;padding:12px 16px' }, h('span', { class: 'cell-s' }, label), h('input', { class: 'input', style: 'padding:0;min-height:28px;background:transparent', type: type || 'text', value: cfg[key] || '', placeholder: ph || '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', oninput: (e) => { cfg[key] = e.target.value; } }));
      put(box, h('h2', null, 'Connect your AI'),
        h('p', { class: 'muted small' }, 'Optional. Lets the translator and your own chatbot work with the project\'s words. The key stays in this browser, is never included in backups, and goes only to the address you choose. Its answers are always labelled unverified drafts.'),
        h('div', { class: 'group', style: 'margin-top:16px' }, selCell('Service', 'ai-kind', Object.keys(DadiAI.KINDS).map((x) => [x, DadiAI.KINDS[x].label]), cfg.kind, (v) => { cfg.kind = v; if (!cfg.endpoint || Object.values(DadiAI.KINDS).some((x) => x.endpoint === cfg.endpoint)) cfg.endpoint = DadiAI.KINDS[v].endpoint || ''; draw(); })),
        cfg.kind === 'copy' ? h('p', { class: 'group-foot' }, 'With no connection, the translator offers a ready-made prompt to paste into any chatbot. That works everywhere and needs no key.') :
          h('div', { class: 'group', style: 'margin-top:12px' }, k.needs.includes('endpoint') ? field('endpoint', 'Address', k.endpoint) : null, field('model', 'Model name', 'for example: gpt-4o-mini'), k.needs.includes('key') ? field('key', 'API key', 'kept on this device only', 'password') : null),
        h('div', { class: 'stack', style: 'margin-top:24px' },
          h('button', { class: 'btn block', type: 'button', onclick: () => { DadiAI.save(cfg); toast('Saved on this device.'); sh.close(); } }, 'Save'),
          cfg.kind !== 'copy' ? h('button', { class: 'btn block tint', type: 'button', onclick: async () => { DadiAI.save(cfg); if (!DadiAI.ready(cfg)) { toast('Fill in every field first.'); return; } toast('Testing...'); try { await DadiAI.ask(cfg, 'Reply with the single word: ready'); toast('Connected.'); } catch (e) { toast(e.message); } } }, 'Test the connection') : null,
          h('button', { class: 'btn block danger', type: 'button', onclick: () => { DadiAI.forget(); toast('Removed from this device.'); sh.close(); } }, 'Remove from this device')));
    }
    draw(); sh = sheet(box, { label: 'Connect your AI' });
  }
  const profileSheet = () => { let sh; sh = sheet(h('div', null, h('h2', null, 'About you'), h('p', { class: 'muted small' }, 'Used when you send contributions. All optional except the two confirmations.'), profileForm(() => sh.close(), false)), { label: 'About you' }); };
  function historySheet() {
    const hist = Store.history().slice(-60).reverse();
    sheet(h('div', null, h('h2', null, 'History on this device'), h('p', { class: 'muted small' }, 'Every change is recorded. Newest first.'), hist.length ? h('div', { class: 'group', style: 'margin-top:12px' }, hist.map((e) => h('div', { class: 'cellwrap small' }, h('b', null, e.type), e.detail ? ' ' + e.detail : '', h('div', { class: 'muted' }, when(e.t))))) : h('p', { class: 'muted' }, 'Nothing yet.')), { label: 'History' });
  }
  function meView(root) {
    const st = S(); const eng = audio.engineInfo();
    const file = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    file.addEventListener('change', async () => { const f = file.files[0]; if (!f) return; const r = Store.importAll(await f.text()); toast(r.ok ? 'Backup merged.' : r.error); if (r.ok) route(); });
    const aiOn = DadiAI.ready(DadiAI.load());
    put(root, h('h1', { class: 'title' }, 'Me'), h('p', { class: 'lede' }, 'Everything here stays on this device.'),
      h('div', { class: 'group' },
        goCell('GitHub', { end: signedIn() ? (st.auth.login || 'Signed in') : 'Not signed in', onclick: () => { if (signedIn()) ask('Sign out?', h('p', null, 'Your drafts stay on this device.'), 'Sign out', 'Stay signed in').then((y) => { if (y) { Store.update((s2) => { s2.auth = null; }, 'signout', 'signed out'); route(); } }); else signInSheet(); } }),
        goCell('About you', { onclick: profileSheet })),
      h('p', { class: 'group-foot' }, 'You can learn and draft contributions without signing in. Signing in lets you send in one tap.'),
      h('div', { class: 'group-title' }, 'Sound and look'),
      h('div', { class: 'group' },
        goCell('Voice', { end: (ENGINES.find((x) => x[0] === (st.settings.engine || 'auto')) || ENGINES[0])[1], s: eng.device ? 'Device voice found' : null, onclick: voiceSheet }),
        goCell('Appearance', { end: ((st.settings.theme || 'system') === 'system' ? 'Auto' : st.settings.theme === 'dark' ? 'Dark' : 'Light') + ', ' + (SCHEMES.find((x) => x[0] === (st.settings.scheme || 'indigo')) || SCHEMES[0])[1], onclick: lookSheet }),
        h('label', { class: 'cell', for: 's-ipa' }, h('span', { class: 'cell-main' }, h('span', { class: 'cell-t' }, 'Show IPA in lessons')), h('input', { type: 'checkbox', id: 's-ipa', checked: !!st.settings.showIPA, onchange: (e) => setting('showIPA', e.target.checked, 'showIPA ' + e.target.checked) }))),
      h('div', { class: 'group-title' }, 'Tools'),
      h('div', { class: 'group' }, goCell('Connect your AI', { end: aiOn ? 'On' : 'Off', onclick: aiSheet })),
      h('div', { class: 'group-title' }, 'Your data'),
      h('div', { class: 'group' },
        actCell('Download a backup', () => { const blob = new Blob([Store.exportAll()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dadi-backup-' + today() + '.json'; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }),
        actCell('Restore from a backup', () => file.click()), file,
        actCell('Update words from GitHub', () => refreshRepo()),
        goCell('History of changes', { onclick: historySheet }),
        actCell('Delete everything on this device', async () => { if (await ask('Delete everything on this device?', h('p', null, 'This removes progress, drafts, sign-in and your AI key from this device. Contributions you already sent stay on GitHub. A backup file is the only way back.'), 'Delete', 'Keep')) { DadiAI.forget(); Store.wipe(); toast('Deleted.'); route(); } }, true)),
      h('p', { class: 'group-foot' }, Store.persistent ? 'Saved on this device with two automatic backups. Nothing is sent unless you press Send.' : 'This browser blocked storage, so changes are lost when you close the page. Download a backup before you leave.'),
      h('div', { class: 'group-title' }, 'Help'),
      h('div', { class: 'group' },
        goCell('Show the tour again', { onclick: () => tour(0) }),
        goCell('Report a problem with content', { onclick: () => reportSheet({ kind: 'content', id: '', label: '' }) }),
        goCell('About Dadi', { onclick: () => nav('#/about') })));
  }
  const applyTheme = () => applyLook();

  function aboutView(root) {
    put(root, h('h1', { class: 'title' }, 'About Dadi'),
      h('div', { class: 'credit' }, h('div', { class: 'dadi-wrap', html: Art.dadi() }), h('p', null, 'Dadi is the learning and contribution tool for siṭaiṅga, the Chittagonian language, made for the Sitainge project. Created by ', h('b', null, CFG.creator), '.')),
      h('p', null, 'The name is the word many Chittagonians use for grandmother, because most people of this generation learned the language from theirs.'),
      h('h2', null, 'How it works'),
      h('p', null, 'Words and sentences come from the project\'s public files on GitHub (', h('a', { href: CFG.repoUrl, target: '_blank', rel: 'noopener noreferrer' }, CFG.repo), '). Contributions go back as reviewable issues. Nothing is accepted automatically, and everything starts as unverified.'),
      h('h2', null, 'How the sounds are made'),
      h('p', null, 'There are no recordings yet. Words can be read three ways: by your device\'s own voice, by an optional clear voice (eSpeak NG, free software) that runs on your device, or by Dadi\'s small built-in synthesizer, which also makes the sound of every key on the IPA keyboard. All three read an approximation, so they are good for telling sounds apart and checking what you typed, but they are not a speaker. Real recordings will replace them as speakers contribute.'),
      h('h2', null, 'How lessons work'),
      h('p', null, 'Each lesson has you listen, choose the meaning, then answer before you see the answer. Words you miss come back a few cards later in the same session, then on a schedule from FSRS, the open spaced-repetition scheduler used in Anki (MIT licence, by the Open Spaced Repetition project).'),
      h('h2', null, 'Licence and privacy'),
      h('p', null, 'The app and its pictures are dedicated to the public domain (CC0 1.0). Dadi has no tracking, no cookies and no ads. Progress stays on your device. Contributions you send are public once reviewers use them.'),
      h('p', null, h('a', { href: CFG.repoUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Project on GitHub'), CFG.contactEmail ? [' or write to ', h('a', { href: 'mailto:' + CFG.contactEmail }, CFG.contactEmail)] : null, '.'));
  }

  /* ---------- start ---------- */
  async function boot() {
    applyLook();
    const net = document.getElementById('net'); const upd = () => { net.textContent = navigator.onLine ? '' : 'Offline'; }; upd(); window.addEventListener('online', upd); window.addEventListener('offline', upd);
    if (Store.restoredFrom) toast('Your saved data was repaired from ' + Store.restoredFrom + '.');
    const cached = Store.cachedRepo();
    if (cached && cached.entries && cached.entries.length) { setEntries(cached.entries); repoInfo = { from: 'cache', at: cached.fetchedAt, errors: [], err: null }; }
    else { const seed = await loadSeed(); if (seed && seed.entries) { setEntries(seed.entries); repoInfo = { from: 'seed', at: seed.builtAt, errors: [], err: null }; } }
    route();
    if (!S().settings.tourDone) setTimeout(() => tour(0), 600);
    if (window.ResizeObserver) new ResizeObserver(() => { document.documentElement.style.setProperty('--kb-h', (dock.hidden ? 0 : dock.offsetHeight) + 'px'); }).observe(dock);
    if (navigator.onLine) refreshRepo({ quiet: true });
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { /* works without it */ });
  }
  window.DadiApp = { route, nav, get index() { return index; }, Store, refreshRepo, setEntries };
  boot();
})();
