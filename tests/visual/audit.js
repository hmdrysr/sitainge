// Layout audit (CC0): finds horizontal overflow, overlaps, fixed bars covering content, truncated text, icon/label misalignment and small touch targets.
// Used by layout.spec.js and runnable on its own: node audit.js <baseURL> <outDir>
async function auditPage(page) {
  return page.evaluate(() => {
    const issues = [], vw = document.documentElement.clientWidth, vh = innerHeight;
    const vis = (el) => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const name = (el) => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' "' + (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30) + '"');
    const clipped = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const s = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(s.overflowX + s.overflowY) && p !== document.body && p !== document.documentElement) { const a = el.getBoundingClientRect(), b = p.getBoundingClientRect(); if (a.right <= b.left || a.left >= b.right) return true; return false; } } return false; };
    if (document.documentElement.scrollWidth > vw + 1) issues.push({ type: 'hscroll', el: 'document', d: document.documentElement.scrollWidth - vw });
    const all = [...document.querySelectorAll('body *')].filter((el) => !el.closest('svg,.skip,.sr,.vh') && vis(el));
    for (const el of all) {
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      if (el.closest('.sr,[aria-hidden="true"] *,svg,.tabs-scroll,.hscroll,pre,table,.kbd,.chart,iframe')) continue;
      if ((r.right > vw + 1 || r.left < -1) && s.position !== 'fixed' && !clipped(el) && el.children.length === 0 && el.innerText.trim()) issues.push({ type: 'overflow-x', el: name(el) });
      const txt = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (txt && !el.classList.contains('msi') && el.tagName !== 'I' && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && s.textOverflow !== 'ellipsis' && !s.webkitLineClamp?.match(/\d/) && (el.scrollWidth > el.clientWidth + 1 && /(hidden|clip)/.test(s.overflowX) || el.scrollHeight > el.clientHeight + 2 && /(hidden|clip)/.test(s.overflowY))) issues.push({ type: 'truncated', el: name(el) });
    }
    const inV = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh; };
    const inter = [...document.querySelectorAll('a,button,input,select,textarea,[role=button],[role=tab]')].filter((el) => !el.closest('svg,.skip,.sr') && vis(el) && inV(el));
    for (const el of inter) {
      const r = el.getBoundingClientRect();
      if (el.closest('p,li p,.crumbs a,.foot') && el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue; // inline text links
      if (el.type === 'hidden' || el.closest('.sr,.vh')) continue;
      // documented exceptions: on-screen keyboard keys (10 per row, sized like a system keyboard) and inline word tokens in running text (WCAG 2.5.8 inline exception)
      const exempt = el.matches('.kk, .hit, .miss');
      if (!exempt && Math.min(r.height, r.width) < 43.5 && !(el.type === 'checkbox' || el.type === 'radio')) issues.push({ type: 'target', el: name(el), d: Math.round(Math.min(r.width, r.height)) });
      const ic = el.querySelector('.msi, i'), lab = [...el.querySelectorAll('span,small')].find((x) => vis(x) && x.innerText.trim() && !x.contains(ic));
      if (ic && vis(ic)) {
        const a = ic.getBoundingClientRect(); const cs = getComputedStyle(el);
        const col = cs.flexDirection.startsWith('column');
        if (ic.closest('picture,.vthumb,.thumb') || el.querySelector('img')) { /* play badge over a thumbnail, not an icon+label pair */ } else if (!col) { let hold = lab; while (hold && hold.parentElement !== el) hold = hold.parentElement; const ref = hold && !hold.contains(ic) ? hold.getBoundingClientRect() : r; if (Math.abs((a.top + a.bottom) / 2 - (ref.top + ref.bottom) / 2) > 4 && (lab || el.innerText.trim().length > 0)) issues.push({ type: 'misaligned', el: name(el), d: Math.round((a.top + a.bottom) / 2 - (ref.top + ref.bottom) / 2) }); }
        else if (Math.abs((a.left + a.right) / 2 - (r.left + r.right) / 2) > 3) issues.push({ type: 'misaligned', el: name(el) });
      }
    }
    // overlaps between interactive elements
    for (let i = 0; i < inter.length; i++) for (let j = i + 1; j < inter.length; j++) {
      const a = inter[i], b = inter[j]; if (a.contains(b) || b.contains(a)) continue;
      const fx = (e) => { for (let n = e; n; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return n; return null; };
      if (fx(a) !== fx(b)) continue;
      if (a.matches('input') && b.matches('.clear') || b.matches('input') && a.matches('.clear')) continue; // clear button sits inside the search field by design (field has right padding)
      const p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
      const ox = Math.min(p.right, q.right) - Math.max(p.left, q.left), oy = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
      if (ox > 2 && oy > 2) issues.push({ type: 'overlap', el: name(a) + ' x ' + name(b) });
    }
    // fixed/sticky bottom bars: count, and does page leave room for them
    const bars = all.filter((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.position === 'fixed' && r.bottom >= vh - 2 && r.width > vw * 0.5 && r.height < vh * 0.4 && !el.closest('#layer,.kbdock'); });
    const top = bars.filter((b) => !bars.some((o) => o !== b && o.contains(b)));
    if (top.length > 1) issues.push({ type: 'double-bar', el: top.map(name).join(' + ') });
    for (const b of top) {
      const h = vh - b.getBoundingClientRect().top; const pb = parseFloat(getComputedStyle(document.body).paddingBottom) + parseFloat(getComputedStyle(document.documentElement).paddingBottom || 0);
      if (pb + 1 < h) issues.push({ type: 'bar-covers', el: name(b), d: Math.round(h - pb) });
      if (b.getBoundingClientRect().bottom > vh + 1) issues.push({ type: 'bar-offscreen', el: name(b) });
    }
    return issues;
  });
}
module.exports = { auditPage };
