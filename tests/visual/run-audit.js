const { chromium } = require('@playwright/test'); const { auditPage } = require('./audit'); const VIEWS = require('./views'); const fs = require('fs');
const [base, out, widthsArg] = process.argv.slice(2); const W = (widthsArg || '320,360,390,414,768,1024,1280,1440').split(',').map(Number);
(async () => {
  const br = await chromium.launch(); const res = {}; const texts = {};
  for (const w of W) { const ctx = await br.newContext({ viewport: { width: w, height: w < 800 ? 800 : 900 }, serviceWorkers: 'block' }); const page = await ctx.newPage();
    for (const [name, path, act] of VIEWS) {
      try { await page.goto(base + path + (path.includes('#') ? '' : ''), { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
        if (name !== 'dadi-tour') { const sk = page.locator('.sheet').getByRole('button', { name: 'Skip' }); if (await sk.count()) { await sk.click(); await page.waitForTimeout(300); } }
        if (act) await act(page).catch(() => {});
        const iss = await auditPage(page); res[name + '@' + w] = iss;
        if (w === 390) texts[name] = await page.evaluate(() => document.body.innerText);
        if ([320, 390, 1280].includes(w)) await page.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: false });
      } catch (e) { res[name + '@' + w] = [{ type: 'error', el: String(e).slice(0, 100) }]; }
    } await ctx.close(); }
  await br.close(); fs.writeFileSync(out + '/audit.json', JSON.stringify(res, null, 1)); fs.writeFileSync(out + '/texts.json', JSON.stringify(texts, null, 1));
  const c = {}; for (const k in res) for (const i of res[k]) c[i.type] = (c[i.type] || 0) + 1; console.log(JSON.stringify(c));
})();
