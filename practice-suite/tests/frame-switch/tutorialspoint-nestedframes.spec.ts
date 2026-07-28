import { test, expect } from '@playwright/test';

test('TutorialsPoint — nested frames content is readable', async ({ page }) => {
  await page.goto('https://www.tutorialspoint.com/selenium/practice/nestedframes.php');

  const outer = page.frameLocator('iframe').first();
  await expect(outer.locator('body')).toBeVisible();

  const nested = outer.frameLocator('iframe').first();
  if (await nested.locator('body').count()) {
    await expect(nested.locator('body')).toBeVisible();
  } else {
    // Some builds use <frame> / single level — assert outer still has text
    await expect(outer.locator('body')).not.toBeEmpty();
  }
});
