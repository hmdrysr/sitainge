/* GitHub sign-in (device flow) and issue creation for Dadi (CC0).
   Why device flow: it needs no client secret, so nothing secret lives in this static site or in the relay.
   A GitHub App is used (not an OAuth App) so the token can only do what the App is allowed: create issues in this repository.
   Browsers cannot call github.com/login/* directly (no CORS headers), so a tiny relay forwards two requests; see dadi-worker/. */
(function (root) {
  'use strict';
  const API = 'https://api.github.com';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function create(cfg) {
    const f = cfg.fetch || (typeof fetch !== 'undefined' ? fetch.bind(root) : null);
    const relay = String(cfg.relayUrl || '').replace(/\/+$/, '');
    const configured = !!(cfg.clientId && relay);

    async function post(path, body) {
      const r = await f(relay + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      let j = null; try { j = await r.json(); } catch (e) { /* not JSON */ }
      if (!r.ok && !(j && j.error)) throw new Error('The sign-in helper answered HTTP ' + r.status);
      return j || {};
    }

    async function deviceStart() {
      if (!configured) throw new Error('Sign-in is not set up on this copy of Dadi.');
      const j = await post('/device/code', { client_id: cfg.clientId });
      if (j.error) throw new Error(j.error_description || j.error);
      return { deviceCode: j.device_code, userCode: j.user_code, url: j.verification_uri, interval: j.interval || 5, expiresIn: j.expires_in || 900 };
    }

    /* Resolves with { token } when approved. Rejects on denial, expiry or cancel (signal.aborted). */
    async function devicePoll(dev, signal) {
      let wait = dev.interval; const stop = Date.now() + dev.expiresIn * 1000;
      while (Date.now() < stop) {
        await sleep(wait * 1000);
        if (signal && signal.aborted) throw new Error('cancelled');
        const j = await post('/device/token', { client_id: cfg.clientId, device_code: dev.deviceCode, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' });
        if (j.access_token) return { token: j.access_token, expiresIn: j.expires_in || null };
        if (j.error === 'authorization_pending') continue;
        if (j.error === 'slow_down') { wait = (j.interval || wait + 5); continue; }
        if (j.error === 'expired_token') throw new Error('The code expired. Start again.');
        if (j.error === 'access_denied') throw new Error('Sign-in was cancelled on GitHub.');
        throw new Error(j.error_description || j.error || 'Sign-in failed.');
      }
      throw new Error('The code expired. Start again.');
    }

    const headers = (token) => ({ Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' });

    async function whoami(token) {
      const r = await f(API + '/user', { headers: headers(token) });
      if (r.status === 401) { const e = new Error('Your GitHub sign-in has expired. Please sign in again.'); e.code = 'expired'; throw e; }
      if (!r.ok) return null;
      const j = await r.json(); return { login: j.login, url: j.html_url };
    }

    async function createIssue(token, issue) {
      const r = await f(API + '/repos/' + cfg.repo + '/issues', { method: 'POST', headers: headers(token), body: JSON.stringify({ title: issue.title, body: issue.body }) });
      if (r.status === 401) { const e = new Error('Your GitHub sign-in has expired. Please sign in again. Your contribution is still saved on this device.'); e.code = 'expired'; throw e; }
      if (r.status === 403) { const e = new Error('GitHub refused (limit reached, or the Dadi app is not allowed on this repository). Your contribution is still saved on this device.'); e.code = 'forbidden'; throw e; }
      if (r.status === 404) { const e = new Error('The repository or the Dadi app was not found. Ask the project owner to check the app installation. Your contribution is still saved.'); e.code = 'notfound'; throw e; }
      if (!r.ok) { const e = new Error('GitHub could not take the contribution (HTTP ' + r.status + '). It is still saved on this device.'); e.code = 'http'; throw e; }
      const j = await r.json(); return { number: j.number, url: j.html_url };
    }

    return { configured, deviceStart, devicePoll, whoami, createIssue };
  }

  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiGitHub = api;
})(typeof self !== 'undefined' ? self : this);
