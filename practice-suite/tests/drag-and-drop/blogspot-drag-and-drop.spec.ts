import { test, expect } from '@playwright/test';

test('@external Blogspot practice — drag #draggable onto #droppable', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const drag = page.locator('#draggable');
  const drop = page.locator('#droppable');

  await expect(drag).toBeVisible();
  await expect(drop).toBeVisible();
  await drag.scrollIntoViewIfNeeded();

  await drag.dragTo(drop);

  await expect(drop).toContainText(/dropped/i);
});
