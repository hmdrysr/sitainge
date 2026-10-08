/* Device voice (the phone's or browser's own text-to-speech) for whole words (CC0).
   Device voices read spelling, not IPA, and none of them knows Chittagonian. So Dadi turns the IPA into a sound-alike
   spelling in Bangla script or Devanagari, used ONLY to drive the voice (never shown, never stored). It is an approximation.
   If the device has no Bangla or Hindi voice, callers should fall back to Dadi's own synthesizer. */
(function (root) {
  'use strict';
  const C = { p: 'प', pʰ: 'फ', b: 'ब', bʱ: 'भ', t: 'त', tʰ: 'थ', d: 'द', dʱ: 'ध', ʈ: 'ट', ʈʰ: 'ठ', ɖ: 'ड', ɖʱ: 'ढ', k: 'क', kʰ: 'ख', ɡ: 'ग', g: 'ग', ɡʱ: 'घ',
    tʃ: 'च', tʃʰ: 'छ', dʒ: 'ज', dʒʱ: 'झ', f: 'फ', v: 'व', z: 'ज', s: 'स', ʃ: 'श', ʂ: 'ष', h: 'ह', ɦ: 'ह', m: 'म', n: 'न', ɳ: 'ण', ŋ: 'ङ', ɲ: 'ञ', l: 'ल', ɭ: 'ल',
    r: 'र', ɾ: 'र', ɽ: 'ड़', ɽʱ: 'ढ़', j: 'य', w: 'व', x: 'ख', ɣ: 'ग', ʔ: '', θ: 'थ', ð: 'द', c: 'च', ɟ: 'ज', q: 'क', ʒ: 'ज', ɹ: 'र', ɓ: 'ब', ɗ: 'द' };
  /* vowel: [independent, matra] */
  const V = { a: ['आ', 'ा'], ɑ: ['आ', 'ा'], ə: ['अ', ''], ʌ: ['अ', ''], ɐ: ['अ', ''], ɔ: ['ऑ', 'ॉ'], ɒ: ['ऑ', 'ॉ'], ɛ: ['ऐ', 'ै'], æ: ['ऐ', 'ै'], e: ['ए', 'े'], i: ['इ', 'ि'], ɪ: ['इ', 'ि'],
    u: ['उ', 'ु'], ʊ: ['उ', 'ु'], o: ['ओ', 'ो'], y: ['इ', 'ि'], ø: ['ए', 'े'], ɨ: ['इ', 'ि'], ɯ: ['उ', 'ु'], ɤ: ['ओ', 'ो'], œ: ['ए', 'े'], ɜ: ['अ', ''], ɵ: ['ओ', 'ो'], ʉ: ['उ', 'ु'] };
  const LONG = { a: ['आ', 'ा'], ɑ: ['आ', 'ा'], i: ['ई', 'ी'], u: ['ऊ', 'ू'], e: ['ए', 'े'], o: ['ओ', 'ो'] };
  const VIRAMA = '्', NASAL = 'ँ';

  /* Bangla script is laid out in parallel with Devanagari, 0x80 higher; a few letters need their own value. */
  const BN_OVERRIDE = { 'व': 'ওয়', 'ऑ': 'অ', 'ॉ': '', 'ऐ': 'অ্যা', 'ै': '্যা', 'अ': 'অ', 'आ': 'আ', 'ळ': 'ল', 'ड़': 'ড়', 'ढ़': 'ঢ়' };
  function toBn(s) {
    let o = '';
    for (const ch of Array.from(s)) {
      if (BN_OVERRIDE[ch] !== undefined) { o += BN_OVERRIDE[ch]; continue; }
      const c = ch.codePointAt(0);
      o += (c >= 0x0901 && c <= 0x094D) ? String.fromCodePoint(c + 0x80) : ch;
    }
    return o;
  }

  const CONS = Object.keys(C).sort((a, b) => b.length - a.length);
  function tokens(word) {
    const out = []; let i = 0; const s = word.normalize('NFD').replace(/[ˈˌ.‿ʼ]/g, '');
    while (i < s.length) {
      let hit = null;
      for (const k of CONS) if (s.startsWith(k, i) && (k.length > 1 || true)) { hit = k; break; }
      const ch = s[i];
      if (hit && !(V[ch] && !C[ch])) {
        let len = hit.length; let sym = hit;
        if (s[i + len] === 'ʰ' && C[sym + 'ʰ']) { sym += 'ʰ'; len++; } else if (s[i + len] === 'ʱ' && C[sym + 'ʱ']) { sym += 'ʱ'; len++; } else if (s[i + len] === 'ʰ' || s[i + len] === 'ʱ') len++;
        let geminate = false; if (s[i + len] === 'ː') { geminate = true; len++; }
        out.push({ c: sym, g: geminate }); i += len; continue;
      }
      if (V[ch]) {
        let len = 1, long = false, nasal = false;
        while (i + len < s.length && /[ːˑ̃]/.test(s[i + len])) { if (s[i + len] === 'ː') long = true; if (s[i + len] === '̃') nasal = true; len++; }
        out.push({ v: ch, long, nasal }); i += len; continue;
      }
      i++; /* anything else is skipped */
    }
    return out;
  }

  function toIndic(ipa, script) {
    const words = String(ipa || '').split(/\s+/).filter(Boolean).map((w) => {
      const t = tokens(w); let out = '';
      for (let i = 0; i < t.length; i++) {
        const k = t[i], prevV = i > 0 && t[i - 1].v !== undefined, prevC = i > 0 && t[i - 1].c !== undefined;
        if (k.v !== undefined) {
          const set = (k.long && LONG[k.v]) || V[k.v] || V.a; let g = prevC && !t[i - 1].used ? set[1] : set[0];
          if (prevC) t[i - 1].used = true; out += g + (k.nasal ? NASAL : ''); continue;
        }
        /* a glide straight after a vowel and before a consonant or the end is the second half of a diphthong */
        if (prevV && (k.c === 'j' || k.c === 'w') && !(t[i + 1] && t[i + 1].v !== undefined)) { out += k.c === 'j' ? 'इ' : 'उ'; k.used = true; continue; }
        const nextV = t[i + 1] && t[i + 1].v !== undefined;
        out += C[k.c] || '';
        if (k.g) out += VIRAMA + (C[k.c] || '');
        if (!nextV && C[k.c]) { out += VIRAMA; }
      }
      return out;
    });
    const dev = words.join(' ');
    return script === 'bn' ? toBn(dev) : dev;
  }

  /* ---- voice choice ---- */
  function voices() { try { return root.speechSynthesis ? root.speechSynthesis.getVoices() : []; } catch (e) { return []; } }
  const norm = (v) => (v.lang || '').toLowerCase().replace('_', '-');
  const usable = () => voices().filter((v) => /^(bn|hi)\b/.test(norm(v)) || /^(bn|hi)-/.test(norm(v)));
  const score = (v) => (/natural|neural|premium|enhanced|siri|google|online/i.test(v.name) ? 3 : 0) + (v.localService ? 1 : 0) + (/^bn/.test(norm(v)) ? 2 : 0);
  function list() { return usable().sort((a, b) => score(b) - score(a)).map((v) => ({ uri: v.voiceURI, name: v.name, lang: v.lang })); }
  function pick(prefer, uri) {
    const us = usable().sort((a, b) => score(b) - score(a)); if (!us.length) return null;
    const v = (uri && us.find((x) => x.voiceURI === uri)) || (prefer === 'hi' ? us.find((x) => /^hi/.test(norm(x))) : null) || us[0];
    return { voice: v, script: /^bn/.test(norm(v)) ? 'bn' : 'dev' };
  }
  /* Browsers load their voice list a moment after the page starts (Chrome fires "voiceschanged"). Without waiting, the first
     word would wrongly find no voice and fall back to the synthetic one. Resolves true when at least one suitable voice exists. */
  let readyP = null;
  function ready(ms) {
    if (!root.speechSynthesis) return Promise.resolve(false);
    if (usable().length) return Promise.resolve(true);
    if (!readyP) readyP = new Promise((res) => {
      let done = false; const fin = () => { if (!done) { done = true; try { root.speechSynthesis.removeEventListener('voiceschanged', fin); } catch (e) { /* none */ } res(usable().length > 0); } };
      try { root.speechSynthesis.addEventListener('voiceschanged', fin); } catch (e) { /* none */ }
      try { root.speechSynthesis.getVoices(); } catch (e) { /* none */ }
      setTimeout(fin, ms || 2500);
    }).then((v) => { if (!v) readyP = null; return v; });
    return readyP;
  }
  const supported = () => !!(root.speechSynthesis && root.SpeechSynthesisUtterance);
  function available() { return supported() && !!pick(); }
  function describe() { const p = supported() && pick(); return p ? p.voice.name + ' (' + p.voice.lang + ')' : null; }

  function speak(ipa, o) {
    o = o || {};
    return new Promise((resolve) => {
      const p = supported() && pick(o.prefer, o.uri);
      if (!p) { resolve({ ok: false, reason: 'No matching voice on this device.' }); return; }
      const text = toIndic(ipa, p.script); if (!text) { resolve({ ok: false, reason: 'Nothing to say.' }); return; }
      try {
        root.speechSynthesis.cancel();
        const u = new root.SpeechSynthesisUtterance(text); u.voice = p.voice; u.lang = p.voice.lang; u.rate = Math.max(0.5, Math.min(1.2, (o.speed || 1) * 0.85));
        u.pitch = o.pitch === 'low' ? 0.85 : o.pitch === 'high' ? 1.2 : 1;
        let done = false; const fin = (ok) => { if (!done) { done = true; resolve({ ok, device: true, voice: p.voice.name }); } };
        u.onend = () => fin(true); u.onerror = () => fin(false);
        setTimeout(() => fin(true), 8000);
        root.speechSynthesis.speak(u);
      } catch (e) { resolve({ ok: false, reason: 'The device voice would not start.' }); }
    });
  }
  function stop() { try { if (root.speechSynthesis) root.speechSynthesis.cancel(); } catch (e) { /* nothing */ } }

  const api = { list, toIndic, tokens, available, supported, describe, speak, stop, pick, ready };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiNativeTTS = api;
})(typeof self !== 'undefined' ? self : this);
