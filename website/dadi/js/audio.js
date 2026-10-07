/* Plays Dadi sounds (CC0). Three ways to make a sound, chosen by the "Word voice" setting:
   - device: the phone's or browser's own text-to-speech, driven by a sound-alike script (native-tts.js). Usually the smoothest.
   - clear: eSpeak NG in WebAssembly (espeak.js), optional download, works offline once cached.
   - dadi: the small synthesizer in synth.js, rendered at the device's own sample rate. Always used for single keyboard symbols.
   Automatic tries them in that order. Needs a tap first (browser rule). Never plays two sounds at once. */
(function (root) {
  'use strict';
  const req = (p) => (typeof require !== 'undefined' && typeof module !== 'undefined') ? require(p) : null;
  const Synth = req('./synth.js') || root.DadiSynth, Native = req('./native-tts.js') || root.DadiNativeTTS, Esp = req('./espeak.js') || root.DadiEspeak;
  const PITCH = { low: 112, mid: 150, high: 205 }, ESP_PITCH = { low: 35, mid: 55, high: 75 };

  function create(opts) {
    opts = opts || {};
    let ctx = null, src = null, token = 0; const cache = new Map();
    const AC = root.AudioContext || root.webkitAudioContext;
    const supported = !!AC;
    const settings = () => (typeof opts.settings === 'function' ? opts.settings() : {}) || {};

    function ensure() { if (!ctx && AC) ctx = new AC(); if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
    const rate = () => (ensure() ? ctx.sampleRate : 44100);
    const remember = (k, v) => { cache.set(k, v); if (cache.size > 120) cache.delete(cache.keys().next().value); return v; };

    function renderOwn(ipa, o, f0, speed) {
      const key = ['own', ipa, f0, speed, o && o.symbol ? 's' : 'w', rate()].join('|');
      if (cache.has(key)) return cache.get(key);
      const r = (o && o.symbol) ? Synth.previewSymbol(ipa, { f0, speed, sr: rate() }) : Synth.synthesize(ipa, { f0, speed, sr: rate() });
      return remember(key, r);
    }
    function stop() {
      token++;
      try { if (Native) Native.stop(); } catch (e) { /* none */ }
      try { if (src) { src.onended = null; src.stop(); } } catch (e) { /* already stopped */ } src = null;
    }
    function playBuffer(samples, sampleRate, my, meta) {
      return new Promise((resolve) => {
        if (my !== token) { resolve({ ok: false, reason: 'Stopped.' }); return; }
        const c = ensure(); const buf = c.createBuffer(1, samples.length, sampleRate); buf.getChannelData(0).set(samples);
        const node = c.createBufferSource(); node.buffer = buf; node.connect(c.destination); src = node;
        node.onended = () => { if (src === node) src = null; resolve(Object.assign({ ok: true }, meta)); };
        node.start();
      });
    }
    async function viaClear(ipa, o) {
      const s = settings(), speed = (o && o.speed) || s.speed || 1, pitch = ESP_PITCH[(o && o.pitch) || s.pitch] || 55;
      const text = Native.toIndic(ipa, 'bn'); if (!text) return null;
      const key = ['clear', text, s.clearVoice, speed, pitch, rate()].join('|');
      if (cache.has(key)) return cache.get(key);
      const r = await Esp.speak(text, { voice: s.clearVoice || 'f3', pitch, speed: 135 * speed, rate: rate() });
      return remember(key, r);
    }

    /* Whole words and sentences. Resolves { ok, how:'device'|'clear'|'dadi', approximated } and never throws. */
    async function play(ipa, o) {
      if (!supported && !(Native && Native.available())) return { ok: false, reason: 'This browser cannot play sound from the app.' };
      stop(); const my = token; const s = settings(), eng = s.engine || 'auto';
      if (o && o.symbol) return playOwnWord(ipa, o, my);
      if ((eng === 'auto' || eng === 'device') && Native && Native.available()) {
        const r = await Native.speak(ipa, { speed: (o && o.speed) || s.speed, pitch: (o && o.pitch) || s.pitch, uri: s.deviceVoice });
        if (r.ok) return { ok: true, how: 'device', approximated: true };
        if (eng === 'device') return r;
      }
      if ((eng === 'auto' || eng === 'clear') && Esp && Esp.canRun() && supported && (eng === 'clear' || s.clearOn)) {
        try { const r = await viaClear(ipa, o); if (r && my === token) { const p = await playBuffer(r.samples, r.sampleRate, my, { how: 'clear', approximated: true }); return p; } }
        catch (e) { if (eng === 'clear') return { ok: false, reason: e.message }; }
      }
      return playOwnWord(ipa, o, my);
    }
    async function playOwnWord(ipa, o, my) {
      if (!supported) return { ok: false, reason: 'This browser cannot play sound from the app.' };
      const s = settings(), f0 = PITCH[(o && o.pitch) || s.pitch] || 150, speed = (o && o.speed) || s.speed || 1;
      const r = renderOwn(ipa, o, f0, speed);
      if (!r.samples.length) return { ok: false, reason: 'Nothing to play.', unsupported: r.unsupported };
      return playBuffer(r.samples, r.sampleRate, my, { how: 'dadi', unsupported: r.unsupported, approximated: r.approximated });
    }
    const playSymbol = (sym, o) => { stop(); return playOwnWord(sym, Object.assign({ symbol: true }, o || {}), token); };
    /* Download the clear voice now (so it works offline later). */
    async function prepareClear() { if (!Esp || !Esp.canRun()) throw new Error('This browser cannot run the clear voice.'); await Esp.speak('অ', { rate: rate() }); return true; }
    return { play, playSymbol, stop, supported, prepareClear,
      engineInfo: () => ({ device: !!(Native && Native.available()), deviceName: Native && Native.describe(), deviceVoices: Native ? Native.list() : [], clear: !!(Esp && Esp.canRun()), clearVoices: Esp ? Esp.VOICES : [] }) };
  }

  const api = { create, PITCH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiAudio = api;
})(typeof self !== 'undefined' ? self : this);
