import { test, expect } from '@playwright/test';

test('TutorialsPoint — interact with framed input', async ({ page }) => {
  await page.goto('https://www.tutorialspoint.com/selenium/practice/frames.php', {
    waitUntil: 'domcontentloaded',
  });

  const frame = page.frameLocator('iframe').first();
  await expect(frame.locator('body')).toBeVisible();

  const input = frame.locator('input').first();
  if (await input.count()) {
    await input.fill('frame-practice');
    await expect(input).toHaveValue('frame-practice');
  } else {
    await expect(frame.locator('h1, h2, p, body').first()).toBeVisible();
  }
});
