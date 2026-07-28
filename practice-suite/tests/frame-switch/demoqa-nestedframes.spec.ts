import { test, expect } from '@playwright/test';

test('DemoQA — nested frames parent → child text', async ({ page }) => {
  await page.goto('https://demoqa.com/nestedframes');
  await page.locator('#close-fixedban').click({ timeout: 3000 }).catch(() => {});

  const parent = page.frameLocator('#frame1');
  await expect(parent.locator('body')).toContainText('Parent frame');

  const child = parent.frameLocator('iframe');
  await expect(child.locator('body')).toContainText('Child Iframe');
});
