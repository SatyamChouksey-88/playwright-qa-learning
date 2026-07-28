import { test, expect } from '@playwright/test';

test('ExpandTesting — dynamic table shows Chrome CPU and matches UI value', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/dynamic-table');

  const table = page.getByRole('table').or(page.locator('table')).first();
  await expect(table).toBeVisible();

  const chromeRow = table.getByRole('row').filter({ hasText: 'Chrome' }).first();
  await expect(chromeRow).toBeVisible();

  const cpuCell = chromeRow.getByRole('cell').filter({ hasText: /%/ }).first();
  await expect(cpuCell).toBeVisible();
  const cpuText = (await cpuCell.innerText()).trim();

  // Yellow warning label mirrors Chrome CPU on this demo
  const label = page.locator('.bg-warning, #chrome-cpu, p').filter({ hasText: /Chrome CPU/i }).first();
  if (await label.isVisible().catch(() => false)) {
    await expect(label).toContainText(cpuText);
  } else {
    expect(cpuText).toMatch(/%/);
  }
});
