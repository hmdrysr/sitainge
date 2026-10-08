/* Dadi IPA keyboard (CC0). Fixed proportions on every screen: ten equal columns, five rows, same shape as the phone keyboards people already know.
   Each key says its sound when tapped. The strip above the keys offers close neighbours of the last sound; tapping one replaces it.
   Keys are full-width cells with a smaller visible cap inside, so the touch target is larger than what you see. Plain DOM. */
(function (root) {
  'use strict';
  const IPA = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./ipa-data.js') : root.DadiIPA;

  const MODS = [['ː', 'long'], ['ʰ', 'aspirated'], ['ʱ', 'breathy'], ['̃', 'nasal'], ['ˈ', 'stress'], ['.', 'syllable break'], ['ʲ', 'palatal'], ['ʷ', 'rounded']];
  const DOTTED = '◌';
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const shown = (sym) => (/^[̀-ͯ]$/.test(sym) ? DOTTED + sym : sym);
  const MARK = /[̀-ͯʰ-˿ː͜͡]/;

  /* Last written sound: one base character plus anything that attaches to it. */
  function lastGrapheme(str, pos) {
    const chars = Array.from(str.slice(0, pos));
    let i = chars.length - 1;
    while (i > 0 && MARK.test(chars[i])) i--;
    return { text: chars.slice(i).join(''), start: chars.slice(0, i).join('').length };
  }
  function alternatives(base) {
    const out = [], seen = new Set([base]);
    [].concat(IPA.FAMILIES[String(base).toLowerCase()] || [], IPA.nearby(base) || []).forEach((s) => { if (!seen.has(s)) { seen.add(s); out.push(s); } });
    return out;
  }

  /* api: { audio: { play, playSymbol }, close(), onChange?(), suggest?(word) -> [{ ipa, gloss }] } ; mount(container, field) shows the keyboard for one text field. */
  function create(api) {
    let field = null, kb = null, strip, info, pop, caret = null, popTimer = null;
    const pos_ = () => Math.max(0, Math.min(caret == null ? field.value.length : caret, field.value.length));
    const setCaret = (n) => { caret = n; try { field.setSelectionRange(n, n); } catch (e) { /* ignore */ } };
    function changed() { field.dispatchEvent(new Event('input', { bubbles: true })); if (api.onChange) api.onChange(field.value); }
    const insertAt = (text) => { const s = pos_(); field.value = field.value.slice(0, s) + text + field.value.slice(s); setCaret(s + text.length); changed(); };
    function back() {
      const s = pos_();
      if (s > 0) { const g = Array.from(field.value.slice(0, s)); g.pop(); const keep = g.join(''); field.value = keep + field.value.slice(s); setCaret(keep.length); }
      changed(); refresh();
    }
    function describe(sym) { const d = IPA.describe(String(sym).normalize('NFD')[0]) || IPA.describe(sym); info.textContent = d ? (shown(sym) + '  ' + d) : ''; }
    const silent = (s) => /^[̀-ͯʰ-˿.ˈˌ]$/.test(s);

    function tap(sym) {
      insertAt(sym); describe(sym);
      if (!silent(sym)) api.audio.playSymbol(sym);
      refresh();
    }
    /* The strip: whole-word suggestions first (from the project's words), then close neighbours of the last sound. Tapping one swaps it in. */
    function refresh() {
      strip.textContent = '';
      const pos = pos_(), before = field.value.slice(0, pos), g = lastGrapheme(field.value, pos);
      const base = g.text ? Array.from(g.text)[0] : '', alts = base ? alternatives(base) : [];
      const word = (/(\S*)$/.exec(before) || ['', ''])[1];
      const words = api.suggest && word.length >= 2 ? api.suggest(word) : [];
      if (!alts.length && !words.length) { strip.append(el('span', 'kb-hint', g.text ? 'No close neighbours for ' + g.text : 'Tap a key to hear its sound.')); return; }
      if (words.length) {
        strip.append(el('span', 'kb-hint', 'Words:'));
        words.forEach((w) => {
          const b = el('button', 'ks kw'); b.type = 'button'; b.setAttribute('aria-label', 'Use the word ' + w.ipa + ', ' + w.gloss);
          b.append(el('span', 'kw-i', w.ipa), el('span', 'kw-g', w.gloss));
          b.addEventListener('click', () => {
            const start = pos - word.length, after = field.value.slice(pos);
            field.value = field.value.slice(0, start) + w.ipa + after; setCaret(start + w.ipa.length); changed(); info.textContent = w.ipa + '  ' + w.gloss; api.audio.play(w.ipa); refresh();
          });
          strip.append(b);
        });
      }
      if (alts.length) {
        strip.append(el('span', 'kb-hint', 'Instead of ' + g.text + ':'));
        alts.forEach((s) => {
          const b = el('button', 'ks', s); b.type = 'button'; b.title = IPA.describe(s); b.setAttribute('aria-label', 'Use ' + s + ' ' + IPA.describe(s));
          b.addEventListener('click', () => {
            const rest = g.text.slice(base.length), pre = field.value.slice(0, g.start), after = field.value.slice(pos);
            field.value = pre + s + rest + after; setCaret((pre + s + rest).length); changed(); describe(s); api.audio.playSymbol(s); refresh();
          });
          strip.append(b);
        });
      }
      strip.scrollLeft = 0;
    }

    function key(label, cls, onTap, aria) {
      const b = el('button', 'kk ' + (cls || '')); b.type = 'button'; b.append(el('span', 'kc', label));
      if (aria) b.setAttribute('aria-label', aria);
      b.addEventListener('click', onTap); return b;
    }
    function build() {
      kb = el('div', 'kb'); kb.setAttribute('role', 'group'); kb.setAttribute('aria-label', 'IPA keyboard');
      const head = el('div', 'kb-head'); strip = el('div', 'kb-strip'); strip.setAttribute('role', 'toolbar'); strip.setAttribute('aria-label', 'Close neighbours of the last sound');
      const done = el('button', 'kb-done', 'Done'); done.type = 'button'; done.addEventListener('click', () => api.close());
      head.append(strip, done);
      info = el('div', 'kb-info'); info.setAttribute('aria-live', 'polite');
      pop = el('div', 'kb-pop'); pop.hidden = true; pop.setAttribute('aria-hidden', 'true');
      kb.append(head, info);
      IPA.ROWS.forEach((row, ri) => {
        const r = el('div', 'kb-row r' + ri);
        if (ri === 2) r.append(key('clear', 'fn', () => { field.value = ''; setCaret(0); changed(); info.textContent = 'Cleared.'; refresh(); }, 'Clear all'));
        Array.from(row).forEach((ch) => { const sym = ch === 'g' ? 'ɡ' : ch; r.append(key(sym, 'ltr', () => tap(sym))); });
        if (ri === 2) r.append(key('⌫', 'fn', back, 'Delete'));
        kb.append(r);
      });
      const mods = el('div', 'kb-row r3');
      MODS.forEach(([s, n]) => mods.append(key(shown(s), 'mod', () => { tap(s); info.textContent = shown(s) + '  ' + n; }, n)));
      const last = el('div', 'kb-row r4');
      last.append(key('space', 'fn space', () => { insertAt(' '); refresh(); }), key('Hear', 'fn hear', () => { if (field.value.trim()) api.audio.play(field.value); }, 'Hear the whole word'));
      kb.append(mods, last, pop);
      /* key popup, like a phone keyboard: shows what is under your finger */
      kb.addEventListener('pointerdown', (e) => {
        const k = e.target.closest && e.target.closest('.kk.ltr, .kk.mod'); if (!k) return;
        e.preventDefault();
        const kr = k.getBoundingClientRect(), br = kb.getBoundingClientRect();
        pop.textContent = k.textContent; pop.hidden = false; clearTimeout(popTimer);
        pop.style.left = Math.max(22, Math.min(br.width - 22, kr.left - br.left + kr.width / 2)) + 'px'; pop.style.top = (kr.top - br.top - 6) + 'px';
      });
      const hidePop = () => { clearTimeout(popTimer); popTimer = setTimeout(() => { pop.hidden = true; }, 110); };
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => kb.addEventListener(n, hidePop));
      kb.addEventListener('mousedown', (e) => { if (e.target.closest && e.target.closest('.kk')) e.preventDefault(); });
      return kb;
    }
    function mount(container, f) {
      field = f; caret = f.value.length; container.textContent = ''; container.append(build());
      const sync = () => { if (document.activeElement === field) caret = field.selectionStart; };
      ['keyup', 'click', 'input', 'select', 'focus'].forEach((ev) => field.addEventListener(ev, sync));
      field.setAttribute('inputmode', 'none'); field.addEventListener('click', refresh); field.addEventListener('keyup', refresh);
      refresh();
    }
    function unmount() { if (field) field.removeAttribute('inputmode'); field = null; }
    return { mount, unmount, lastGrapheme, alternatives };
  }

  const out = { create, lastGrapheme, alternatives };
  if (typeof module !== 'undefined' && module.exports) module.exports = out; else root.DadiKeyboard = out;
})(typeof self !== 'undefined' ? self : this);
