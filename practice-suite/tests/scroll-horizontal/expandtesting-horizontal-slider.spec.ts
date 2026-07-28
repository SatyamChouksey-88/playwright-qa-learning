import { test, expect } from '@playwright/test';

test('@external ExpandTesting — move horizontal slider and assert range value', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/horizontal-slider');

  const slider = page.locator('input[type="range"]');
  await expect(slider).toBeVisible();

  await slider.fill('4');
  await expect(page.locator('#range')).toHaveText('4');
});
