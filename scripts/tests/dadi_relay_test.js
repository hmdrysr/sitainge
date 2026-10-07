// Run from repository root: node scripts/tests/dadi_relay_test.js
const fs = require('fs'), assert = require('assert');
const src = fs.readFileSync('dadi-worker/relay.js', 'utf8').replace('export default', 'module.exports =');
const m = { exports: {} }; new Function('module', 'fetch', 'Response', 'URL', 'URLSearchParams', src)(m, async (u, o) => { calls.push({ u, body: o.body.toString() }); return new Response('{"device_code":"x"}'); }, Response, URL, URLSearchParams);
const calls = [], env = { CLIENT_ID: 'Iv1.abc', ALLOWED_ORIGIN: 'https://o.example' };
const req = (path, o) => new Request('https://r.example' + path, { method: 'POST', headers: { Origin: 'https://o.example', 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
(async () => {
  let r = await m.exports.fetch(req('/device/code', { client_id: 'Iv1.abc' }), env);
  assert.equal(r.status, 200); assert.equal(r.headers.get('access-control-allow-origin'), 'https://o.example');
  assert.equal(calls[0].u, 'https://github.com/login/device/code');
  r = await m.exports.fetch(req('/device/token', { client_id: 'Iv1.abc', device_code: 'dc' }), env);
  assert.ok(calls[1].body.includes('grant_type') && calls[1].body.includes('device_code=dc'));
  r = await m.exports.fetch(req('/device/code', { client_id: 'other' }), env); assert.equal(r.status, 403);
  r = await m.exports.fetch(req('/evil', { client_id: 'Iv1.abc' }), env); assert.equal(r.status, 404);
  r = await m.exports.fetch(new Request('https://r.example/device/code', { method: 'POST', headers: { Origin: 'https://bad.example' }, body: '{}' }), env); assert.equal(r.status, 403);
  console.log('relay ok');
})().catch((e) => { console.error(e); process.exit(1); });
