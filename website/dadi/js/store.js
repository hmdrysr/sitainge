/* Dadi local storage with fail-safes (CC0).
   - Every save is checksummed and written through two rolling backups, so a failed or cut-short write can be rolled back.
   - Every change to progress, profile or contributions is appended to a history log (nothing is silently overwritten or removed).
   - Works with no storage at all (memory only) and says so.
   - Export / import of the whole state as one JSON file. */
(function (root) {
  'use strict';
  const KEY = 'dadi.v1.state', BAK1 = 'dadi.v1.bak1', BAK2 = 'dadi.v1.bak2', LOG = 'dadi.v1.log', DATA = 'dadi.v1.repo';
  const LOG_MAX = 3000;

  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); }
  function blank() {
    return { v: 1, profile: { locality: '', age: '', background: '', otherLanguages: '', languageName: '', credit: 'anonymous', creditName: '', adult: false, cc0: false },
      settings: { pitch: 'mid', speed: 1, showIPA: true }, cards: {}, stats: { xp: 0, streak: 0, lastDay: '', lessonsDone: {} }, queue: [], auth: null };
  }

  function create(backend) {
    let mem = {}, persistent = true;
    const b = backend || (function () {
      try { const t = '__dadi_test'; root.localStorage.setItem(t, '1'); root.localStorage.removeItem(t); return root.localStorage; } catch (e) { return null; }
    })();
    if (!b) persistent = false;
    const get = (k) => { try { return b ? b.getItem(k) : (k in mem ? mem[k] : null); } catch (e) { return mem[k] || null; } };
    const set = (k, v) => { try { if (b) b.setItem(k, v); else mem[k] = v; return true; } catch (e) { mem[k] = v; persistent = false; return false; } };
    const del = (k) => { try { if (b) b.removeItem(k); else delete mem[k]; } catch (e) { delete mem[k]; } };

    function pack(state) { const data = JSON.stringify(state); return JSON.stringify({ t: new Date().toISOString(), sum: fnv(data), data }); }
    function unpack(raw) {
      if (!raw) return null;
      try { const o = JSON.parse(raw); if (typeof o.data !== 'string' || fnv(o.data) !== o.sum) return null; const s = JSON.parse(o.data); return s && s.v === 1 ? s : null; } catch (e) { return null; }
    }

    let state = null, restoredFrom = null;
    function load() {
      for (const [k, name] of [[KEY, 'main'], [BAK1, 'backup 1'], [BAK2, 'backup 2']]) {
        const s = unpack(get(k));
        if (s) { state = Object.assign(blank(), s); restoredFrom = k === KEY ? null : name; if (restoredFrom) { log('rollback', 'state restored from ' + name + ' because the main copy was missing or damaged'); save(); } return state; }
      }
      state = blank(); return state;
    }
    function save() {
      const packed = pack(state);
      const old1 = get(BAK1), old0 = get(KEY);
      if (old1) set(BAK2, old1);
      if (old0) set(BAK1, old0);
      return set(KEY, packed);
    }
    function log(type, detail, id) {
      let arr = []; try { arr = JSON.parse(get(LOG) || '[]'); } catch (e) { arr = []; }
      arr.push({ t: new Date().toISOString(), type, id: id || null, detail: String(detail || '').slice(0, 300) });
      if (arr.length > LOG_MAX) arr = arr.slice(arr.length - LOG_MAX);
      set(LOG, JSON.stringify(arr));
    }
    const history = () => { try { return JSON.parse(get(LOG) || '[]'); } catch (e) { return []; } };

    function update(fn, type, detail, id) { fn(state); save(); log(type, detail, id); return state; }

    function exportAll() {
      const safe = JSON.parse(JSON.stringify(state)); safe.auth = null; /* never put the sign-in token in a file */
      return JSON.stringify({ app: 'dadi', exported: new Date().toISOString(), state: safe, history: history() }, null, 1);
    }
    function importAll(text) {
      let o; try { o = JSON.parse(text); } catch (e) { return { ok: false, error: 'This is not a Dadi backup file (not valid JSON).' }; }
      if (!o || o.app !== 'dadi' || !o.state || o.state.v !== 1) return { ok: false, error: 'This file is not a Dadi backup.' };
      /* Merge, never overwrite: keep the newer card by last review; add queue items we do not have. */
      const inc = o.state, mine = state;
      for (const [id, c] of Object.entries(inc.cards || {})) {
        const m = mine.cards[id];
        if (!m || String(c.last_review || '') > String(m.last_review || '')) mine.cards[id] = c;
      }
      const have = new Set(mine.queue.map((q) => q.id));
      for (const q of inc.queue || []) if (!have.has(q.id)) mine.queue.push(q);
      mine.stats.xp = Math.max(mine.stats.xp || 0, (inc.stats && inc.stats.xp) || 0);
      mine.stats.streak = Math.max(mine.stats.streak || 0, (inc.stats && inc.stats.streak) || 0);
      Object.assign(mine.stats.lessonsDone, (inc.stats && inc.stats.lessonsDone) || {});
      save(); log('import', 'merged a backup file made ' + (o.exported || 'at an unknown time'));
      return { ok: true };
    }

    function cacheRepo(obj) { return set(DATA, JSON.stringify(obj)); }
    function cachedRepo() { try { return JSON.parse(get(DATA) || 'null'); } catch (e) { return null; } }
    function wipe() { log('wipe', 'all local data deleted at the user\'s request'); [KEY, BAK1, BAK2, DATA].forEach(del); state = blank(); }

    load();
    return { get state() { return state; }, save, update, log, history, exportAll, importAll, cacheRepo, cachedRepo, wipe, load,
      get persistent() { return persistent; }, get restoredFrom() { return restoredFrom; } };
  }

  const api = { create, fnv, blank };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiStore = api;
})(typeof self !== 'undefined' ? self : this);
