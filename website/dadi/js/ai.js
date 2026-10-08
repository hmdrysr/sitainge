/* Dadi: connect your own AI (CC0). Nothing here is required. Your key stays in this browser only: it is stored under its
   own key, never in the progress store, never in backups or exports, and it is only ever sent to the address you choose.
   AI output is always labelled an unverified draft. The prompt tells the AI to use only the project's own words. */
(function (root) {
  'use strict';
  const KEY = 'dadi.ai';
  const KINDS = {
    copy: { label: 'No connection (copy a prompt)', needs: [] },
    openai: { label: 'OpenAI-compatible (OpenAI, OpenRouter, LM Studio, and others)', needs: ['endpoint', 'model', 'key'], endpoint: 'https://openrouter.ai/api/v1' },
    anthropic: { label: 'Anthropic (Claude)', needs: ['model', 'key'], endpoint: 'https://api.anthropic.com' },
    ollama: { label: 'Ollama on this device or network', needs: ['endpoint', 'model'], endpoint: 'http://localhost:11434' }
  };
  const store = () => { try { return root.localStorage; } catch (e) { return null; } };
  function load() { const s = store(); try { return Object.assign({ kind: 'copy', endpoint: '', model: '', key: '' }, JSON.parse((s && s.getItem(KEY)) || '{}')); } catch (e) { return { kind: 'copy', endpoint: '', model: '', key: '' }; } }
  function save(c) { const s = store(); if (s) s.setItem(KEY, JSON.stringify(c)); }
  function forget() { const s = store(); if (s) s.removeItem(KEY); }
  const ready = (c) => c.kind !== 'copy' && KINDS[c.kind] && KINDS[c.kind].needs.every((k) => (c[k] || '').trim());

  /* The prompt: short, grounded, honest. Only the glossary lines that matter for this text are included (saves tokens). */
  function buildPrompt(text, hits, opts) {
    const lines = (hits || []).slice(0, 80).map((h) => '- ' + String(h.s || h.src).toLowerCase() + ' = ' + h.out + ' (' + h.level + ')').join('\n') || '(no matches)';
    return [
      'You are helping with siṭaiṅga, the Chittagonian language, written in Roman letters (Latin script). Follow these rules exactly.',
      '1. Use only the words in the dictionary list below. Do not invent words, spellings or grammar.',
      '2. If a meaning is not in the list, keep the English word in [square brackets].',
      '3. Do not use Bengali script. Do not claim any result is correct.',
      '4. Start your answer with "Draft, unverified." and end with a short list of the words you could not translate.',
      opts && opts.explain ? '5. After the draft, explain in one line each how you used the dictionary words.' : '',
      '', 'Dictionary (English = siṭaiṅga, evidence level):', lines, '', 'Text to translate:', String(text || '').trim()
    ].filter((x) => x !== '').join('\n');
  }

  async function ask(cfg, prompt, signal) {
    const k = KINDS[cfg.kind]; if (!k || cfg.kind === 'copy') throw new Error('Connect an AI service first, or copy the prompt.');
    const base = (cfg.endpoint || k.endpoint).replace(/\/+$/, '');
    let url, headers = { 'content-type': 'application/json' }, body;
    if (cfg.kind === 'anthropic') {
      url = base + '/v1/messages'; headers['x-api-key'] = cfg.key; headers['anthropic-version'] = '2023-06-01'; headers['anthropic-dangerous-direct-browser-access'] = 'true';
      body = { model: cfg.model, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] };
    } else if (cfg.kind === 'ollama') { url = base + '/api/chat'; body = { model: cfg.model, stream: false, messages: [{ role: 'user', content: prompt }] }; }
    else { url = base + '/chat/completions'; if (cfg.key) headers.authorization = 'Bearer ' + cfg.key; body = { model: cfg.model, messages: [{ role: 'user', content: prompt }] }; }
    let r; try { r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal }); } catch (e) { throw new Error('Could not reach ' + base + '. Check the address and your connection' + (cfg.kind === 'ollama' ? ', and that Ollama allows this site (OLLAMA_ORIGINS).' : '.')); }
    if (!r.ok) { let m = ''; try { m = (await r.json()).error; m = (m && m.message) || m || ''; } catch (e) { /* none */ } throw new Error('The AI service declined the request (HTTP ' + r.status + ')' + (m ? ': ' + m : '') + '.'); }
    const j = await r.json();
    const t = cfg.kind === 'anthropic' ? (j.content || []).map((c) => c.text || '').join('') : cfg.kind === 'ollama' ? (j.message && j.message.content) : (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content);
    if (!t) throw new Error('The AI service returned an empty response.');
    return String(t).trim();
  }

  const api = { KINDS, load, save, forget, ready, buildPrompt, ask };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiAI = api;
})(typeof self !== 'undefined' ? self : this);
