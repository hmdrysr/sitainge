/* Dadi learning logic (CC0). Pure functions, no page access, so they can be tested in Node.
   Follows docs/dadi/LEARNING_DESIGN.md: answer matching (section 5), units and sessions (sections 2 and 3), progress counts (section 11). */
(function (root) {
  'use strict';

  const SESSION = { maxNew: 5, hardMaxNew: 7, maxReviews: 12, pauseNewAbove: 25, interleave: 4, gate: 0.8, gateDays: 2, leechLapses: 6 };

  /* ---------- text helpers ---------- */
  const nfc = (s) => String(s == null ? '' : s).normalize('NFC');
  const display = (e) => (e.spellings && e.spellings[0]) || e.form;
  /* Fold for comparison: no accents or dots under or over letters, no case, no punctuation or spaces. */
  function fold(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/ɡ/g, 'g').replace(/ß/g, 'ss').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/ı/g, 'i').replace(/ł/g, 'l').replace(/đ/g, 'd')
      .replace(/[^\p{L}\p{N}]/gu, '');
  }
  const plain = (s) => nfc(s).toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/g, '').trim();
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let best = i;
      for (let j = 1; j <= b.length; j++) { const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); cur.push(v); if (v < best) best = v; }
      if (best > max) return max + 1; prev = cur;
    }
    return prev[b.length];
  }
  function graphemes(s) { return nfc(s).match(/\P{M}\p{M}*/gu) || []; }
  const hasBlank = (e) => /_{2,}/.test((e.spellings || [e.form]).join(' ')) || /_{2,}/.test(e.gloss || '');

  /* Every written form a learner may type for an entry: each attested spelling, the spelling without a bracketed part,
     with the bracket marks removed, and each side of a slash. */
  function accepted(e) {
    const out = new Set();
    for (const sp of (e.spellings && e.spellings.length ? e.spellings : [e.form])) {
      const s = nfc(sp).trim(); if (!s) continue;
      const bare = s.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
      const open = s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
      for (const v of [s, bare, open]) {
        if (!v) continue; out.add(v);
        if (v.indexOf('/') >= 0) v.split('/').map((x) => x.trim()).filter(Boolean).forEach((x) => out.add(x));
      }
    }
    return Array.from(out);
  }

  /* Check a typed answer. Result kinds:
       exact   same letters as the main written form (case and final punctuation ignored)
       folded  same once accents and dots are ignored
       alt     another attested spelling of the same entry
       also    a spelling of a different entry that has the same English gloss
       near    one letter away from an attested form (not accepted)
       none    not in the list (not accepted)
       empty   nothing typed
     `correct` is true for exact, folded, alt and also. */
  function matchAnswer(input, entry, pool) {
    const typed = nfc(input).trim();
    if (!typed) return { result: 'empty', correct: false };
    const main = display(entry), acc = accepted(entry);
    const tk = fold(typed), tp = plain(typed);
    if (!tk) return { result: 'none', correct: false };
    if (plain(main) === tp) return { result: 'exact', correct: true, matched: main };
    if (fold(main) === tk) return { result: 'folded', correct: true, matched: main };
    for (const a of acc) if (plain(a) === tp || fold(a) === tk) return { result: a === main ? 'exact' : (fold(a) === fold(main) ? 'folded' : 'alt'), correct: true, matched: a === main ? main : a };
    if (pool) {
      const g = fold(entry.gloss);
      for (const o of pool) {
        if (o.id === entry.id || fold(o.gloss) !== g || hasBlank(o)) continue;
        for (const a of accepted(o)) if (plain(a) === tp || fold(a) === tk) return { result: 'also', correct: true, matched: a, other: o };
      }
    }
    for (const a of acc) { const k = fold(a); if (k.length >= 4 && lev(tk, k, 1) <= 1) return { result: 'near', correct: false, close: true }; }
    return { result: 'none', correct: false };
  }

  /* ---------- units ---------- */
  /* themes: the parsed themes.json. byId: Map of entry id to entry. Items whose entry is missing are dropped, so a changed word list
     never breaks a unit. A unit with no items left is dropped. */
  function buildUnits(themes, byId) {
    const units = [];
    for (const u of (themes && themes.units) || []) {
      const items = (u.items || []).slice().sort((a, b) => (a.frequency_rank || 0) - (b.frequency_rank || 0)).map((i) => i.id).filter((id) => byId.has(id));
      if (items.length) units.push({ id: u.id, title: u.title, stage: u.stage || 4, icon: u.icon || '', pictures: !!u.pictures, summary: u.summary || '', items });
    }
    return units;
  }
  const unitOf = (units, id) => units.find((u) => u.items.indexOf(id) >= 0) || null;

  function dayOf(iso) { return String(iso).slice(0, 10); }
  /* items: st.learn.items, a map id -> { seen, days: [dates of a correct graded recall], lapses, suspended, known }. */
  function unitProgress(unit, items, cards) {
    let met = 0, twice = 0;
    for (const id of unit.items) {
      const it = items[id] || {};
      if (cards[id] || it.seen) met++;
      if ((it.days || []).length >= SESSION.gateDays) twice++;
    }
    const total = unit.items.length;
    return { total, met, twice, done: twice / total >= SESSION.gate };
  }
  function recommendedUnit(units, items, cards) {
    for (const u of units) if (!unitProgress(u, items, cards).done) return u;
    return null;
  }

  /* ---------- session ---------- */
  function isDue(card, now) { return !card || new Date(card.due) <= now; }
  /* Reviews due come first (oldest due first). If more than 25 are due, new items wait. New items come from the chosen unit, then from the
     next units in order, never more than 5. Items paused as leeches are left out. */
  function buildSession(o) {
    const now = o.now || new Date(), cards = o.cards || {}, items = o.items || {}, units = o.units || [], byId = o.byId;
    const usable = (id) => byId.has(id) && !(items[id] && items[id].suspended);
    const dueAll = Object.keys(cards).filter((id) => usable(id) && isDue(cards[id], now)).sort((a, b) => new Date(cards[a].due) - new Date(cards[b].due));
    const reviews = dueAll.slice(0, o.maxReviews || SESSION.maxReviews);
    const paused = dueAll.length > SESSION.pauseNewAbove;
    const cap = Math.min(o.maxNew || SESSION.maxNew, SESSION.hardMaxNew);
    let first = o.unitId ? units.find((u) => u.id === o.unitId) : recommendedUnit(units, items, cards);
    if (!first) first = units[0] || null;
    const order = first ? [first].concat(units.slice(units.indexOf(first) + 1), units.slice(0, units.indexOf(first))) : [];
    const fresh = [];
    if (!paused) for (const u of order) {
      for (const id of u.items) {
        if (fresh.length >= cap) break;
        if (!cards[id] && usable(id) && !hasBlank(byId.get(id))) fresh.push(id);
      }
      if (fresh.length >= cap || (o.unitId && fresh.length)) break;
    }
    const taken = new Set(reviews.concat(fresh));
    const freshUnits = new Set(fresh.map((id) => (unitOf(units, id) || {}).id));
    const rest = Object.keys(cards).filter((id) => usable(id) && !taken.has(id) && !freshUnits.has((unitOf(units, id) || {}).id))
      .sort((a, b) => new Date(cards[a].due) - new Date(cards[b].due)).slice(0, SESSION.interleave);
    return { reviews, fresh, interleave: o.rng ? shuffleWith(rest, o.rng) : rest, paused, dueTotal: dueAll.length, unitId: first ? first.id : null };
  }
  function shuffleWith(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* Order of steps: reviews due, then each new item (preview, meaning match, second recognition, first production), then a delayed retrieval of every new
     item mixed with items from older units. Delayed items keep the order in which they were first met, so each one comes back after the others. */
  function planSteps(s, o) {
    o = o || {}; const rng = o.rng || Math.random, known = o.known || {};
    const steps = [];
    s.reviews.forEach((id) => steps.push({ t: 'review', id }));
    s.fresh.forEach((id) => {
      if (!known[id]) steps.push({ t: 'preview', id });
      steps.push({ t: 'meaning', id }, { t: 'second', id }, { t: 'produce', id });
    });
    const delayed = s.fresh.map((id) => ({ t: 'delayed', id })), inter = s.interleave.map((id) => ({ t: 'mixed', id }));
    const mixed = []; let di = 0, ii = 0;
    while (di < delayed.length || ii < inter.length) {
      if (ii < inter.length && (di >= delayed.length || rng() < 0.5)) mixed.push(inter[ii++]); else mixed.push(delayed[di++]);
    }
    return steps.concat(mixed);
  }

  /* Rating from what happened: correct first try with no hint is Good; a hint or a second try is Hard; two misses is Again. Never Easy (section 8). */
  function ratingFor(r) {
    if (!r.correct) return 'again';
    return r.attempts > 1 || r.hint ? 'hard' : 'good';
  }
  const timeBucket = (ms) => (ms < 3000 ? 's' : ms < 8000 ? 'm' : ms < 20000 ? 'l' : 'xl');

  /* ---------- exercise material ---------- */
  function pickDistractors(entry, pool, n, o) {
    o = o || {}; const rng = o.rng || Math.random, unit = o.unitItems || [];
    const g = fold(entry.gloss);
    const ok = pool.filter((x) => x.id !== entry.id && fold(x.gloss) !== g && !hasBlank(x) && (!o.kind || x.kind === entry.kind));
    const same = ok.filter((x) => unit.indexOf(x.id) >= 0), other = ok.filter((x) => unit.indexOf(x.id) < 0);
    const f = fold(display(entry));
    const score = (x) => { const k = fold(display(x)); return (k[0] === f[0] ? 2 : 0) + (Math.abs(k.length - f.length) <= 1 ? 1 : 0) + rng() * 0.5; };
    const rest = o.byForm ? other.slice().sort((a, b) => score(b) - score(a)) : shuffleWith(other, rng);
    const seen = new Set([o.byForm ? f : g]), out = [];
    for (const x of shuffleWith(same, rng).concat(rest)) {
      const k = o.byForm ? fold(display(x)) : fold(x.gloss); if (!k || seen.has(k)) continue;
      seen.add(k); out.push(x); if (out.length >= n) break;
    }
    return out;
  }
  /* Tiles for tap-to-build: letters of a word (phrases use whole words), plus two decoys from other forms. */
  function buildTiles(entry, pool, rng) {
    rng = rng || Math.random;
    const target = display(entry).replace(/[.!?]+$/g, '').trim();
    const words = target.split(/\s+/).filter(Boolean), byWord = words.length > 1;
    const parts = byWord ? words : graphemes(target);
    const bank = new Set(); pool.forEach((x) => { if (x.id === entry.id || hasBlank(x)) return; (byWord ? display(x).split(/\s+/) : graphemes(display(x))).forEach((t) => { if (t && /\p{L}/u.test(t)) bank.add(byWord ? t.replace(/[.!?,]+$/g, '') : t); }); });
    const have = new Set(parts); const decoys = shuffleWith(Array.from(bank).filter((t) => !have.has(t)), rng).slice(0, 2);
    return { target, parts, tiles: shuffleWith(parts.concat(decoys).map((t, i) => ({ t, i })), rng), byWord };
  }
  const canType = (e) => !hasBlank(e) && display(e).length <= 24 && display(e).split(/\s+/).length <= 3;

  /* ---------- progress ---------- */
  /* log: array of [entry_id, iso time, exercise, correct 0/1, time bucket, hint 0/1, rating, fsrs state]; only graded rows count. */
  function weekRecall(log, now) {
    const since = (now || new Date()).getTime() - 7 * 864e5; let m = 0, c = 0;
    for (const r of log) if (r[6] && new Date(r[1]).getTime() >= since) { m++; if (r[3]) c++; }
    return { reviewed: m, remembered: c };
  }
  function totals(items, cards, now, byId) {
    now = now || new Date(); let met = 0, twice = 0, due = 0;
    for (const id of Object.keys(items)) { if (byId && !byId.has(id)) continue; if (items[id].seen || cards[id]) met++; if ((items[id].days || []).length >= 2) twice++; }
    for (const id of Object.keys(cards)) if ((!byId || byId.has(id)) && isDue(cards[id], now) && !(items[id] && items[id].suspended)) due++;
    return { met, twice, due };
  }
  const VERIFY = { unverified: 'Unverified', one_speaker: 'Checked by one speaker', community: 'Community verified', disputed: 'Disputed' };
  /* Status comes from the entry only. Nothing in the app raises it. */
  function verification(e) {
    const v = String(e.verification || '').toLowerCase().replace(/[\s-]+/g, '_');
    return VERIFY[v] ? { key: v, label: VERIFY[v] } : { key: 'unverified', label: VERIFY.unverified };
  }

  const api = { SESSION, fold, graphemes, accepted, matchAnswer, buildUnits, unitOf, unitProgress, recommendedUnit, buildSession, planSteps, ratingFor, timeBucket,
    pickDistractors, buildTiles, canType, weekRecall, totals, verification, display, hasBlank, dayOf, isDue };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiLearn = api;
})(typeof self !== 'undefined' ? self : this);
