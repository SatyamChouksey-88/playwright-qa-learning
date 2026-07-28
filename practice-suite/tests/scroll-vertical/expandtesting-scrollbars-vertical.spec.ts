import { test, expect } from '@playwright/test';

test('ExpandTesting scrollbars — vertical scroll reveals hiding button', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/scrollbars');

  const button = page.locator('#hidingButton');
  await button.scrollIntoViewIfNeeded();
  await expect(button).toBeInViewport();
  await expect(button).toBeVisible();
});
