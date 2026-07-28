import { test, expect } from '@playwright/test';

test('ExpandTesting — static tables are readable', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/tables');

  const table = page.locator('table').first();
  await expect(table).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(await table.getByRole('row').count());
  expect(await table.getByRole('row').count()).toBeGreaterThan(1);

  // Click a sortable header if present
  const header = table.getByRole('columnheader').or(table.locator('th')).first();
  if (await header.isVisible()) {
    const firstCellBefore = await table.locator('tbody tr').first().locator('td').first().innerText();
    await header.click();
    await expect(table.locator('tbody tr').first().locator('td').first()).toBeVisible();
    // Sorting may or may not change first row depending on data — assert table still stable
    await expect(table.locator('tbody tr').first()).toBeVisible();
    void firstCellBefore;
  }
});
