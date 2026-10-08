/* Content script (CC0), injected on demand. Replaces text nodes with dictionary hits; keeps each original node so Undo is exact. */
(function () {
  'use strict';
  if (window.__sitaingaLoaded) return; window.__sitaingaLoaded = true;
  const ext = window.browser || window.chrome, T = window.DadiTranslate;
  const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|SELECT|OPTION|CODE|PRE|SVG|IFRAME|CANVAS|KBD|SAMP)$/;
  const orig = new WeakMap(), wrappers = new Set(); /* wrapper span -> original text node */
  let G = null, obs = null, timer = 0, pending = new Set(), words = 0, hits = 0, on = false;
  const ui = (n) => n.closest && n.closest('[data-sitainga-ui]');
  const ok = (n) => { const p = n.parentNode; return p && n.nodeType === 3 && !SKIP.test(p.nodeName) && !p.isContentEditable && !(p.closest && (p.closest('[data-sitainga-wrap]') || p.closest('[data-sitainga-ui]') || p.closest('[contenteditable=""],[contenteditable="true"]'))) && /[A-Za-z]/.test(n.nodeValue); };
  function collect(root, out) {
    if (root.nodeType === 3) { if (ok(root)) out.push(root); return; }
    if (root.nodeType !== 1 || SKIP.test(root.nodeName) || root.isContentEditable || ui(root)) return;
    const w = document.createTreeWalker(root, 4, { acceptNode: (n) => (ok(n) ? 1 : 2) });
    while (w.nextNode()) out.push(w.currentNode);
  }
  function apply(nodes) {
    for (const n of nodes) {
      if (!n.parentNode) continue;
      const r = T.translate(n.nodeValue, G); words += r.words; if (!r.hits) continue; hits += r.hits;
      const wrap = document.createElement('span'); wrap.setAttribute('data-sitainga-wrap', '');
      for (const p of r.parts) {
        if (p.t === 'hit') { const s = document.createElement('span'); s.textContent = p.out; s.setAttribute('data-sitainga-hit', ''); s.title = p.s + ', evidence level: ' + p.level + ' (unverified draft)'; s.style.cssText = 'text-decoration:underline dotted;text-underline-offset:3px'; wrap.append(s); }
        else wrap.append(document.createTextNode(p.s));
      }
      orig.set(wrap, n); wrappers.add(wrap); n.parentNode.replaceChild(wrap, n);
    }
  }
  const flush = () => {
    timer = 0; if (!on) return; const nodes = []; pending.forEach((x) => { if (x.isConnected) collect(x, nodes); }); pending = new Set();
    if (obs) obs.disconnect(); apply(nodes); watch();
  };
  function watch() { if (!obs) obs = new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'characterData') pending.add(m.target); else m.addedNodes.forEach((a) => { if (!(a.nodeType === 1 && (a.hasAttribute('data-sitainga-wrap') || a.hasAttribute('data-sitainga-ui')))) pending.add(a); }); } if (pending.size && !timer) timer = setTimeout(flush, 600); }); obs.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  function page(g) {
    if (on) return stat(); G = T.load(g); on = true; words = hits = 0;
    const nodes = []; collect(document.body, nodes); apply(nodes); watch(); return stat();
  }
  function undo() {
    on = false; if (obs) { obs.disconnect(); obs = null; } clearTimeout(timer); timer = 0; pending = new Set();
    wrappers.forEach((w) => { const o = orig.get(w); if (w.parentNode && o) w.parentNode.replaceChild(o, w); }); wrappers.clear(); words = hits = 0; hideBox(); return stat();
  }
  const stat = () => ({ on, words, hits, coverage: words ? hits / words : 0 });
  function hideBox() { document.querySelectorAll('[data-sitainga-ui]').forEach((b) => b.remove()); }
  function selection(g, text) {
    text = text || String(window.getSelection() || ''); const r = T.translate(text, T.load(g)); hideBox();
    const box = document.createElement('div'); box.setAttribute('data-sitainga-ui', '');
    box.style.cssText = 'position:fixed;z-index:2147483647;left:8px;right:8px;bottom:8px;max-width:520px;margin:auto;background:#1c1c1e;color:#fff;font:14px/1.4 system-ui,sans-serif;padding:12px 14px;border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.35)';
    const a = document.createElement('div'); a.style.cssText = 'font-size:16px;margin-bottom:6px;white-space:pre-wrap'; a.textContent = T.plain(r) || '(no text selected)';
    const b = document.createElement('div'); b.style.cssText = 'opacity:.8;font-size:12px'; b.textContent = 'siṭaiṅga draft (unverified). ' + r.hits + ' of ' + r.words + ' words found; the rest remain in English.';
    const x = document.createElement('button'); x.textContent = 'Close'; x.style.cssText = 'margin-top:8px;border:0;border-radius:999px;padding:6px 14px;font:inherit;font-weight:600;background:#fff;color:#000;cursor:pointer'; x.onclick = hideBox;
    box.append(a, b, x); document.body.append(box); return { words: r.words, hits: r.hits, coverage: r.coverage, text: a.textContent };
  }
  ext.runtime.onMessage.addListener((m, s, send) => {
    let r; try { r = m.cmd === 'page' ? page(m.glossary) : m.cmd === 'undo' ? undo() : m.cmd === 'selection' ? selection(m.glossary, m.text) : stat(); } catch (e) { r = { error: String(e && e.message || e) }; }
    send(r); return false;
  });
})();
