/* Dadi IPA keyboard (CC0): a QWERTY layout where each letter opens the family of related IPA symbols.
   Every tap is heard. Built for a native speaker who does not know IPA: type by ear, hear the whole word, swap a
   sound for its neighbours until it matches what they say. Plain DOM, no dependencies. */
(function (root) {
  'use strict';
  const IPA = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./ipa-data.js') : root.DadiIPA;

  const MODS = [['ː', 'long'], ['ʰ', 'aspirated'], ['ʱ', 'breathy'], ['̃', 'nasal'], ['ˈ', 'stress'], ['.', 'break'], ['ʲ', 'palatal'], ['ʷ', 'rounded']];
  const DOTTED = '◌';
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const shown = (sym) => (/^[̀-ͯ]$/.test(sym) ? DOTTED + sym : sym);

  /* Last written sound: one base character plus anything that attaches to it. */
  function lastGrapheme(str, pos) {
    const chars = Array.from(str.slice(0, pos));
    let i = chars.length - 1;
    while (i > 0 && /[̀-ͯʰ-˿ː͜͡]/.test(chars[i])) i--;
    return { text: chars.slice(i).join(''), start: chars.slice(0, i).join('').length };
  }

  /* api: { audio, getSpelling(): string, onChange() } ; mount(container, field) shows the keyboard for one text field. */
  function create(api) {
    let field = null, root_ = null, familyBox, info, nearBox, lastTap = '';
    const insertAt = (text) => {
      const s = field.selectionStart == null ? field.value.length : field.selectionStart, e = field.selectionEnd == null ? s : field.selectionEnd;
      field.value = field.value.slice(0, s) + text + field.value.slice(e);
      const p = s + text.length; field.setSelectionRange(p, p); changed();
    };
    const back = () => {
      const s = field.selectionStart == null ? field.value.length : field.selectionStart, e = field.selectionEnd == null ? s : field.selectionEnd;
      if (e > s) { field.value = field.value.slice(0, s) + field.value.slice(e); field.setSelectionRange(s, s); }
      else if (s > 0) { const g = Array.from(field.value.slice(0, s)); g.pop(); const keep = g.join(''); field.value = keep + field.value.slice(s); field.setSelectionRange(keep.length, keep.length); }
      changed(); refreshNear();
    };
    function changed() { field.dispatchEvent(new Event('input', { bubbles: true })); if (api.onChange) api.onChange(field.value); }
    function describe(sym) { const d = IPA.describe(String(sym).normalize('NFD')[0]) || IPA.describe(sym); info.textContent = d ? (shown(sym) + '  ' + d) : ''; }

    function tapSymbol(sym, opts) {
      insertAt(sym); lastTap = sym; describe(sym);
      if (!/^[̀-ͯʰ-˿.ˈˌ]$/.test(sym)) api.audio.playSymbol(sym);
      if (!opts || opts.family !== false) showFamily(sym);
      refreshNear();
    }
    function showFamily(sym) {
      const fam = IPA.FAMILIES[String(sym).toLowerCase()] || IPA.nearby(sym);
      familyBox.textContent = '';
      if (!fam.length) { familyBox.hidden = true; return; }
      familyBox.hidden = false;
      fam.forEach((s) => {
        const b = el('button', 'kf', s); b.type = 'button'; b.title = IPA.describe(s); b.setAttribute('aria-label', s + ' ' + IPA.describe(s));
        b.addEventListener('click', () => { tapSymbol(s, { family: false }); });
        familyBox.appendChild(b);
      });
    }
    /* "Try nearby sounds": replace the sound just before the cursor with a neighbour and hear the whole word. */
    function refreshNear() {
      nearBox.textContent = '';
      const pos = field.selectionStart == null ? field.value.length : field.selectionStart;
      const g = lastGrapheme(field.value, pos);
      const base = g.text.normalize('NFD')[0];
      const fam = IPA.nearby(base).filter((s) => s !== base);
      if (!g.text || !fam.length) { nearBox.hidden = true; return; }
      nearBox.hidden = false;
      const lab = el('span', 'near-label', 'Not quite? Try instead of ' + g.text + ':'); nearBox.appendChild(lab);
      fam.forEach((s) => {
        const b = el('button', 'kn', s); b.type = 'button'; b.title = IPA.describe(s);
        b.addEventListener('click', () => {
          const before = field.value.slice(0, g.start), after = field.value.slice(pos);
          field.value = before + s + after; const np = (before + s).length; field.setSelectionRange(np, np); changed(); describe(s); refreshNear();
          api.audio.play(field.value);
        });
        nearBox.appendChild(b);
      });
    }

    function build() {
      root_ = el('div', 'kb'); root_.setAttribute('role', 'group'); root_.setAttribute('aria-label', 'IPA keyboard');
      const bar = el('div', 'kb-bar');
      info = el('div', 'kb-info', 'Tap a letter. You will hear it.'); info.setAttribute('aria-live', 'polite');
      const hear = el('button', 'kb-act kb-hear', 'Hear it'); hear.type = 'button'; hear.addEventListener('click', () => { if (field.value.trim()) api.audio.play(field.value); });
      const close = el('button', 'kb-act', 'Done'); close.type = 'button'; close.addEventListener('click', () => api.close());
      bar.append(info, hear, close);
      familyBox = el('div', 'kb-family'); familyBox.hidden = true;
      nearBox = el('div', 'kb-near'); nearBox.hidden = true;
      root_.append(bar, nearBox, familyBox);
      IPA.ROWS.forEach((row, ri) => {
        const r = el('div', 'kb-row r' + ri);
        Array.from(row).forEach((ch) => {
          const k = el('button', 'kk', ch); k.type = 'button';
          const fam = IPA.FAMILIES[ch]; if (fam && fam.length > 1) k.setAttribute('data-more', String(fam.length - 1));
          k.addEventListener('click', () => tapSymbol(ch === 'g' ? '\u0261' : ch));
          r.appendChild(k);
        });
        if (ri === 2) { const bk = el('button', 'kk kk-wide', '⌫'); bk.type = 'button'; bk.setAttribute('aria-label', 'Delete'); bk.addEventListener('click', back); r.appendChild(bk); }
        root_.appendChild(r);
      });
      const mods = el('div', 'kb-row kb-mods');
      MODS.forEach(([s, n]) => { const b = el('button', 'kk km', shown(s)); b.type = 'button'; b.title = n; b.setAttribute('aria-label', n); b.addEventListener('click', () => { tapSymbol(s, { family: false }); info.textContent = shown(s) + '  ' + n; }); mods.appendChild(b); });
      const sp = el('button', 'kk km kk-space', 'space'); sp.type = 'button'; sp.addEventListener('click', () => { insertAt(' '); refreshNear(); });
      mods.appendChild(sp);
      const clr = el('button', 'kk km', 'clear'); clr.type = 'button'; clr.addEventListener('click', () => { field.value = ''; changed(); familyBox.hidden = true; nearBox.hidden = true; info.textContent = 'Cleared.'; });
      mods.appendChild(clr);
      root_.appendChild(mods);
      return root_;
    }
    function mount(container, f) {
      field = f; container.textContent = ''; container.appendChild(build());
      field.setAttribute('inputmode', 'none'); field.addEventListener('click', refreshNear); field.addEventListener('keyup', refreshNear);
      refreshNear();
    }
    function unmount() { if (field) field.removeAttribute('inputmode'); field = null; }
    return { mount, unmount, lastGrapheme };
  }

  const out = { create, lastGrapheme };
  if (typeof module !== 'undefined' && module.exports) module.exports = out; else root.DadiKeyboard = out;
})(typeof self !== 'undefined' ? self : this);
