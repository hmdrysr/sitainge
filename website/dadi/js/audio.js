/* Plays Dadi sounds through the browser's own audio (CC0). Needs a tap first (browser rule), caches rendered sounds,
   and never plays two sounds at once. Uses synth.js for the sound itself. */
(function (root) {
  'use strict';
  const Synth = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./synth.js') : root.DadiSynth;
  const Native = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./native-tts.js') : root.DadiNativeTTS;
  const PITCH = { low: 112, mid: 150, high: 205 };

  function create(opts) {
    opts = opts || {};
    let ctx = null, src = null; const cache = new Map();
    const AC = root.AudioContext || root.webkitAudioContext;
    const supported = !!AC;
    const settings = () => (typeof opts.settings === 'function' ? opts.settings() : {}) || {};

    function ensure() {
      if (!ctx && AC) ctx = new AC();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function render(ipa, o) {
      const s = settings();
      const f0 = PITCH[(o && o.pitch) || s.pitch] || 150, speed = (o && o.speed) || s.speed || 1;
      const key = [ipa, f0, speed, o && o.symbol ? 's' : 'w'].join('|');
      if (cache.has(key)) return cache.get(key);
      const r = (o && o.symbol) ? Synth.previewSymbol(ipa, { f0, speed }) : Synth.synthesize(ipa, { f0, speed });
      cache.set(key, r); if (cache.size > 300) cache.delete(cache.keys().next().value);
      return r;
    }
    function stop() { try { if (Native) Native.stop(); } catch (e) { /* none */ } try { if (src) { src.onended = null; src.stop(); } } catch (e) { /* already stopped */ } src = null; }

    /* Plays and resolves when finished. Resolves { ok:false, reason } instead of throwing. */
    function play(ipa, o) {
      const eng = (settings().engine || 'auto');
      const whole = !(o && o.symbol);
      if (whole && eng !== 'dadi' && Native && Native.available()) {
        stop();
        return Native.speak(ipa, { speed: (o && o.speed) || settings().speed, pitch: (o && o.pitch) || settings().pitch }).then((r) => {
          if (r.ok || eng === 'device') return r.ok ? { ok: true, device: true, approximated: true } : r;
          return playOwn(ipa, o);
        });
      }
      return playOwn(ipa, o);
    }
    function playOwn(ipa, o) {
      return new Promise((resolve) => {
        if (!supported) { resolve({ ok: false, reason: 'This browser cannot play sound from the app.' }); return; }
        const r = render(ipa, o);
        if (!r.samples.length) { resolve({ ok: false, reason: 'Nothing to play.', unsupported: r.unsupported }); return; }
        const c = ensure(); stop();
        const buf = c.createBuffer(1, r.samples.length, r.sampleRate); buf.getChannelData(0).set(r.samples);
        const node = c.createBufferSource(); node.buffer = buf; node.connect(c.destination); src = node;
        node.onended = () => { if (src === node) src = null; resolve({ ok: true, unsupported: r.unsupported, approximated: r.approximated }); };
        node.start();
      });
    }
    const playSymbol = (sym, o) => play(sym, Object.assign({ symbol: true }, o || {}));
    return { play, playSymbol, stop, supported, render, engineInfo: () => ({ device: !!(Native && Native.available()), deviceName: Native && Native.describe() }) };
  }

  const api = { create, PITCH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiAudio = api;
})(typeof self !== 'undefined' ? self : this);
