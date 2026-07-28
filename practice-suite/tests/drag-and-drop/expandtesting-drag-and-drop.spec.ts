import { test, expect } from '@playwright/test';

/**
 * Classic column swap (#column-a / #column-b) — same pattern as Heroku.
 */
test('@external ExpandTesting — drag column A onto column B', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/drag-and-drop');

  const columnA = page.locator('#column-a');
  const columnB = page.locator('#column-b');
  await expect(columnA).toBeVisible();
  await expect(columnB).toBeVisible();

  await expect(columnA).toContainText('A');
  await expect(columnB).toContainText('B');

  await columnA.dragTo(columnB);

  await expect(columnA).toContainText('B');
  await expect(columnB).toContainText('A');
});
