// Every page at a phone size and a desktop size: a screenshot compared with the committed baseline, and no console errors.
const { test, expect } = require('@playwright/test');
const PAGES = [
  ['home', '/'], ['contribute', '/contribute.html'], ['dictionary', '/dictionary/'], ['translate', '/translate/'],
  ['dadi-learn', '/dadi/'], ['dadi-words', '/dadi/#/words'], ['dadi-write', '/dadi/#/write'], ['dadi-me', '/dadi/#/me'],
];
const SIZES = [[390, 844], [1280, 800]];
for (const [w, h] of SIZES) {
  test.describe(`${w}x${h}`, () => {
    test.use({ viewport: { width: w, height: h } });
    for (const [name, path] of PAGES) {
      test(name, async ({ page }) => {
        const errors = [];
        page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
        page.on('pageerror', (e) => errors.push(String(e)));
        await page.goto(path, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(`${name}-${w}.png`, {
          mask: [page.locator('#status, ul.rows, .updated, .stamp, iframe, img[src*="ytimg"], .vthumb img')],
        });
        expect(errors, 'console errors').toEqual([]);
      });
    }
  });
}
test('Dadi lesson starts', async ({ page }) => {
  await page.goto('/dadi/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Skip' }).click().catch(() => {});
  await page.getByText('I am starting from zero').click();
  await page.goto('/dadi/');
  await page.getByRole('link', { name: 'Start session' }).click();
  await expect(page).toHaveURL(/#\/session/);
  await expect(page.getByText('New item')).toBeVisible();
});
