import { test, expect } from '@playwright/test';

test('The Internet — infinite scroll appends more content', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/infinite_scroll', {
    waitUntil: 'domcontentloaded',
  });

  const paragraphs = page.locator('.jscroll-added');
  await expect(paragraphs.first()).toBeVisible();
  const before = await paragraphs.count();

  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 3000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  await expect.poll(async () => paragraphs.count(), { timeout: 25_000 }).toBeGreaterThan(before);
});
