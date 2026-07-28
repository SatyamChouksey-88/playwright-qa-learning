import { test, expect } from '@playwright/test';

test('LetCode — fill name inside nested frames', async ({ page }) => {
  await page.goto('https://letcode.in/frame');

  const outer = page.frameLocator('#firstFr');
  await outer.getByPlaceholder('Enter name').fill('Satyam');
  await expect(outer.getByPlaceholder('Enter name')).toHaveValue('Satyam');

  const inner = outer.frameLocator('iframe[src*="inner"], iframe').first();
  await inner.getByPlaceholder('Enter email').fill('satyam@example.com');
  await expect(inner.getByPlaceholder('Enter email')).toHaveValue('satyam@example.com');
});
