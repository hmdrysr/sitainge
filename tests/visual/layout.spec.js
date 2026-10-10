// Automated layout checks (overflow, overlap, fixed bars covering content, truncation, icon/label alignment, 44px targets) on every view.
const { test, expect } = require('@playwright/test'); const { auditPage } = require('./audit'); const VIEWS = require('./views');
for (const w of [320, 390, 768, 1280]) test.describe(`layout ${w}`, () => {
  test.use({ viewport: { width: w, height: 800 } });
  for (const [name, path, act] of VIEWS) test(name, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
    if (name !== 'dadi-tour') { const sk = page.locator('.sheet').getByRole('button', { name: 'Skip' }); if (await sk.count()) await sk.click(); }
    if (act) await act(page).catch(() => {});
    expect(await auditPage(page)).toEqual([]);
  });
});
