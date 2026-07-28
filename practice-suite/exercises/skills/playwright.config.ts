import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: /SK-.*\.spec\.ts$/,
  testIgnore: /\.solution\.ts$/,
  grep: /@skills/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  projects: [{ name: 'skills-exercises' }],
});
