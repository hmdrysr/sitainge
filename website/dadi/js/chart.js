/* IPA chart (CC0): the consonant and vowel charts built from ipa-data.js. Tap a symbol to hear it and read its name.
   The charts show the whole IPA, not only the sounds used in siṭaiṅga. Nothing here says which sounds the language uses. */
(function (root) {
  'use strict';
  const IPA = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./ipa-data.js') : root.DadiIPA;
  const PLACES = [['lab', 'Bilabial'], ['ldt', 'Labiodental'], ['den', 'Dental'], ['alv', 'Alveolar'], ['pla', 'Postalveolar'], ['ret', 'Retroflex'], ['alp', 'Alveolo-palatal'], ['pal', 'Palatal'], ['vel', 'Velar'], ['uvu', 'Uvular'], ['pha', 'Pharyngeal'], ['glo', 'Glottal'], ['lpa', 'Labial-palatal']];
  const MANNERS = [['stop', 'Stop'], ['nasal', 'Nasal'], ['trill', 'Trill'], ['tap', 'Tap or flap'], ['fric', 'Fricative'], ['latfric', 'Lateral fricative'], ['appr', 'Approximant'], ['lat', 'Lateral approximant']];
  const HEIGHTS = [['close', 'Close'], ['near-close', 'Near-close'], ['close-mid', 'Close-mid'], ['mid', 'Mid'], ['open-mid', 'Open-mid'], ['near-open', 'Near-open'], ['open', 'Open']];
  const BACKS = [['front', 'Front'], ['central', 'Central'], ['back', 'Back']];
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  function vowelCell(n) {
    const t = n.replace(/\(.*?\)/g, '').trim();
    const height = HEIGHTS.map((x) => x[0]).sort((a, b) => b.length - a.length).find((h) => t.startsWith(h + ' ')) || 'mid';
    const back = /near-front|front/.test(t) ? 'front' : /back/.test(t) ? 'back' : 'central';
    return { height, back, rounded: /\brounded\b/.test(t) && !/unrounded/.test(t) };
  }
  function build(api) {
    const wrap = el('div', 'chart'), info = el('div', 'chart-info'); info.setAttribute('aria-live', 'polite'); info.textContent = 'Tap a symbol to hear it.';
    const pick = (sym, name) => { info.textContent = ''; const s = el('b', 'ipa', sym); info.append(s, ' ' + name + (IPA.APPROX[sym] ? ' (played as ' + IPA.APPROX[sym] + ')' : '')); api.play(sym); };
    const sym = (s, name) => { const b = el('button', 'cs', s); b.type = 'button'; b.title = name; b.setAttribute('aria-label', s + ', ' + name); b.addEventListener('click', () => pick(s, name)); return b; };

    /* consonants */
    const cons = Object.entries(IPA.CONSONANTS), usedPlaces = PLACES.filter(([p]) => cons.some(([, c]) => c.p === p));
    const t = el('table', 'ct'); const head = el('tr'); head.append(el('th', null, ''));
    usedPlaces.forEach(([, n]) => head.append(el('th', 'colh', n))); t.append(head);
    MANNERS.forEach(([m, mn]) => {
      const tr = el('tr'); tr.append(el('th', 'rowh', mn));
      usedPlaces.forEach(([p]) => {
        const td = el('td'); const cell = el('div', 'pair');
        cons.filter(([, c]) => c.t === m && c.p === p).sort((a, b) => a[1].v - b[1].v).forEach(([s, c]) => cell.append(sym(s, c.n)));
        td.append(cell); tr.append(td);
      });
      t.append(tr);
    });
    const consWrap = el('div', 'chart-scroll'); consWrap.append(t);

    /* vowels */
    const vt = el('table', 'ct vt'); const vh = el('tr'); vh.append(el('th', null, '')); BACKS.forEach(([, n]) => vh.append(el('th', 'colh', n))); vt.append(vh);
    const vowels = Object.entries(IPA.VOWELS).map(([s, v]) => ({ s, n: v.n, ...vowelCell(v.n) }));
    HEIGHTS.forEach(([h, hn]) => {
      const tr = el('tr'); tr.append(el('th', 'rowh', hn));
      BACKS.forEach(([b]) => { const td = el('td'); const cell = el('div', 'pair'); vowels.filter((v) => v.height === h && v.back === b).sort((a, c) => a.rounded - c.rounded).forEach((v) => cell.append(sym(v.s, v.n))); td.append(cell); tr.append(td); });
      vt.append(tr);
    });
    const vowWrap = el('div', 'chart-scroll'); vowWrap.append(vt);

    /* other symbols and marks */
    const others = el('div', 'pair wrapall'); Object.entries(IPA.NAMES_EXTRA || {}).forEach(([s, n]) => others.append(sym(s, n)));
    const marks = el('div', 'pair wrapall'); IPA.MODIFIERS.forEach(([s, n]) => { const shown = /^[̀-ͯ]$/.test(s) ? '◌' + s : s; marks.append(sym(shown, n)); });

    const sec = (title, note, node) => { const s = el('section', 'chart-sec'); s.append(el('h3', null, title)); if (note) s.append(el('p', 'small muted', note)); s.append(node); return s; };
    wrap.append(info, sec('Consonants', 'Where the sound is made across, how across the rows. Left of a pair is voiceless, right is voiced.', consWrap),
      sec('Vowels', 'Tongue height down the side, front to back across. Left of a pair is unrounded, right is rounded.', vowWrap),
      sec('Other symbols', 'Implosives and rarer sounds. Some are played as the nearest sound that Dadi can make.', others),
      sec('Marks', 'These attach to the sound before them: length, breath, nasal and stress.', marks));
    return wrap;
  }
  const api = { build, vowelCell, PLACES, MANNERS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiChart = api;
})(typeof self !== 'undefined' ? self : this);
