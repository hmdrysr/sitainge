// Builds website/dadi/data/icons.json: Fluent Emoji (Flat) pictures (MIT, Microsoft) plus a word index made from the
// Unicode CLDR names and keywords shipped in emojibase-data (MIT). Used by Dadi and the dictionary to give most words a picture.
// Needs the two npm packages once:  npm install --no-save @iconify-json/fluent-emoji-flat emojibase-data
// Run from the repository root:     node scripts/build_icons.js
const fs = require('fs'), path = require('path');
const req = (p) => { try { return require(p); } catch (e) { return require(path.join(process.cwd(), 'node_modules', p)); } };
const flat = req('@iconify-json/fluent-emoji-flat/icons.json'), emoji = req('emojibase-data/en/data.json');
const slug = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const GROUP_RANK = { 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 2, 1: 3, 0: 4, 2: 5, 9: 6 }; // food, animals/nature, objects, people, places before symbols; flags excluded
const have = flat.icons, w = 32;
const words = new Map(), used = new Set();
const stop = new Set(['left', 'right', 'up', 'down', 'top', 'bottom', 'back', 'front', 'tilted', 'the', 'of', 'and', 'with', 'face', 'sign', 'symbol', 'button', 'mark', 'in', 'on', 'a', 'to']);
function offer(word, e, weight) {
  word = word.toLowerCase().replace(/[^a-z' ]/g, '').trim(); if (!word || stop.has(word) || word.length < 2) return;
  const score = weight * 10 - (GROUP_RANK[e.group] || 9);
  const cur = words.get(word); if (!cur || score > cur.score) words.set(word, { score, slug: e.slug });
}
for (const e of emoji) {
  if (e.group === 9 || e.skins || (e.tone && e.tone.length)) continue; // skip flags and skin-tone variants
  const s = slug(e.label); if (!have[s] && !(flat.aliases && flat.aliases[s])) continue;
  e.slug = flat.aliases && flat.aliases[s] ? flat.aliases[s].parent : s; if (!have[e.slug]) continue;
  const label = e.label.toLowerCase();
  // Pictures must not mislead: no faces or symbols by keyword, and only food, animals and plants by label word.
  if (e.group === 0 || e.group === 8) continue;
  offer(label, e, 5); if (e.group === 3 || e.group === 4) label.split(/\s+/).forEach((x) => offer(x, e, 3));
  (e.tags || []).forEach((t) => offer(t, e, 2));
}
// Hand-checked words learners meet first. Each one points at a plainly matching picture.
const HAND = { mother: 'woman', father: 'man', grandmother: 'older-woman', grandfather: 'older-man', child: 'child', boy: 'boy', girl: 'girl', baby: 'baby', person: 'person', people: 'busts-in-silhouette', friend: 'handshake', family: 'family', home: 'house', house: 'house', food: 'pot-of-food', rice: 'cooked-rice', water: 'droplet', fish: 'fish', tea: 'teacup-without-handle', eat: 'fork-and-knife-with-plate', drink: 'cup-with-straw', sleep: 'sleeping-face', go: 'person-walking', come: 'waving-hand', walk: 'person-walking', run: 'person-running', see: 'eyes', look: 'eyes', hear: 'ear', speak: 'speaking-head', say: 'speech-balloon', talk: 'speech-balloon', love: 'red-heart', good: 'thumbs-up', bad: 'thumbs-down', yes: 'check-mark-button', no: 'cross-mark', hello: 'waving-hand', thanks: 'folded-hands', thank: 'folded-hands', please: 'folded-hands', sorry: 'folded-hands', money: 'money-bag', book: 'books', school: 'school', work: 'briefcase', job: 'briefcase', shop: 'shopping-cart', store: 'convenience-store', market: 'shopping-cart', sun: 'sun', moon: 'crescent-moon', rain: 'cloud-with-rain', river: 'water-wave', sea: 'water-wave', boat: 'sailboat', ship: 'passenger-ship', road: 'motorway', bus: 'bus', train: 'locomotive', time: 'alarm-clock', day: 'sun', night: 'crescent-moon', hot: 'hot-face', cold: 'cold-face', new: 'sparkles', old: 'older-person', one: 'keycap-1', two: 'keycap-2', three: 'keycap-3', four: 'keycap-4', five: 'keycap-5', six: 'keycap-6', seven: 'keycap-7', eight: 'keycap-8', nine: 'keycap-9', ten: 'keycap-10', zero: 'keycap-0', red: 'red-circle', blue: 'blue-circle', green: 'green-circle', yellow: 'yellow-circle', black: 'black-circle', white: 'white-circle', hand: 'raised-hand', eye: 'eye', ear: 'ear', mouth: 'mouth', nose: 'nose', name: 'name-badge', hospital: 'hospital', doctor: 'health-worker', police: 'police-officer', tree: 'deciduous-tree', flower: 'blossom', bird: 'bird', cow: 'cow-face', dog: 'dog-face', cat: 'cat-face', goat: 'goat', chicken: 'chicken', egg: 'egg', milk: 'glass-of-milk', bread: 'bread', fruit: 'red-apple', mango: 'mango', banana: 'banana', salt: 'salt', phone: 'mobile-phone' };
for (const [k, v] of Object.entries(HAND)) { if (have[v]) words.set(k, { score: 99, slug: v }); }
const index = {}, set = {};
for (const [k, v] of words) { if (v.score < 12 && !have[v.slug]) continue; index[k] = v.slug; used.add(v.slug); }
for (const s of used) { const ic = have[s]; set[s] = ic.body; }
const out = { v: 1, source: 'Fluent Emoji (Flat), Microsoft, MIT licence; word index from Unicode CLDR via emojibase-data, MIT', viewBox: '0 0 ' + w + ' ' + w, words: index, icons: set };
const file = path.resolve(process.cwd(), 'website/dadi/data/icons.json');
fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(out));
console.log('icons:', Object.keys(set).length, 'words:', Object.keys(index).length, 'bytes:', fs.statSync(file).size);
