import { test, expect } from '@playwright/test';

test('@external The Internet — nested frames LEFT and MIDDLE text', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/nested_frames');

  const top = page.frameLocator('frame[name="frame-top"]');
  const left = top.frameLocator('frame[name="frame-left"]');
  const middle = top.frameLocator('frame[name="frame-middle"]');

  await expect(left.locator('body')).toContainText('LEFT');
  await expect(middle.locator('body')).toContainText('MIDDLE');

  const bottom = page.frameLocator('frame[name="frame-bottom"]');
  await expect(bottom.locator('body')).toContainText('BOTTOM');
});
