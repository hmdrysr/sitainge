// Run from repository root: node scripts/tests/dadi_learn_test.js
// Checks answer matching, units, the session builder and the additive store changes.
const assert = require('assert'), fs = require('fs');
const J = 'website/dadi/js/';
const L = require('../../' + J + 'learn.js'), Store = require('../../' + J + 'store.js'), Srs = require('../../' + J + 'srs.js');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const mem = () => { const o = {}; return { getItem: (k) => (k in o ? o[k] : null), setItem: (k, v) => { o[k] = v; }, removeItem: (k) => { delete o[k]; }, o }; };
const E = (id, form, gloss, sp) => ({ id, kind: 'word', form, spellings: sp || [form], gloss });

// answer matching: exact, case, accents, attested alternates, same-gloss entries, near misses
{
  const good = E('a', 'Gômm', 'good'), bro = E('b', 'Badda / By', 'brother', ['Badda / By', 'Badda', 'By']);
  ok(L.matchAnswer('Gômm', good).result === 'exact', 'exact');
  ok(L.matchAnswer('gomm', good).result === 'folded' && L.matchAnswer('GÔMM', good).correct, 'accents and case folded');
  ok(L.matchAnswer('  gomm  ', good).correct, 'spaces trimmed');
  ok(L.matchAnswer('Badda', bro).result === 'alt' && L.matchAnswer('by', bro).correct, 'every attested spelling accepted');
  ok(L.matchAnswer('badda/by', bro).correct, 'slash form accepted');
  ok(L.matchAnswer('dain', E('d', 'dain (mikka)', 'right')).correct, 'bracketed part optional');
  ok(L.matchAnswer('dain mikka', E('d', 'dain (mikka)', 'right')).correct, 'bracket marks optional');
  ok(L.matchAnswer('ai gom asi', E('p', 'Ãi gom asi.', 'I am fine')).correct, 'final punctuation and accents ignored');
  const i1 = E('x', 'Äy', 'I'), i2 = E('y', 'aiye', 'I', ['aiye', 'aiyé']);
  const a = L.matchAnswer('aiye', i1, [i1, i2]); ok(a.result === 'also' && a.correct, 'spelling of another entry with the same gloss is also correct');
  ok(!L.matchAnswer('aiye', i1).correct, 'no pool, no same-gloss match');
  ok(L.matchAnswer('gom', good).result === 'near' && !L.matchAnswer('gom', good).correct, 'near miss is not accepted');
  ok(L.matchAnswer('xyz', good).result === 'none' && !L.matchAnswer('xyz', good).correct, 'unattested is not accepted');
  ok(L.matchAnswer('   ', good).result === 'empty' && !L.matchAnswer('!!!', good).correct, 'empty input');
  ok(L.matchAnswer('siṭaiṅga', E('s', 'siṭaiṅga', 'x')).correct && L.matchAnswer('sitainga', E('s', 'siṭaiṅga', 'x')).result === 'folded', 'dots under and over letters fold');
  ok(L.hasBlank(E('z', 'Añi ______', 'I\'m ______.')) && !L.canType(E('z', 'Añi ______', 'x')), 'blank templates are not typed');
}
// graphemes, tiles, rating
{
  ok(L.graphemes('Gômm').length === 4 && L.graphemes('siṭaiṅga').length === 8, 'graphemes keep marks');
  const e = E('a', 'hana', 'food'), pool = [e, E('b', 'bat', 'rice'), E('c', 'ar', 'and')];
  const t = L.buildTiles(e, pool, () => 0.3); ok(t.parts.join('') === 'hana' && t.tiles.length >= 4 && t.tiles.length <= 6, 'tiles: parts plus up to two decoys');
  ok(L.ratingFor({ correct: true, attempts: 1, hint: false }) === 'good' && L.ratingFor({ correct: true, attempts: 2, hint: true }) === 'hard' && L.ratingFor({ correct: false, attempts: 2 }) === 'again', 'rating');
  ok(L.verification({}).label === 'Unverified' && L.verification({ verification: 'one_speaker' }).label === 'Checked by one speaker', 'verification label comes from the entry only');
}
// units and session builder on the real theme file and seed
{
  const seed = JSON.parse(fs.readFileSync('website/dadi/data/seed.json', 'utf8')), themes = JSON.parse(fs.readFileSync('website/data/themes.json', 'utf8'));
  const byId = new Map(seed.entries.map((e) => [e.id, e]));
  const units = L.buildUnits(themes, byId);
  ok(units.length >= 15 && units.every((u) => u.items.length >= 1), 'units built');
  const all = units.flatMap((u) => u.items); ok(new Set(all).size === all.length, 'no entry in two units');
  ok(themes.frequency_rank_source === 'hand-set' && themes.units.every((u) => u.items.every((i) => i.frequency_rank > 0)), 'hand-set rank recorded');
  ok(units.filter((u) => u.items.length >= 8 && u.items.length <= 12).length >= 12, 'most units have 8 to 12 items');
  const u2 = L.buildUnits({ units: [{ id: 'q', title: 'Q', items: [{ id: 'missing', frequency_rank: 1 }] }] }, byId); ok(u2.length === 0, 'missing entries are dropped');
  const now = new Date('2026-10-08T12:00:00Z');
  let s = L.buildSession({ now, cards: {}, items: {}, units, byId });
  ok(s.fresh.length === 5 && s.reviews.length === 0 && s.unitId === units[0].id, 'first session: 5 new items from the first unit');
  ok(s.fresh.every((id) => units[0].items.includes(id)), 'new items are from one unit');
  const cards = {}; for (let i = 0; i < 30; i++) cards[all[i]] = Srs.review(null, 'good', new Date('2026-09-01T00:00:00Z'));
  s = L.buildSession({ now, cards, items: {}, units, byId }); ok(s.paused && s.fresh.length === 0 && s.reviews.length === 12 && s.dueTotal === 30, 'more than 25 due: new items pause, reviews capped');
  const few = {}; for (let i = 0; i < 4; i++) few[all[i]] = Srs.review(null, 'good', new Date('2026-09-01T00:00:00Z'));
  s = L.buildSession({ now, cards: few, items: { [all[0]]: { suspended: true } }, units, byId });
  ok(s.reviews.length === 3 && !s.reviews.includes(all[0]) && s.fresh.length === 5, 'paused items left out; reviews and new items together');
  const steps = L.planSteps(s, { rng: () => 0.9 });
  ok(steps.slice(0, 3).every((x) => x.t === 'review') && steps.filter((x) => x.t === 'delayed').length === 5, 'reviews first, each new item tested again later');
  const firstPrev = steps.findIndex((x) => x.t === 'preview'), lastDelayed = steps.map((x) => x.t).lastIndexOf('delayed'); ok(firstPrev < lastDelayed, 'preview before delayed retrieval');
  const k = L.planSteps(s, { known: { [s.fresh[0]]: true } }); ok(!k.some((x) => x.t === 'preview' && x.id === s.fresh[0]), 'known items skip the preview');
  const done = {}; units[0].items.forEach((id) => { done[id] = { days: ['2026-10-01', '2026-10-03'] }; });
  ok(L.unitProgress(units[0], done, {}).done && L.recommendedUnit(units, done, {}).id === units[1].id, 'unit gate: 80% recalled on two days');
  const wk = L.weekRecall([['a', '2026-10-07T10:00:00Z', 'type', 1, 's', 0, 'good', 2], ['b', '2026-10-07T10:00:00Z', 'type', 0, 's', 0, 'again', 1], ['c', '2026-10-07T10:00:00Z', 'meaning', 1, 's', 0, '', ''], ['d', '2026-09-01T10:00:00Z', 'type', 1, 's', 0, 'good', 2]], now);
  ok(wk.reviewed === 2 && wk.remembered === 1, 'weekly recall counts graded rows from the last 7 days');
}
// scheduler settings
{
  ok(Srs.settings.retention === 0.9 && Srs.settings.maximumInterval === 180, 'FSRS settings');
  let c = null, mx = 0; for (let i = 0; i < 14; i++) { const now = new Date(c ? c.due : '2026-01-01T00:00:00Z'); c = Srs.review(c, 'easy', now); mx = Math.max(mx, (new Date(c.due) - now) / 864e5); }
  ok(mx <= 180, 'interval never above 180 days');
  let l = null; for (let i = 0; i < 8; i++) { for (let k = 0; k < 3; k++) l = Srs.review(l, 'good', new Date(l ? l.due : '2026-01-01T00:00:00Z')); l = Srs.review(l, 'again', new Date(l.due)); } ok(Srs.isLeech(l), 'leech after 6 lapses');
}
// store: additive migration, review log, export and import of learning data
{
  const b = mem(); b.o['dadi.v1.state'] = null;
  const old = Store.blank(); delete old.learn; const packed = JSON.stringify(old);
  b.o['dadi.v1.state'] = JSON.stringify({ t: 'x', sum: Store.fnv(packed), data: packed });
  let s = Store.create(b); ok(s.state.learn && Array.isArray(s.state.learn.notes) && s.state.cards, 'older saved state gains learning data without loss');
  s.update((st) => { st.learn.notes.push({ id: 'n1', entryId: 'a', text: 'x' }); st.learn.items.a = { days: ['2026-10-01'], seen: '2026-10-01' }; }, 'test', 'n');
  s.logReview(['a', '2026-10-01T00:00:00Z', 'type', 1, 's', 0, 'good', 2]);
  const exp = s.exportAll(); ok(JSON.parse(exp).reviews.length === 1, 'export has the review log');
  const t = Store.create(mem()); t.update((st) => { st.learn.items.a = { days: ['2026-10-02'], seen: '2026-10-02' }; }, 'test', 'm');
  ok(t.importAll(exp).ok, 'import ok'); ok(t.state.learn.notes.length === 1 && t.state.learn.items.a.days.length === 2 && t.reviews().length === 1, 'import merges notes, days and reviews');
  t.importAll(exp); ok(t.state.learn.notes.length === 1 && t.reviews().length === 1, 'importing twice adds nothing');
}
console.log('dadi learn ok (' + n + ' checks)');
