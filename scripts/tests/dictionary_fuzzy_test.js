// Run from repository root: node scripts/tests/dictionary_fuzzy_test.js
// Checks the dictionary's fuzzy search module with placeholder entries (and the bundled seed when present).
const assert = require('assert'), fs = require('fs');
const F = require('../../website/dictionary/fuzzy.js');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const eq = (a, b, m) => { assert.strictEqual(a, b, m); n++; };

// normalization
eq(F.normalize('Śiṭaiṅga'), 'sitainga', 'marks removed');
eq(F.normalize('  Hamèd!  '), 'hamed', 'punctuation and case');
eq(F.normalize('koɡil'), 'kogil', 'IPA letters folded');
eq(F.normalize('bɔʒ∧'), 'boja', 'IPA schwa-like letters folded');
eq(F.skeleton(F.normalize('shobdo')), F.skeleton(F.normalize('sobdo')), 'sh and s are loose equals');
eq(F.skeleton('panni'), F.skeleton('fani'), 'ph/f/p and doubled letters collapse');
eq(F.skeleton('whater'), F.skeleton('water'), 'consonant + h dropped');

// edit distance
eq(F.dl('water', 'water', 2), 0); eq(F.dl('water', 'wather', 2), 1); eq(F.dl('abcd', 'abdc', 2), 1, 'transposition is one edit');
eq(F.dl('abc', 'xyz', 1), 2, 'exceeds the limit: max + 1'); eq(F.dl('', 'ab', 3), 2);
eq(F.tolerance(3), 0); eq(F.tolerance(5), 1); eq(F.tolerance(7), 2); eq(F.tolerance(12), 3);

// ranking
const E = (id, form, gloss, extra) => Object.assign({ id: id, kind: 'word', form: form, spellings: [form], gloss: gloss, ipa: null }, extra || {});
const sample = [
  E('1', 'fani', 'water'), E('2', 'pani ghor', 'water house'), E('3', 'matha', 'head'), E('4', 'mathar', 'of the head'), E('5', 'hamid', 'Hamid'),
  E('6', 'gaśa', 'tree, plant'), E('7', 'shapla', 'water lily'), E('8', 'xwater', 'bad entry'), E('9', 'koɡil', 'cuckoo', { ipa: 'koɡil' }),
  E('10', 'ayu', 'My name is Hamid', { kind: 'sentence', spellings: ['ayu namm Hamed', 'Äar namm Hamèd.'] })
];
const ix = F.create(sample);
const ids = (q, o) => ix.search(q, o).list.map((h) => h.e.id);
eq(ids('water')[0], '1', 'exact gloss first');
ok(ids('water').indexOf('2') < ids('water').indexOf('8'), 'word prefix before substring');
eq(ids('wat')[0], '1', 'prefix before others');
ok(ids('water').indexOf('8') > ids('water').indexOf('7'), 'substring last among plain matches');
eq(ids('panni')[0], '1', 'typo panni finds fani (loose match)');
eq(ids('pani')[0], '2', 'prefix of a form outranks a loose match');
ok(ids('pani').indexOf('1') >= 0, 'pani also reaches fani');
eq(ids('whater')[0], '1', 'whater finds water');
eq(ids('wtaer')[0], '1', 'transposition within tolerance');
ok(ids('mathe').indexOf('3') >= 0 && ids('mathe').indexOf('4') >= 0, 'mathe finds matha and mathar');
eq(ids('Gasa')[0], '6', 'diacritic-insensitive');
eq(ids('kogil')[0], '9', 'IPA letters match Latin letters');
ok(ids('xyzzyq').length === 0, 'no match returns nothing');
ok(ids('my name is hamed').indexOf('10') >= 0, 'sentence search with a typo');
eq(ids('name hamid')[0], '10', 'several words in any order');
ok(ids('water', { filter: (e) => e.id !== '1' }).indexOf('1') < 0, 'filter applies');
ok(ix.search('xwatr').fuzzy === true, 'fuzzy flag set when edit distance was needed');
ok(ix.search('water').fuzzy === false || ix.search('water').list.length >= 1, 'results exist for water');
eq(ix.suggest('whatter'), 'water', 'did you mean');
eq(ix.suggest('fani'), null, 'known word needs no suggestion');
eq(ix.suggest(''), null);
eq(ix.search('').list.length, 0, 'empty query returns nothing');
eq(ix.search('a').list.length >= 0, true, 'one-letter query works');

// speed with about 2,900 entries (synthetic, then the real seed if present)
function speed(entries, queries, label) {
  const t0 = Date.now(), big = F.create(entries), build = Date.now() - t0;
  let worst = 0;
  queries.forEach((q) => { const s = process.hrtime.bigint(); big.search(q); big.suggest(q); const ms = Number(process.hrtime.bigint() - s) / 1e6; if (ms > worst) worst = ms; });
  ok(worst < 30, label + ': worst query ' + worst.toFixed(1) + ' ms (limit 30)');
  ok(build < 1500, label + ': index built in ' + build + ' ms');
}
{
  const syl = ['ka', 'ma', 'ni', 'sho', 'pa', 'ra', 'ta', 'bo', 'gi', 'dha', 'le', 'ku'], syn = [];
  for (let i = 0; i < 2900; i++) { let w = ''; for (let k = 0, x = i + 7; k < 3 + (i % 3); k++, x = (x * 31 + 11) % 997) w += syl[x % syl.length]; syn.push(E('S' + i, w, 'thing number ' + (i % 290) + ' word', { ipa: w })); }
  speed(syn, ['a', 'ka', 'kama', 'zzzzz', 'kamaa', 'thing number 12', 'shoro', 'thign', 'xxxxxxxx'], 'synthetic');
}
const seed = __dirname + '/../../website/dadi/data/seed.json';
if (fs.existsSync(seed)) {
  const d = JSON.parse(fs.readFileSync(seed, 'utf8')).entries;
  speed(d, ['a', 'pa', 'panni', 'pani', 'mathe', 'whater', 'my name is', 'father drinks coconut water', 'zzzzz', 'ma', 'fan', 'chokhot'], 'seed (' + d.length + ' entries)');
  const real = F.create(d), r = real.search('panni').list.map((h) => h.e.form);
  ok(r.indexOf('fani') >= 0 && r.indexOf('fani') < 5, 'seed: panni reaches fani near the top');
  ok(real.search('water').list[0].e.gloss.toLowerCase() === 'water', 'seed: water ranks the word water first');
}
console.log('dictionary fuzzy tests passed (' + n + ' checks)');
