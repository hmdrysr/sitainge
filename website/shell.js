/* siṭaiṅge site shell (CC0): colour theme choice and the narrow-width menu. Loaded in <head> on every page so the saved theme is applied before the first paint.
   The choice (auto, light or dark) is kept in localStorage only; if storage is blocked the page still works and follows the device. No network use. */
(function () {
  'use strict';
  var KEY = 'site.theme', root = document.documentElement, mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  root.classList.add('js');
  function saved() { try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'auto'; } catch (e) { return 'auto'; } }
  function apply(mode) {
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode); else root.removeAttribute('data-theme');
    var dark = mode === 'dark' || (mode !== 'light' && mq && mq.matches);
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    if (metas.length) { for (var i = 1; i < metas.length; i++) metas[i].remove(); metas[0].removeAttribute('media'); metas[0].setAttribute('content', dark ? '#14243a' : '#ffffff'); }
  }
  var mode = saved(); apply(mode);
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (mode === 'auto') apply(mode); });

  function ready() {
    /* theme control in the footer */
    var box = document.querySelector('[data-theme-control]');
    if (box) {
      var lab = document.createElement('span'); lab.className = 'lbl'; lab.id = 'theme-lbl'; lab.textContent = 'Colour theme';
      var grp = document.createElement('div'); grp.className = 'tseg'; grp.setAttribute('role', 'group'); grp.setAttribute('aria-labelledby', 'theme-lbl');
      var btns = {};
      [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].forEach(function (p) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = p[1]; b.setAttribute('data-mode', p[0]);
        b.addEventListener('click', function () {
          mode = p[0]; apply(mode);
          try { if (mode === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, mode); } catch (e) { /* storage unavailable */ }
          mark();
        });
        btns[p[0]] = b; grp.appendChild(b);
      });
      var mark = function () { for (var k in btns) btns[k].setAttribute('aria-pressed', String(k === mode)); };
      mark(); box.appendChild(lab); box.appendChild(grp);
    }
    /* menu sheet on narrow screens */
    var bar = document.querySelector('.bar'), btn = bar && bar.querySelector('.menu-btn'), nav = bar && bar.querySelector('.nav');
    if (!btn || !nav) return;
    var wide = matchMedia('(min-width: 760px)');
    function set(open, focusBtn) {
      bar.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open));
      if (!open && focusBtn) btn.focus();
    }
    btn.addEventListener('click', function () { set(!bar.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bar.classList.contains('is-open')) set(false, true); });
    document.addEventListener('click', function (e) { if (!bar.contains(e.target)) set(false); });
    bar.addEventListener('focusout', function (e) { if (e.relatedTarget && !bar.contains(e.relatedTarget)) set(false); });
    if (wide.addEventListener) wide.addEventListener('change', function () { set(false); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
