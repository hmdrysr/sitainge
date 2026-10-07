// Tests for the Dadi translator, AI prompt and keyboard helpers (run: node scripts/tests/dadi_translate_test.js)
const assert = require('assert');
const T = require('../../website/dadi/js/translate.js'), AI = require('../../website/dadi/js/ai.js'), K = require('../../website/dadi/js/keyboard.js');
const entries = [
  { id: 'A1', gloss: 'water', form: 'pani', spellings: ['pani'], level: 'unassessed', state: 'RAW' },
  { id: 'A2', gloss: 'to go', form: 'zai', spellings: ['zai'], level: 'B', state: 'REVIEW' },
  { id: 'A3', gloss: 'go', form: 'zaa', spellings: ['zaa'], level: 'unassessed', state: 'RAW' },
  { id: 'A4', gloss: 'my name is Hamid.', form: 'Aar nam Hamid.', spellings: ['Aar nam Hamid.'], level: 'unassessed', state: 'RAW' },
  { id: 'A5', gloss: 'old', form: 'purana', spellings: ['purana'], level: 'unassessed', state: 'ARCHIVED' }
];
const G = T.load(T.makeGlossary(entries));
let r = T.translate('Water, please.', G);
assert.strictEqual(T.plain(r), 'pani, please.'); assert.strictEqual(r.hits, 1); assert.strictEqual(r.words, 2);
r = T.translate('Let us go', G); assert.ok(/zai/.test(T.plain(r)), 'better evidence wins when two entries share a meaning');
r = T.translate('My name is Hamid.', G); assert.strictEqual(T.plain(r), 'Aar nam Hamid.', 'longest phrase wins and the full stop is not doubled');
r = T.translate('The old waters', G); assert.ok(/old/.test(T.plain(r)) && /pani/.test(T.plain(r)), 'archived entries are not used; simple plurals match');
r = T.translate('', G); assert.strictEqual(r.words, 0); assert.strictEqual(r.coverage, 0);
const p = AI.buildPrompt('water', T.translate('water', G).parts.filter((x) => x.t === 'hit'), {});
assert.ok(/Use only the words/.test(p) && /water = pani/.test(p) && /Do not use Bengali script/.test(p));
assert.strictEqual(AI.ready({ kind: 'copy' }), false); assert.strictEqual(AI.ready({ kind: 'anthropic', model: 'm', key: 'k' }), true); assert.strictEqual(AI.ready({ kind: 'openai', endpoint: 'x', model: 'm', key: '' }), false);
assert.deepStrictEqual(K.lastGrapheme('abtʰ', 4), { text: 'tʰ', start: 2 });
console.log('translate/ai/keyboard tests passed');
