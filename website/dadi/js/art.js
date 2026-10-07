/* Original line-and-fill illustrations for Dadi, drawn for this project (CC0).
   Bundled inside the app instead of hotlinked, so they work offline and never disappear. Colours come from CSS classes:
   a indigo, b madder red, c leaf green, d marigold, w cotton, k ink. Each icon is a 64x64 picture. */
(function (root) {
  'use strict';
  const S = (inner) => '<svg class="art" viewBox="0 0 64 64" role="img" aria-hidden="true" focusable="false">' + inner + '</svg>';
  const P = {};

  /* things */
  P.water = '<path class="a" d="M32 8C22 22 16 30 16 39a16 16 0 0 0 32 0c0-9-6-17-16-31z"/><path class="w" d="M24 40a8 8 0 0 0 6 8" fill="none" stroke-width="3" stroke-linecap="round" style="stroke:var(--cotton)"/>';
  P.rice = '<path class="k" d="M8 32h48a24 20 0 0 1-48 0z"/><path d="M12 31c4-14 36-14 40 0z" style="fill:var(--cotton);stroke:var(--ink);stroke-width:2"/><g class="k"><circle cx="24" cy="25" r="1.800"/><circle cx="32" cy="21" r="1.800"/><circle cx="40" cy="25" r="1.800"/><circle cx="28" cy="28" r="1.600"/><circle cx="36" cy="28" r="1.600"/></g><path class="d" d="M22 53h20v3H22z"/>';
  P.food = P.rice;
  P.fish = '<path class="a" d="M6 32c8-14 26-16 38-6l10-8v28l-10-8C32 48 14 46 6 32z"/><circle class="w" cx="18" cy="29" r="2.6"/><path class="b" d="M26 24c3 5 3 11 0 16" fill="none" stroke-width="2.6" stroke-linecap="round" style="stroke:var(--madder)"/>';
  P.salt = '<path class="w" d="M20 26h24l-3 30H23z" style="stroke:var(--ink);stroke-width:2"/><path class="a" d="M20 26a12 12 0 0 1 24 0z"/><g class="k"><circle cx="28" cy="16" r="1.4"/><circle cx="36" cy="16" r="1.4"/><circle cx="32" cy="20" r="1.4"/></g>';
  P.tea = '<path class="w" d="M12 26h32v12a16 14 0 0 1-32 0z" style="stroke:var(--ink);stroke-width:2"/><path d="M44 29h5a6 6 0 0 1 0 12h-6" fill="none" style="stroke:var(--ink);stroke-width:2.4"/><path class="b" d="M16 26h24v5H16z"/><path d="M22 20c-3-4 3-6 0-10M32 20c-3-4 3-6 0-10" fill="none" stroke-width="2" stroke-linecap="round" style="stroke:var(--indigo)"/><ellipse class="a" cx="28" cy="55" rx="20" ry="3"/>';
  P.money = '<circle class="d" cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="16" fill="none" style="stroke:var(--ink);stroke-width:2"/><path d="M26 32h12M32 24v16" style="stroke:var(--ink);stroke-width:3;stroke-linecap:round"/>';
  P.book = '<path class="a" d="M6 14c10-3 20-2 26 3v38c-6-5-16-6-26-3z"/><path class="b" d="M58 14c-10-3-20-2-26 3v38c6-5 16-6 26-3z"/><path d="M12 22c6-1 12 0 15 2M12 30c6-1 12 0 15 2M37 24c3-2 9-3 15-2M37 32c3-2 9-3 15-2" fill="none" style="stroke:var(--cotton);stroke-width:2;stroke-linecap:round"/>';
  P.phone = '<rect class="k" x="18" y="6" width="28" height="52" rx="5"/><rect class="w" x="21.5" y="12" width="21" height="36" rx="1.5"/><circle class="w" cx="32" cy="53" r="2.2"/><path class="a" d="M25 20h14M25 27h14M25 34h9" style="stroke:var(--indigo);stroke-width:2.4;stroke-linecap:round"/>';
  P.house = '<path class="b" d="M4 30L32 8l28 22z"/><path class="w" d="M12 29h40v26H12z" style="stroke:var(--ink);stroke-width:2"/><path class="a" d="M27 55V38h10v17z"/><rect class="d" x="15" y="34" width="8" height="8"/><rect class="d" x="41" y="34" width="8" height="8"/>';
  P.village = '<path class="c" d="M0 52h64v12H0z"/><path class="b" d="M4 36l12-10 12 10z"/><rect class="w" x="7" y="36" width="18" height="16" style="stroke:var(--ink);stroke-width:1.6"/><path class="b" d="M34 40l10-9 10 9z"/><rect class="w" x="37" y="40" width="14" height="12" style="stroke:var(--ink);stroke-width:1.6"/><circle class="c" cx="58" cy="30" r="7"/><rect class="k" x="57" y="36" width="2" height="16"/>';
  P.door = '<path class="a" d="M16 58V24a16 16 0 0 1 32 0v34z"/><path d="M32 12v46M20 24v34M44 24v34" style="stroke:var(--cotton);stroke-width:1.6;opacity:.55"/><circle class="d" cx="41" cy="38" r="2.4"/>';
  P.shop = '<path class="b" d="M6 12h52l4 14H2z"/><g class="w"><path d="M14 12l-3 14h6l2-14zM30 12l-1 14h6l1-14zM46 12l3 14h-6l-2-14z" opacity=".9"/></g><rect class="w" x="8" y="26" width="48" height="30" style="stroke:var(--ink);stroke-width:2"/><rect class="a" x="14" y="34" width="16" height="22"/><rect class="d" x="36" y="34" width="14" height="10"/>';
  P.table = '<rect class="d" x="6" y="22" width="52" height="7" rx="2"/><path class="k" d="M12 29h5v26h-5zM47 29h5v26h-5z"/>';
  P.chair = '<path class="a" d="M18 8h6l-1 24h-6z"/><rect class="d" x="16" y="30" width="32" height="7" rx="2"/><path class="k" d="M18 37h5v19h-5zM42 37h5v19h-5z"/>';
  P.bed = '<rect class="a" x="4" y="26" width="6" height="30"/><rect class="d" x="10" y="38" width="48" height="8" rx="2"/><rect class="w" x="12" y="30" width="14" height="8" rx="3" style="stroke:var(--ink);stroke-width:1.6"/><path class="b" d="M28 32h30v8H28z"/><rect class="a" x="54" y="36" width="6" height="20"/>';
  /* nature */
  P.sun = '<circle class="d" cx="32" cy="32" r="12"/><g style="stroke:var(--madder);stroke-width:3.4;stroke-linecap:round"><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.6 5.6M44.8 44.8l5.6 5.6M13.6 50.4l5.6-5.6M44.8 19.2l5.6-5.6"/></g>';
  P.moon = '<path class="d" d="M42 8a25 25 0 1 0 14 38A21 21 0 0 1 42 8z"/><g class="a"><circle cx="50" cy="14" r="1.8"/><circle cx="56" cy="24" r="1.4"/></g>';
  P.rain = '<path class="a" d="M16 36a10 10 0 0 1 2-19.800A14 14 0 0 1 45 18a9 9 0 0 1 3 18z"/><g style="stroke:var(--indigo);stroke-width:3;stroke-linecap:round"><path d="M18 44l-3 8M30 44l-3 8M42 44l-3 8M24 52l-2 6M36 52l-2 6"/></g>';
  P.river = '<rect class="c" width="64" height="64"/><path d="M26 -2C50 16 14 40 36 66" fill="none" style="stroke:var(--indigo);stroke-width:18;stroke-linecap:butt"/><path d="M26 14c3-2 5 1 8-1M30 36c3-2 5 1 8-1M33 52c3-2 5 1 8-1" style="stroke:var(--cotton);stroke-width:2;fill:none;stroke-linecap:round"/>';
  P.sea = '<circle class="d" cx="44" cy="20" r="9"/><rect class="a" x="0" y="30" width="64" height="34"/><g style="stroke:var(--cotton);stroke-width:2.6;fill:none;stroke-linecap:round"><path d="M6 40q6-5 12 0t12 0t12 0t12 0M2 50q6-5 12 0t12 0t12 0t12 0t12 0M10 59q6-5 12 0t12 0t12 0"/></g>';
  P.boat = '<path class="a" d="M4 40h56c-3 10-10 16-22 16H26C14 56 7 50 4 40z"/><path class="d" d="M12 36C18 30 24 28 32 28s14 2 20 8z"/><path class="k" d="M31 10h2v18h-2z"/><path class="b" d="M33 11l16 12H33z"/><path d="M0 60q8-5 16 0t16 0t16 0t16 0" style="stroke:var(--indigo);stroke-width:2.4;fill:none"/>';
  P.hill = '<path class="c" d="M0 56L22 16l16 24 8-12 18 28z"/><path class="a" d="M22 16l-6 10 6-3 5 5z" style="fill:var(--cotton)"/><circle class="d" cx="50" cy="12" r="6"/>';
  P.road = '<path class="k" d="M26 6h12l20 52H6z"/><path d="M32 10v6M32 22v8M32 36v10M32 52v6" style="stroke:var(--cotton);stroke-width:2.6;stroke-linecap:round"/>';
  P.soil = '<path class="k" d="M4 56c4-16 14-22 28-22s24 6 28 22z"/><path class="c" d="M32 34V18M32 22c-8 0-12-4-12-10 8 0 12 4 12 10zM32 26c7 0 11-3 11-9-7 0-11 3-11 9z"/>';
  P.tree = '<rect class="k" x="29" y="34" width="6" height="24"/><circle class="c" cx="32" cy="22" r="16"/><circle class="c" cx="19" cy="31" r="10"/><circle class="c" cx="45" cy="31" r="10"/>';
  /* people (heads and bodies, kept simple and respectful) */
  const person = (body, hair, extra) => '<circle class="s" cx="32" cy="20" r="10"/>' + (hair || '') + '<path class="' + body + '" d="M12 60c0-14 8-24 20-24s20 10 20 24z"/>' + (extra || '');
  P.person = person('a');
  P.we = '<g transform="translate(-9 4) scale(.8)">' + person('a') + '</g><g transform="translate(22 4) scale(.8)">' + person('b') + '</g>';
  P.they = '<g transform="translate(-14 6) scale(.7)">' + person('a') + '</g><g transform="translate(9 6) scale(.7)">' + person('b') + '</g><g transform="translate(32 6) scale(.7)">' + person('c') + '</g>';
  P.man = person('a', '<path class="k" d="M22 18a10 10 0 0 1 20 0c-4-4-16-4-20 0z"/>');
  P.father = person('c', '<path class="w" d="M21 20a11 11 0 0 1 22 0c-3-5-19-5-22 0z" style="stroke:var(--ink);stroke-width:1.4"/>');
  P.boy = '<g transform="translate(6 10) scale(.8)">' + person('d', '<path class="k" d="M22 18a10 10 0 0 1 20 0c-4-4-16-4-20 0z"/>') + '</g>';
  P.child = P.boy;
  P.woman = person('b', '<path class="k" d="M21 22a11 11 0 0 1 22 0c0 8 1 14-3 16V20c-6-2-12-2-16 0v18c-4-2-3-8-3-16z"/>');
  P.mother = person('b', '<path class="a" d="M20 24a12 12 0 0 1 24 0c0 8-2 12-4 14-3-6-5-10-8-10s-5 4-8 10c-2-2-4-6-4-14z"/>');
  P.girl = '<g transform="translate(6 10) scale(.8)">' + person('c', '<path class="k" d="M22 18a10 10 0 0 1 20 0c-4-4-16-4-20 0z"/><circle class="k" cx="19" cy="26" r="4"/><circle class="k" cx="45" cy="26" r="4"/>') + '</g>';
  P.grandmother = person('a', '<path class="w" d="M21 20a11 11 0 0 1 22 0c-3-5-19-5-22 0z" style="stroke:var(--ink);stroke-width:1.2"/><circle class="w" cx="32" cy="8" r="5" style="stroke:var(--ink);stroke-width:1.2"/>', '<g fill="none" style="stroke:var(--ink);stroke-width:1.6"><circle cx="27.500" cy="21" r="3.600"/><circle cx="36.500" cy="21" r="3.600"/><path d="M31 21h2"/></g>');
  P.grandfather = person('c', '<path class="w" d="M21 20a11 11 0 0 1 22 0c-3-5-19-5-22 0z" style="stroke:var(--ink);stroke-width:1.2"/>', '<path class="w" d="M23 24c0 10 18 10 18 0-4 3-14 3-18 0z" style="stroke:var(--ink);stroke-width:1.2"/>');
  /* actions and ideas */
  P.come = '<path class="a" d="M6 32h38M32 18l14 14-14 14" fill="none" style="stroke:var(--indigo);stroke-width:6;stroke-linecap:round;stroke-linejoin:round;transform:scaleX(-1);transform-origin:32px 32px"/><circle class="d" cx="54" cy="32" r="6"/>';
  P.go = '<path d="M8 32h42M36 18l14 14-14 14" fill="none" style="stroke:var(--indigo);stroke-width:6;stroke-linecap:round;stroke-linejoin:round"/><circle class="d" cx="10" cy="32" r="5"/>';
  P.drink = '<path class="w" d="M16 10h32l-4 46H20z" style="stroke:var(--ink);stroke-width:2"/><path class="a" d="M18 24h28l-2 32H20z"/>';
  P.sleep = '<rect class="d" x="6" y="36" width="52" height="8" rx="2"/><circle class="s" cx="18" cy="30" r="7"/><path class="a" d="M24 34h30v6H24z"/><g style="fill:none;stroke:var(--madder);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round"><path d="M38 8h8l-8 8h8M48 18h6l-6 6h6"/></g>';
  P.sit = P.chair;
  P.see = '<path class="w" d="M4 32C14 16 50 16 60 32 50 48 14 48 4 32z" style="stroke:var(--ink);stroke-width:2.4"/><circle class="a" cx="32" cy="32" r="10"/><circle class="k" cx="32" cy="32" r="4.500"/><circle class="w" cx="35" cy="29" r="1.600"/>';
  P.say = '<path class="a" d="M6 10h52a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H30L16 56V42H6a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" transform="translate(0 -2)"/><g class="w"><circle cx="20" cy="26" r="3"/><circle cx="32" cy="26" r="3"/><circle cx="44" cy="26" r="3"/></g>';
  P.give = '<path class="s" d="M6 40c8-2 14-6 22-6h10c4 0 4 6 0 6H26"/><path class="s" d="M26 40l14 2c6 1 10-4 16-10"/><circle class="d" cx="42" cy="20" r="8"/>';
  P.take = '<path class="s" d="M58 40c-8-2-14-6-22-6H26c-4 0-4 6 0 6h12"/><path class="s" d="M38 40l-14 2c-6 1-10-4-16-10"/><circle class="d" cx="22" cy="20" r="8"/>';
  P.want = '<path class="b" d="M32 56C10 40 6 26 6 20a13 13 0 0 1 26-3 13 13 0 0 1 26 3c0 6-4 20-26 36z"/>';
  P.know = '<path class="d" d="M32 6a18 18 0 0 0-8 34v6h16v-6a18 18 0 0 0-8-34z"/><path class="k" d="M24 50h16v4a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z"/>';
  P.work = '<path class="k" d="M36 8l20 20-6 6-8-8-26 26-6-6 26-26-6-6z"/><path class="d" d="M6 56l10-10 6 6-10 10z"/>';
  P.good = '<path class="a" d="M8 28h12v28H8z"/><path class="a" d="M24 28l10-20c6 0 8 6 6 12l-2 6h16c4 0 6 4 4 8l-6 20c-1 3-3 4-6 4H24z"/>';
  P.bad = '<g transform="translate(0 64) scale(1 -1)">' + P.good + '</g>';
  P.big = '<circle class="a" cx="26" cy="38" r="22"/><circle class="b" cx="52" cy="18" r="8"/>';
  P.small = '<circle class="b" cx="14" cy="50" r="8"/><circle class="a" cx="38" cy="26" r="22" opacity=".25"/>';
  P.hot = '<path class="b" d="M32 4c4 10 18 16 18 32a18 18 0 0 1-36 0c0-8 4-12 8-16 0 6 3 8 6 8 0-10-2-16 4-24z"/><path class="d" d="M32 56a9 9 0 0 1-9-9c0-6 5-8 6-14 6 4 12 8 12 14a9 9 0 0 1-9 9z"/>';
  P.cold = '<g style="stroke:var(--indigo);stroke-width:4;stroke-linecap:round"><path d="M32 6v52M9.500 19l45 26M9.500 45l45-26"/><path d="M26 10l6 6 6-6M26 54l6-6 6 6M6 26l8 2-2 8M58 38l-8-2 2-8M6 38l8-2-2-8M58 26l-8 2 2 8" style="stroke-width:3"/></g>';
  P.new = '<path class="d" d="M32 4l7 17 18 2-14 12 5 18-16-10-16 10 5-18L7 23l18-2z"/>';
  P.old = '<path class="d" d="M18 8h28v6L35 32l11 18v6H18v-6l11-18-11-18z"/><path class="k" d="M14 6h36v4H14zM14 54h36v4H14z"/><path class="b" d="M24 50h16l-8-10z"/>';
  P.speech = '<path class="a" d="M10 8h44a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H30L16 58V44h-6a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z"/><g class="w"><circle cx="22" cy="26" r="3"/><circle cx="32" cy="26" r="3"/><circle cx="42" cy="26" r="3"/></g>';

  /* gloss keywords (lower case, first match wins) -> picture */
  const MAP = [
    ['grandmother', 'grandmother'], ['grandfather', 'grandfather'], ['mother', 'mother'], ['father', 'father'], ['sister', 'woman'], ['brother', 'man'],
    ['girl', 'girl'], ['boy', 'boy'], ['child', 'child'], ['woman', 'woman'], ['man', 'man'], ['person', 'person'],
    ['we', 'we'], ['they', 'they'], ['you', 'person'], ['he / she', 'person'], ['i', 'person'], ['me', 'person'], ['my', 'person'], ['your', 'person'],
    ['water', 'water'], ['rice', 'rice'], ['food', 'food'], ['eat', 'food'], ['fish', 'fish'], ['salt', 'salt'], ['tea', 'tea'], ['drink', 'drink'], ['money', 'money'],
    ['book', 'book'], ['phone', 'phone'], ['house', 'house'], ['village', 'village'], ['door', 'door'], ['shop', 'shop'], ['store', 'shop'], ['table', 'table'], ['chair', 'chair'], ['bed', 'bed'],
    ['sun', 'sun'], ['moon', 'moon'], ['rain', 'rain'], ['river', 'river'], ['sea', 'sea'], ['boat', 'boat'], ['hill', 'hill'], ['road', 'road'], ['soil', 'soil'], ['earth', 'soil'], ['tree', 'tree'],
    ['come', 'come'], ['go', 'go'], ['sit', 'sit'], ['sleep', 'sleep'], ['see', 'see'], ['say', 'say'], ['give', 'give'], ['take', 'take'], ['took', 'take'], ['want', 'want'], ['know', 'know'], ['work', 'work'],
    ['good', 'good'], ['bad', 'bad'], ['big', 'big'], ['small', 'small'], ['hot', 'hot'], ['cold', 'cold'], ['new', 'new'], ['old', 'old']
  ];
  function keyFor(gloss) {
    const g = String(gloss || '').toLowerCase().replace(/[^a-z\/' ]+/g, ' ').trim();
    const words = g.split(/\s+/);
    if (P[g]) return g;
    for (const [k, v] of MAP) { if (g === k || (k.indexOf(' ') < 0 && words.indexOf(k) >= 0 && words.length <= 3)) return v; }
    return 'speech';
  }
  const art = (gloss) => S(P[keyFor(gloss)] || P.speech);

  /* Dadi, the grandmother who gives the app its name: white hair in a bun, round glasses, a patterned shawl. */
  const dadi = () => '<svg class="art dadi-art" viewBox="0 0 120 120" role="img" aria-label="Dadi, a smiling grandmother with a white bun and round glasses">' +
    '<path class="a" d="M14 120c0-30 18-46 46-46s46 16 46 46z"/>' +
    '<path d="M22 112c10-20 26-28 38-28s28 8 38 28" fill="none" style="stroke:var(--cotton);stroke-width:2.2;stroke-dasharray:5 4;stroke-linecap:round"/>' +
    '<path d="M30 118c8-12 18-18 30-18s22 6 30 18" fill="none" style="stroke:var(--madder);stroke-width:2.2;stroke-dasharray:5 4;stroke-linecap:round"/>' +
    '<circle cx="60" cy="18" r="11" style="fill:#dfe2f1;stroke:var(--ink);stroke-width:2"/>' +
    '<ellipse class="s" cx="60" cy="52" rx="24" ry="27"/>' +
    '<path d="M34 48C32 20 88 20 86 48c-6-14-22-20-26-20s-20 6-26 20z" style="fill:#dfe2f1;stroke:var(--ink);stroke-width:2"/>' +
    '<g fill="none" style="stroke:var(--ink);stroke-width:2.6"><circle cx="49" cy="52" r="7.500"/><circle cx="71" cy="52" r="7.500"/><path d="M56.500 52h7"/></g>' +
    '<g class="k"><circle cx="49" cy="52" r="2.200"/><circle cx="71" cy="52" r="2.200"/></g>' +
    '<path d="M50 66c6 7 14 7 20 0" fill="none" style="stroke:var(--ink);stroke-width:3;stroke-linecap:round"/>' +
    '<path class="b" d="M58 36h4l-2 5z" opacity="0"/>' +
    '<circle cx="40" cy="62" r="4" style="fill:var(--madder);opacity:.25"/><circle cx="80" cy="62" r="4" style="fill:var(--madder);opacity:.25"/>' +
    '</svg>';

  const api = { art, dadi, keyFor, KEYS: Object.keys(P) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiArt = api;
})(typeof self !== 'undefined' ? self : this);
