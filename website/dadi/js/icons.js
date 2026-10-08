/* Pictures for words (CC0 wrapper). The pictures are Fluent Emoji (Flat) by Microsoft, MIT licence, and the word index comes from
   the Unicode CLDR names and keywords. Both are built into data/icons.json by scripts/build_icons.js. Nothing is fetched from other sites. */
(function (root) {
  'use strict';
  let D = null;
  const STOP = new Set(['a', 'an', 'the', 'to', 'of', 'is', 'am', 'are', 'my', 'your', 'our', 'his', 'her', 'its', 'this', 'that', 'it', 'and', 'or', 'in', 'on', 'at', 'for', 'with', 'be', 'do', 'does', 'i', 'you', 'we', 'he', 'she', 'they', 'me', 'us', 'them', 'let', 'lets', 'not', 'no']);
  const clean = (g) => String(g || '').toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z' ]+/g, ' ').replace(/'s\b/g, '').replace(/\s+/g, ' ').trim();
  function use(data) { D = data && data.words ? data : null; }
  async function load(url) { try { const r = await fetch(url); if (r.ok) use(await r.json()); } catch (e) { /* pictures are optional */ } return !!D; }
  const svg = (slug) => (D && D.icons[slug]) ? '<svg class="art" viewBox="' + D.viewBox + '" aria-hidden="true">' + D.icons[slug] + '</svg>' : null;
  function slugFor(gloss) {
    if (!D) return null;
    const g = clean(gloss); if (!g) return null;
    if (D.words[g]) return D.words[g];
    const toks = g.split(' ').filter((t) => t && !STOP.has(t));
    for (const t of toks) { const s = D.words[t] || (t.endsWith('s') && D.words[t.slice(0, -1)]) || (t.endsWith('ing') && D.words[t.slice(0, -3)]); if (s) return s; }
    return null;
  }
  const find = (gloss) => { const s = slugFor(gloss); return s ? svg(s) : null; };
  const api = { use, load, find, get: svg, slugFor, get ready() { return !!D; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiIcons = api;
})(typeof self !== 'undefined' ? self : this);
