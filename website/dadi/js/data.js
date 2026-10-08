/* Dadi data layer: reads the project's own files from GitHub (the "dictionary scrape"), normalizes them,
   ranks them, and decides how each entry can be played. CC0.
   Rules it enforces: nothing is invented; every entry keeps its original spellings; trust is shown, never hidden. */
(function (root) {
  'use strict';
  const G2P = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./g2p.js') : root.DadiG2P;

  const WANTED = [
    /^lexicon\/(raw|review|accepted)\/[^/]+\.jsonl$/,
    /^datasets\/[^/]+\.jsonl$/,
    /^corpus\/texts\/[^/]+\.(yaml|yml|jsonl)$/
  ];
  const HIDDEN_CONSENT = new Set(['private', 'withdrawn', 'restricted']);
  const LEVEL_SCORE = { A: 5, B: 4, C: 3, D: 1, E: 0, unassessed: 0 };
  const STATE_SCORE = { ACCEPTED: 3, REVIEW: 1, RAW: 0, ARCHIVED: -9 };

  /* ---- parsers ---- */
  function parseJSONL(text) {
    const out = [], errors = [];
    String(text || '').split(/\r?\n/).forEach((line, i) => {
      if (!line.trim()) return;
      try { out.push(JSON.parse(line)); } catch (e) { errors.push('line ' + (i + 1) + ': ' + e.message); }
    });
    return { records: out, errors };
  }

  /* Minimal reader for the repository's own YAML text files: a list of flat mappings, with quoted or plain
     scalars and one-line [ "a", "b" ] lists. Anything fancier is reported, not guessed. */
  function scalar(v) {
    v = v.trim();
    if (v === '' || v === 'null' || v === '~') return null;
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v[0] === '"') { try { return JSON.parse(v); } catch (e) { throw new Error('bad quoted value: ' + v); } }
    if (v[0] === "'") return v.slice(1, -1).replace(/''/g, "'");
    if (v[0] === '[') { try { return JSON.parse(v); } catch (e) { throw new Error('bad list: ' + v); } }
    if (/^-?\d+$/.test(v)) return Number(v);
    return v;
  }
  function stripComment(v) {
    if (v[0] === '"' || v[0] === "'" || v[0] === '[' || v[0] === '{') return v;
    return v.replace(/\s+#.*$/, '');
  }
  function flowMap(v) {
    const o = {};
    v.slice(1, -1).split(/,\s*(?=[A-Za-z_]\w*:)/).forEach((pair) => {
      const m = pair.match(/^\s*([A-Za-z_]\w*):\s*(.*?)\s*$/); if (m) o[m[1]] = scalar(m[2]);
    });
    return o;
  }
  function value(v) { v = stripComment(v.trim()); return v[0] === '{' ? flowMap(v) : scalar(v); }
  function parseSimpleYAML(text) {
    const out = []; let cur = null; const errors = [];
    const lines = String(text || '').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || /^\s*#/.test(line)) continue;
      try {
        let m = line.match(/^- ([A-Za-z_]\w*):\s*(.*)$/);
        if (m) { cur = {}; out.push(cur); cur[m[1]] = value(m[2]); continue; }
        m = line.match(/^( {2})?([A-Za-z_]\w*):\s*(.*)$/);
        if (m) {
          let v = m[3];
          if (/^[>|][-+]?\s*$/.test(v.trim())) {            /* folded or literal block: indented lines that follow */
            const parts = [];
            while (i + 1 < lines.length && (/^\s+\S/.test(lines[i + 1]) || !lines[i + 1].trim())) { i++; if (lines[i].trim()) parts.push(lines[i].trim()); }
            if (!cur || (!m[1] && out.length && out[out.length - 1] !== cur)) { cur = {}; out.push(cur); }
            cur[m[2]] = parts.join(v.trim()[0] === '|' ? '\n' : ' ');
            continue;
          }
          if (!m[1] && (!cur || (out.length && out.indexOf(cur) < 0))) { cur = {}; out.push(cur); }
          else if (!m[1] && out.length === 1 && Array.isArray(out) && Object.keys(cur || {}).length && !cur.__list) { /* continue same top-level mapping */ }
          if (!cur) { cur = {}; out.push(cur); }
          cur[m[2]] = value(v);
          continue;
        }
        errors.push('line ' + (i + 1) + ' not understood');
      } catch (e) { errors.push('line ' + (i + 1) + ': ' + e.message); }
    }
    return { records: out, errors };
  }

  /* ---- normalization ---- */
  const nfc = (s) => String(s == null ? '' : s).normalize('NFC');
  const fold = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function normalize(rec, path) {
    if (!rec || typeof rec !== 'object') return null;
    const isText = /^CTG-TXT/.test(rec.id || '') || /corpus\/texts/.test(path || '');
    const form = nfc(isText ? (rec.original || rec.original_text_verbatim) : rec.form_as_submitted);
    const gloss = nfc(isText ? (rec.english || rec.english_source_text) : rec.english_gloss);
    if (!rec.id || !form || !gloss) return null;
    const consent = rec.consent || 'permission pending';
    const state = rec.state || 'RAW';
    if (HIDDEN_CONSENT.has(consent) || state === 'ARCHIVED') return null;
    const variants = (rec.variants || []).map(nfc).filter(Boolean);
    const spellings = Array.from(new Set(((rec.spellings && rec.spellings.length) ? rec.spellings : [form].concat(variants)).map(nfc).filter(Boolean)));
    const tokens = form.split(/\s+/).filter(Boolean).length;
    const sentenceLike = rec.unit === 'sentence' || /sentence/i.test(rec.form_note || '') || tokens >= 5 || (tokens >= 3 && /[.?!]$/.test(form));
    const kind = isText ? ((rec.type && rec.type !== 'sentence') || rec.original_text_verbatim ? 'text' : 'sentence') : (sentenceLike ? 'sentence' : 'word');
    return {
      id: rec.id, kind, form, spellings, gloss, pos: rec.part_of_speech || null, formNote: rec.form_note || null,
      example: rec.example_sentence || null, region: rec.region || null, state, level: rec.evidence_level || 'unassessed',
      confidence: rec.confidence || '', ai: !!rec.ai_assisted, consent, source: rec.source || '', notes: rec.notes || '',
      ipa: rec.ipa || null, ipaStatus: rec.ipa ? (rec.ipa_status || 'unknown') : 'none', ipaSource: rec.ipa_source || null,
      recording: rec.recording && rec.recording !== 'none' ? rec.recording : null, path: path || ''
    };
  }

  /* How an entry can be heard, and how far to trust it:
       recording      a recording of a speaker (none yet in the repository)
       ipa            IPA supplied by a person (speaker or phonetician)
       reading        machine reading of the spelling (approximate)
       none           not playable (spelling contains characters the reader does not know) */
  function pronunciation(entry) {
    if (entry.ipa) return { ipa: entry.ipa, how: 'ipa', complete: true, status: entry.ipaStatus };
    const pick = entry.spellings[0] || entry.form;
    const r = G2P.g2p(pick);
    if (r.complete && r.ipa) return { ipa: r.ipa, how: 'reading', complete: true, status: 'machine reading of the spelling' };
    return { ipa: r.ipa || '', how: 'none', complete: false, status: 'spelling contains characters the reader does not know: ' + r.unknown.join(' ') };
  }

  function trust(entry) {
    let t = (LEVEL_SCORE[entry.level] || 0) + (STATE_SCORE[entry.state] || 0);
    if (entry.ai) t -= 2;
    if (/native speaker/i.test(entry.confidence)) t += 1;
    if (entry.ipa && /speaker|phonetician|audio/.test(entry.ipaStatus)) t += 1;
    if (entry.consent === 'public') t += 0.5;
    return t;
  }

  function buildIndex(entries) {
    const seen = new Set(), list = [];
    for (const e of entries) { if (e && !seen.has(e.id)) { seen.add(e.id); list.push(e); } }
    list.forEach((e) => { e._fold = fold([e.gloss].concat(e.spellings).join(' | ')); e._pron = pronunciation(e); e._trust = trust(e); });
    list.sort((a, b) => b._trust - a._trust || (a.kind === b.kind ? 0 : a.kind === 'word' ? -1 : 1) || a.form.length - b.form.length || (a.id < b.id ? -1 : 1));
    return {
      all: list, byId: new Map(list.map((e) => [e.id, e])),
      search(q) {
        const f = fold(q).trim(); if (!f) return list.slice();
        return list.filter((e) => e._fold.includes(f));
      },
      playable() { return list.filter((e) => e._pron.complete && (e.kind === 'word' || e.kind === 'sentence')); }
    };
  }

  /* Lessons of six, easiest and most trusted first; words before sentences within a lesson group. */
  function lessons(index, size) {
    size = size || 6;
    const items = index.playable();
    const words = items.filter((e) => e.kind === 'word'), sents = items.filter((e) => e.kind === 'sentence');
    const out = []; let w = 0, s = 0;
    while (w < words.length || s < sents.length) {
      const group = words.slice(w, w + size - (s < sents.length && w + size >= words.length ? 1 : 0)); w += group.length;
      if (s < sents.length && (group.length < size)) { group.push(sents[s++]); }
      if (!group.length) break;
      out.push(group.map((e) => e.id));
    }
    return out;
  }

  /* ---- scrape ---- */
  async function scrape(opts) {
    const o = Object.assign({ repo: 'hmdrysr/sitainge', branch: 'main', fetch: (typeof fetch !== 'undefined' ? fetch : null), token: null }, opts || {});
    if (!o.fetch) throw new Error('no fetch available');
    const hdr = { Accept: 'application/vnd.github+json' };
    if (o.token) hdr.Authorization = 'Bearer ' + o.token;
    const tr = await o.fetch('https://api.github.com/repos/' + o.repo + '/git/trees/' + o.branch + '?recursive=1', { headers: hdr });
    if (!tr.ok) throw new Error('file list: HTTP ' + tr.status);
    const tree = await tr.json();
    const files = (tree.tree || []).filter((n) => n.type === 'blob' && WANTED.some((re) => re.test(n.path))).map((n) => n.path);
    const entries = [], errors = [], used = [];
    let i = 0;
    async function worker() {
      while (i < files.length) {
        const path = files[i++];
        try {
          const r = await o.fetch('https://raw.githubusercontent.com/' + o.repo + '/' + o.branch + '/' + path);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const txt = await r.text();
          const parsed = /\.ya?ml$/.test(path) ? parseSimpleYAML(txt) : parseJSONL(txt);
          parsed.errors.forEach((e) => errors.push(path + ' ' + e));
          for (const rec of parsed.records) { const n = normalize(rec, path); if (n) entries.push(n); }
          used.push(path);
        } catch (e) { errors.push(path + ': ' + e.message); }
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);
    return { entries, files: used, errors, truncated: !!tree.truncated, fetchedAt: new Date().toISOString() };
  }

  const api = { WANTED, parseJSONL, parseSimpleYAML, normalize, pronunciation, trust, buildIndex, lessons, scrape, fold };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiData = api;
})(typeof self !== 'undefined' ? self : this);
