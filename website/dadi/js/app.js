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
    layer.append(back, box);
    const close = () => { back.remove(); box.remove(); sheetClose = null; if (opts && opts.onClose) opts.onClose(); };
    back.addEventListener('click', close); sheetClose = close;
    const first = box.querySelector('button, input, select, textarea, a'); if (first) first.focus({ preventScroll: true });
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
    [/^#\/learn$/, learnView], [/^#\/lesson\/(\d+)$/, lessonView], [/^#\/review$/, reviewView], [/^#\/words$/, wordsView],
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
    setTab(hash.split('/')[1] === 'lesson' || hash.split('/')[1] === 'review' ? 'learn' : hash.split('/')[1].split('?')[0]);
    fn(main, ...m.slice(1)); window.scrollTo(0, 0);
  }
  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function setTab(t) { document.querySelectorAll('.tabs a').forEach((a) => { if (a.dataset.tab === t) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); }
  window.addEventListener('hashchange', route);

  /* ---------- keyboard dock ---------- */
  function openKeyboard(field, onChange) {
    dock.hidden = false; document.body.classList.add('kb-open');
    kb.mount(dock, field);
    if (onChange) field.addEventListener('input', onChange);
    field.focus({ preventScroll: true }); field.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function closeKeyboard() { dock.hidden = true; dock.textContent = ''; document.body.classList.remove('kb-open'); kb.unmount(); }

  /* ---------- Learn ---------- */
  function learnView(root) {
    const st = S(), playable = index.playable();
    const learned = playable.filter((e) => st.cards[e.id]).length, due = dueIds().length;
    put(root, 
      h('section', { class: 'hero' }, h('div', { class: 'dadi-wrap', html: Art.dadi() }),
        h('div', null, h('h1', null, 'Learn Sitainge'), h('p', { class: 'muted' }, 'Words and sentences that people have shared with the project. Listen, answer before the reveal, and come back to what you forget.'))),
      h('div', { class: 'chips' }, h('span', { class: 'chip' }, 'Streak: ' + (st.stats.streak || 0) + ' day' + ((st.stats.streak || 0) === 1 ? '' : 's')),
        h('span', { class: 'chip' }, 'Practice points: ' + (st.stats.xp || 0)), h('span', { class: 'chip' }, learned + ' of ' + playable.length + ' started')),
      due ? h('a', { class: 'btn block', href: '#/review' }, 'Review ' + due + ' due word' + (due === 1 ? '' : 's')) : null,
      h('details', { class: 'note' }, h('summary', null, 'How much to trust what you hear'),
        h('ul', null,
          h('li', null, 'Machine reading: no one has said the IPA yet. The sound comes from reading the spelling like Latin letters. It can be wrong.'),
          h('li', null, 'IPA from a person: a speaker chose the sounds. Still unreviewed, so treat it as likely rather than certain.'),
          h('li', null, 'Recording: a real speaker. None exist yet.')),
        h('p', { class: 'small', style: 'margin-top:8px' }, 'All content is unverified and gets better as speakers fix it. You can fix any word with the Teach tab.')),
      h('h2', null, 'Your quilt'),
      h('p', { class: 'muted small' }, 'Each patch is a word you have started. The cloth fills as you practise.'),
      quilt(playable, st),
      h('h2', { style: 'margin-top:20px' }, 'Lessons'),
      lessonPath(st));
  }
  function quilt(playable, st) {
    const q = h('div', { class: 'quilt', role: 'img', 'aria-label': 'Quilt of started words' });
    playable.forEach((e, i) => q.append(h('span', { class: 'patch' + (st.cards[e.id] ? ' on p' + (i % 4) : '') })));
    if (!playable.length) q.append(h('span', { class: 'muted small' }, 'No playable words yet.'));
    return q;
  }
  function lessonPath(st) {
    if (!lessonList.length) return h('div', { class: 'note' }, 'There are no lessons yet because no entry can be played. Open Teach and add what you know. Words with Latin-letter spellings play right away.');
    const ol = h('ol', { class: 'path' });
    lessonList.forEach((ids, i) => {
      const es = ids.map((id) => index.byId.get(id)).filter(Boolean), done = !!st.stats.lessonsDone[i];
      const thumbs = h('div', { class: 'thumbs' }); es.slice(0, 6).forEach((e) => thumbs.append(h('span', { html: Art.art(e.gloss) })));
      ol.append(h('li', null, h('span', { class: 'node' + (done ? ' done' : '') }, done ? '✓' : String(i + 1)),
        h('button', { class: 'lesson-btn', type: 'button', onclick: () => nav('#/lesson/' + i) }, h('b', null, 'Lesson ' + (i + 1)),
          h('span', { class: 'muted small' }, es.map((e) => e.gloss).slice(0, 4).join(', ') + (es.length > 4 ? ', ...' : '')), thumbs)));
    });
    return ol;
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
    const input = h('input', { class: 'search', type: 'search', placeholder: 'Search English or Sitainge spelling', 'aria-label': 'Search the dictionary', value: wordFilter.q, autocomplete: 'off' });
    const list = h('ul', { class: 'rows' }), count = h('p', { class: 'muted small', 'aria-live': 'polite' });
    const chip = (label, key, val, pressed) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(pressed), onclick: () => { if (key === 'ipaOnly') wordFilter.ipaOnly = !wordFilter.ipaOnly; else wordFilter.kind = val; paint(); chips.replaceWith((chips = makeChips())); } }, label);
    const makeChips = () => h('div', { class: 'chips' }, chip('Everything', 'kind', 'all', wordFilter.kind === 'all'), chip('Words', 'kind', 'word', wordFilter.kind === 'word'),
      chip('Sentences and sayings', 'kind', 'text', wordFilter.kind === 'text'), chip('IPA from a person', 'ipaOnly', null, wordFilter.ipaOnly));
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
        list.append(h('li', null, h('div', { class: 'pic', html: Art.art(e.gloss) }),
          h('button', { class: 'main', type: 'button', onclick: () => detail(e) }, h('span', { class: 'form' }, e.spellings[0] || e.form), h('span', { class: 'gloss' }, e.gloss), h('span', null, trustBadge(e))),
          h('button', { class: 'play', type: 'button', html: PLAY, disabled: !can, 'aria-label': 'Hear ' + (e.spellings[0] || e.form), onclick: () => audio.play(e._pron.ipa) })));
      });
      count.textContent = r.length + ' entr' + (r.length === 1 ? 'y' : 'ies') + (r.length > 200 ? ' (showing 200; search to narrow)' : '');
      if (!r.length) list.append(h('li', { style: 'display:block' }, h('p', null, 'Nothing matches. If you know this word, '), h('a', { class: 'btn small', href: '#/teach/new?gloss=' + encodeURIComponent(wordFilter.q) }, 'Add it')));
    }
    input.addEventListener('input', paint);
    const src = repoInfo.from === 'github' ? 'From GitHub, updated ' + when(repoInfo.at) : (Store.cachedRepo() ? 'Saved copy from ' + when(Store.cachedRepo().fetchedAt) : 'Built-in copy');
    put(root, h('h1', null, 'Words'), input, chips, count, list,
      h('p', { class: 'muted small', style: 'margin-top:16px' }, src + '. ', h('button', { class: 'link', type: 'button', onclick: () => refreshRepo() }, 'Update now')));
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
      h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', disabled: !can, onclick: () => audio.play(p.ipa) }, 'Hear it'), h('button', { class: 'btn small ghost', type: 'button', disabled: !can, onclick: () => audio.play(p.ipa, { speed: 0.6 }) }, 'Hear it slowly')),
      facts,
      h('h3', null, 'Help improve this entry'),
      h('div', { class: 'row' },
        h('a', { class: 'btn small ghost', href: '#/teach/new?action=variant&rel=' + encodeURIComponent(e.id) }, 'I say it differently'),
        h('a', { class: 'btn small ghost', href: '#/teach/new?action=ipa&rel=' + encodeURIComponent(e.id) }, 'Fix the pronunciation'),
        h('a', { class: 'btn small ghost', href: '#/teach/new?action=report&rel=' + encodeURIComponent(e.id) }, 'Report a problem'))), { label: e.gloss });
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
    put(root, h('h1', null, 'Teach Dadi'),
      h('p', null, 'If you speak Sitainge, add what you say. Write it any way you would write it to a friend: there is no wrong spelling here. Reviewers read everything before it is used, and nothing is accepted automatically.'),
      h('a', { class: 'btn block', href: '#/teach/new' }, 'Add a word or sentence'),
      h('h2', { style: 'margin-top:22px' }, 'Waiting to send'));
    if (!queued.length) put(root, h('p', { class: 'muted' }, 'Nothing waiting. What you add is saved on this device first.'));
    else {
      queued.forEach((q) => put(root, h('div', { class: 'queue-item' }, h('b', null, (q.action === 'report' ? 'Report: ' : '') + (q.form || q.gloss)), ' ', h('span', { class: 'muted' }, q.gloss && q.form ? q.gloss : ''),
        q.ipa ? h('div', { class: 'ipa small' }, '/' + q.ipa + '/') : null,
        h('button', { class: 'link small', type: 'button', onclick: async () => { if (await ask('Remove this?', h('p', null, 'It stays in your history log as removed.'), 'Remove', 'Keep')) { Store.update((st) => { const t = st.queue.find((x) => x.id === q.id); if (t) t.status = 'withdrawn'; }, 'queue-withdrawn', q.form || q.gloss, q.id); route(); } } }, 'Remove'))));
      put(root, h('div', { class: 'row', style: 'margin-top:12px' }, h('button', { class: 'btn', type: 'button', onclick: sendFlow }, 'Send ' + queued.length + ' to the project'),
        signedIn() ? h('span', { class: 'small ok' }, 'Signed in' + (S().auth.login ? ' as ' + S().auth.login : '')) : h('button', { class: 'btn ghost small', type: 'button', onclick: signInSheet }, 'Sign in with GitHub')));
    }
    if (want.length) {
      put(root, h('h2', { style: 'margin-top:26px' }, 'Words we still need'), h('p', { class: 'muted small' }, 'The project does not have these yet. Tap one to add how you say it.'));
      const box = h('div', { class: 'chips' });
      want.slice(0, 30).forEach((g) => box.append(h('a', { class: 'chip', href: '#/teach/new?gloss=' + encodeURIComponent(g.replace(/ \(.*\)$/, '')) + (/\(/.test(g) ? '&ctx=' + encodeURIComponent(g.replace(/^.*\(|\)$/g, '')) : '') }, g)));
      put(root, box);
    }
    if (sent.length) put(root, h('p', { class: 'muted small', style: 'margin-top:20px' }, sent.length + ' contribution' + (sent.length === 1 ? '' : 's') + ' sent so far. Thank you.'));
  }

  function teachNew(root, qs) {
    const p = new URLSearchParams(qs || ''), action = ['add', 'variant', 'ipa', 'report'].includes(p.get('action')) ? p.get('action') : 'add';
    const rel = p.get('rel') ? index.byId.get(p.get('rel')) : null;
    const f = { kind: rel ? rel.kind : (p.get('kind') || 'word'), gloss: rel ? rel.gloss : (p.get('gloss') || ''), form: action === 'ipa' && rel ? (rel.spellings[0] || rel.form) : '', variants: [''],
      ipa: action === 'ipa' && rel && rel.ipa ? rel.ipa : '', ipaStatus: 'speaker-chosen-by-ear', register: '', confidence: '', note: p.get('ctx') ? 'Context: ' + p.get('ctx') : '' };
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
      h('div', { class: 'ipa-tools' },
        h('button', { class: 'btn small', type: 'button', onclick: () => { openKeyboard(ipa); } }, 'IPA keyboard'),
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => { if (ipa.value.trim()) audio.play(ipa.value); else toast('Type or build some sounds first.'); } }, 'Hear it'),
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => {
          const g = DadiG2P.g2p(form.value || ''); if (!g.complete || !g.ipa) { toast('The spelling reader does not know some characters: ' + (g.unknown.join(' ') || 'empty spelling')); return; }
          ipa.value = g.ipa; manual = false; ipaStatus.value = 'ai-drafted-unverified'; audio.play(g.ipa); toast('A machine reading of your spelling. Adjust it until it sounds like you.');
        } }, 'Suggest from my spelling')),
      h('label', { class: 'f', for: 'f-ipastatus' }, 'Where did this IPA come from?'), ipaStatus);
    const conf = h('select', { class: 'input', id: 'f-conf' }, h('option', { value: '' }, 'Not said'), h('option', { value: 'sure' }, 'I am sure'), h('option', { value: 'fairly' }, 'Fairly sure'), h('option', { value: 'unsure' }, 'Not sure'));
    const reg = h('select', { class: 'input', id: 'f-reg' }, h('option', { value: '' }, 'Not said'), h('option', { value: 'everyday' }, 'Everyday speech'), h('option', { value: 'respectful' }, 'Respectful, for elders or strangers'), h('option', { value: 'dictionary' }, 'Dictionary or formal form'), h('option', { value: 'friends' }, 'With friends'));
    const note = h('textarea', { class: 'input', id: 'f-note', placeholder: action === 'report' ? 'What is wrong, and what do you say instead?' : 'Where it is used, who says it, anything useful (optional).' }, f.note);
    const kindSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Kind' });
    ['word', 'sentence'].forEach((k) => kindSeg.append(h('button', { type: 'button', 'aria-pressed': String(f.kind === k), disabled: !!rel || null, onclick: (ev) => { f.kind = k; kindSeg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === ev.currentTarget))); } }, k === 'word' ? 'Word' : 'Sentence')));
    const save = h('button', { class: 'btn block', type: 'button', style: 'margin-top:20px' }, 'Save on this device');
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
    put(root, h('h1', null, titles[action]),
      rel ? h('p', { class: 'muted' }, action === 'report' ? 'About: ' : 'Existing entry: ', h('b', { class: 'ipa' }, (rel.spellings[0] || rel.form)), ' = ' + rel.gloss) : null,
      action === 'report' ? null : h('div', null, h('label', { class: 'f', for: 'f-gloss' }, 'What does it mean in English?'), gloss, !rel ? h('div', { style: 'margin-top:8px' }, kindSeg) : null),
      action === 'report' || action === 'ipa' ? null : h('div', null, h('label', { class: 'f', for: 'f-form' }, 'How do you say it?', h('span', { class: 'f-hint' }, 'Any spelling is fine. Roman letters (Latin script) please, not Bangla script.')), form,
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
    const other = h('input', { class: 'input', id: 'p-other', value: p.otherLanguages, placeholder: 'For example: Bangla, English', autocomplete: 'off' });
    const credit = h('select', { class: 'input', id: 'p-credit' }, h('option', { value: 'anonymous', selected: p.credit === 'anonymous' }, 'Anonymous'), h('option', { value: 'name', selected: p.credit === 'name' }, 'Use my name'), h('option', { value: 'id', selected: p.credit === 'id' }, 'A contributor ID only'));
    const cname = h('input', { class: 'input', id: 'p-cname', value: p.creditName, placeholder: 'Name to show', autocomplete: 'off' });
    const err = h('p', { class: 'err', role: 'alert' });
    box.append(adult, cc0,
      h('label', { class: 'f', for: 'p-loc' }, 'Where is your Sitainge from?', h('span', { class: 'f-hint' }, 'Optional. Helps show regional differences.')), loc,
      h('label', { class: 'f', for: 'p-age' }, 'Age group (optional)'), age,
      h('label', { class: 'f', for: 'p-other' }, 'Other languages you speak (optional)'), other,
      h('label', { class: 'f', for: 'p-credit' }, 'How should you be credited?'), credit, h('div', { id: 'p-cn' }, h('label', { class: 'f', for: 'p-cname' }, 'Name'), cname),
      err, h('button', { class: 'btn block', type: 'button', style: 'margin-top:16px', onclick: () => {
        if (needConsent && (!adult.querySelector('input').checked || !cc0.querySelector('input').checked)) { err.textContent = 'Please tick both boxes to send contributions.'; return; }
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
        CFG.contactEmail ? h('button', { class: 'btn small', type: 'button', onclick: () => { if (text.length > 1500) { download(); toast('File saved. Attach it to the email.'); } location.href = 'mailto:' + CFG.contactEmail + '?subject=' + encodeURIComponent('Dadi contribution') + '&body=' + encodeURIComponent(text.length > 1500 ? 'Please find my Dadi contribution attached (dadi-contribution-' + today() + '.txt).' : text); } }, 'Email it') : null,
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
    main.append(h('section', { class: 'hero' }, h('div', { class: 'dadi-wrap', html: Art.dadi() }), h('div', null, h('h1', null, 'Welcome to Dadi'), h('p', null, 'Sign in with GitHub so your lessons and contributions go to the right place automatically.'))),
      h('button', { class: 'btn block', type: 'button', onclick: signInSheet }, 'Sign in with GitHub'),
      h('p', { class: 'small muted', style: 'margin-top:14px' }, 'No account yet? GitHub is free. ', h('button', { class: 'link', type: 'button', onclick: () => { try { sessionStorage.setItem('dadi.skipgate', '1'); } catch (e) { /* ignore */ } route(); } }, 'Not now')));
  }

  /* ---------- Me ---------- */
  function meView(root) {
    const st = S();
    const acct = signedIn()
      ? h('div', null, h('p', { class: 'ok' }, 'Signed in' + (st.auth.login ? ' as ' + st.auth.login : '') + '.'), h('button', { class: 'btn ghost small', type: 'button', onclick: () => { Store.update((s2) => { s2.auth = null; }, 'signout', 'signed out'); route(); } }, 'Sign out'))
      : h('div', null, h('p', { class: 'muted' }, 'Not signed in. You can learn and draft contributions without signing in.'), h('button', { class: 'btn small', type: 'button', onclick: signInSheet }, 'Sign in with GitHub'));
    const sel = (id, opts, val, on) => { const s = h('select', { class: 'input', id }, opts.map(([v, t]) => h('option', { value: v, selected: String(val) === String(v) }, t))); s.addEventListener('change', () => on(s.value)); return s; };
    const hist = Store.history().slice(-30).reverse();
    const file = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    file.addEventListener('change', async () => { const f = file.files[0]; if (!f) return; const r = Store.importAll(await f.text()); toast(r.ok ? 'Backup merged.' : r.error); if (r.ok) route(); });
    put(root, h('h1', null, 'Me'),
      h('h2', null, 'GitHub'), acct,
      h('h2', { style: 'margin-top:22px' }, 'About you'), h('p', { class: 'muted small' }, 'Used when you send contributions. All of it is optional except the two confirmations.'), profileForm(null, false),
      h('h2', { style: 'margin-top:26px' }, 'Sound and display'),
      h('label', { class: 'f', for: 's-pitch' }, 'Voice pitch'), sel('s-pitch', [['low', 'Lower'], ['mid', 'Middle'], ['high', 'Higher']], st.settings.pitch, (v) => Store.update((s2) => { s2.settings.pitch = v; }, 'settings', 'pitch ' + v)),
      h('label', { class: 'f', for: 's-speed' }, 'Speed'), sel('s-speed', [[0.8, 'Slower'], [1, 'Normal'], [1.2, 'Faster']], st.settings.speed, (v) => Store.update((s2) => { s2.settings.speed = Number(v); }, 'settings', 'speed ' + v)),
      h('label', { class: 'f', for: 's-ipa' }, 'Show IPA in lessons'), sel('s-ipa', [['1', 'Yes'], ['0', 'No']], st.settings.showIPA ? '1' : '0', (v) => Store.update((s2) => { s2.settings.showIPA = v === '1'; }, 'settings', 'showIPA ' + v)),
      h('label', { class: 'f', for: 's-theme' }, 'Colours'), sel('s-theme', [['system', 'Follow my device'], ['light', 'Light'], ['dark', 'Dark']], st.settings.theme || 'system', (v) => { Store.update((s2) => { s2.settings.theme = v; }, 'settings', 'theme ' + v); applyTheme(); }),
      h('div', { class: 'row', style: 'margin-top:12px' }, h('button', { class: 'btn small ghost', type: 'button', onclick: () => audio.playSymbol('a') }, 'Test the sound')),
      h('h2', { style: 'margin-top:26px' }, 'Your data'), h('p', { class: 'muted small' }, Store.persistent ? 'Everything is saved on this device only, with two automatic backups. Nothing is sent unless you press Send.' : 'This browser blocked storage, so changes will be lost when you close the page. Export a backup before you leave.'),
      h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', onclick: () => { const blob = new Blob([Store.exportAll()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dadi-backup-' + today() + '.json'; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); } }, 'Download a backup'),
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => file.click() }, 'Restore from a backup'), file,
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => refreshRepo() }, 'Update words from GitHub')),
      h('details', { style: 'margin-top:14px' }, h('summary', null, 'History of changes on this device'), hist.length ? h('ul', { class: 'small' }, hist.map((e) => h('li', null, when(e.t) + ': ' + e.type + (e.detail ? ' (' + e.detail + ')' : '')))) : h('p', { class: 'muted small' }, 'Nothing yet.')),
      h('div', { style: 'margin-top:16px' }, h('button', { class: 'link err', type: 'button', onclick: async () => { if (await ask('Delete everything on this device?', h('p', null, 'This removes progress, drafts and sign-in from this device. Contributions you already sent stay on GitHub. A backup file is the only way back.'), 'Delete', 'Keep')) { Store.wipe(); toast('Deleted.'); route(); } } }, 'Delete everything on this device')),
      h('p', { style: 'margin-top:22px' }, h('a', { href: '#/about' }, 'About Dadi, credits and how the sounds are made')));
  }
  function applyTheme() { const t = S().settings.theme; if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }

  function aboutView(root) {
    put(root, h('h1', null, 'About Dadi'),
      h('div', { class: 'credit' }, h('div', { class: 'dadi-wrap', html: Art.dadi() }), h('p', null, 'Dadi is the Sitainge (Chittagonian) learning and contribution tool of the Sitainge project. Created by ', h('b', null, CFG.creator), '.')),
      h('p', null, 'The name is the word many Chittagonians use for grandmother, because most people of this generation learned the language from theirs.'),
      h('h2', null, 'How it works'),
      h('p', null, 'Words and sentences come from the project\'s public files on GitHub (', h('a', { href: CFG.repoUrl, target: '_blank', rel: 'noopener noreferrer' }, CFG.repo), '). Contributions go back as reviewable issues. Nothing is accepted automatically, and everything starts as unverified.'),
      h('h2', null, 'How the sounds are made'),
      h('p', null, 'There are no recordings yet. Dadi has a small speech synthesizer built into the app. It turns IPA into sound with rules from textbook acoustics, so every symbol on the IPA keyboard can be heard, offline. When an entry has no IPA, Dadi reads the spelling like Latin letters and says so. These sounds approximate speech. They are good for telling sounds apart and for checking what you typed, but they are not a speaker. Real recordings will replace them as speakers contribute.'),
      h('h2', null, 'How lessons work'),
      h('p', null, 'Each lesson has you listen, choose the meaning, then answer before you see the answer. Words you miss come back a few cards later in the same session, then on a schedule from FSRS, the open spaced-repetition scheduler used in Anki (MIT licence, by the Open Spaced Repetition project).'),
      h('h2', null, 'Licence and privacy'),
      h('p', null, 'The app and its pictures are dedicated to the public domain (CC0 1.0). Dadi has no tracking, no cookies and no ads. Progress stays on your device. Contributions you send are public once reviewers use them.'),
      h('p', null, h('a', { href: CFG.repoUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Project on GitHub'), CFG.contactEmail ? [' or write to ', h('a', { href: 'mailto:' + CFG.contactEmail }, CFG.contactEmail)] : null, '.'));
  }

  /* ---------- start ---------- */
  async function boot() {
    document.getElementById('mark').innerHTML = Art.dadi();
    applyTheme();
    const net = document.getElementById('net'); const upd = () => { net.textContent = navigator.onLine ? '' : 'Offline'; }; upd(); window.addEventListener('online', upd); window.addEventListener('offline', upd);
    if (Store.restoredFrom) toast('Your saved data was repaired from ' + Store.restoredFrom + '.');
    const cached = Store.cachedRepo();
    if (cached && cached.entries && cached.entries.length) { setEntries(cached.entries); repoInfo = { from: 'cache', at: cached.fetchedAt, errors: [], err: null }; }
    else { const seed = await loadSeed(); if (seed && seed.entries) { setEntries(seed.entries); repoInfo = { from: 'seed', at: seed.builtAt, errors: [], err: null }; } }
    route();
    if (navigator.onLine) refreshRepo({ quiet: true });
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { /* works without it */ });
  }
  window.DadiApp = { route, nav, get index() { return index; }, Store, refreshRepo, setEntries };
  boot();
})();
