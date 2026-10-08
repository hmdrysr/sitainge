/* Plays real recordings of speakers (CC0 code). There is no text-to-speech and no synthesized voice.
   An entry is playable only when it names a recording that is public: entry.recording is an https address, or a path inside the
   repository (for example audio/public/CTG-REC-00001.mp3). Audio itself is kept out of Git by default (schemas/recording.schema.json),
   so a recording normally lives at a hosted address. has(entry) is false until one exists, and the interface then shows no sound button. */
(function (root) {
  'use strict';
  const EXT = /\.(mp3|wav|ogg|oga|opus|m4a|aac|flac|webm)(\?.*)?$/i;
  function create(opts) {
    opts = opts || {};
    const cfg = opts.config || (root.DADI_CONFIG || {});
    let el = null;
    const supported = typeof root.Audio === 'function';
    function url(e) {
      const r = e && e.recording; if (!r || typeof r !== 'string') return null;
      if (e.consent && e.consent !== 'public') return null;
      if (/^https:\/\//i.test(r)) return r;
      if (/^[a-z]+:/i.test(r) || r.indexOf('..') >= 0 || !EXT.test(r)) return null;
      return 'https://raw.githubusercontent.com/' + (cfg.repo || 'hmdrysr/sitainge') + '/' + (cfg.branch || 'main') + '/' + r.replace(/^\/+/, '');
    }
    const has = (e) => supported && !!url(e);
    function stop() { try { if (el) { el.pause(); el.onended = null; } } catch (x) { /* none */ } el = null; }
    function play(e, o) {
      const u = url(e); if (!supported || !u) return Promise.resolve({ ok: false, reason: 'No recording is available.' });
      stop();
      return new Promise((resolve) => {
        const a = new root.Audio(u); el = a; a.preload = 'auto'; a.playbackRate = (o && o.speed) || 1;
        a.onended = () => resolve({ ok: true }); a.onerror = () => { if (el === a) el = null; resolve({ ok: false, reason: 'The recording could not be played.' }); };
        const p = a.play(); if (p && p.catch) p.catch(() => resolve({ ok: false, reason: 'The recording could not be played.' }));
      });
    }
    return { has, url, play, stop, supported };
  }
  const api = { create, EXT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiAudio = api;
})(typeof self !== 'undefined' ? self : this);
