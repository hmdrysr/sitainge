// Builds website/dadi/data/icons.json: monochrome line icons from Tabler Icons (outline set, MIT) plus a strict word index.
// Tabler gives each icon a name, a category and tags; this script turns them into a word -> icon index and adds a hand-checked map
// (scripts/icon_concepts.js) for the words learners meet first and for every gloss in website/dadi/data/seed.json.
//
// Needs two npm packages once (any folder; point ICON_MODULES at its node_modules, or run from a folder that has one):
//   npm install --no-save @tabler/icons @iconify-json/tabler
// Run from the repository root:   node scripts/build_icons.js            (writes website/dadi/data/icons.json and refreshes the UI block in js/icons.js)
// Options:                        ICON_MODULES=/path/to/node_modules   OUT_DIR=/path/to/website/dadi   node scripts/build_icons.js
// Prints a report; fails (non-zero) if any hand-picked icon name does not exist in the pack.
'use strict';
const fs = require('fs'), path = require('path');
const { HAND, FORMS, NEVER, UI, DENY_WORDS, DENY_ICONS } = require('./icon_concepts.js');
const modDir = process.env.ICON_MODULES || path.join(process.cwd(), 'node_modules');
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(modDir, p), 'utf8'));
const meta = readJSON('@tabler/icons/icons.json');             // name -> { category, tags[], styles }
const iconify = readJSON('@iconify-json/tabler/icons.json');   // icons[name].body (24x24, stroke 2, round caps and joins)
const pkgVersion = readJSON('@tabler/icons/package.json').version;

// ---- 1. Turn each outline icon into path data only (stroke settings are applied once, on the <svg>) ----
const circleToD = (cx, cy, r) => 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0';
function toPaths(body) {
  if (/<(defs|use|rect|ellipse|line|polyline|polygon)\b/.test(body)) return null; // a handful of unusual icons: skipped
  const segs = [];
  for (const m of body.matchAll(/<(path|circle)\b([^>]*)\/>/g)) {
    const a = m[2], get = (k) => { const r = a.match(new RegExp('\\b' + k + '="([^"]*)"')); return r ? r[1] : null; };
    const filled = get('fill') === 'currentColor';
    let d = m[1] === 'path' ? get('d') : circleToD(+get('cx'), +get('cy'), +get('r'));
    if (!d) return null;
    segs.push((filled ? '!' : '') + d);
  }
  return segs.length ? segs.join('|') : null;
}
const names = Object.keys(meta).filter((n) => iconify.icons[n] && meta[n].styles && meta[n].styles.outline);
const paths = {};
for (const n of names) { const p = toPaths(iconify.icons[n].body); if (p) paths[n] = p; }

// ---- 2. Which icons may be found by a word ----
// Left out: logos (brands), letters, zodiac, currencies, developer and database tools and similar categories that would only add wrong matches.
const SKIP_CAT = new Set(['Brand', 'Letters', 'Zodiac', 'Development', 'Version control', 'Extensions', 'Logic', 'Currencies', 'Database', 'Gender', 'Electrical', 'Laundry', 'Math', 'Numbers', 'Shapes', 'Arrows', 'Design', 'Charts']);
const MODS = new Set(('bitcoin bolt cancel check code cog dollar down download upload edit exclamation heart minus off pause pin plus question search share star up x lock filled discount ' +
  'dots dotted alert x-mark filter flip left right top bottom center middle stretch horizontal vertical rotate rotate-2 move spark ai shield-check').split(/\s+/));
const isBase = (n) => paths[n] && !SKIP_CAT.has(meta[n].category) && !/^(brand|letter|zodiac|number|circle|square|hexagon|pentagon|rosette|octagon|triangle|box|dice|play-card)-/.test(n) &&
  !/-(off|2|3|4)$/.test(n) && n.split('-').length <= 3 && !n.split('-').some((t) => MODS.has(t));
