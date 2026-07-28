import { test, expect } from '@playwright/test';

test('ExpandTesting — open new window and assert content', async ({ page, context }) => {
  await page.goto('https://practice.expandtesting.com/windows');

  const popupPromise = context.waitForEvent('page');
  await page.getByRole('link', { name: /click here|new window|new page/i }).first().click();
  const popup = await popupPromise;
  await popup.waitForLoadState();

  await expect(popup.getByRole('heading').first()).toBeVisible();
  await expect(popup.locator('body')).toContainText(/new|window|page/i);

  await popup.close();
  await page.bringToFront();
  await expect(page.getByRole('heading').first()).toBeVisible();
});
