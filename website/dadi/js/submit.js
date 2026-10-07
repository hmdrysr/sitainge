/* Turns the contribution queue into the project's standard submission text (CC0).
   It reuses website/core.js unchanged, so the format, the personal-information scan and the fingerprint are the same as the
   contribution page and the chatbot interview, and the reviewer script scripts/ingest_interview.py reads it. */
(function (root) {
  'use strict';
  const Core = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('../../core.js') : root.SitaingeCore;
  const PER_ISSUE = 40, BODY_MAX = 60000;
  const CONF = { sure: 'sure', fairly: 'fairly_sure', unsure: 'not_sure' };

  /* One queued contribution -> one block with one item. */
  function toBlock(q) {
    const ctx = [];
    if (q.action === 'variant') ctx.push('Dadi: says it differently from ' + (q.relatedId || 'an existing entry') + (q.relatedForm ? ' (' + q.relatedForm + ')' : ''));
    if (q.action === 'ipa') ctx.push('Dadi: IPA suggestion for ' + (q.relatedId || 'an existing entry'));
    if (q.action === 'report') ctx.push('Dadi: report on ' + (q.relatedId || 'an entry') + (q.relatedForm ? ' (' + q.relatedForm + ')' : ''));
    if (q.register) ctx.push('form: ' + q.register);
    return { id: 'q' + q.id.replace(/[^a-z0-9]/gi, ''), kind: q.kind === 'sentence' ? 'sentence' : 'word', title: 'Dadi', items: [{ en: q.gloss || '(see comment)', ctx: ctx.join('; ') }] };
  }
  function answerFor(q) {
    const pron = q.ipa ? 'IPA: ' + q.ipa + ' [status: ' + (q.ipaStatus || 'speaker-chosen-by-ear') + ']' : '';
    if (q.action === 'report') return { status: 'unsure', response: '', variants: [], pron: '', usage: '', conf: '', comment: 'REPORT: ' + (q.note || '') };
    return { status: 'used', response: q.form, variants: q.variants || [], pron, usage: q.note || '', conf: CONF[q.confidence] || '', comment: q.action === 'ipa' ? 'IPA suggestion only; the spelling is the existing entry\'s' : '' };
  }

  function stateFor(profile, answers) {
    return {
      consent: { adult: !!profile.adult, cc0: !!profile.cc0, publish: 'yes', credit: profile.credit || 'anonymous', creditName: profile.creditName || '', audio: 'none', save: true },
      speaker: { locality: profile.locality || '', age: profile.age || '', background: profile.background || '', otherLanguages: profile.otherLanguages || '', languageName: profile.languageName || '' },
      answers, heritage: [], readBack: true
    };
  }

  /* Returns an array of batches: { text, title, items, errors, pii, ids }. Each batch stays within issue size limits. */
  async function build(queue, profile, now) {
    const pending = queue.filter((q) => q.status === 'queued');
    const batches = [];
    for (let i = 0; i < pending.length; i += PER_ISSUE) {
      const slice = pending.slice(i, i + PER_ISSUE);
      const blocks = slice.map(toBlock), answers = {};
      slice.forEach((q, k) => { answers[blocks[k].id + ':0'] = answerFor(q); });
      const state = stateFor(profile, answers);
      const d = now || new Date();
      const res = await Core.buildSubmission(state, blocks, d, Math.random().toString(36).slice(2, 6));
      const body = res.text;
      const errors = res.errors.slice();
      if (body.length > BODY_MAX) errors.push('This batch is too large for one GitHub issue. Send fewer contributions at a time.');
      batches.push({ text: body, title: '[Dadi] ' + slice.length + ' contribution' + (slice.length === 1 ? '' : 's') + ' · ' + res.id, items: res.items, errors, pii: res.pii, ids: slice.map((q) => q.id), submissionId: res.id });
    }
    return batches;
  }

  /* Issue body: short preface, then the submission block inside a code fence so GitHub does not reformat it. */
  function issueBody(batch, login) {
    return 'Sent from the Dadi learning app' + (login ? ' by @' + login : '') + '. Reviewers: run `scripts/ingest_interview.py` on the block below, or let the optional ingest workflow do it. Nothing here is accepted automatically.\n\n```text\n' + batch.text + '```\n';
  }

  const api = { build, issueBody, toBlock, answerFor, PER_ISSUE, BODY_MAX };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiSubmit = api;
})(typeof self !== 'undefined' ? self : this);
