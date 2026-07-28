import { test, expect } from '@playwright/test';

test('The Internet — open new window via Promise.all', async ({ page, context }) => {
  await page.goto('https://the-internet.herokuapp.com/windows', { waitUntil: 'domcontentloaded' });

  if (await page.getByText(/Application error/i).isVisible().catch(() => false)) {
    test.skip(true, 'the-internet.herokuapp.com returned Application Error');
  }

  const link = page.getByRole('link', { name: 'Click Here' });
  if (!(await link.count())) {
    test.skip(true, 'Click Here link missing (host error/interstitial)');
  }

  const [popup] = await Promise.all([
    context.waitForEvent('page', { timeout: 30_000 }),
    link.click(),
  ]);
  await popup.waitForLoadState('domcontentloaded');

  if (await popup.getByText(/Application error/i).isVisible().catch(() => false)) {
    test.skip(true, 'popup Application Error from Heroku');
  }

  await expect(popup.getByRole('heading', { name: 'New Window' })).toBeVisible();
  await popup.close();
  await expect(page.getByRole('heading', { name: 'Opening a new window' })).toBeVisible();
});
