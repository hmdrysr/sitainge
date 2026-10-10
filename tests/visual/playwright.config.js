// Visual regression tests for the static site (Playwright, Apache 2.0). See README.md.
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: '.',
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  timeout: 60000,
  workers: 4,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' } },
  use: { baseURL: 'http://127.0.0.1:8765', serviceWorkers: 'block', colorScheme: 'light', locale: 'en-GB', timezoneId: 'Asia/Dhaka' },
  webServer: { command: 'python3 -m http.server 8765 --bind 127.0.0.1 --directory ../../website', url: 'http://127.0.0.1:8765/', reuseExistingServer: true },
});
