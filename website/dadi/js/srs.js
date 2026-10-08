/* Dadi review scheduling (CC0 wrapper around the MIT-licensed FSRS algorithm, vendored in fsrs.umd.js).
   Settings follow docs/dadi/LEARNING_DESIGN.md section 8: desired retention 0.90, default weights, learning steps of 1 and 10 minutes,
   maximum interval 180 days, fuzz on. A card with 6 or more lapses is a leech and is paused by the app. */
(function (root) {
  'use strict';
  const FSRS = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./fsrs.umd.js') : root.FSRS;
  const sched = FSRS.fsrs(FSRS.generatorParameters({ request_retention: 0.9, maximum_interval: 180, enable_fuzz: true, enable_short_term: true, learning_steps: ['1m', '10m'] }));
  const R = { again: FSRS.Rating.Again, hard: FSRS.Rating.Hard, good: FSRS.Rating.Good, easy: FSRS.Rating.Easy };

  function thaw(c) {
    if (!c) return FSRS.createEmptyCard(new Date());
    return Object.assign({}, c, { due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined });
  }
  function freeze(c) { return Object.assign({}, c, { due: new Date(c.due).toISOString(), last_review: c.last_review ? new Date(c.last_review).toISOString() : undefined }); }

  /* grade: 'again' | 'hard' | 'good' | 'easy'. Returns the new stored card. */
  function review(stored, grade, now) {
    now = now || new Date();
    const res = sched.next(thaw(stored), now, R[grade]);
    const cap = now.getTime() + 180 * 864e5;                       /* fuzz can overshoot the maximum interval by a day or two */
    if (res.card.due.getTime() > cap) res.card.due = new Date(cap);
    return freeze(res.card);
  }
  /* Preview the next due time for each grade, for button labels. */
  function preview(stored, now) {
    now = now || new Date();
    const rec = sched.repeat(thaw(stored), now); const out = {};
    for (const k of Object.keys(R)) out[k] = new Date(rec[R[k]].card.due);
    return out;
  }
  /* Estimated chance of recalling the item now (0 to 1), from the scheduler's memory model. 0 for an item never reviewed. */
  function retrievability(stored, now) {
    if (!stored) return 0;
    try { const r = sched.get_retrievability(thaw(stored), now || new Date(), false); return typeof r === 'number' && isFinite(r) ? Math.max(0, Math.min(1, r)) : 0; } catch (e) { return 0; }
  }
  const LEECH_LAPSES = 6;
  const isLeech = (stored) => !!stored && (stored.lapses || 0) >= LEECH_LAPSES;
  function isDue(stored, now) { return !stored || new Date(stored.due) <= (now || new Date()); }
  function label(due, now) {
    const ms = due - (now || new Date()), m = Math.round(ms / 60000);
    if (m < 1) return 'under 1 minute'; if (m < 60) return m + (m === 1 ? ' minute' : ' minutes'); const h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? ' hour' : ' hours');
    const d = Math.round(h / 24); if (d < 30) return d + (d === 1 ? ' day' : ' days'); const mo = Math.round(d / 30); return mo + (mo === 1 ? ' month' : ' months');
  }

  const api = { review, preview, isDue, label, thaw, freeze, retrievability, isLeech, LEECH_LAPSES, settings: { retention: 0.9, maximumInterval: 180, fuzz: true } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiSrs = api;
})(typeof self !== 'undefined' ? self : this);
