import { test, expect } from '@playwright/test';

test('ExpandTesting — scroll horizontally until hiding button is visible', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/scrollbars');

  const button = page.locator('#hidingButton');
  await expect(button).toBeAttached();

  // Scroll the button into view (covers overflow containers)
  await button.scrollIntoViewIfNeeded();
  await expect(button).toBeVisible();
  await button.click();
});
