import { test, expect } from '@playwright/test';

test('@external LetCode advanced table — search/filter and assert row', async ({ page }) => {
  await page.goto('https://letcode.in/advancedtable');

  const search = page.getByRole('searchbox').or(page.locator('input[type="search"]')).first();
  await expect(search).toBeVisible();
  await search.fill('London');

  const table = page.getByRole('table').or(page.locator('table')).first();
  await expect(table.getByRole('row').filter({ hasText: /London/i }).first()).toBeVisible();
  const rows = table.locator('tbody tr:visible, tbody tr').filter({ hasNotText: /no matching/i });
  expect(await rows.count()).toBeGreaterThan(0);
});
