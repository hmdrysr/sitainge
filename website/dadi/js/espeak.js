/* Optional clear offline voice: eSpeak NG (GPL-3.0-or-later, see vendor/espeak-ng/NOTICE.md) run in WebAssembly (CC0 wrapper).
   Reads a sound-alike script made by native-tts.js. Loaded only on demand; if the files are missing or the browser cannot run WebAssembly,
   speak() rejects and the caller falls back. Every call makes a short-lived instance (about 0.15 s). */
(function (root) {
  'use strict';
  const VOICES = [['f3', 'Clear voice, higher'], ['f2', 'Clear voice, warm'], ['f5', 'Clear voice, soft'], ['m3', 'Clear voice, lower'], ['m2', 'Clear voice, steady'], ['m7', 'Clear voice, deep']];
  let factory = null, failed = false;
  const canRun = () => typeof WebAssembly === 'object' && typeof root.document !== 'undefined';

  async function load() {
    if (failed) throw new Error('The clear voice is not available.');
    if (factory) return factory;
    try { const mod = await import('../vendor/espeak-ng/espeak-ng.js'); factory = mod.default; return factory; }
    catch (e) { failed = true; throw new Error('The clear voice could not be loaded.'); }
  }
  /* Smooth upsampling (Catmull-Rom) so the browser never has to resample a low-rate buffer. */
  function resample(x, from, to) {
    if (from === to) return x;
    const n = Math.floor(x.length * to / from), out = new Float32Array(n), k = from / to;
    for (let i = 0; i < n; i++) {
      const p = i * k, i1 = Math.floor(p), t = p - i1, a = x[Math.max(0, i1 - 1)], b = x[i1] || 0, c = x[Math.min(x.length - 1, i1 + 1)], d = x[Math.min(x.length - 1, i1 + 2)];
      out[i] = b + 0.5 * t * (c - a + t * (2 * a - 5 * b + 4 * c - d + t * (3 * (b - c) + d - a)));
    }
    return out;
  }
  function wavToFloat(u8) {
    const v = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); const rate = v.getUint32(24, true);
    let off = 12; while (off < u8.length - 8 && String.fromCharCode(u8[off], u8[off + 1], u8[off + 2], u8[off + 3]) !== 'data') off += 8 + v.getUint32(off + 4, true);
    const len = Math.min(v.getUint32(off + 4, true), u8.length - off - 8) >> 1, f = new Float32Array(len);
    for (let i = 0; i < len; i++) f[i] = v.getInt16(off + 8 + i * 2, true) / 32768;
    return { samples: f, rate };
  }
  /* o: { voice:'f3', pitch:0-99, speed:wpm, rate: target sample rate } */
  async function speak(text, o) {
    o = o || {};
    if (!canRun()) throw new Error('This browser cannot run the clear voice.');
    const M = await load();
    const args = ['-v', 'bn+' + (VOICES.some((v) => v[0] === o.voice) ? o.voice : 'f3'), '-p', String(Math.round(o.pitch == null ? 55 : o.pitch)), '-s', String(Math.round(o.speed || 135)), '-g', '4', '-w', 'o.wav', text];
    const m = await M({ arguments: args, print() {}, printErr() {} });
    const w = wavToFloat(m.FS.readFile('o.wav'));
    let s = w.samples, pk = 0; for (let i = 0; i < s.length; i++) pk = Math.max(pk, Math.abs(s[i]));
    if (pk > 0) { const g = 0.8 / pk; for (let i = 0; i < s.length; i++) s[i] *= g; }
    const rate = o.rate || w.rate;
    return { samples: resample(s, w.rate, rate), sampleRate: rate };
  }
  const api = { speak, VOICES, resample, canRun, reset() { failed = false; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiEspeak = api;
})(typeof self !== 'undefined' ? self : this);
