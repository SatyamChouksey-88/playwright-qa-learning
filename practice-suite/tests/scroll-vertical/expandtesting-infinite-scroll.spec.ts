import { test, expect } from '@playwright/test';

test('ExpandTesting — infinite scroll loads more content blocks', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/infinite-scroll', {
    waitUntil: 'domcontentloaded',
  });

  const blocks = page.locator('.jscroll-added, #content .row, #content > div, main .container > div');
  await expect(blocks.first()).toBeVisible();
  const before = await blocks.count();

  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 2500);
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  }

  await expect.poll(async () => blocks.count(), { timeout: 25_000 }).toBeGreaterThan(before);
});
