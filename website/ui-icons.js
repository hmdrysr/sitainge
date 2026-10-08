/* Shared icon loader for the project pages (CC0). Icons are Tabler Icons (outline, MIT licence), read from the Dadi icon pack
   through dadi/js/icons.js and dadi/data/icons.json. Mark a place with <span data-icon="name"></span>; the icon is drawn inline in the
   text colour. Decorative by default (aria-hidden). Nothing is fetched from other sites. */
(function () {
  'use strict';
  const me = document.currentScript, base = (me && me.getAttribute('data-base')) || '';
  const DI = window.DadiIcons;
  let loading = null;
  const svgFor = (name) => (DI ? (DI.ui(name) || DI.get(name)) : null);
  function fill(root) {
    let missing = false;
    (root || document).querySelectorAll('[data-icon]:not([data-done])').forEach((el) => {
      const s = svgFor(el.getAttribute('data-icon'));
      if (s) { el.innerHTML = s; el.setAttribute('data-done', ''); } else missing = true;
    });
    return missing;
  }
  function draw(root) {
    if (!DI) return;
    if (fill(root) && !loading) {
      loading = DI.load(base + 'dadi/data/icons.json').then(() => fill(document));
    }
  }
  window.SiteIcons = { draw, svg: svgFor };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => draw()); else draw();
})();
