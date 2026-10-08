(function () {
  'use strict';
  const { BLOCKS, HERITAGE_TYPES } = window.SitaingeItems;
  const Core = window.SitaingeCore;
  const CFG = window.SITAINGE_CONFIG || {};
  const KEY = 'sitainge-draft-v1';
  const app = document.getElementById('app');

  /* ---------- state ---------- */
  const rid = () => {
    const a = new Uint8Array(3); crypto.getRandomValues(a);
    return Array.from(a).map((b) => b.toString(36)).join('').slice(0, 4).toUpperCase().padEnd(4, 'X');
  };
  function fresh() {
    const d = new Date(), p = (x) => String(x).padStart(2, '0');
    return { v: 1, interviewId: 'SIT-INT-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + rid(),
      consent: { adult: false, cc0: false, publish: '', credit: '', creditName: '', save: true, audio: '' },
      speaker: { locality: '', age: '', background: '', otherLanguages: '', languageName: '' },
      answers: {}, heritage: [], readBack: false, piiOk: false };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.v === 1 ? s : null; } catch (e) { return null; }
  }
  let state = load() || fresh();
  let timer = null;
  function save() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { if (state.consent.save) localStorage.setItem(KEY, JSON.stringify(state)); else localStorage.removeItem(KEY); } catch (e) { /* storage unavailable: carry on */ }
    }, 250);
  }
  /* ---------- audio (kept on the device; IndexedDB only when saving is allowed) ---------- */
  const audioMem = {}; const urls = []; let idb = null; let rec = null;
  function openDB() {
    return new Promise((res) => { try { const r = indexedDB.open('sitainge-audio', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); r.onblocked = () => res(null); } catch (e) { res(null); } });
  }
  function idbTx(mode, fn) { return new Promise((ok) => { if (!idb) { ok(null); return; } try { const tx = idb.transaction('clips', mode); const out = fn(tx.objectStore('clips')); tx.oncomplete = () => ok(out && out.result !== undefined ? out.result : true); tx.onerror = () => ok(null); tx.onabort = () => ok(null); } catch (e) { ok(null); } }); }
  const idbPut = (k, v) => (state.consent.save ? idbTx('readwrite', (st) => st.put(v, k)) : Promise.resolve(null));
  const idbDel = (k) => idbTx('readwrite', (st) => st.delete(k));
  const idbClear = () => idbTx('readwrite', (st) => st.clear());
  function idbLoadAll() {
    return new Promise((ok) => { if (!idb) { ok(); return; } try {
      const tx = idb.transaction('clips', 'readonly'), st = tx.objectStore('clips'), rq = st.openCursor();
      rq.onsuccess = () => { const cur = rq.result; if (cur) { audioMem[cur.key] = cur.value; cur.continue(); } };
      tx.oncomplete = () => ok(); tx.onerror = () => ok(); tx.onabort = () => ok();
    } catch (e) { ok(); } });
  }
  function blobBytes(b) {
    if (b.arrayBuffer) return b.arrayBuffer().then((x) => new Uint8Array(x));
    return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(new Uint8Array(r.result)); r.onerror = no; r.readAsArrayBuffer(b); });
  }
  const extFor = (m) => { m = (m || '').toLowerCase(); return m.includes('webm') ? 'webm' : m.includes('ogg') ? 'ogg' : (m.includes('mp4') || m.includes('aac') || m.includes('m4a')) ? 'm4a' : m.includes('wav') ? 'wav' : 'bin'; };
  function mimeFor() {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported) for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) if (MediaRecorder.isTypeSupported(m)) return m;
    return '';
  }
  function abortRecording() {
    if (!rec) return; const r = rec; rec = null; clearInterval(r.timer);
    try { r.mr.ondataavailable = null; r.mr.onstop = null; if (r.mr.state !== 'inactive') r.mr.stop(); } catch (e) { /* ignore */ }
    try { r.stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* ignore */ }
  }
  async function audioMeta() {
    const out = {};
    for (const [k, c] of Object.entries(audioMem)) { const bytes = await blobBytes(c.blob); out[k] = { sha: await Core.sha256hex(bytes), ms: c.ms, ext: extFor(c.mime), mime: c.mime, bytes }; }
    return out;
  }
  function audioPanel(key) {
    const box = h('div', { class: 'card' }), say = h('div', { class: 'small mut', 'aria-live': 'polite' }), maxMs = 90000;
    function showIdle() {
      box.replaceChildren(h('strong', { text: 'Record your voice (optional)' }),
        h('p', { class: 'small mut', text: 'Say only your answer. Do not say your name, phone number or address.' }), say,
        h('div', { class: 'row' }, h('button', { type: 'button', onclick: startRec }, 'Record')));
    }
    function showClip() {
      const c = audioMem[key], url = URL.createObjectURL(c.blob); urls.push(url);
      box.replaceChildren(h('strong', { text: 'Your recording' }), h('audio', { controls: true, src: url, preload: 'metadata' }),
        h('div', { class: 'small mut', text: Math.max(1, Math.round(c.ms / 1000)) + (Math.max(1, Math.round(c.ms / 1000)) === 1 ? ' second' : ' seconds') }),
        h('div', { class: 'row' }, h('button', { type: 'button', onclick: () => { delete audioMem[key]; idbDel(key); showIdle(); } }, 'Delete recording'),
          h('button', { type: 'button', onclick: startRec }, 'Record again')));
    }
    async function startRec() {
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) { say.textContent = 'Recording is not supported in this browser. You can still type your answer.'; return; }
      let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { say.textContent = 'The microphone is blocked. Allow access in the browser settings, or type the answer.'; return; }
      const mime = mimeFor(); let mr;
      try { mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 48000 } : { audioBitsPerSecond: 48000 }); }
      catch (e) { stream.getTracks().forEach((t) => t.stop()); say.textContent = 'Recording could not start in this browser.'; return; }
      const chunks = [], started = Date.now(), timeEl = h('strong', { text: 'Recording… 0 s' });
      const stop = () => { try { if (mr.state !== 'inactive') mr.stop(); } catch (e) { /* ignore */ } };
      rec = { key, mr, stream, timer: setInterval(() => { const ms = Date.now() - started; timeEl.textContent = 'Recording… ' + Math.floor(ms / 1000) + ' s'; if (ms >= maxMs) stop(); }, 250) };
      mr.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunks.push(ev.data); };
      mr.onstop = () => {
        if (rec) clearInterval(rec.timer); stream.getTracks().forEach((t) => t.stop()); rec = null;
        const type = mr.mimeType || mime || 'audio/webm', blob = new Blob(chunks, { type });
        if (!blob.size) { say.textContent = 'Nothing was recorded. Try again.'; showIdle(); return; }
        audioMem[key] = { blob, mime: type, ms: Date.now() - started }; idbPut(key, audioMem[key]); showClip();
      };
      mr.start();
      box.replaceChildren(timeEl, h('div', { class: 'row' }, h('button', { class: 'primary', type: 'button', onclick: stop }, 'Stop')));
    }
    if (audioMem[key]) showClip(); else showIdle();
    return box;
  }
  async function wipe() {
    abortRecording(); try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    for (const k of Object.keys(audioMem)) delete audioMem[k]; await idbClear(); state = fresh();
  }

  /* ---------- helpers ---------- */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) { if (kid == null || kid === false) continue; el.append(kid.nodeType ? kid : document.createTextNode(String(kid))); }
    return el;
  }
  const verbatim = { spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', lang: 'und' };
  function render(...nodes) { abortRecording(); urls.splice(0).forEach((u) => URL.revokeObjectURL(u)); app.replaceChildren(...nodes.flat().filter(Boolean)); window.scrollTo(0, 0); app.focus({ preventScroll: true }); }
  function keyOf(b, i) { return BLOCKS[b].id + ':' + i; }
  function answered(a) { return !!(a && (a.status || Core.clean(a.response))); }
  function blockCount(b) { return BLOCKS[b].items.filter((_, i) => answered(state.answers[keyOf(b, i)])).length; }
  function totalCount() { return BLOCKS.reduce((n, _, b) => n + blockCount(b), 0) + state.heritage.length; }
  function bar(done, total) { const i = h('i'); i.style.width = (total ? Math.round(100 * done / total) : 0) + '%'; return h('div', { class: 'bar-prog', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': done }, i); }
  function field(label, node) { return h('div', null, h('label', null, label), node); }
  function input(obj, key, opts) {
    const el = h('input', Object.assign({ type: 'text' }, opts && opts.verbatim ? verbatim : { autocomplete: 'off' }));
    el.value = obj[key] || ''; el.addEventListener('input', () => { obj[key] = el.value; save(); }); return el;
  }
  function area(obj, key, opts) {
    const el = h('textarea', Object.assign({}, opts && opts.verbatim ? verbatim : {}));
    el.value = obj[key] || ''; el.addEventListener('input', () => { obj[key] = el.value; save(); }); return el;
  }
  function choice(type, name, label, checked, onchange) {
    const el = h('input', { type, name });
    el.checked = !!checked; el.addEventListener('change', () => onchange(el.checked));
    return h('label', { class: 'choice' }, el, h('span', null, label));
  }

  /* ---------- screens ---------- */
  function screenConsent() {
    const c = state.consent, err = h('div', { 'aria-live': 'polite' });
    const credName = h('input', { type: 'text', autocomplete: 'off', placeholder: 'The name to show' });
    credName.value = c.creditName || ''; credName.addEventListener('input', () => { c.creditName = credName.value; save(); });
    render(
      h('h1', { text: 'Share how you speak siṭaiṅga' }),
      h('p', { text: 'The form asks for words and sentences as you say them in siṭaiṅga. There are no wrong answers. If your village says a word differently from others, that difference is what the project needs to record.' }),
      h('p', { class: 'mut', text: 'You can stop at any time and still export what you have entered. Your answers stay on this device until you choose to share them.' }),
      h('details', null, h('summary', { text: 'What this page does' }),
        h('ul', null,
          h('li', { text: 'It sends nothing by itself. You decide whether, when and how to share.' }),
          h('li', { text: 'It shows English prompts only. It does not suggest siṭaiṅga words, correct answers or judge them.' }),
          h('li', { text: 'It records exactly what you type, in Latin letters or in the script you normally use. Autocorrect is turned off in the answer boxes.' }),
          h('li', { text: 'Voice recordings are optional. They are made only when you press Record, kept on your device, and shared with the rest of your submission only when you choose. A voice can identify a person, so you decide separately what may happen to recordings.' }),
          h('li', { text: 'It adds a checksum (a SHA-256 fingerprint) to the file so that reviewers can detect damage or changes in transit.' }),
          h('li', { text: 'People review everything before it is used. Nothing is accepted automatically, and accepting one form does not mean that other forms are wrong.' }))),
      h('h2', { text: 'Before you start' }),
      choice('checkbox', 'adult', 'I am 18 or older, or a parent or guardian is helping me and will read the final output.', c.adult, (v) => { c.adult = v; save(); }),
      choice('checkbox', 'cc0', 'I understand that, if my contribution is published, it is dedicated to the public domain under CC0 1.0. Anyone may use it, including for AI. This cannot be undone once it is published. I am sharing my own speech or material I have the right to share.', c.cc0, (v) => { c.cc0 = v; save(); }),
      h('h2', { text: 'What should happen to the contribution?' }),
      choice('radio', 'pub', 'Publish after review (CC0)', c.publish === 'yes', () => { c.publish = 'yes'; save(); }),
      choice('radio', 'pub', 'Discuss with me first. Do not publish yet.', c.publish === 'no', () => { c.publish = 'no'; save(); }),
      h('h2', { text: 'Voice recordings' }),
      h('p', { class: 'small mut', text: 'A recording lets reviewers hear how a word is said, which is the strongest kind of evidence. Your voice may identify you.' }),
      choice('radio', 'aud', 'Keep my recordings for research only. They are not published.', c.audio === 'research_only', () => { c.audio = 'research_only'; save(); }),
      choice('radio', 'aud', 'Publish my recordings under CC0 after review. This cannot be undone.', c.audio === 'public', () => { c.audio = 'public'; save(); }),
      choice('radio', 'aud', 'No recordings. I will type my answers only.', c.audio === 'none', () => { c.audio = 'none'; save(); }),
      h('h2', { text: 'How should you be credited?' }),
      choice('radio', 'cr', 'Anonymously', c.credit === 'anonymous', () => { c.credit = 'anonymous'; save(); }),
      choice('radio', 'cr', 'By a contributor ID only', c.credit === 'contributor_id', () => { c.credit = 'contributor_id'; save(); }),
      choice('radio', 'cr', 'By name', c.credit === 'name', () => { c.credit = 'name'; save(); }),
      credName,
      h('h2', { text: 'Privacy on this device' }),
      choice('checkbox', 'save', 'Save my draft and recordings on this device so I can continue later. Clear this box on a shared phone or computer.', c.save, (v) => { c.save = v; if (!v) idbClear(); else Object.entries(audioMem).forEach(([k, val]) => idbPut(k, val)); save(); }),
      h('p', { class: 'small mut', text: 'Do not enter a full name, phone number, address, email or ID number in the answers.' }),
      err,
      h('div', { class: 'row' }, h('button', { class: 'primary', type: 'button', onclick: () => {
        const m = [];
        if (!c.adult) m.push('Confirm that you are 18 or older, or that a parent or guardian is helping.');
        if (!c.cc0) m.push('Confirm the public-domain (CC0) statement.');
        if (!c.publish) m.push('Choose what should happen to the contribution.');
        if (!c.credit) m.push('Choose how you want to be credited.');
        if (!c.audio) m.push('Choose what to do about voice recordings.');
        if (c.audio === 'public' && c.publish !== 'yes') m.push('Recordings cannot be published while the text is set to "Discuss with me first".');
        if (c.credit === 'name' && !Core.clean(c.creditName)) m.push('Enter the name to show.');
        if (m.length) { err.replaceChildren(h('div', { class: 'notice error' }, m.map((x) => h('div', { text: x })))); return; }
        save(); screenAbout();
      } }, 'Continue'))
    );
  }

  function screenAbout() {
    const s = state.speaker;
    const age = h('select', null, ...[['', 'Prefer not to say'], ['18-29', '18 to 29'], ['30-49', '30 to 49'], ['50-69', '50 to 69'], ['70+', '70 or older']].map(([v, t]) => h('option', { value: v, text: t })));
    age.value = s.age || ''; age.addEventListener('change', () => { s.age = age.value; save(); });
    render(
      h('h1', { text: 'About how you speak' }),
      h('p', { class: 'mut', text: 'All of this is optional. It helps reviewers understand which variety you speak. Leave any field blank.' }),
      field('Where do you speak it? (village, union, upazila or district, as much detail as you like)', input(s, 'locality')),
      field('Age group', age),
      field('What do you call your language?', input(s, 'languageName', { verbatim: true })),
      field('Other languages you use', input(s, 'otherLanguages')),
      field('Anything in your background that affects how you speak', area(s, 'background')),
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenConsent }, 'Back'), h('button', { class: 'primary', type: 'button', onclick: () => { save(); screenHub(); } }, 'Continue'))
    );
  }

  function screenHub() {
    const rows = BLOCKS.map((b, bi) => {
      const done = blockCount(bi);
      return h('div', { class: 'card' },
        h('strong', { text: b.title }), ' ', h('span', { class: 'tag', text: done + ' of ' + b.items.length + (b.optional ? ' (optional)' : '') }),
        bar(done, b.items.length),
        h('div', { class: 'row' }, h('button', { type: 'button', onclick: () => {
          const first = b.items.findIndex((_, i) => !answered(state.answers[keyOf(bi, i)]));
          screenItem(bi, first < 0 ? 0 : first);
        } }, done ? 'Continue' : 'Start')));
    });
    render(
      h('h1', { text: 'Choose a section' }),
      h('p', { text: 'Complete as many sections as you like, in any order. You have entered ' + totalCount() + ' answer' + (totalCount() === 1 ? '' : 's') + ' so far.' }),
      rows,
      h('div', { class: 'card' }, h('strong', { text: 'Proverbs, riddles, rhymes, place names, stories' }), ' ', h('span', { class: 'tag', text: state.heritage.length + ' added (optional)' }),
        h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenHeritage }, 'Add an item'))),
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenAbout }, 'Back'),
        h('button', { class: 'primary', type: 'button', onclick: screenReview }, 'Review and finish'))
    );
  }

  const STATUS = [['used', 'I say it like this'], ['not_used', "We don't say this"], ['unsure', "I'm not sure how to say it"], ['skipped', 'Skip']];
  function screenItem(bi, ii) {
    const b = BLOCKS[bi], it = b.items[ii], key = keyOf(bi, ii);
    const a = state.answers[key] || (state.answers[key] = { status: '', response: '', variants: [], pron: '', usage: '', conf: '', comment: '' });
    const answerBox = a.status && a.status !== 'used' ? null : (() => {
      const ta = area(a, 'response', { verbatim: true });
      ta.addEventListener('input', () => { if (!a.status && Core.clean(a.response)) { a.status = 'used'; } });
      return h('div', null, field('How do you say it? Write it as you would say it.', ta));
    })();
    const answering = !a.status || a.status === 'used';
    const variants = answering ? h('div', null,
      (a.variants || []).map((v, vi) => {
        const el = h('input', Object.assign({ type: 'text', 'aria-label': 'Another way ' + (vi + 1) }, verbatim)); el.value = v;
        el.addEventListener('input', () => { a.variants[vi] = el.value; save(); });
        return h('div', { class: 'row' }, el, h('button', { type: 'button', 'aria-label': 'Remove', onclick: () => { a.variants.splice(vi, 1); save(); screenItem(bi, ii); } }, 'Remove'));
      }),
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: () => { a.variants = a.variants || []; a.variants.push(''); save(); screenItem(bi, ii); } }, 'Add another way, or how others say it'))) : null;
    const conf = h('select', null, ...[['', 'How sure are you?'], ['sure', 'Very sure'], ['fairly_sure', 'Fairly sure'], ['not_sure', 'Not sure']].map(([v, t]) => h('option', { value: v, text: t })));
    conf.value = a.conf || ''; conf.addEventListener('change', () => { a.conf = conf.value; save(); });
    const more = h('details', null, h('summary', { text: 'More (optional)' }),
      field('How does it sound? Write it in any way you like.', input(a, 'pron', { verbatim: true })),
      field('Who says it? (for example, older people, my village, everyone)', input(a, 'usage')),
      field('Anything else about it', area(a, 'comment')),
      conf);
    render(
      h('div', { class: 'tag', text: b.title + ' · ' + (ii + 1) + ' of ' + b.items.length }), bar(ii + 1, b.items.length),
      h('div', { class: 'card' },
        h('p', { class: 'en', text: it.en }), it.ctx ? h('p', { class: 'ctx', text: it.ctx }) : null,
        answerBox,
        h('div', { class: 'row', role: 'group', 'aria-label': 'Answer type' }, STATUS.map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(a.status === v), onclick: () => { a.status = a.status === v ? '' : v; save(); screenItem(bi, ii); } }, t))),
        variants, answering && state.consent.audio && state.consent.audio !== 'none' ? audioPanel(key) : null, answering ? more : null),
      h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => { save(); screenHub(); } }, 'Back to list'),
        ii > 0 ? h('button', { type: 'button', onclick: () => { save(); screenItem(bi, ii - 1); } }, 'Previous') : null,
        h('button', { class: 'primary', type: 'button', onclick: () => { save(); if (ii + 1 < b.items.length) screenItem(bi, ii + 1); else screenHub(); } }, ii + 1 < b.items.length ? 'Next' : 'Finish this section'))
    );
  }

  function screenHeritage() {
    const draft = { type: 'proverb', original: '', literal: '', meaning: '', context: '', conf: '' };
    const type = h('select', null, ...HERITAGE_TYPES.map(([v, t]) => h('option', { value: v, text: t })));
    const note = h('div', { class: 'notice warn small' });
    const setNote = () => { note.textContent = type.value === 'song_line' ? 'Include traditional oral songs only; they belong to the community. For a song by a known composer, write only the title and the performer. Do not write out the lyrics.' : ''; note.style.display = type.value === 'song_line' ? 'block' : 'none'; };
    type.addEventListener('change', () => { draft.type = type.value; setNote(); }); setNote();
    const listing = state.heritage.map((x, i) => h('div', { class: 'item' }, h('div', null, h('div', { class: 'a', text: x.original }), h('div', { class: 'tag', text: (HERITAGE_TYPES.find((t) => t[0] === x.type) || [0, 'item'])[1] })),
      h('button', { type: 'button', onclick: () => { state.heritage.splice(i, 1); save(); screenHeritage(); } }, 'Remove')));
    const msg = h('div', { 'aria-live': 'polite' });
    render(
      h('h1', { text: 'Add an item from your culture' }),
      h('p', { class: 'mut', text: 'Proverbs, sayings, riddles, rhymes, place names and short stories. Share only what you have the right to share.' }),
      listing.length ? h('div', { class: 'card' }, listing) : null,
      field('What is it?', type), note,
      field('The original, exactly as it is said', area(draft, 'original', { verbatim: true })),
      field('What it says word for word (optional)', area(draft, 'literal')),
      field('What it really means (optional)', area(draft, 'meaning')),
      field('When or where people say it (optional)', input(draft, 'context')), msg,
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenHub }, 'Back to list'),
        h('button', { class: 'primary', type: 'button', onclick: () => {
          if (!Core.clean(draft.original)) { msg.replaceChildren(h('div', { class: 'notice error', text: 'Enter the original first.' })); return; }
          state.heritage.push(Object.assign({}, draft)); save(); screenHeritage();
        } }, 'Add item'))
    );
  }

  async function screenReview() {
    const meta = await audioMeta();
    const sub = await Core.buildSubmission(state, BLOCKS, undefined, undefined, meta);
    const groups = [];
    BLOCKS.forEach((b, bi) => {
      const rows = [];
      b.items.forEach((it, ii) => {
        const a = state.answers[keyOf(bi, ii)]; if (!answered(a)) return;
        const st = a.status || 'used';
        const text = st === 'used' ? Core.clean(a.response) : (STATUS.find((s) => s[0] === st) || [0, st])[1];
        const vs = (a.variants || []).map(Core.clean).filter(Boolean);
        rows.push(h('div', { class: 'item' }, h('div', null,
          h('div', { class: 'tag', text: it.en + (it.ctx ? ' (' + it.ctx + ')' : '') }), h('div', { class: 'a', text: text || '(empty)' }),
          vs.length ? h('div', { class: 'tag', text: 'Other ways: ' + vs.join(' · ') }) : null,
          st === 'used' && audioMem[keyOf(bi, ii)] ? h('div', { class: 'tag', text: 'Recording saved (' + Math.max(1, Math.round(audioMem[keyOf(bi, ii)].ms / 1000)) + ' s)' }) : null),
          h('button', { type: 'button', onclick: () => screenItem(bi, ii) }, 'Edit')));
      });
      if (rows.length) groups.push(h('div', { class: 'card' }, h('strong', { text: b.title }), rows));
    });
    if (state.heritage.length) groups.push(h('div', { class: 'card' }, h('strong', { text: 'Culture' }), state.heritage.map((x) => h('div', { class: 'item' }, h('div', { class: 'a', text: x.original })))));
    const errBox = sub.errors.length ? h('div', { class: 'notice error' }, h('strong', { text: 'Fix these items to continue:' }), h('ul', null, sub.errors.map((e) => h('li', { text: e })))) : null;
    const piiBox = sub.pii.length ? h('div', { class: 'notice warn' }, h('strong', { text: 'This may contain personal information:' }),
      h('ul', null, sub.pii.map((p) => h('li', { text: p.where + ': ' + p.kind }))),
      h('p', { class: 'small', text: 'Edit the item if it does. If the items are fine, tick the box below.' }),
      choice('checkbox', 'piiok', 'I checked, and nothing here needs to be removed as personal information.', state.piiOk, (v) => { state.piiOk = v; save(); go.disabled = !ready(); })) : null;
    const rb = choice('checkbox', 'rb', 'I read everything above. It is exactly what I said.', state.readBack, (v) => { state.readBack = v; save(); go.disabled = !ready(); });
    const ready = () => !sub.errors.length && state.readBack && (!sub.pii.length || state.piiOk);
    const go = h('button', { class: 'primary', type: 'button', disabled: !ready(), onclick: () => screenExport() }, 'Prepare my submission');
    const nAud = sub.audioList.length;
    render(h('h1', { text: 'Review your answers' }), h('p', { class: 'mut', text: sub.items.length + ' item' + (sub.items.length === 1 ? '' : 's') + (nAud ? ', ' + nAud + ' with a recording' : '') + '. Edit anything that is not exactly what you said.' }),
      groups, errBox, piiBox, rb, h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenHub }, 'Back to list'), go));
  }

  async function screenExport() {
    const meta = await audioMeta();
    const sub = await Core.buildSubmission(state, BLOCKS, undefined, undefined, meta);
    if (sub.errors.length || !state.readBack) { screenReview(); return; }
    const text = sub.text, hasAudio = sub.audioList.length > 0, status = h('div', { class: 'notice good', 'aria-live': 'polite' });
    const say = (m) => { status.textContent = m; };
    let payload, name;
    if (hasAudio) {
      const files = [{ name: 'submission.txt', data: new TextEncoder().encode(text) }];
      for (const a of sub.audioList) files.push({ name: a.name, data: meta[a.key].bytes });
      payload = new Blob(window.SitaingeZip.zipStore(files), { type: 'application/zip' }); name = 'sitainge-' + sub.id + '.zip';
    } else { payload = new Blob([text], { type: 'text/plain' }); name = 'sitainge-' + sub.id + '.txt'; }
    const mb = (payload.size / 1048576).toFixed(1);
    async function copy() {
      try { await navigator.clipboard.writeText(text); return true; } catch (e) {
        const t = h('textarea', { class: 'hidden-copy' }); t.value = text; document.body.append(t); t.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; } t.remove(); return ok;
      }
    }
    function download() {
      const url = URL.createObjectURL(payload);
      const a = h('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
    const btns = [];
    const file = typeof File === 'function' ? new File([payload], name, { type: payload.type }) : null;
    if (navigator.share) btns.push(h('button', { class: 'primary', type: 'button', onclick: async () => {
      try {
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'Sitainge submission ' + sub.id });
        else if (!hasAudio) await navigator.share({ title: 'Sitainge submission ' + sub.id, text });
        else { say('This browser cannot share files. Use Download file instead.'); return; }
        say('Shared. Keep your receipt code below.');
      } catch (e) { if (e && e.name !== 'AbortError') say('Sharing is not available here. Use Download file or Copy text.'); }
    } }, 'Share with another app'));
    btns.push(h('button', { class: btns.length ? '' : 'primary', type: 'button', onclick: () => { download(); say('Downloaded as ' + name + '. Send that file to the project, or keep it in a safe place.'); } }, 'Download file'));
    btns.push(h('button', { type: 'button', onclick: async () => say((await copy()) ? (hasAudio ? 'Text copied. The recordings are only in the downloaded file.' : 'Copied. Paste it where you are sending it.') : 'Copying failed. Select the text below and copy it manually.') }, 'Copy text'));
    if (CFG.contactEmail) btns.push(h('button', { type: 'button', onclick: async () => {
      if (hasAudio) download(); else await copy();
      location.href = 'mailto:' + encodeURIComponent(CFG.contactEmail).replace('%40', '@') + '?subject=' + encodeURIComponent('Sitainge submission ' + sub.id) +
        '&body=' + encodeURIComponent((hasAudio ? 'Attach the file ' + name + ' that was just downloaded.' : 'Paste the copied text here, or attach the downloaded file.') + '\n\nReceipt code: ' + sub.id + (sub.sha ? '-' + sub.sha.slice(0, 8) : ''));
      say(hasAudio ? 'The file was downloaded and the email app should open. Attach the downloaded file to the message.' : 'The email app should open. The text is copied; paste it into the message.');
    } }, 'Send by email'));
    btns.push(h('button', { type: 'button', onclick: async () => {
      await copy(); window.open(CFG.githubIssueUrl, '_blank', 'noopener,noreferrer');
      say(hasAudio ? 'Text copied. GitHub accepts text only; send the downloaded file with the recordings by email or share.' : 'Copied. On GitHub, paste the text into the large box (a free GitHub account is required).');
    } }, 'Post on GitHub (account required)'));
    render(
      h('h1', { text: 'Your submission is ready' }),
      h('p', { text: 'The submission has not been sent anywhere. Choose how to share it.' }),
      hasAudio ? h('div', { class: 'notice warn small', text: 'The submission is one file containing ' + sub.audioList.length + ' recording' + (sub.audioList.length === 1 ? '' : 's') + ' (' + mb + ' MB). Send the file itself. Some email services reject files over 20 MB; if so, use Share or send the file in two parts.' }) : null,
      h('div', { class: 'row' }, btns), status,
      h('div', { class: 'card' }, h('strong', { text: 'Receipt code' }), h('p', { text: sub.id + (sub.sha ? '-' + sub.sha.slice(0, 8) : '') }),
        h('p', { class: 'small mut', text: 'Quote this code if you need to ask about your contribution. The longer fingerprint inside the file lets reviewers confirm that it arrived undamaged.' })),
      h('div', { class: 'notice warn small', text: 'Reviewers check everything before it is used. Published contributions are CC0 and cannot be withdrawn. If you chose "Discuss with me first", nothing is published until you agree.' + (hasAudio ? ' Recordings follow your choice: ' + (state.consent.audio === 'public' ? 'publish after review.' : 'research only, not published.') : '') }),
      h('details', null, h('summary', { text: 'See exactly what will be shared' }), h('pre', { class: 'out', text })),
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenReview }, 'Back and edit'),
        h('button', { type: 'button', onclick: async () => { if (confirm('Delete everything on this device, including recordings, and start a new contribution? Share or download your file first.')) { await wipe(); screenConsent(); } } }, 'Delete draft and start new'))
    );
  }

  /* ---------- shell ---------- */
  document.getElementById('menu-clear').addEventListener('click', async () => {
    if (confirm('Delete your draft and recordings from this device? This cannot be undone.')) { await wipe(); screenConsent(); }
  });
  const net = document.getElementById('net');
  const setNet = () => { net.textContent = navigator.onLine ? '' : 'Offline. The form still works.'; };
  addEventListener('online', setNet); addEventListener('offline', setNet); setNet();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline cache is optional */ });
  }
  (async () => {
    if (state.consent.save) { idb = await openDB(); await idbLoadAll(); }
    const c = state.consent;
    if (c.adult && c.cc0 && c.publish && c.credit && c.audio) screenHub(); else screenConsent();
  })();
})();
