import { test, expect } from '@playwright/test';

test('@external LetCode frame UI — interact with framed controls', async ({ page }) => {
  await page.goto('https://letcode.in/frameui');

  const frame = page.frameLocator('iframe').first();
  // Page layout varies; assert we can see framed content and click a control if present
  await expect(frame.locator('body')).toBeVisible();

  const button = frame.getByRole('button').first();
  if (await button.count()) {
    await button.click();
  }

  const input = frame.getByRole('textbox').first();
  if (await input.count()) {
    await input.fill('framed-input');
    await expect(input).toHaveValue('framed-input');
  } else {
    await expect(frame.locator('body')).not.toBeEmpty();
  }
});
