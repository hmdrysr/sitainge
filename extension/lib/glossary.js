/* Glossary supply for the extension (CC0). Cached copy in storage.local, refreshed from the repo at most once a day,
   bundled data/glossary.json as the fallback. Only the dictionary file is fetched; page text is never sent anywhere. */
(function (root) {
  'use strict';
  const ext = root.browser || root.chrome, DAY = 864e5;
  const URL_RAW = 'https://raw.githubusercontent.com/hmdrysr/sitainge/main/website/dadi/data/glossary.json';
  const get = (k) => new Promise((res) => { try { ext.storage.local.get(k, (r) => res(r || {})); } catch (e) { res({}); } });
  const set = (o) => new Promise((res) => { try { ext.storage.local.set(o, () => res()); } catch (e) { res(); } });
  const valid = (j) => j && Array.isArray(j.items) && j.items.length > 0 && Array.isArray(j.items[0]);
  async function fetchJSON(u, ms) { const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms); try { const r = await fetch(u, { signal: ac.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
  async function glossary(force) {
    const c = await get(['glossary', 'glossaryAt']), fresh = valid(c.glossary) && Date.now() - (c.glossaryAt || 0) < DAY;
    if (fresh && !force) return { g: c.glossary, from: 'cache', at: c.glossaryAt };
    try { const j = await fetchJSON(URL_RAW, 5000); if (valid(j)) { await set({ glossary: j, glossaryAt: Date.now() }); return { g: j, from: 'repo', at: Date.now() }; } } catch (e) { /* offline: fall through */ }
    if (valid(c.glossary)) return { g: c.glossary, from: 'cache (stale)', at: c.glossaryAt };
    return { g: await fetchJSON(ext.runtime.getURL('data/glossary.json'), 5000), from: 'bundled', at: 0 };
  }
  root.SitaingaGlossary = { glossary };
})(typeof self !== 'undefined' ? self : this);
