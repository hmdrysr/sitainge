/* siṭaiṅge site shell (CC0): the day and night toggle in the header and the narrow-width menu. Loaded in <head> on every page so the theme is applied before the first paint.
   First visit: follows the device (prefers-color-scheme). After the visitor taps the toggle, the explicit choice is kept in localStorage only; if storage is blocked the page still works. No network use. */
(function () {
  'use strict';
  var KEY = 'site.theme', root = document.documentElement, mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  root.classList.add('js');
  function saved() { try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; } }
  function system() { return mq && mq.matches ? 'dark' : 'light'; }
  var chosen = saved(), mode = chosen || system();
  /* Beer CSS reads its light and dark schemes from a class on <body> */
  function syncBody() { var b = document.body; if (b) { b.classList.toggle('dark', mode === 'dark'); b.classList.toggle('light', mode !== 'dark'); } }
  function apply(m) {
    mode = m; root.setAttribute('data-theme', m); syncBody();
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    if (metas.length) { for (var i = 1; i < metas.length; i++) metas[i].remove(); metas[0].removeAttribute('media'); metas[0].setAttribute('content', m === 'dark' ? '#14243a' : '#ffffff'); }
  }
  apply(mode);
  var onToggle = null;
  /* with no saved choice, a change of the device setting is followed */
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (!chosen) { apply(system()); if (onToggle) onToggle(); } });

  function ready() {
    syncBody();
    var bar = document.querySelector('.bar'), btn = bar && bar.querySelector('.menu-btn'), nav = bar && bar.querySelector('.nav');
    /* day and night toggle */
    var host = bar && bar.querySelector('.bar-in');
    if (host) {
      var tg = document.createElement('button'); tg.type = 'button'; tg.className = 'theme-btn';
      [['moon', 'dark_mode'], ['sun', 'light_mode']].forEach(function (n) { var s = document.createElement('i'); s.className = 'msi ti ti-' + n[0]; s.setAttribute('aria-hidden', 'true'); s.textContent = n[1]; tg.appendChild(s); });
      var mark = function () { tg.setAttribute('aria-pressed', String(mode === 'dark')); tg.setAttribute('aria-label', mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); };
      onToggle = mark;
      tg.addEventListener('click', function () {
        chosen = mode === 'dark' ? 'light' : 'dark'; apply(chosen);
        try { localStorage.setItem(KEY, chosen); } catch (e) { /* storage unavailable: the choice lasts for this page only */ }
        mark();
      });
      mark();
      var brand = host.querySelector('.brand'); if (brand) brand.after(tg); else host.prepend(tg);
    }
    /* menu sheet on narrow screens */
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
