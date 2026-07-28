import { test, expect } from '@playwright/test';

/** Unverified list — confirmed live; classic multi-frame demo. */
test('UI.Vision — nested frames demo loads frame tree', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/', { waitUntil: 'domcontentloaded' });

  expect(page.frames().length).toBeGreaterThan(1);
  await expect(page.locator('frame, iframe').first()).toBeAttached();

  const f1 = page.frame({ url: /frame_1\.html/ });
  if (f1) {
    const input = f1.locator('input').first();
    await expect(input).toBeVisible();
    await input.fill('ui-vision');
    await expect(input).toHaveValue('ui-vision');
  }
});
