import { test, expect } from '@playwright/test';

test('SelectorsHub — xpath practice page with shadow DOM input', async ({ page }) => {
  await page.goto('https://selectorshub.com/xpath-practice-page/', { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: /accept|agree|close|got it/i }).click({ timeout: 4000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('.cky-overlay, .cky-consent-container, .cookie, #cookie-law-info-bar').forEach((el) => el.remove());
  });

  await expect(page.locator('body')).toContainText(/XPath|cssSelector|Practice/i);

  // #userName is a shadow-DOM host — Playwright pierces open shadow roots
  const userInput = page.locator('#userName input, input[placeholder*="enter name" i]').first();
  await expect(userInput).toBeVisible({ timeout: 20_000 });
  await userInput.fill('practice.user');
  await expect(userInput).toHaveValue('practice.user');

  expect(await page.locator('iframe').count()).toBeGreaterThan(0);
});
