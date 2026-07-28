import { test, expect } from '@playwright/test';

test('DemoQA — read sample text from both iframes', async ({ page }) => {
  await page.goto('https://demoqa.com/frames');
  await page.locator('#close-fixedban').click({ timeout: 3000 }).catch(() => {});

  const frame1 = page.frameLocator('#frame1');
  const frame2 = page.frameLocator('#frame2');

  await expect(frame1.locator('#sampleHeading')).toHaveText('This is a sample page');
  await expect(frame2.locator('#sampleHeading')).toHaveText('This is a sample page');
});
