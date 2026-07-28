import { test, expect } from '@playwright/test';

/** In-page tabs (not browser tabs) — still a common “tab switch” interview topic. */
test('@external DemoQA — switch in-page tabs and assert panel content', async ({ page }) => {
  await page.goto('https://demoqa.com/tabs');
  await page.locator('#close-fixedban').click({ timeout: 3000 }).catch(() => {});

  const what = page.getByRole('tab', { name: 'What' });
  const origin = page.getByRole('tab', { name: 'Origin' });
  const use = page.getByRole('tab', { name: 'Use' });

  await expect(what).toBeVisible();
  await expect(page.locator('#demo-tabpane-what')).toBeVisible();

  await origin.click();
  await expect(origin).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#demo-tabpane-origin')).toBeVisible();
  await expect(page.locator('#demo-tabpane-origin')).toContainText(/origin|lore|ipsum|came/i);

  await use.click();
  await expect(use).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#demo-tabpane-use')).toBeVisible();
});
