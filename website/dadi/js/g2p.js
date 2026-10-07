/* Spelling reader: turns Latin-letter spellings into a DRAFT IPA string by plain rules (CC0).
   IMPORTANT: this is a machine reading of the spelling with the usual sound values of Latin letters. It does not know
   Chittagonian. Its output is always labelled "approximate" and is replaced as soon as a speaker supplies IPA or a
   recording. Anything it does not understand makes the result incomplete; it never guesses at unknown characters. */
(function (root) {
  'use strict';
  const IPA = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./ipa-data.js') : root.DadiIPA;

  /* Longest match first. Revise these in one place; documented in docs/dadi/IPA_AND_AUDIO.md. */
  const DIGRAPHS = [
    ['jh', 'dʒʱ'], ['ch', 'tʃ'], ['sh', 'ʃ'], ['kh', 'kʰ'], ['gh', 'ɡʱ'], ['th', 'tʰ'], ['dh', 'dʱ'], ['ph', 'pʰ'], ['bh', 'bʱ'], ['ng', 'ŋ'],
    ['aa', 'aː'], ['ee', 'eː'], ['ii', 'iː'], ['oo', 'oː'], ['uu', 'uː'],
    ['ai', 'aj'], ['ay', 'aj'], ['oi', 'oj'], ['oy', 'oj'], ['ei', 'ej'], ['ui', 'uj'],
    ['au', 'aw'], ['ou', 'ow'], ['eu', 'ew'], ['aw', 'aw'], ['ow', 'ow']
  ];
  const SINGLE = { a: 'a', b: 'b', c: 'k', d: 'd', e: 'e', f: 'f', g: 'ɡ', h: 'h', i: 'i', j: 'dʒ', k: 'k', l: 'l', m: 'm', n: 'n', o: 'o', p: 'p',
    q: 'k', r: 'ɾ', s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'ks', y: 'j', z: 'z' };
  const VOWEL_LETTERS = 'aeiou';
  const IPA_ONLY = /[ɑɐæɒɶəɛɜɞɔɪʊɨʉɯɤɘɵøœʌʏɚɝɡɣɢɓɗʄɠʛɾɽɹɻʁʀɺʈɖʂʐɕʑçʝʃʒθðχħʕɸβɱɳɲŋɴʙⱱɬɮʋɥʍɰɭʎʟɫʔʰʱ]/;
  const SPECIAL = { 'ṭ': 'ʈ', 'ḍ': 'ɖ', 'ṇ': 'ɳ', 'ṅ': 'ŋ', 'ñ': 'ɲ', 'ś': 'ʃ', 'ṣ': 'ʃ', 'ṛ': 'ɽ', 'ṝ': 'ɽ', 'ā': 'aː', 'ī': 'iː', 'ū': 'uː', 'ē': 'eː', 'ō': 'oː', 'ṁ': '̃', 'ṃ': '̃', 'ḥ': 'h', 'ɛ': 'ɛ', 'ɔ': 'ɔ' };
  const DROP = /[.,;:!?"'’‘“”()\[\]\-–—_*]/g;

  function g2p(spelling) {
    const raw = String(spelling == null ? '' : spelling).trim();
    if (!raw) return { ipa: '', complete: false, unknown: [], note: 'empty' };
    /* "ite / iti": read the first alternative only. */
    const first = raw.split(/\s*[\/|]\s*/)[0];
    if (IPA_ONLY.test(first)) return { ipa: first, complete: true, unknown: [], note: 'already IPA' };
    const words = first.toLowerCase().replace(DROP, ' ').split(/\s+/).filter(Boolean);
    const unknown = []; const outWords = []; let marks = false;
    for (const w of words) {
      /* Units: plain letters, letters with a dot-below or macron (siṭaiṅga style) and letters with marks the spelling does not explain (ä, é, ô). */
      const units = [];
      for (const c of Array.from(w.normalize('NFC'))) {
        if (SPECIAL[c]) { units.push({ sp: SPECIAL[c] }); continue; }
        const d = c.normalize('NFD');
        if (d.length > 1) {
          units.push(d.slice(1).replace(/̃/g, '') ? { b: d[0] } : d[0]);
          if (d.slice(1).indexOf('̃') >= 0) units.push('̃');
          if (d.slice(1).replace(/̃/g, '')) marks = true;
        } else units.push(c);
      }
      let out = '';
      for (let i = 0; i < units.length;) {
        let u = units[i], marked = false;
        if (u && u.b) { u = u.b; marked = true; }
        if (u && u.sp) { out += u.sp; i++; if (/[ʈɖ]$/.test(u.sp) && units[i] === 'h') { out += 'ʰ'; i++; } continue; }
        if (u === '̃') { out += '̃'; i++; continue; }
        if (/[0-9]/.test(u)) { i++; continue; }
        const two = marked ? '' : u + (typeof units[i + 1] === 'string' ? units[i + 1] : '');
        const dg = DIGRAPHS.find((d) => d[0] === two);
        if (dg) {
          out += dg[1]; i += 2;
          if (/j$/.test(dg[1]) && units[i] === 'y') i++;
          continue;
        }
        if (SINGLE[u]) {
          let sym = SINGLE[u];
          if (u === 'y' && /[aeiou]/.test(out.slice(-1)) === false && out && VOWEL_LETTERS.indexOf(units[i + 1]) < 0) sym = 'j';
          if (units[i + 1] === u && VOWEL_LETTERS.indexOf(u) < 0 && u !== 'x') { out += sym + 'ː'; i += 2; continue; }
          out += sym; i++; continue;
        }
        if (IPA_ONLY.test(u)) { out += u; i++; continue; }
        unknown.push(u); i++;
      }
      outWords.push(out);
    }
    return { ipa: outWords.join(' '), complete: unknown.length === 0, unknown: Array.from(new Set(unknown)), note: marks ? 'machine reading; accent marks and dots on some letters were ignored; approximate' : 'machine reading of the spelling; approximate' };
  }

  const api = { g2p, DIGRAPHS, SINGLE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiG2P = api;
})(typeof self !== 'undefined' ? self : this);
