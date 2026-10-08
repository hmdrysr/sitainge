/* Background (CC0). Works as a Chrome service worker and as a Firefox event page. */
if (typeof importScripts === 'function') importScripts('lib/glossary.js');
const ext = self.browser || self.chrome;
ext.runtime.onInstalled.addListener(() => {
  ext.contextMenus.create({ id: 'sit-sel', title: 'Translate selection to siṭaiṅga (draft)', contexts: ['selection'] });
  ext.contextMenus.create({ id: 'sit-page', title: 'Translate this page to siṭaiṅga (draft)', contexts: ['page'] });
});
ext.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  try {
    await ext.scripting.executeScript({ target: { tabId: tab.id }, files: ['lib/translate.js', 'content.js'] });
    const { g } = await self.SitaingaGlossary.glossary();
    ext.tabs.sendMessage(tab.id, info.menuItemId === 'sit-sel' ? { cmd: 'selection', glossary: g, text: info.selectionText } : { cmd: 'page', glossary: g });
  } catch (e) { /* page not scriptable (browser pages, store pages) */ }
});
