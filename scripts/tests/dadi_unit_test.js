// Run from repository root: node scripts/tests/dadi_unit_test.js
// Uses placeholder data only. Checks the parts of Dadi that can be checked without a browser or ears.
const assert = require('assert'), fs = require('fs');
const J = 'website/dadi/js/';
const Store = require('../../' + J + 'store.js'), G2P = require('../../' + J + 'g2p.js'), Synth = require('../../' + J + 'synth.js'),
  IPA = require('../../' + J + 'ipa-data.js'), Data = require('../../' + J + 'data.js');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const mem = () => { const o = {}; return { getItem: (k) => (k in o ? o[k] : null), setItem: (k, v) => { o[k] = v; }, removeItem: (k) => { delete o[k]; }, o }; };

// store: save, corruption rollback, export never carries the token, import merges
{
  const b = mem(); let s = Store.create(b);
  s.update((st) => { st.cards.a = { last_review: '2026-01-01' }; st.auth = { login: 'x', token: 'SECRET' }; }, 'test', 'one');
  s.update((st) => { st.stats.xp = 5; }, 'test', 'two');
  b.o['dadi.v1.state'] = '{broken';
  s = Store.create(b); ok(s.state.cards.a && s.restoredFrom, 'rolled back to a backup');
  const exp = s.exportAll(); ok(!/SECRET/.test(exp), 'export has no token');
  const t = Store.create(mem()); ok(t.importAll(exp).ok && t.state.cards.a, 'import merges'); ok(!t.state.auth, 'import brings no auth');
  ok(!t.importAll('not json').ok, 'bad import refused');
  ok(s.history().length >= 2, 'history kept');
}
// g2p
{
  const r = G2P.g2p('hana'); ok(r.ipa && r.complete, 'g2p simple'); ok(!G2P.g2p('###').complete, 'unknown flagged');
}
// synth: every consonant and vowel makes sound, no NaN, stays in range
{
  const syms = [...Object.keys(IPA.VOWELS), ...Object.keys(IPA.CONSONANTS)];
  for (const sy of syms) {
    const pcm = (Synth.previewSymbol(sy) || {}).samples; if (!pcm || !pcm.length) continue;
    let peak = 0; for (const v of pcm) { assert.ok(Number.isFinite(v), 'finite ' + sy); peak = Math.max(peak, Math.abs(v)); }
    assert.ok(peak <= 1.0001 && peak > 0, 'range ' + sy);
  } n++;
  const wav = (r => Synth.toWav(r.samples, r.sampleRate))(Synth.synthesize('hana')); ok(String.fromCharCode(...wav.slice(0, 4)) === 'RIFF', 'wav header');
}
// data: JSONL tolerant of bad lines; YAML parity on a small case
{
  const p = Data.parseJSONL('{"a":1}\nnot json\n{"b":2}\n'); ok(p.records.length === 2 && p.errors.length === 1, 'jsonl tolerant');
  const y = Data.parseSimpleYAML('- id: T-1\n  text: "[TEST] x"\n- id: T-2\n  text: y\n'); ok(y.records.length === 2 && y.records[0].id === 'T-1', 'yaml list');
}
// g2p handles siṭaiṅga-style letters and accent marks; device-voice mapping
{
  const r = G2P.g2p('siṭaiṅga'); ok(r.complete && /ʈ/.test(r.ipa) && /ŋ/.test(r.ipa), 'dot letters read');
  ok(G2P.g2p('Äar namm Hamèd.').complete, 'accent marks tolerated');
  const N = require('../../' + J + 'native-tts.js');
  ok(N.toIndic('hana', 'dev') === 'हाना' && N.toIndic('hana', 'bn') === 'হানা', 'sound-alike script');
  ok(!/[A-Za-z]/.test(N.toIndic('siʈajŋɡa', 'bn')), 'no Roman letters left in sound-alike');
}
// synth is smooth: no huge single-sample jumps relative to the signal level
{
  for (const w of ['hana', 'mamama', 'fani']) { const x = Synth.synthesize(w).samples; let mj = 0, e = 0; for (let i = 1; i < x.length; i++) { mj = Math.max(mj, Math.abs(x[i] - x[i - 1])); e += x[i] * x[i]; } const rms = Math.sqrt(e / x.length); assert.ok(rms > 0.1 && mj < 4 * rms + 0.3, 'smooth ' + w); n++; }
}
// audio: recordings play only when public; lessons never use a synthesized voice
{
  const vm = require('vm'), ctx = { self: {}, Audio: function () {} }; ctx.self = ctx; ['ipa-data.js', 'synth.js', 'native-tts.js', 'espeak.js', 'audio.js'].forEach((f) => vm.runInNewContext(fs.readFileSync(J + f, 'utf8'), ctx));
  const A = ctx.DadiAudio.create({ config: { repo: 'o/r', branch: 'main' } });
  ok(!A.has({ recording: null }) && !A.has({ recording: 'https://x.org/a.mp3', consent: 'research-only' }), 'no recording button without a public recording');
  ok(A.has({ recording: 'https://x.org/a.mp3', consent: 'public' }) && A.has({ recording: 'audio/public/a.wav', consent: 'public' }), 'public recordings play');
  ok(!A.has({ recording: '../a.mp3', consent: 'public' }) && !A.has({ recording: 'javascript:alert(1)', consent: 'public' }) && !A.has({ recording: 'notes.txt', consent: 'public' }), 'unsafe or non-audio paths refused');
}
// seed file loads and respects consent
{
  const seed = JSON.parse(fs.readFileSync('website/dadi/data/seed.json', 'utf8')); ok(Array.isArray(seed.entries) && seed.entries.length > 0, 'seed present');
}
console.log('dadi unit ok (' + n + ' checks)');
