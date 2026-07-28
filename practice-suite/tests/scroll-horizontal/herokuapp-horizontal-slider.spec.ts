import { test, expect } from '@playwright/test';

test('The Internet — keyboard-drive the horizontal slider', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/horizontal_slider', {
    waitUntil: 'domcontentloaded',
  });

  if (await page.getByText(/Application error/i).isVisible().catch(() => false)) {
    test.skip(true, 'the-internet.herokuapp.com returned Application Error');
  }

  const slider = page.locator('input[type="range"]');
  await expect(slider).toBeVisible();
  await slider.focus();

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowRight');
  }

  await expect(page.locator('#range')).toHaveText('2.5');
});
