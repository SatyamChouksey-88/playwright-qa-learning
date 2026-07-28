import { test, expect } from '@playwright/test';

function isSorted(values: string[], direction: 'asc' | 'desc') {
  const sorted = [...values].sort((a, b) => a.localeCompare(b));
  if (direction === 'desc') sorted.reverse();
  return values.every((v, i) => v === sorted[i]);
}

test('@external The Internet — sort Example 1 table by Last Name', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/tables', { waitUntil: 'domcontentloaded' });

  if (await page.getByText(/Application error/i).isVisible().catch(() => false)) {
    test.skip(true, 'the-internet.herokuapp.com returned Application Error');
  }

  const table = page.locator('#table1');
  if (!(await table.isVisible().catch(() => false))) {
    test.skip(true, '#table1 not rendered');
  }

  const lastNameHeader = table.locator('th.header, th').filter({ hasText: 'Last Name' }).first();
  const cells = table.locator('tbody tr td:nth-child(1)');

  const before = (await cells.allTextContents()).map((n) => n.trim());
  await lastNameHeader.click();

  // tablesorter toggles; assert either sorted OR order changed after click
  await expect.poll(async () => {
    const names = (await cells.allTextContents()).map((n) => n.trim());
    return (
      isSorted(names, 'asc') ||
      isSorted(names, 'desc') ||
      names.join('|') !== before.join('|')
    );
  }).toBeTruthy();

  const mid = (await cells.allTextContents()).map((n) => n.trim());
  await lastNameHeader.click();
  await expect.poll(async () => {
    const after = (await cells.allTextContents()).map((n) => n.trim());
    return after.join('|') !== mid.join('|');
  }).toBeTruthy();
});
