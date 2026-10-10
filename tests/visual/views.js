// Every view to audit: pages, Dadi tabs and screens, and the sheets they open.
const open = (sel) => async (p) => { await p.locator(sel).first().click(); await p.waitForTimeout(400); };
module.exports = [
  ['home', '/'], ['contribute', '/contribute.html'], ['dictionary', '/dictionary/'],
  ['dictionary-search', '/dictionary/', async (p) => { await p.locator('input[type=search],input').first().fill('fani'); await p.waitForTimeout(600); }],
  ['translate', '/translate/'],
  ['translate-run', '/translate/', async (p) => { await p.locator('textarea').first().fill('water mother house ṭaṅga ŧóŧŧóŧóŧ đóirgíđe şóoy extraordinarilylongwordwithoutbreaks'); const b = p.getByRole('button', { name: /translate/i }); if (await b.count()) await b.first().click(); await p.waitForTimeout(500); }],
  ['home-menu', '/', open('.menu-btn')],
  ['dadi-tour', '/dadi/', async (p) => { await p.waitForTimeout(900); }], ['dadi-learn', '/dadi/'], ['dadi-words', '/dadi/#/words'], ['dadi-write', '/dadi/#/write'], ['dadi-teach', '/dadi/#/teach'],
  ['dadi-me', '/dadi/#/me'], ['dadi-about', '/dadi/#/about'], ['dadi-progress', '/dadi/#/progress'], ['dadi-check', '/dadi/#/check'], ['dadi-session', '/dadi/#/session'],
  ['dadi-word-sheet', '/dadi/#/words', open('#app ul li a, #app ul li button')],
  ['dadi-write-modes', '/dadi/#/write', async (p) => { const c = p.locator('#app .chips button, #app [role=tab]'); const n = await c.count(); if (n > 1) await c.nth(n - 1).click(); await p.waitForTimeout(300); }],
  ['dadi-me-sheet', '/dadi/#/me', open('#app .list button, #app button.row, #app li button')],
];
