import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const learningSite = path.join(__dirname, '..', 'learning-site');
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const authFile = path.join(__dirname, 'playwright/.auth/apex_user.json');

/**
 * PR CI: bank-demo (+ setup / authed / a11y / visual) — deterministic, self-hosted.
 * Nightly: chromium-external with --grep @external.
 * Weekly: firefox-bank-demo + webkit-bank-demo.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['blob'],
        ['json', { outputFile: 'test-results/report.json' }],
      ]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      // Platform-agnostic name — regenerate on Linux in CI/Docker when fonts drift
      // (see practice-suite README Docker one-liner).
    },
  },
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
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
      name: 'setup',
      testDir: './setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
    {
      name: 'bank-demo',
      testMatch: /bank-demo\/.*\.spec\.ts/,
      testIgnore: /authed-dashboard\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
    {
      name: 'bank-demo-authed',
      dependencies: ['setup'],
      testMatch: /bank-demo\/authed-dashboard\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
        storageState: authFile,
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
      testIgnore: /authed-dashboard\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        baseURL,
      },
    },
    {
      name: 'webkit-bank-demo',
      testMatch: /bank-demo\/.*\.spec\.ts/,
      testIgnore: /authed-dashboard\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        baseURL,
      },
    },
  ],
  webServer: {
    command: `npx serve "${learningSite}" -l 4173 --no-port-switching`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
