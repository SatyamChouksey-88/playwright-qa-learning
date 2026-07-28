import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const learningSite = path.join(__dirname, '..', 'learning-site');

/**
 * PR CI: bank-demo project only (deterministic, self-hosted).
 * Nightly: chromium-external with --grep @external.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['blob']]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'bank-demo',
      testMatch: /bank-demo\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4173',
      },
    },
    {
      name: 'chromium-external',
      testIgnore: /bank-demo\//,
      grep: /@external/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-bank-demo',
      testMatch: /bank-demo\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://127.0.0.1:4173',
      },
    },
    {
      name: 'webkit-bank-demo',
      testMatch: /bank-demo\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        baseURL: 'http://127.0.0.1:4173',
      },
    },
  ],
  webServer: {
    command: `npx --yes serve "${learningSite}" -l 4173 --no-port-switching`,
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
