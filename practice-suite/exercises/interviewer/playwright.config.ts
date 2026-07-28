import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: /IV-CODE-.*\.spec\.ts$/,
  testIgnore: /\.solution\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  projects: [{ name: 'interviewer-exercises' }],
});
