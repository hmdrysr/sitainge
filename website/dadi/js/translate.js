/* Dadi translator (CC0): English to siṭaiṅga using only words and phrases the project already holds.
   It looks meanings up; it does not do grammar. Anything it does not know stays in English, and every replaced
   word keeps its source entry and evidence level so nothing looks more certain than it is. Works offline.
   Also runs as a bookmarklet on any web page (page()). */
(function (root) {
  'use strict';
  const LEVEL = { A: 5, B: 4, C: 3, D: 1, E: 0, unassessed: 0 };
  const STATE = { ACCEPTED: 3, REVIEW: 1, RAW: 0, ARCHIVED: -9 };
  const fold = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const rank = (e) => (LEVEL[e.level] || 0) * 10 + (STATE[e.state] || 0) + (e.ipa ? 1 : 0);

  /* Glossary: meaning -> best form. Compact on purpose so a page can load it in one small file. */
  function makeGlossary(entries) {
    const best = new Map();
    for (const e of entries || []) {
      const form = (e.spellings && e.spellings[0]) || e.form, gloss = e.gloss;
      if (!form || !gloss || e.state === 'ARCHIVED') continue;
      const alts = String(gloss).split(/\s*[;/]\s*/);
      for (const a of alts) {
        const base = fold(a.replace(/\(.*?\)/g, ' '));
        if (!base || base.split(' ').length > 12) continue;
        const keys = [base]; if (/^to [a-z]/.test(base)) keys.push(base.slice(3));
        for (const k of keys) { const cur = best.get(k); const r = rank(e); if (!cur || r > cur.r) best.set(k, { r, form, level: e.level || 'unassessed', id: e.id }); }
      }
    }
    const items = Array.from(best, ([k, v]) => [k, v.form, v.level, v.id]);
    return { v: 1, items };
  }
  function load(g) {
    const map = new Map(); let maxWords = 1;
    for (const [k, form, level, id] of g.items) { map.set(k, { form, level, id }); maxWords = Math.max(maxWords, k.split(' ').length); }
    return { map, maxWords: Math.min(maxWords, 12), size: map.size };
  }
  const stems = (w) => { const out = [w]; if (w.length > 3 && w.endsWith('s')) out.push(w.slice(0, -1)); if (w.length > 4 && w.endsWith('es')) out.push(w.slice(0, -2)); return out; };

  /* translate(text, G) -> { parts: [{ t:'hit'|'miss'|'text', s, out?, id?, level? }], words, hits, coverage } */
  function translate(text, G) {
    const re = /[A-Za-z0-9’']+/g, toks = []; let m, last = 0;
    text = String(text || '');
    while ((m = re.exec(text))) { toks.push({ w: m[0], f: fold(m[0].replace(/’/g, "'")), start: m.index, end: m.index + m[0].length }); }
    const parts = []; let i = 0, hits = 0, cursor = 0;
    const gap = (to) => { if (to > cursor) parts.push({ t: 'text', s: text.slice(cursor, to) }); cursor = to; };
    while (i < toks.length) {
      let hit = null, n = Math.min(G.maxWords, toks.length - i);
      for (; n >= 1 && !hit; n--) {
        const words = toks.slice(i, i + n).map((x) => x.f); if (words.some((x) => !x)) continue;
        const head = words.slice(0, -1).join(' ');
        for (const st of stems(words[words.length - 1])) { const v = G.map.get((head ? head + ' ' : '') + st); if (v) { hit = { v, n }; break; } }
      }
      if (hit) {
        gap(toks[i].start); const end = toks[i + hit.n - 1].end;
        parts.push({ t: 'hit', s: text.slice(toks[i].start, end), out: hit.v.form, id: hit.v.id, level: hit.v.level, words: hit.n });
        cursor = end; hits += hit.n; i += hit.n;
      } else { gap(toks[i].start); parts.push({ t: 'miss', s: toks[i].w }); cursor = toks[i].end; i++; }
    }
    gap(text.length);
    parts.forEach((p, k) => { const nx = parts[k + 1]; if (p.t === 'hit' && nx && nx.t === 'text' && /[.?!]$/.test(p.out) && nx.s[0] === p.out.slice(-1)) p.out = p.out.slice(0, -1); });
    return { parts, words: toks.length, hits, coverage: toks.length ? hits / toks.length : 0 };
  }
  const plain = (r) => r.parts.map((p) => (p.t === 'hit' ? p.out : p.s)).join('');

  /* Replace words on the current web page. Original text is kept so "Undo" restores it exactly. */
  function page(G, doc) {
    doc = doc || root.document; const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|SELECT|CODE|PRE|SVG|IFRAME)$/;
    const saved = []; let words = 0, hits = 0;
    const w = doc.createTreeWalker(doc.body, 4, { acceptNode: (n) => { const p = n.parentNode; if (!p || SKIP.test(p.nodeName) || p.isContentEditable || (p.closest && p.closest('[data-dadi-ui]'))) return 2; return /[A-Za-z]/.test(n.nodeValue) ? 1 : 2; } });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    for (const n of nodes) {
      const r = translate(n.nodeValue, G); words += r.words; if (!r.hits) continue; hits += r.hits;
      const frag = doc.createDocumentFragment();
      for (const p of r.parts) {
        if (p.t === 'hit') { const s = doc.createElement('span'); s.textContent = p.out; s.title = p.s + ' (unverified: ' + p.level + ')'; s.setAttribute('data-dadi-hit', ''); s.style.cssText = 'text-decoration:underline dotted;text-underline-offset:3px'; frag.append(s); }
        else frag.append(doc.createTextNode(p.s));
      }
      const marker = doc.createComment('dadi'); n.parentNode.insertBefore(marker, n); n.parentNode.insertBefore(frag, n); saved.push([n, marker]); n.parentNode.removeChild(n);
    }
    const bar = doc.createElement('div'); bar.setAttribute('data-dadi-ui', '');
    bar.style.cssText = 'position:fixed;z-index:2147483647;left:8px;right:8px;bottom:8px;max-width:520px;margin:auto;background:#1c1c1e;color:#fff;font:14px/1.35 system-ui,sans-serif;padding:10px 14px;border-radius:14px;display:flex;gap:12px;align-items:center;box-shadow:0 4px 18px rgba(0,0,0,.35)';
    const t = doc.createElement('span'); t.style.flex = '1'; t.textContent = 'siṭaiṅga draft: ' + hits + ' of ' + words + ' words replaced from the project dictionary. Unverified. The remaining words are left in English.';
    const b = doc.createElement('button'); b.textContent = 'Undo'; b.style.cssText = 'border:0;border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;background:#fff;color:#000;cursor:pointer';
    b.onclick = () => { saved.forEach(([n, mk]) => { let x = mk.nextSibling; const first = x; const stop = []; while (x && x.nodeType && (x.nodeType === 3 || (x.getAttribute && x.hasAttribute('data-dadi-hit')))) { stop.push(x); x = x.nextSibling; if (stop.length > 400) break; } stop.forEach((y) => y.remove()); mk.parentNode.insertBefore(n, mk); mk.remove(); void first; }); bar.remove(); };
    bar.append(t, b); doc.body.append(bar);
    return { words, hits };
  }
  /* Bookmarklet entry: loads the glossary from the project site and rewrites the page. */
  async function pageFromUrl(url) { const r = await fetch(url); if (!r.ok) throw new Error('The dictionary could not be loaded (HTTP ' + r.status + ').'); return page(load(await r.json())); }

  const api = { fold, makeGlossary, load, translate, plain, page, pageFromUrl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiTranslate = api;
})(typeof self !== 'undefined' ? self : this);
