import { test, expect } from '@playwright/test';

test('@external LetCode — read shopping table totals', async ({ page }) => {
  await page.goto('https://letcode.in/table');

  const table = page.locator('#shopping');
  await expect(table).toBeVisible();

  const prices = await table.locator('tbody tr td:nth-child(2)').allTextContents();
  const sum = prices.map((p) => Number(p.trim())).reduce((a, b) => a + b, 0);

  const presented = Number((await table.locator('tfoot td').last().innerText()).trim());
  expect(sum).toBe(presented);
});
