import { test, expect } from '@playwright/test';

test('@external ExpandTesting — paginated table navigates to next page', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/dynamic-pagination-table');

  const table = page.getByRole('table').or(page.locator('table')).first();
  await expect(table).toBeVisible();
  const firstBefore = await table.locator('tbody tr').first().innerText();

  const next = page.getByRole('link', { name: /next|>/i }).or(page.locator('.paginate_button.next, a.next')).first();
  await expect(next).toBeVisible();
  await next.click();

  await expect(table.locator('tbody tr').first()).toBeVisible();
  const firstAfter = table.locator('tbody tr').first();
  await expect(firstAfter).not.toHaveText(firstBefore);
});
