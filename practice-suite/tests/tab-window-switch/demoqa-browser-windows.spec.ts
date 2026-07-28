import { test, expect } from '@playwright/test';

test('DemoQA — open new tab and new window', async ({ page, context }) => {
  await page.goto('https://demoqa.com/browser-windows');
  await page.locator('#close-fixedban').click({ timeout: 3000 }).catch(() => {});

  const [tab] = await Promise.all([
    context.waitForEvent('page'),
    page.locator('#tabButton').click(),
  ]);
  await tab.waitForLoadState();
  await expect(tab.locator('#sampleHeading')).toHaveText('This is a sample page');
  await tab.close();

  const [win] = await Promise.all([
    context.waitForEvent('page'),
    page.locator('#windowButton').click(),
  ]);
  await win.waitForLoadState();
  await expect(win.locator('#sampleHeading')).toHaveText('This is a sample page');
  await win.close();

  await page.bringToFront();
  await expect(page.locator('#tabButton')).toBeVisible();
});
