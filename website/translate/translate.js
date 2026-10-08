/* Translator page logic (CC0). No inline script, no tracking. Typed text never leaves the browser. */
(function () {
  'use strict';
  const D = window.DadiData, T = window.DadiTranslate, N = window.DadiNativeTTS, $ = (id) => document.getElementById(id);
  const REPO = 'hmdrysr/sitainge', BRANCH = 'main', KEY = 'sitainga.translator.glossary', HOUR = 36e5, DAY = 24 * HOUR;
  const LOCAL = '../dadi/data/glossary.json';
  let G = null, last = null;

  const store = { get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* full or blocked */ } } };
  /* every request gets a 5 second limit */
  const tfetch = (u, o) => { const ac = new AbortController(), t = setTimeout(() => ac.abort(), 5000); return fetch(u, Object.assign({}, o, { signal: ac.signal })).finally(() => clearTimeout(t)); };
  const valid = (g) => g && Array.isArray(g.items) && g.items.length > 0;

  async function live() { /* build the glossary in this browser from the repo's own files (Dadi's scrape) */
    const r = await D.scrape({ repo: REPO, branch: BRANCH, fetch: tfetch });
    if (!r.entries.length) throw new Error('no entries found');
    return T.makeGlossary(r.entries);
  }
  async function init() {
    const c = store.get();
    if (c && valid(c.g)) { setG(c.g, 'saved copy from ' + new Date(c.at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })); }
    else { try { const r = await tfetch(LOCAL); setG(await r.json(), 'bundled copy'); } catch (e) { setG({ items: [] }, 'no dictionary available'); } }
    if (c && Date.now() - c.at < HOUR) return;
    try { const g = await live(); store.set({ g, at: Date.now() }); setG(g, 'live from GitHub'); }
    catch (e) { if (!c) { /* already on the bundled copy */ } $('src').textContent = $('src').textContent + ' GitHub could not be reached.'; }
  }
  function setG(g, from) { G = T.load(g); $('src').textContent = 'Dictionary: ' + G.size + (G.size === 1 ? ' meaning, ' : ' meanings, ') + from + '.'; render(); }

  function render() {
    const text = $('in').value, out = $('out'); out.textContent = '';
    if (!G) return;
    const r = last = T.translate(text, G);
    for (const p of r.parts) {
      if (p.t === 'text') { out.append(document.createTextNode(p.s)); continue; }
      const b = document.createElement('button'); b.type = 'button'; b.className = p.t;
      if (p.t === 'hit') { b.textContent = p.out; b.dataset.o = p.s; b.dataset.id = p.id; b.dataset.l = p.level; b.setAttribute('aria-label', p.out + ', English original ' + p.s + ', evidence level ' + p.level); }
      else { b.textContent = p.s; b.disabled = true; b.title = 'Not in the dictionary; stays in English'; }
      out.append(b);
    }
    $('cov').textContent = r.words ? r.hits + ' of ' + r.words + (r.words === 1 ? ' word' : ' words') + ' found (' + Math.round(r.coverage * 100) + '%).' + (r.hits < r.words ? ' The remaining words stay in English.' : '') : 'Enter text to see a draft.';
    $('detail').hidden = true;
    const miss = Array.from(new Set(r.parts.filter((p) => p.t === 'miss').map((p) => p.s.toLowerCase())));
    $('suggest').href = 'https://github.com/' + REPO + '/issues/new?title=' + encodeURIComponent('Missing word' + (miss.length > 1 ? 's' : '') + ': ' + (miss.slice(0, 3).join(', ') || '')) +
      '&body=' + encodeURIComponent('English words the translator did not find:\n\n' + miss.map((w) => '- ' + w).join('\n') + '\n\nIf you know the word in siṭaiṅga, please add how you say it, where you are from, and whether siṭaiṅga is your first language. Please do not include private information.');
  }
  function show(b) {
    const d = $('detail'); d.textContent = ''; d.hidden = false;
    const s = document.createElement('strong'); s.textContent = b.textContent;
    d.append(s, document.createTextNode(' · English original: "' + b.dataset.o + '". Source entry: ' + b.dataset.id + '. Evidence level: ' + b.dataset.l + (b.dataset.l === 'unassessed' ? ' (not yet assessed; treat as unverified).' : '.')));
  }
  $('out').addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('button.hit'); if (b) show(b); });
  $('out').addEventListener('mouseover', (e) => { const b = e.target.closest && e.target.closest('button.hit'); if (b) b.title = 'English: ' + b.dataset.o + ', evidence level ' + b.dataset.l; });
  $('in').addEventListener('input', render);

  $('copy').onclick = async () => {
    if (!last) return; const t = T.plain(last);
    try { await navigator.clipboard.writeText(t); $('copy').textContent = 'Copied'; } catch (e) { const r = document.createRange(); r.selectNodeContents($('out')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); $('copy').textContent = 'Selected; copy manually'; }
    setTimeout(() => { $('copy').textContent = 'Copy'; }, 1800);
  };
  $('listen').onclick = async () => {
    const t = $('tts'); if (!last) return;
    if (!N.supported() || !(await N.ready(1500))) { t.hidden = false; t.textContent = 'No voice is available on this device. Nothing was played.'; return; }
    t.hidden = false; t.textContent = 'Playing with the device voice. To the project\'s knowledge, no device voice supports siṭaiṅga, so the sound is an approximation, not a speaker\'s pronunciation.';
    for (const p of last.parts) { if (p.t !== 'hit') continue; const pr = D.pronunciation({ spellings: [p.out], form: p.out }); if (pr.complete && pr.ipa) { const r = await N.speak(pr.ipa, {}); if (!r.ok) { t.textContent = r.reason || 'Playback stopped.'; return; } } }
  };

  /* bookmarklet: loads the project's translate.js and dictionary from this site, replaces words, keeps an Undo button */
  const base = new URL('../dadi/', location.href).href;
  const code = "javascript:(function(){var s=document.createElement('script');s.src='" + base + "js/translate.js';s.onload=function(){DadiTranslate.pageFromUrl('" + base + "data/glossary.json').catch(function(e){alert(e.message)})};s.onerror=function(){alert('This page blocks outside scripts. Use the browser extension instead.')};document.head.appendChild(s)})();";
  $('bm').setAttribute('href', code);
  $('bm').addEventListener('click', (e) => e.preventDefault());
  $('bmcopy').onclick = async () => { try { await navigator.clipboard.writeText(code); $('bmcopy').textContent = 'Copied'; } catch (e) { $('bmcopy').textContent = 'Copy failed'; } };

  init();
})();
