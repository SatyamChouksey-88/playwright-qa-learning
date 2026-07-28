import { test, expect } from '@playwright/test';

/** Index page that links to iframe / nested frames demos. */
test('The Internet — frames index links to iframe demo', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/frames', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Frames' })).toBeVisible();
  const iframeLink = page.getByRole('link', { name: 'iFrame' });
  await expect(iframeLink).toHaveAttribute('href', '/iframe');

  // Direct navigation avoids flaky “wait for scheduled navigations” hangs on this host
  await page.goto('https://the-internet.herokuapp.com/iframe', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#mce_0_ifr')).toBeAttached();
});
