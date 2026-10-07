/* Dadi review scheduling (CC0 wrapper around the MIT-licensed FSRS algorithm, vendored in fsrs.umd.js).
   FSRS is the open scheduler used in Anki. A Pimsleur-style session loop (listen, answer before the reveal, spaced
   re-asking inside the session) sits on top; long-term timing comes from FSRS. */
(function (root) {
  'use strict';
  const FSRS = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./fsrs.umd.js') : root.FSRS;
  const sched = FSRS.fsrs(FSRS.generatorParameters({ request_retention: 0.9, enable_fuzz: false }));
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
    return freeze(res.card);
  }
  /* Preview the next due time for each grade, for button labels. */
  function preview(stored, now) {
    now = now || new Date();
    const rec = sched.repeat(thaw(stored), now); const out = {};
    for (const k of Object.keys(R)) out[k] = new Date(rec[R[k]].card.due);
    return out;
  }
  function isDue(stored, now) { return !stored || new Date(stored.due) <= (now || new Date()); }
  function label(due, now) {
    const ms = due - (now || new Date()), m = Math.round(ms / 60000);
    if (m < 1) return '<1 min'; if (m < 60) return m + ' min'; const h = Math.round(m / 60); if (h < 24) return h + ' h';
    const d = Math.round(h / 24); return d < 30 ? d + ' d' : Math.round(d / 30) + ' mo';
  }

  const api = { review, preview, isDue, label, thaw, freeze };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiSrs = api;
})(typeof self !== 'undefined' ? self : this);
