/* Pure functions: building, checking and fingerprinting a submission. No network, no storage. */
(function (root) {
  'use strict';
  const LIMITS = { field: 3000, items: 500 };
  const Y = (s) => JSON.stringify(String(s == null ? '' : s)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const clean = (s) => String(s == null ? '' : s).replace(/\r\n?/g, '\n').trim();   // verbatim apart from edge whitespace

  async function sha256hex(text) {
    const c = root.crypto || (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
    const subtle = (c && c.subtle) || null;
    if (!subtle) return '';
    const data = typeof text === 'string' ? new TextEncoder().encode(text) : text;
    const buf = await subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function itemFrom(base, a, n, aud) {
    let status = a.status; const resp = clean(a.response);
    if (!status && resp) status = 'used';
    if (!status) return null;
    let comment = clean(a.comment);
    if (status !== 'used' && resp) comment = (comment ? comment + ' | ' : '') + 'also typed: ' + resp;
    const o = {
      n, type: base.type, prompt_english: base.prompt, context_given: base.ctx || '',
      response_as_given: status === 'used' ? resp : '',
      variants_given: (a.variants || []).map(clean).filter(Boolean),
      pronunciation_note: clean(a.pron), usage_note: clean(a.usage), status,
      speaker_confidence: status === 'used' ? (a.conf || '') : '', speaker_comment: comment
    };
    if (aud && status === 'used') {
      o.audio_file = 'audio/item-' + String(n).padStart(4, '0') + '.' + aud.ext;
      o.audio_sha256 = aud.sha; o.audio_ms = aud.ms; o.audio_mime = aud.mime;
    }
    return o;
  }

  function buildItems(state, blocks, audio) {
    const items = [], keys = []; let n = 0; audio = audio || {};
    for (const b of blocks) b.items.forEach((it, i) => {
      const a = state.answers[b.id + ':' + i]; if (!a) return;
      const k = b.id + ':' + i;
      const o = itemFrom({ type: b.kind, prompt: it.en, ctx: it.ctx }, a, n + 1, audio[k]);
      if (o) { n++; items.push(o); keys.push(k); }
    });
    for (const h of state.heritage || []) {
      const original = clean(h.original); if (!original) continue;
      const label = (root.SitaingeItems ? root.SitaingeItems.HERITAGE_TYPES : []).find((t) => t[0] === h.type);
      const parts = [];
      if (clean(h.literal)) parts.push('literal meaning: ' + clean(h.literal));
      if (clean(h.meaning)) parts.push('actual meaning: ' + clean(h.meaning));
      n++;
      items.push({ n, type: h.type || 'other', prompt_english: 'Shared by speaker (' + (label ? label[1] : 'heritage item') + ')',
        context_given: clean(h.context), response_as_given: original, variants_given: [], pronunciation_note: '', usage_note: '',
        status: 'used', speaker_confidence: h.conf || '', speaker_comment: parts.join('; ') });
      keys.push('heritage');
    }
    Object.defineProperty(items, '_keys', { value: keys });
    return items;
  }

  function validate(state, items) {
    const e = [], c = state.consent || {};
    if (!c.adult) e.push('Confirm that you are 18 or older, or that a parent or guardian is helping.');
    if (!c.cc0) e.push('Confirm the public-domain (CC0) statement.');
    if (!c.publish) e.push('Choose what should happen to the contribution.');
    if (!c.credit) e.push('Choose how you want to be credited.');
    if (!c.audio) e.push('Choose what to do about voice recordings.');
    if (c.audio === 'public' && c.publish !== 'yes') e.push('Recordings cannot be published while the text is set to "Discuss with me first". Change one of the two choices.');
    if (c.audio === 'none' && items.some((it) => it.audio_file)) e.push('Recordings exist, but you chose no recordings.');
    if (c.credit === 'name' && !clean(c.creditName)) e.push('You chose to be credited by name. Enter the name to show.');
    if (!items.length) e.push('There is nothing to export yet.');
    if (items.length > LIMITS.items) e.push('This submission has too many items (limit ' + LIMITS.items + '). Export now and start a second submission.');
    items.forEach((it) => {
      if (it.status === 'used' && !it.response_as_given) e.push('Item ' + it.n + ' (' + it.prompt_english + '): marked as answered but empty.');
      ['response_as_given', 'speaker_comment', 'usage_note', 'pronunciation_note', 'context_given'].forEach((k) => {
        if (it[k].length > LIMITS.field) e.push('Item ' + it.n + ': "' + k + '" is longer than ' + LIMITS.field + ' characters.');
      });
    });
    return e;
  }

  const PII = [['email address', /[^\s@]+@[^\s@]+\.[^\s@]+/], ['phone or ID number', /\+?\d[\d\s\-().]{7,}\d/], ['web link', /https?:\/\/|www\./i]];
  function scanPII(state, items) {
    const hits = [];
    const look = (where, text) => PII.forEach(([kind, re]) => { if (re.test(text)) hits.push({ where, kind }); });
    items.forEach((it) => ['response_as_given', 'pronunciation_note', 'usage_note', 'speaker_comment', 'context_given']
      .forEach((k) => look('Item ' + it.n, it[k])));
    items.forEach((it) => it.variants_given.forEach((v) => look('Item ' + it.n, v)));
    const s = state.speaker || {};
    ['locality', 'background', 'otherLanguages', 'languageName'].forEach((k) => look('About you', clean(s[k])));
    return hits;
  }

  async function buildSubmission(state, blocks, now, rand, audio) {
    const items = buildItems(state, blocks, audio);
    const errors = validate(state, items);
    const pad = (x) => String(x).padStart(2, '0');
    const d = now || new Date();
    const date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const id = state.interviewId || ('SIT-INT-' + date.replace(/-/g, '') + '-' + (rand || Math.random().toString(36).slice(2, 6)).toUpperCase());
    const sha = await sha256hex(JSON.stringify(items));
    const c = state.consent || {}, s = state.speaker || {};
    const L = [];
    L.push('=== SITAINGE SUBMISSION START ===');
    L.push('sitainge_interview_version: 1', 'capture_method: "web_form"', 'interview_id: ' + Y(id), 'date: ' + Y(date),
      'chatbot: "sitainge web contribution page v1"', 'language_of_interview: "English"', 'consent:',
      '  publish_cc0: ' + Y(c.publish === 'yes' ? 'yes' : 'no'),
      '  adult_or_guardian_present: ' + Y(c.adult ? 'yes' : 'no'),
      '  credit: ' + Y(c.credit || 'anonymous'),
      '  credit_name: ' + Y(c.credit === 'name' ? clean(c.creditName) : ''),
      '  audio_consent: ' + Y(c.audio || 'none'),
      'speaker:', '  locality_as_given: ' + Y(clean(s.locality)), '  age_group: ' + Y(s.age || ''),
      '  background_note: ' + Y(clean(s.background)), '  other_languages: ' + Y(clean(s.otherLanguages)),
      '  name_for_language_as_given: ' + Y(clean(s.languageName)), 'items:');
    items.forEach((it) => {
      L.push('  - n: ' + it.n, '    type: ' + Y(it.type), '    prompt_english: ' + Y(it.prompt_english),
        '    context_given: ' + Y(it.context_given), '    response_as_given: ' + Y(it.response_as_given),
        '    variants_given: [' + it.variants_given.map(Y).join(', ') + ']',
        '    pronunciation_note: ' + Y(it.pronunciation_note), '    usage_note: ' + Y(it.usage_note),
        '    status: ' + Y(it.status), '    speaker_confidence: ' + Y(it.speaker_confidence),
        '    speaker_comment: ' + Y(it.speaker_comment));
      if (it.audio_file) L.push('    audio_file: ' + Y(it.audio_file), '    audio_sha256: ' + Y(it.audio_sha256), '    audio_ms: ' + it.audio_ms, '    audio_mime: ' + Y(it.audio_mime));
    });
    L.push('review:', '  read_back_confirmed: ' + Y(state.readBack ? 'yes' : 'no'), '  item_count: ' + items.length,
      '  items_sha256: ' + Y(sha), '=== SITAINGE SUBMISSION END ===');
    const audioList = items.map((it, i) => (it.audio_file ? { name: it.audio_file, key: items._keys[i] } : null)).filter(Boolean);
    return { text: L.join('\n') + '\n', items, errors, id, sha, pii: scanPII(state, items), audioList };
  }

  const api = { LIMITS, clean, buildItems, validate, scanPII, buildSubmission, sha256hex };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SitaingeCore = api;
})(typeof self !== 'undefined' ? self : this);
