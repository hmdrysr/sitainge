/* Dadi sign-in relay (CC0). Cloudflare Worker, also runs on Deno Deploy / any fetch-style runtime.
   Why it exists: browsers cannot call github.com/login/device/* directly (no CORS headers).
   What it does: forwards exactly two requests and adds CORS headers. It holds NO secret.
   Settings (plain variables, not secrets):
     CLIENT_ID       the GitHub App's Client ID (only this id is forwarded)
     ALLOWED_ORIGIN  e.g. https://hmdrysr.github.io  (no trailing slash) */
const TARGETS = {
  '/device/code': 'https://github.com/login/device/code',
  '/device/token': 'https://github.com/login/oauth/access_token',
};
const GRANT = 'urn:ietf:params:oauth:grant-type:device_code';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '';
    const cors = {
      'Access-Control-Allow-Origin': origin && origin === allowed ? allowed : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const json = (obj, status) => new Response(JSON.stringify(obj), { status: status || 200, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    if (!origin || origin !== allowed) return json({ error: 'origin_not_allowed' }, 403);

    const path = new URL(request.url).pathname.replace(/\/+$/, '');
    const target = TARGETS[path];
    if (!target) return json({ error: 'not_found' }, 404);

    let body; try { body = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
    if (!env.CLIENT_ID || body.client_id !== env.CLIENT_ID) return json({ error: 'wrong_client' }, 403);

    const form = new URLSearchParams({ client_id: env.CLIENT_ID });
    if (path === '/device/token') {
      if (typeof body.device_code !== 'string' || body.device_code.length > 200) return json({ error: 'bad_request' }, 400);
      form.set('device_code', body.device_code);
      form.set('grant_type', GRANT);
    }
    const r = await fetch(target, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
    const text = await r.text();
    return new Response(text, { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
