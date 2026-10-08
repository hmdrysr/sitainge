/* IPA symbol data for Dadi. Written for this project (symbols and their standard names are facts, not copied layouts).
   Used by the on-screen keyboard and the IPA chart (keyboard.js). CC0. */
(function (root) {
  'use strict';

  /* Vowels: approximate first three formants in Hz for a mid-pitched adult voice, rounded from commonly published
     averages. They are close enough to hear the quality; they are NOT measurements of Chittagonian speech. */
  const VOWELS = {
    'i': { f: [280, 2250, 2900], n: 'close front unrounded' },
    'y': { f: [280, 1900, 2200], n: 'close front rounded' },
    'ɨ': { f: [320, 1700, 2400], n: 'close central unrounded' },
    'ʉ': { f: [320, 1450, 2150], n: 'close central rounded' },
    'ɯ': { f: [320, 1250, 2300], n: 'close back unrounded' },
    'u': { f: [300, 800, 2200], n: 'close back rounded' },
    'ɪ': { f: [400, 1950, 2550], n: 'near-close near-front unrounded' },
    'ʏ': { f: [400, 1600, 2200], n: 'near-close near-front rounded' },
    'ʊ': { f: [420, 1000, 2300], n: 'near-close near-back rounded' },
    'e': { f: [400, 2150, 2750], n: 'close-mid front unrounded' },
    'ø': { f: [400, 1650, 2200], n: 'close-mid front rounded' },
    'ɘ': { f: [420, 1750, 2450], n: 'close-mid central unrounded' },
    'ɵ': { f: [420, 1350, 2200], n: 'close-mid central rounded' },
    'ɤ': { f: [450, 1200, 2300], n: 'close-mid back unrounded' },
    'o': { f: [420, 800, 2300], n: 'close-mid back rounded' },
    'ə': { f: [500, 1500, 2500], n: 'mid central (schwa)' },
    'ɛ': { f: [550, 1850, 2550], n: 'open-mid front unrounded' },
    'œ': { f: [550, 1500, 2300], n: 'open-mid front rounded' },
    'ɜ': { f: [560, 1500, 2450], n: 'open-mid central unrounded' },
    'ɞ': { f: [560, 1300, 2300], n: 'open-mid central rounded' },
    'ʌ': { f: [650, 1200, 2500], n: 'open-mid back unrounded' },
    'ɔ': { f: [570, 880, 2400], n: 'open-mid back rounded' },
    'æ': { f: [700, 1700, 2450], n: 'near-open front unrounded' },
    'ɐ': { f: [700, 1350, 2500], n: 'near-open central' },
    'a': { f: [800, 1450, 2500], n: 'open front unrounded' },
    'ɶ': { f: [780, 1350, 2300], n: 'open front rounded' },
    'ɑ': { f: [760, 1100, 2450], n: 'open back unrounded' },
    'ɒ': { f: [700, 900, 2400], n: 'open back rounded' },
    'ɚ': { f: [500, 1350, 1700], n: 'r-coloured schwa' },
    'ɝ': { f: [520, 1350, 1650], n: 'r-coloured open-mid central' }
  };

  /* Consonants: t = manner, p = place, v = voiced (1) or not (0). */
  const C = (t, p, v, n) => ({ t, p, v, n });
  const CONSONANTS = {
    'p': C('stop', 'lab', 0, 'voiceless bilabial stop'), 'b': C('stop', 'lab', 1, 'voiced bilabial stop'),
    't': C('stop', 'alv', 0, 'voiceless alveolar stop'), 'd': C('stop', 'alv', 1, 'voiced alveolar stop'),
    'ʈ': C('stop', 'ret', 0, 'voiceless retroflex stop'), 'ɖ': C('stop', 'ret', 1, 'voiced retroflex stop'),
    'c': C('stop', 'pal', 0, 'voiceless palatal stop'), 'ɟ': C('stop', 'pal', 1, 'voiced palatal stop'),
    'k': C('stop', 'vel', 0, 'voiceless velar stop'), 'ɡ': C('stop', 'vel', 1, 'voiced velar stop'),
    'q': C('stop', 'uvu', 0, 'voiceless uvular stop'), 'ɢ': C('stop', 'uvu', 1, 'voiced uvular stop'),
    'ʔ': C('stop', 'glo', 0, 'glottal stop'),
    'm': C('nasal', 'lab', 1, 'bilabial nasal'), 'ɱ': C('nasal', 'ldt', 1, 'labiodental nasal'),
    'n': C('nasal', 'alv', 1, 'alveolar nasal'), 'ɳ': C('nasal', 'ret', 1, 'retroflex nasal'),
    'ɲ': C('nasal', 'pal', 1, 'palatal nasal'), 'ŋ': C('nasal', 'vel', 1, 'velar nasal'), 'ɴ': C('nasal', 'uvu', 1, 'uvular nasal'),
    'ʙ': C('trill', 'lab', 1, 'bilabial trill'), 'r': C('trill', 'alv', 1, 'alveolar trill'), 'ʀ': C('trill', 'uvu', 1, 'uvular trill'),
    'ⱱ': C('tap', 'ldt', 1, 'labiodental flap'), 'ɾ': C('tap', 'alv', 1, 'alveolar tap'), 'ɽ': C('tap', 'ret', 1, 'retroflex flap'),
    'ɸ': C('fric', 'lab', 0, 'voiceless bilabial fricative'), 'β': C('fric', 'lab', 1, 'voiced bilabial fricative'),
    'f': C('fric', 'ldt', 0, 'voiceless labiodental fricative'), 'v': C('fric', 'ldt', 1, 'voiced labiodental fricative'),
    'θ': C('fric', 'den', 0, 'voiceless dental fricative'), 'ð': C('fric', 'den', 1, 'voiced dental fricative'),
    's': C('fric', 'alv', 0, 'voiceless alveolar fricative'), 'z': C('fric', 'alv', 1, 'voiced alveolar fricative'),
    'ʃ': C('fric', 'pla', 0, 'voiceless postalveolar fricative'), 'ʒ': C('fric', 'pla', 1, 'voiced postalveolar fricative'),
    'ʂ': C('fric', 'ret', 0, 'voiceless retroflex fricative'), 'ʐ': C('fric', 'ret', 1, 'voiced retroflex fricative'),
    'ɕ': C('fric', 'alp', 0, 'voiceless alveolo-palatal fricative'), 'ʑ': C('fric', 'alp', 1, 'voiced alveolo-palatal fricative'),
    'ç': C('fric', 'pal', 0, 'voiceless palatal fricative'), 'ʝ': C('fric', 'pal', 1, 'voiced palatal fricative'),
    'x': C('fric', 'vel', 0, 'voiceless velar fricative'), 'ɣ': C('fric', 'vel', 1, 'voiced velar fricative'),
    'χ': C('fric', 'uvu', 0, 'voiceless uvular fricative'), 'ʁ': C('fric', 'uvu', 1, 'voiced uvular fricative'),
    'ħ': C('fric', 'pha', 0, 'voiceless pharyngeal fricative'), 'ʕ': C('fric', 'pha', 1, 'voiced pharyngeal fricative'),
    'h': C('fric', 'glo', 0, 'voiceless glottal fricative'), 'ɦ': C('fric', 'glo', 1, 'voiced glottal fricative'),
    'ɬ': C('latfric', 'alv', 0, 'voiceless alveolar lateral fricative'), 'ɮ': C('latfric', 'alv', 1, 'voiced alveolar lateral fricative'),
    'ʋ': C('appr', 'ldt', 1, 'labiodental approximant'), 'ɹ': C('appr', 'alv', 1, 'alveolar approximant'),
    'ɻ': C('appr', 'ret', 1, 'retroflex approximant'), 'j': C('appr', 'pal', 1, 'palatal approximant'),
    'ɰ': C('appr', 'vel', 1, 'velar approximant'), 'w': C('appr', 'lab', 1, 'labial-velar approximant'),
    'ɥ': C('appr', 'lpa', 1, 'labial-palatal approximant'), 'ʍ': C('appr', 'lab', 0, 'voiceless labial-velar fricative'),
    'l': C('lat', 'alv', 1, 'alveolar lateral approximant'), 'ɭ': C('lat', 'ret', 1, 'retroflex lateral approximant'),
    'ʎ': C('lat', 'pal', 1, 'palatal lateral approximant'), 'ʟ': C('lat', 'vel', 1, 'velar lateral approximant'),
    'ɫ': C('lat', 'vel', 1, 'velarized alveolar lateral')
  };

  /* Symbols with no separate model: they are played as the nearest modelled sound, and the page says so. */
  const APPROX = { 'ɓ': 'b', 'ɗ': 'd', 'ʄ': 'ɟ', 'ɠ': 'ɡ', 'ʛ': 'ɢ', 'ɺ': 'ɾ', 'ʜ': 'ħ', 'ʢ': 'ʕ', 'ʡ': 'ʔ', 'ɧ': 'ʃ', 'g': 'ɡ' };
  const NAMES_EXTRA = { 'ɓ': 'voiced bilabial implosive', 'ɗ': 'voiced alveolar implosive', 'ʄ': 'voiced palatal implosive', 'ɠ': 'voiced velar implosive',
    'ʛ': 'voiced uvular implosive', 'ɺ': 'alveolar lateral flap', 'ʜ': 'voiceless epiglottal fricative', 'ʢ': 'voiced epiglottal fricative',
    'ʡ': 'epiglottal stop', 'ɧ': 'sj-sound (simultaneous postalveolar and velar fricative)' };

  /* Marks that attach to the symbol before them (written as combining characters or modifier letters). */
  const MODIFIERS = [
    ['ː', 'long'], ['ˑ', 'half-long'], ['ʰ', 'aspirated (breath after the sound)'], ['ʱ', 'breathy-voiced'],
    ['̃', 'nasalized'], ['̤', 'breathy voice'], ['̥', 'voiceless'], ['ʲ', 'palatalized'], ['ʷ', 'rounded (labialized)'],
    ['̩', 'syllabic'], ['̯', 'non-syllabic'], ['̪', 'dental'], ['ˈ', 'primary stress (before the syllable)'],
    ['ˌ', 'secondary stress (before the syllable)'], ['.', 'syllable break'], ['͡', 'tie bar (joins two sounds into one)']
  ];

  /* On-screen keyboard: every QWERTY letter is a key; its "family" holds the related IPA symbols. */
  const FAMILIES = {
    a: ['a', 'ɑ', 'ɐ', 'æ', 'ɒ', 'ɶ'], b: ['b', 'β', 'ʙ', 'ɓ'], c: ['c', 'ç', 'ɕ'], d: ['d', 'ɖ', 'ð', 'ɗ'],
    e: ['e', 'ɛ', 'ə', 'ɘ', 'ɜ', 'ɞ', 'ɤ', 'ɚ', 'ɝ'], f: ['f', 'ɸ'], g: ['ɡ', 'ɣ', 'ɢ', 'ɠ'], h: ['h', 'ɦ', 'ħ', 'ɧ', 'ʜ'],
    i: ['i', 'ɪ', 'ɨ'], j: ['j', 'ʝ', 'ɟ', 'ʄ'], k: ['k', 'q', 'x', 'χ'], l: ['l', 'ɭ', 'ɫ', 'ʎ', 'ʟ', 'ɬ', 'ɮ'],
    m: ['m', 'ɱ'], n: ['n', 'ɳ', 'ɲ', 'ŋ', 'ɴ'], o: ['o', 'ɔ', 'ø', 'œ', 'ɵ', 'ɞ', 'ɒ'], p: ['p', 'ɸ'],
    q: ['q', 'ɢ', 'ʔ'], r: ['r', 'ɾ', 'ɽ', 'ɹ', 'ɻ', 'ʁ', 'ʀ', 'ɺ'], s: ['s', 'ʃ', 'ʂ', 'ɕ', 'z', 'ʒ', 'ʐ', 'ʑ'],
    t: ['t', 'ʈ', 'θ'], u: ['u', 'ʊ', 'ʉ', 'ɯ', 'y', 'ʏ'], v: ['v', 'ʋ', 'β', 'ⱱ'], w: ['w', 'ʍ', 'ɥ', 'ɰ'],
    x: ['x', 'χ', 'ɣ'], y: ['y', 'ʏ', 'j', 'ɥ'], z: ['z', 'ʒ', 'ʐ', 'ʑ']
  };
  const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

  function describe(sym) {
    const s = String(sym || '');
    if (VOWELS[s]) return VOWELS[s].n;
    if (CONSONANTS[s]) return CONSONANTS[s].n;
    if (NAMES_EXTRA[s]) return NAMES_EXTRA[s];
    const m = MODIFIERS.find((x) => x[0] === s);
    return m ? m[1] : '';
  }

  /* Family of the symbol, for the "try nearby sounds" row. Returns [] when unknown. */
  function nearby(sym) {
    const base = String(sym || '').normalize('NFD')[0];
    for (const k of Object.keys(FAMILIES)) if (FAMILIES[k].includes(base)) return FAMILIES[k];
    const lower = base.toLowerCase();
    return FAMILIES[lower] || [];
  }

  const api = { VOWELS, CONSONANTS, APPROX, MODIFIERS, FAMILIES, ROWS, describe, nearby };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiIPA = api;
})(typeof self !== 'undefined' ? self : this);
