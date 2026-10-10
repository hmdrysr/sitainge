// axe-core accessibility check (MPL-2.0) on every view at 390px.
const { test, expect } = require('@playwright/test'); const AxeBuilder = require('@axe-core/playwright').default; const VIEWS = require('./views');
test.use({ viewport: { width: 390, height: 800 } });
for (const [name, path] of VIEWS) test('axe ' + name, async ({ page }) => {
  await page.goto(path, { waitUntil: 'networkidle' });
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']).analyze();
  expect(r.violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => v.id + ': ' + v.nodes.length)).toEqual([]);
});
