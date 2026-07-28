import { test, expect } from '@playwright/test';

test.describe('Learning site smoke @bank-demo', () => {
  test('home loads and search index is present', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#home')).toBeVisible();
    const hasIndex = await page.evaluate(() => !!window.SEARCH_INDEX?.documentCount);
    expect(hasIndex).toBeTruthy();
  });

  test('bank demo section mounts auth screen', async ({ page }) => {
    await page.goto('/index.html#bank-demo');
    await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 15_000 });
  });
});
