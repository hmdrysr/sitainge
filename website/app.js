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
      consent: { adult: false, cc0: false, publish: '', credit: '', creditName: '', save: true },
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
  function wipe() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } state = fresh(); }

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
  function render(...nodes) { app.replaceChildren(...nodes.flat().filter(Boolean)); window.scrollTo(0, 0); app.focus(); }
  function keyOf(b, i) { return BLOCKS[b].id + ':' + i; }
  function answered(a) { return !!(a && (a.status || Core.clean(a.response))); }
  function blockCount(b) { return BLOCKS[b].items.filter((_, i) => answered(state.answers[keyOf(b, i)])).length; }
  function totalCount() { return BLOCKS.reduce((n, _, b) => n + blockCount(b), 0) + state.heritage.length; }
  function bar(done, total) { return h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': done }, h('i', { style: 'width:' + (total ? Math.round(100 * done / total) : 0) + '%' })); }
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
      h('h1', { text: 'Share how you speak Sitainge' }),
      h('p', { text: 'You will be asked to say words and sentences in your own natural Sitainge. There are no wrong answers. If your village says it differently from others, that is exactly what the project wants.' }),
      h('p', { class: 'mut', text: 'You can stop at any time and still export what you have. Your answers stay on this device until you choose to share them.' }),
      h('details', null, h('summary', { text: 'What this page does and does not do' }),
        h('ul', null,
          h('li', { text: 'It never sends anything by itself. You decide if, when and how to share.' }),
          h('li', { text: 'It shows English prompts only. It never suggests a Sitainge word, never corrects you and never judges an answer.' }),
          h('li', { text: 'It records exactly what you type, in Latin letters or Bangla script. Phone autocorrect is turned off for answer boxes.' }),
          h('li', { text: 'It adds a fingerprint code to your file so reviewers can tell if it was damaged or changed on the way.' }),
          h('li', { text: 'Everything is reviewed by people before it is used. Nothing is accepted automatically, and accepting a form never means other forms are wrong.' }))),
      h('h2', { text: 'Before you start' }),
      choice('checkbox', 'adult', 'I am 18 or older, or a parent or guardian is helping me and will read the final output.', c.adult, (v) => { c.adult = v; save(); }),
      choice('checkbox', 'cc0', 'I understand that if my contribution is published, it is dedicated to the public domain under CC0 1.0. Anyone can use it, including for AI. This cannot be undone once published. I am sharing my own speech or something I have the right to share.', c.cc0, (v) => { c.cc0 = v; save(); }),
      h('h2', { text: 'What should we do with it?' }),
      choice('radio', 'pub', 'Publish it (CC0) after review', c.publish === 'yes', () => { c.publish = 'yes'; save(); }),
      choice('radio', 'pub', 'Discuss with me first. Do not publish yet.', c.publish === 'no', () => { c.publish = 'no'; save(); }),
      h('h2', { text: 'How should we credit you?' }),
      choice('radio', 'cr', 'Anonymously', c.credit === 'anonymous', () => { c.credit = 'anonymous'; save(); }),
      choice('radio', 'cr', 'By a contributor ID only', c.credit === 'contributor_id', () => { c.credit = 'contributor_id'; save(); }),
      choice('radio', 'cr', 'By name', c.credit === 'name', () => { c.credit = 'name'; save(); }),
      credName,
      h('h2', { text: 'Privacy on this device' }),
      choice('checkbox', 'save', 'Save my draft on this device so I can continue later. Untick this on a shared phone or computer.', c.save, (v) => { c.save = v; save(); }),
      h('p', { class: 'small mut', text: 'Please do not enter your full name, phone number, address, email or any ID number in the answers.' }),
      err,
      h('div', { class: 'row' }, h('button', { class: 'primary', type: 'button', onclick: () => {
        const m = [];
        if (!c.adult) m.push('Please confirm your age or guardian.');
        if (!c.cc0) m.push('Please confirm the public-domain statement.');
        if (!c.publish) m.push('Please choose what to do with your contribution.');
        if (!c.credit) m.push('Please choose how to be credited.');
        if (c.credit === 'name' && !Core.clean(c.creditName)) m.push('Please type the name you want shown.');
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
      h('p', { class: 'mut', text: 'All of this is optional. It helps reviewers understand which variety you speak. Leave anything blank.' }),
      field('Where do you speak it? (village, union, upazila or district, as much as you like)', input(s, 'locality')),
      field('Age group', age),
      field('What do you call your language?', input(s, 'languageName', { verbatim: true })),
      field('Other languages you use', input(s, 'otherLanguages')),
      field('Anything about your background that affects how you speak', area(s, 'background')),
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
      h('h1', { text: 'Choose what to do' }),
      h('p', { text: 'Do as much or as little as you like, in any order. You have given ' + totalCount() + ' answer' + (totalCount() === 1 ? '' : 's') + ' so far.' }),
      rows,
      h('div', { class: 'card' }, h('strong', { text: 'Proverbs, riddles, rhymes, place names, stories' }), ' ', h('span', { class: 'tag', text: state.heritage.length + ' added (optional)' }),
        h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenHeritage }, 'Add one'))),
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
      return h('div', null, field('How do you say it? Write it the way you would say it.', ta));
    })();
    const answering = !a.status || a.status === 'used';
    const variants = answering ? h('div', null,
      (a.variants || []).map((v, vi) => {
        const el = h('input', Object.assign({ type: 'text', 'aria-label': 'Another way ' + (vi + 1) }, verbatim)); el.value = v;
        el.addEventListener('input', () => { a.variants[vi] = el.value; save(); });
        return h('div', { class: 'row' }, el, h('button', { type: 'button', 'aria-label': 'Remove', onclick: () => { a.variants.splice(vi, 1); save(); screenItem(bi, ii); } }, 'Remove'));
      }),
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: () => { a.variants = a.variants || []; a.variants.push(''); save(); screenItem(bi, ii); } }, 'Another way, or how others say it'))) : null;
    const conf = h('select', null, ...[['', 'How sure are you?'], ['sure', 'Very sure'], ['fairly_sure', 'Fairly sure'], ['not_sure', 'Not sure']].map(([v, t]) => h('option', { value: v, text: t })));
    conf.value = a.conf || ''; conf.addEventListener('change', () => { a.conf = conf.value; save(); });
    const more = h('details', null, h('summary', { text: 'More (optional)' }),
      field('How does it sound? Write it however you like.', input(a, 'pron', { verbatim: true })),
      field('Who says it? (older people, my village, everyone...)', input(a, 'usage')),
      field('Anything else about it', area(a, 'comment')),
      conf);
    render(
      h('div', { class: 'tag', text: b.title + ' · ' + (ii + 1) + ' of ' + b.items.length }), bar(ii + 1, b.items.length),
      h('div', { class: 'card' },
        h('p', { class: 'en', text: it.en }), it.ctx ? h('p', { class: 'ctx', text: it.ctx }) : null,
        answerBox,
        h('div', { class: 'row', role: 'group', 'aria-label': 'Answer type' }, STATUS.map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(a.status === v), onclick: () => { a.status = a.status === v ? '' : v; save(); screenItem(bi, ii); } }, t))),
        variants, answering ? more : null),
      h('div', { class: 'row' },
        h('button', { type: 'button', onclick: () => { save(); screenHub(); } }, 'Back to list'),
        ii > 0 ? h('button', { type: 'button', onclick: () => { save(); screenItem(bi, ii - 1); } }, 'Previous') : null,
        h('button', { class: 'primary', type: 'button', onclick: () => { save(); if (ii + 1 < b.items.length) screenItem(bi, ii + 1); else screenHub(); } }, ii + 1 < b.items.length ? 'Next' : 'Finish this part'))
    );
  }

  function screenHeritage() {
    const draft = { type: 'proverb', original: '', literal: '', meaning: '', context: '', conf: '' };
    const type = h('select', null, ...HERITAGE_TYPES.map(([v, t]) => h('option', { value: v, text: t })));
    const note = h('div', { class: 'notice warn small' });
    const setNote = () => { note.textContent = type.value === 'song_line' ? 'Only traditional oral songs, which belong to the community. For a song by a known composer, write only the title and who performed it. Do not write out its lyrics.' : ''; note.style.display = type.value === 'song_line' ? 'block' : 'none'; };
    type.addEventListener('change', () => { draft.type = type.value; setNote(); }); setNote();
    const listing = state.heritage.map((x, i) => h('div', { class: 'item' }, h('div', null, h('div', { class: 'a', text: x.original }), h('div', { class: 'tag', text: (HERITAGE_TYPES.find((t) => t[0] === x.type) || [0, 'item'])[1] })),
      h('button', { type: 'button', onclick: () => { state.heritage.splice(i, 1); save(); screenHeritage(); } }, 'Remove')));
    const msg = h('div', { 'aria-live': 'polite' });
    render(
      h('h1', { text: 'Add something from your culture' }),
      h('p', { class: 'mut', text: 'Proverbs, sayings, riddles, rhymes, place names, short stories. Only share what you have the right to share.' }),
      listing.length ? h('div', { class: 'card' }, listing) : null,
      field('What is it?', type), note,
      field('The original, exactly as it is said', area(draft, 'original', { verbatim: true })),
      field('What it says word for word (optional)', area(draft, 'literal')),
      field('What it really means (optional)', area(draft, 'meaning')),
      field('When or where people say it (optional)', input(draft, 'context')), msg,
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenHub }, 'Back to list'),
        h('button', { class: 'primary', type: 'button', onclick: () => {
          if (!Core.clean(draft.original)) { msg.replaceChildren(h('div', { class: 'notice error', text: 'Please write the original first.' })); return; }
          state.heritage.push(Object.assign({}, draft)); save(); screenHeritage();
        } }, 'Add it'))
    );
  }

  async function screenReview() {
    const sub = await Core.buildSubmission(state, BLOCKS);
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
          vs.length ? h('div', { class: 'tag', text: 'Other ways: ' + vs.join(' · ') }) : null),
          h('button', { type: 'button', onclick: () => screenItem(bi, ii) }, 'Edit')));
      });
      if (rows.length) groups.push(h('div', { class: 'card' }, h('strong', { text: b.title }), rows));
    });
    if (state.heritage.length) groups.push(h('div', { class: 'card' }, h('strong', { text: 'Culture' }), state.heritage.map((x) => h('div', { class: 'item' }, h('div', { class: 'a', text: x.original })))));
    const errBox = sub.errors.length ? h('div', { class: 'notice error' }, h('strong', { text: 'Please fix before you continue:' }), h('ul', null, sub.errors.map((e) => h('li', { text: e })))) : null;
    const piiBox = sub.pii.length ? h('div', { class: 'notice warn' }, h('strong', { text: 'This looks like it may contain personal information:' }),
      h('ul', null, sub.pii.map((p) => h('li', { text: p.where + ': ' + p.kind }))),
      h('p', { class: 'small', text: 'Please edit the item if so. If these are fine, tick the box below.' }),
      choice('checkbox', 'piiok', 'I checked, and this is not personal information I need to remove.', state.piiOk, (v) => { state.piiOk = v; save(); go.disabled = !ready(); })) : null;
    const rb = choice('checkbox', 'rb', 'I read everything above. It is exactly what I said.', state.readBack, (v) => { state.readBack = v; save(); go.disabled = !ready(); });
    const ready = () => !sub.errors.length && state.readBack && (!sub.pii.length || state.piiOk);
    const go = h('button', { class: 'primary', type: 'button', disabled: !ready(), onclick: () => screenExport() }, 'Prepare my submission');
    render(h('h1', { text: 'Read it back' }), h('p', { class: 'mut', text: sub.items.length + ' item' + (sub.items.length === 1 ? '' : 's') + '. Edit anything that is not exactly what you said.' }),
      groups, errBox, piiBox, rb, h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenHub }, 'Back to list'), go));
  }

  async function screenExport() {
    const sub = await Core.buildSubmission(state, BLOCKS);
    if (sub.errors.length || !state.readBack) { screenReview(); return; }
    const text = sub.text, name = 'sitainge-' + sub.id + '.txt', status = h('div', { class: 'notice good', 'aria-live': 'polite' });
    const say = (m) => { status.textContent = m; };
    async function copy() {
      try { await navigator.clipboard.writeText(text); return true; } catch (e) {
        const t = h('textarea', { style: 'position:fixed;opacity:0' }); t.value = text; document.body.append(t); t.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; } t.remove(); return ok;
      }
    }
    const btns = [];
    const file = typeof File === 'function' ? new File([text], name, { type: 'text/plain' }) : null;
    if (navigator.share) btns.push(h('button', { class: 'primary', type: 'button', onclick: async () => {
      try {
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'Sitainge submission ' + sub.id });
        else await navigator.share({ title: 'Sitainge submission ' + sub.id, text });
        say('Shared. Keep your receipt code below.');
      } catch (e) { if (e && e.name !== 'AbortError') say('Sharing did not work here. Use Download or Copy instead.'); }
    } }, 'Share (WhatsApp, email, any app)'));
    btns.push(h('button', { class: btns.length ? '' : 'primary', type: 'button', onclick: () => {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      const a = h('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
      say('Downloaded as ' + name + '. Send that file to the project, or keep it safe.');
    } }, 'Download file'));
    btns.push(h('button', { type: 'button', onclick: async () => say((await copy()) ? 'Copied. Paste it where you are sending it.' : 'Copy did not work. Select the text below and copy it by hand.') }, 'Copy text'));
    if (CFG.contactEmail) btns.push(h('button', { type: 'button', onclick: async () => {
      await copy();
      location.href = 'mailto:' + encodeURIComponent(CFG.contactEmail).replace('%40', '@') + '?subject=' + encodeURIComponent('Sitainge submission ' + sub.id) +
        '&body=' + encodeURIComponent('Paste the copied text here, or attach the downloaded file.\n\nReceipt code: ' + sub.id + (sub.sha ? '-' + sub.sha.slice(0, 8) : ''));
      say('Your email app should open. The text is copied; paste it into the email.');
    } }, 'Email it'));
    btns.push(h('button', { type: 'button', onclick: async () => {
      await copy(); window.open(CFG.githubIssueUrl, '_blank', 'noopener,noreferrer');
      say('Copied. On GitHub, paste it into the big box (a free GitHub account is needed).');
    } }, 'Post on GitHub (needs account)'));
    render(
      h('h1', { text: 'Your submission is ready' }),
      h('p', { text: 'It has not been sent anywhere. Choose how to share it:' }),
      h('div', { class: 'row' }, btns), status,
      h('div', { class: 'card' }, h('strong', { text: 'Receipt code' }), h('p', { text: sub.id + (sub.sha ? '-' + sub.sha.slice(0, 8) : '') }),
        h('p', { class: 'small mut', text: 'Quote this code if you ever need to ask about your contribution. The long fingerprint inside the file lets reviewers check it arrived undamaged.' })),
      h('div', { class: 'notice warn small', text: 'Reviewers check everything before use. Published contributions are CC0 and cannot be taken back. If you chose "Discuss with me first", nothing is published until you agree.' }),
      h('details', null, h('summary', { text: 'See exactly what will be shared' }), h('pre', { class: 'out', text })),
      h('div', { class: 'row' }, h('button', { type: 'button', onclick: screenReview }, 'Back and edit'),
        h('button', { type: 'button', onclick: () => { if (confirm('Delete everything from this device and start a new contribution? Make sure you have shared or downloaded your file first.')) { wipe(); screenConsent(); } } }, 'Delete draft and start new'))
    );
  }

  /* ---------- shell ---------- */
  document.getElementById('menu-clear').addEventListener('click', () => {
    if (confirm('Delete your draft from this device? This cannot be undone.')) { wipe(); screenConsent(); }
  });
  const net = document.getElementById('net');
  const setNet = () => { net.textContent = navigator.onLine ? '' : 'Offline: that is fine'; };
  addEventListener('online', setNet); addEventListener('offline', setNet); setNet();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline cache is optional */ });
  }
  const c = state.consent;
  if (c.adult && c.cc0 && c.publish && c.credit) screenHub(); else screenConsent();
})();
