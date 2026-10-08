/* Popup (CC0). Injects the content script on demand (activeTab) and talks to it. */
const ext = self.browser || self.chrome, $ = (id) => document.getElementById(id);
const say = (t) => { $('out').textContent = t; };
const show = (r) => { if (!r) return say('Nothing to report on this page.'); if (r.error) return say('Error: ' + r.error); say(r.words ? r.hits + ' of ' + r.words + ' words found (' + Math.round(r.coverage * 100) + '%). The rest stay in English.' : (r.on ? 'No English words found here.' : 'Not translated.')); };
const tab = () => new Promise((res) => ext.tabs.query({ active: true, currentWindow: true }, (t) => res(t[0])));
const send = (id, m) => new Promise((res) => ext.tabs.sendMessage(id, m, (r) => { void (ext.runtime.lastError); res(r); }));
async function inject(t) { await ext.scripting.executeScript({ target: { tabId: t.id }, files: ['lib/translate.js', 'content.js'] }); }
async function run(cmd) {
  const t = await tab(); if (!t || !t.id) return say('No active tab.');
  try {
    await inject(t);
    if (cmd === 'undo') return show(await send(t.id, { cmd: 'undo' }));
    const { g, from } = await self.SitaingaGlossary.glossary();
    let m = { cmd, glossary: g };
    if (cmd === 'selection') { const s = await ext.scripting.executeScript({ target: { tabId: t.id }, func: () => String(window.getSelection() || '') }); m.text = s && s[0] && s[0].result; if (!m.text) return say('Select some text on the page first.'); }
    show(await send(t.id, m)); $('src').textContent = 'Dictionary: ' + from + '.';
  } catch (e) { say('This page cannot be translated (browser or store pages are off limits).'); }
}
$('page').onclick = () => run('page'); $('sel').onclick = () => run('selection'); $('undo').onclick = () => run('undo');
(async () => { const t = await tab(); if (t && t.id) { const r = await send(t.id, { cmd: 'status' }); if (r && r.on) show(r); } })();
