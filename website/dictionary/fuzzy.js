/* siṭaiṅge dictionary: fuzzy search (CC0). Pure module, no dependencies; works in browsers and Node.
   Ranking, best first: exact, prefix, word prefix, substring, then a loose spelling match (diacritics, sh/s, ph/f, doubled letters),
   then edit distance (Damerau-Levenshtein, tolerance scaled to length). A trigram index narrows the candidates before any edit distance is computed. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.DictFuzzy = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* IPA and phonetic letters folded to the Latin letters a reader would type. */
  const MAP = { 'ɔ': 'o', 'ɛ': 'e', 'ʃ': 's', 'ʒ': 'j', 'ɡ': 'g', 'ŋ': 'n', 'ɟ': 'j', 'ɖ': 'd', 'ɽ': 'r', 'ʈ': 't', 'ɳ': 'n', 'ɭ': 'l', 'ə': 'a', '∧': 'a', 'ʌ': 'a', 'ɪ': 'i', 'ʊ': 'u', 'æ': 'e', 'ɑ': 'a', 'ɾ': 'r', 'ʰ': '', 'ː': '', 'ʔ': '', 'ɦ': 'h', 'ɲ': 'n', 'ɱ': 'm', 'ʋ': 'v', 'ɹ': 'r', 'ɐ': 'a', 'ø': 'o', 'ð': 'd', 'θ': 't', 'ß': 'ss', 'œ': 'oe', 'ł': 'l', 'đ': 'd' };
  const MAPRE = new RegExp('[' + Object.keys(MAP).join('') + ']', 'g');

  /* Plain form: marks removed, lower case, IPA letters folded, everything else a single space. */
  function normalize(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(MAPRE, (c) => MAP[c])
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  /* Loose form: spellings that readers use interchangeably collapse together (sh/s, ph/f/p, kh/k, c/k, z/j, v/b, doubled letters). */
  function skeleton(n) {
    return n.replace(/([bcdgjklmnprstwz])h/g, '$1').replace(/f/g, 'p').replace(/v/g, 'b').replace(/z/g, 'j').replace(/[cq]/g, 'k').replace(/(.)\1+/g, '$1');
  }
  const tolerance = (len) => (len <= 3 ? 0 : len <= 5 ? 1 : len <= 8 ? 2 : 3);

  /* Damerau-Levenshtein (optimal string alignment) with an early exit: returns max + 1 when the distance exceeds max. */
  function dl(a, b, max) {
    const la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    if (!la) return lb; if (!lb) return la;
    let p2 = null, p1 = new Array(lb + 1), cur = new Array(lb + 1);
    for (let j = 0; j <= lb; j++) p1[j] = j;
    for (let i = 1; i <= la; i++) {
      cur[0] = i; let min = i;
      for (let j = 1; j <= lb; j++) {
        const c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        let v = Math.min(p1[j] + 1, cur[j - 1] + 1, p1[j - 1] + c);
        if (p2 && i > 1 && j > 1 && c && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) v = Math.min(v, p2[j - 2] + 1);
        cur[j] = v; if (v < min) min = v;
      }
      if (min > max) return max + 1;
      const t = p2 || new Array(lb + 1); p2 = p1; p1 = cur; cur = t;
    }
    return p1[lb];
  }

  function grams(s) { const t = ' ' + s + ' ', out = new Set(); for (let i = 0; i + 3 <= t.length; i++) out.add(t.substr(i, 3)); return out; }

  function makeField(text, pen) {
    const n = normalize(text); if (!n) return null;
    const s = skeleton(n);
    return { n: n, s: s, w: n.split(' '), sw: s.split(' '), pen: pen };
  }
  /* Default view of an entry: forms, the whole gloss plus its parts, and the IPA. */
  function defaultFields(e) {
    const forms = [].concat(e.spellings || [], e.form ? [e.form] : []);
    const gl = e.gloss ? [e.gloss].concat(String(e.gloss).indexOf(';') >= 0 || String(e.gloss).indexOf('/') >= 0 || String(e.gloss).indexOf(',') >= 0 ? String(e.gloss).split(/[;\/,]/) : []) : [];
    return { forms: forms, glosses: gl, ipa: e.ipa ? [e.ipa] : [] };
  }

  /* Score of one query against one field; lower is better, Infinity for no match. */
  function scoreField(f, q) {
    const n = f.n, s = f.s, qn = q.n, qs = q.s;
    let sc = Infinity;
    if (n === qn) sc = 0;
    else if (n.startsWith(qn)) sc = 1;
    else if (n.indexOf(' ' + qn) >= 0) sc = 2;
    else if (n.indexOf(qn) >= 0) sc = 3;
    else if (qs.length < 2) sc = Infinity;
    else if (s === qs) sc = 1.2;
    else if (s.startsWith(qs)) sc = 2.2;
    else if (s.indexOf(' ' + qs) >= 0) sc = 2.6;
    else if (qs.length > 2 && s.indexOf(qs) >= 0) sc = 3.4;
    if (sc >= 2 && sc < 4 && f.w.length > 1) sc += Math.min(f.w.length - 1, 5) * 0.6;   /* a match inside a long sentence ranks below a match in a word */
    if (sc === Infinity && q.t.length > 1) sc = tokens(f, q);
    if (sc === Infinity && q.tol > 0) {
      let d = dl(s, qs, q.tol); if (d <= q.tol) sc = 4 + d * 0.5;
      if (s.length > qs.length) { d = dl(s.slice(0, qs.length), qs, q.tol); if (d <= q.tol && 4.5 + d * 0.5 < sc) sc = 4.5 + d * 0.5; }
      if (f.sw.length > 1 && q.t.length === 1) for (let i = 0; i < f.sw.length; i++) { d = dl(f.sw[i], qs, q.tol); if (d <= q.tol && 5 + d * 0.5 < sc) sc = 5 + d * 0.5; }
    }
    return sc === Infinity ? sc : sc + f.pen + Math.min(n.length, 80) * 0.004;
  }
  /* Several query words: every one must match some word of the field (exact, prefix, loose, or within edit tolerance), in any order. */
  function tokens(f, q) {
    let total = 0;
    for (let i = 0; i < q.t.length; i++) {
      const t = q.t[i], ts = q.ts[i], tol = q.fz ? tolerance(ts.length) : 0; let best = Infinity;
      for (let j = 0; j < f.w.length && best > 0; j++) {
        const w = f.w[j], ws = f.sw[j];
        let c = w === t ? 0 : w.startsWith(t) ? 0.3 : ws === ts ? 0.5 : ws.startsWith(ts) ? 0.8 : Infinity;
        if (c === Infinity && tol > 0) { const d = dl(ws, ts, tol); if (d <= tol) c = 1 + d; }
        if (c < best) best = c;
      }
      if (best === Infinity) return Infinity;
      total += best;
    }
    return 2.8 + (total / q.t.length) * 1.2;
  }

  function create(entries, opts) {
    opts = opts || {};
    const getFields = opts.fields || defaultFields;
    const list = [], fields = [], gi = new Map(), vocab = new Map(), vgi = new Map();
    entries.forEach((e) => {
      const v = getFields(e), fs = [];
      (v.forms || []).forEach((t) => { const f = makeField(t, 0); if (f) fs.push(f); });
      (v.glosses || []).forEach((t) => { const f = makeField(t, 0); if (f) fs.push(f); });
      (v.ipa || []).forEach((t) => { const f = makeField(t, 0.3); if (f) fs.push(f); });
      const idx = list.length; list.push(e); fields.push(fs);
      const seen = new Set();
      fs.forEach((f) => {
        grams(f.s).forEach((g) => { if (!seen.has(g)) { seen.add(g); let a = gi.get(g); if (!a) gi.set(g, a = []); a.push(idx); } });
        f.w.forEach((w, k) => { if (w.length > 1) { const x = vocab.get(w); if (x) x.c++; else vocab.set(w, { w: w, s: f.sw[k], c: 1 }); } });
      });
    });
    const vlist = Array.from(vocab.values());
    vlist.forEach((x, i) => grams(x.s).forEach((g) => { let a = vgi.get(g); if (!a) vgi.set(g, a = []); a.push(i); }));

    function prep(query) {
      const n = normalize(query), t = n ? n.split(' ') : [];
      const s = skeleton(n);
      return { n: n, s: s, t: t, ts: t.map(skeleton), tol: tolerance(s.length), fz: true };
    }
    /* Which candidates to run edit distance on: those sharing enough trigrams with the query. */
    function candidates(str, tol) {
      const qg = Array.from(grams(str)), need = Math.max(1, qg.length - (tol === 0 ? 2 : tol > 1 ? 3 * tol : 4 * tol)), cnt = new Map();
      qg.forEach((g) => { const a = gi.get(g); if (a) for (let i = 0; i < a.length; i++) cnt.set(a[i], (cnt.get(a[i]) || 0) + 1); });
      const out = []; cnt.forEach((c, i) => { if (c >= need) out.push(i); });
      return out;
    }

    /* Several words: an entry must be a candidate for every word. */
    function multi(q) {
      let set = null;
      q.ts.forEach((ts) => {
        const c = new Set(candidates(ts, tolerance(ts.length)));
        set = set ? new Set(Array.from(set).filter((i) => c.has(i))) : c;
      });
      return Array.from(set || []);
    }

    /* search(query, { filter: (entry) => boolean }) -> { list: [{ e, score }], fuzzy: boolean } */
    function search(query, o) {
      const q = prep(query), filter = o && o.filter;
      if (!q.n) return { list: [], fuzzy: false };
      const hits = [], done = new Uint8Array(list.length);
      const test = (i) => {
        if (done[i]) return; done[i] = 1;
        if (filter && !filter(list[i])) return;
        let best = Infinity; const fs = fields[i];
        for (let k = 0; k < fs.length; k++) { const s = scoreField(fs[k], q); if (s < best) best = s; }
        if (best < Infinity) hits.push({ e: list[i], score: best, i: i });
      };
      /* pass 1: exact, prefix, substring and loose matches by plain scan (cheap string tests only) */
      const q1 = { n: q.n, s: q.s, t: q.t, ts: q.ts, tol: 0, fz: false };
      for (let i = 0; i < list.length; i++) {
        if (filter && !filter(list[i])) { done[i] = 1; continue; }
        let best = Infinity; const fs = fields[i];
        for (let k = 0; k < fs.length; k++) { const s = scoreField(fs[k], q1); if (s < best) best = s; }
        if (best < Infinity) { hits.push({ e: list[i], score: best, i: i }); done[i] = 1; }
      }
      /* pass 2: edit distance, only when the plain pass found little, and only on trigram candidates */
      let fuzzy = false;
      if (q.tol > 0 && q.s.length >= 3 && hits.length < (o && o.fuzzyBelow || 30)) {
        const before = hits.length;
        if (q.t.length === 1) candidates(q.s, q.tol).forEach(test);
        else multi(q).forEach(test);
        fuzzy = hits.length > before;
      } else if (q.t.length > 1 && !hits.length) {
        multi(q).forEach(test);
        fuzzy = hits.length > 0;
      }
      hits.sort((a, b) => a.score - b.score || a.i - b.i);
      return { list: hits, fuzzy: fuzzy };
    }

    /* A "did you mean" for a query that found little: each unknown word is replaced by the closest word in the dictionary. */
    function suggest(query) {
      const q = prep(query); if (!q.n) return null;
      let changed = false;
      const out = q.t.map((t, ti) => {
        if (vocab.has(t)) return t;
        const ts = q.ts[ti], tol = Math.max(1, tolerance(ts.length));
        const qg = Array.from(grams(ts)), need = Math.max(1, qg.length - 4 * tol), cnt = new Map();
        qg.forEach((g) => { const a = vgi.get(g); if (a) for (let i = 0; i < a.length; i++) cnt.set(a[i], (cnt.get(a[i]) || 0) + 1); });
        let best = null, bd = tol + 1, bc = 0;
        cnt.forEach((c, i) => {
          if (c < need) return; const x = vlist[i];
          const d = dl(x.s, ts, tol) + (x.w === t ? 0 : dl(x.w, t, 3) * 0.01);
          if (d < bd || (d === bd && x.c > bc)) { best = x; bd = d; bc = x.c; }
        });
        if (best && bd <= tol + 0.2) { changed = true; return best.w; }
        return t;
      });
      return changed ? out.join(' ') : null;
    }
    return { size: list.length, search: search, suggest: suggest, entries: list };
  }

  return { create: create, normalize: normalize, skeleton: skeleton, dl: dl, tolerance: tolerance };
});
