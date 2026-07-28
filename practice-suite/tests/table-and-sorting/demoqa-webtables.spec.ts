import { test, expect, Page } from '@playwright/test';

async function dismissDemoQaNoise(page: Page) {
  await page.locator('#close-fixedban').click({ timeout: 2000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('#fixedban, .Advertisement, iframe[id^="google_ads"], #adplus-anchor').forEach((el) => el.remove());
  });
}

test('@external DemoQA — edit an existing web-table row and search', async ({ page }) => {
  await page.goto('https://demoqa.com/webtables', { waitUntil: 'domcontentloaded' });
  await dismissDemoQaNoise(page);

  const tableBody = page.locator('.rt-tbody');
  if (!(await tableBody.isVisible().catch(() => false))) {
    // Fallback: page occasionally fails to hydrate behind ads — assert shell loaded
    await expect(page.locator('h1, .main-header, .text-center').first()).toBeAttached();
    test.skip(true, 'DemoQA web table did not hydrate (.rt-tbody missing)');
  }

  // Edit first row instead of Add — fewer modal/ad race conditions
  await page.locator('#edit-record-1').click({ force: true });
  await expect(page.locator('#userForm')).toBeVisible();
  await page.locator('#firstName').fill('CierraEdited');
  await page.locator('#submit').click({ force: true });

  await expect(tableBody).toContainText('CierraEdited');

  await page.locator('#searchBox').fill('CierraEdited');
  await expect(tableBody).toContainText('CierraEdited');
  await expect(tableBody.getByRole('row').filter({ hasText: 'CierraEdited' })).toHaveCount(1);
});
