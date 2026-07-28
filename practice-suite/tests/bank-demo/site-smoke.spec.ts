import { test, expect } from '@playwright/test';

test.describe('Learning site smoke @bank-demo', () => {
  test('home loads and search index is present @smoke', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#home')).toBeVisible();

    // Open search so a lazy-loaded search-index.js can inject SEARCH_INDEX.
    await page.keyboard.press('Control+K');
    await expect
      .poll(async () => page.evaluate(() => window.SEARCH_INDEX?.documentCount ?? 0), {
        timeout: 15_000,
      })
      .toBeGreaterThan(0);
  });

  test('bank demo section mounts auth screen @bank-demo', async ({ page }) => {
    await page.goto('/index.html#bank-demo');
    await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 15_000 });
  });
});