// A word may find an icon by itself only when the icon belongs to a category of concrete things. Interface-style icons (system, text, devices, documents...)
// have names such as "bolt", "pin" or "filter" that would mislead on ordinary words, so those are reachable only through the hand-checked list.
const CONCRETE = new Set(['Food', 'Animals', 'Nature', 'Weather', 'Buildings', 'Vehicles', 'Mood', 'Health', 'Sport', 'Gestures', 'Games', 'Map']);
const wordsOk = (w) => /^[a-z]{3,}$/.test(w) && !NEVER.has(w) && !DENY_WORDS.has(w);
const exact = new Map(), tagged = new Map();
function claim(map, w, n, rank) { if (!map.has(w)) map.set(w, []); map.get(w).push({ n, rank }); }
for (const n of names) {
  if (!isBase(n)) continue;
  const toks = n.split('-');
  if (!CONCRETE.has(meta[n].category) || DENY_ICONS.has(n)) continue;
  if (toks.length === 1 && wordsOk(n)) claim(exact, n, n, 0);
  else if (toks.length > 1) { const phrase = toks.join(' '); if (!toks.some((t) => NEVER.has(t))) claim(exact, phrase, n, 0); }
  (meta[n].tags || []).slice(0, 2).forEach((t, i) => { if (wordsOk(t) && t.length >= 4) claim(tagged, t, n, i); });
}
const words = {};
for (const [w, cs] of exact) if (cs.length === 1) words[w] = cs[0].n;                       // exact name: always unique
for (const [w, cs] of tagged) {                                                              // tag match: only if exactly one plain icon claims the word
  if (words[w] || cs.length !== 1) continue;
  words[w] = cs[0].n;
}
// Hand-checked map wins over the index. A word listed in NEVER is removed again unless it is in HAND.
const bad = [];
for (const [w, n] of Object.entries(HAND)) { if (!paths[n]) bad.push(w + ' -> ' + n); else words[w] = n; }
for (const w of Object.keys(words)) if (NEVER.has(w) && !HAND[w]) delete words[w];
const uiMap = {};
for (const [k, n] of Object.entries(UI)) { if (!paths[n]) bad.push('ui:' + k + ' -> ' + n); else uiMap[k] = n; }
if (bad.length) { console.error('Unknown icon names:\n  ' + bad.join('\n  ')); process.exit(1); }

// ---- 3. Keep icons that are findable or used by the interface ----
const keep = new Set([...Object.values(words), ...Object.values(uiMap)]);
if (process.env.ALL_BASE) names.filter(isBase).forEach((n) => keep.add(n));
const icons = {};
for (const n of [...keep].sort()) icons[n] = paths[n];
const out = {
  v: 2,
  source: 'Tabler Icons ' + pkgVersion + ' (outline), MIT licence, Paweł Kuna and contributors; word index from the pack\'s own names and tags; hand-checked words from scripts/icon_concepts.js',
  viewBox: '0 0 24 24', stroke: 1.75, forms: FORMS, ui: uiMap, words, icons
};
const outDir = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : path.resolve(process.cwd(), 'website/dadi');
const file = path.join(outDir, 'data/icons.json');
fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(out));

// ---- 4. Embed the interface icons in js/icons.js so the tab bar never waits for a download ----
const jsFile = path.join(outDir, 'js/icons.js');
if (fs.existsSync(jsFile)) {
  let js = fs.readFileSync(jsFile, 'utf8');
  const block = '/*UI-BEGIN (written by scripts/build_icons.js; do not edit by hand)*/\n  const UI_NAMES = ' + JSON.stringify(uiMap) + ';\n  const UI_PATHS = ' + JSON.stringify(Object.fromEntries([...new Set(Object.values(uiMap))].sort().map((n) => [n, paths[n]]))) + ';\n  /*UI-END*/';
  js = js.replace(/\/\*UI-BEGIN[\s\S]*?\/\*UI-END\*\//, () => block);
  fs.writeFileSync(jsFile, js);
}
console.log('Tabler outline icons in pack:', names.length, '| usable as path data:', Object.keys(paths).length, '| plain (findable) icons:', names.filter(isBase).length);
console.log('Icons written:', Object.keys(icons).length, '| word entries:', Object.keys(words).length, '(hand-checked:', Object.keys(HAND).length + ')', '| UI names:', Object.keys(uiMap).length);
console.log('Bytes:', fs.statSync(file).size, file);
