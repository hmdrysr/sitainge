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
  const DROP = /[.,;:!?"'’‘“”()\[\]\-–—_*]/g;

  function g2p(spelling) {
    const raw = String(spelling == null ? '' : spelling).trim();
    if (!raw) return { ipa: '', complete: false, unknown: [], note: 'empty' };
    /* "ite / iti": read the first alternative only. */
    const first = raw.split(/\s*[\/|]\s*/)[0];
    if (IPA_ONLY.test(first)) return { ipa: first, complete: true, unknown: [], note: 'already IPA' };
    const words = first.toLowerCase().normalize('NFD').replace(DROP, ' ').split(/\s+/).filter(Boolean);
    const unknown = []; const outWords = [];
    for (const w of words) {
      const chars = Array.from(w);
      let out = '';
      for (let i = 0; i < chars.length;) {
        const ch = chars[i];
        if (ch === '̃') { out += '̃'; i++; continue; }
        const two = ch + (chars[i + 1] || '');
        const dg = DIGRAPHS.find((d) => d[0] === two);
        if (dg) {
          out += dg[1]; i += 2;
          if (/j$/.test(dg[1]) && chars[i] === 'y') i++;
          continue;
        }
        if (SINGLE[ch]) {
          let sym = SINGLE[ch];
          if (ch === 'y' && /[aeiou]/.test(out.slice(-1)) === false && out && VOWEL_LETTERS.indexOf(chars[i + 1]) < 0) sym = 'j';
          /* doubled consonant = long consonant */
          if (chars[i + 1] === ch && VOWEL_LETTERS.indexOf(ch) < 0 && ch !== 'x') { out += sym + 'ː'; i += 2; continue; }
          out += sym; i++; continue;
        }
        unknown.push(ch); i++;
      }
      outWords.push(out);
    }
    return { ipa: outWords.join(' '), complete: unknown.length === 0, unknown: Array.from(new Set(unknown)), note: 'machine reading of the spelling; approximate' };
  }

  const api = { g2p, DIGRAPHS, SINGLE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiG2P = api;
})(typeof self !== 'undefined' ? self : this);
