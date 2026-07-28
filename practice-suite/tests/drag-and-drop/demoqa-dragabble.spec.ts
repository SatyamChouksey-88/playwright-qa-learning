import { test, expect, Page } from '@playwright/test';

async function dismissDemoQaNoise(page: Page) {
  await page.locator('#close-fixedban').click({ timeout: 2000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('#fixedban, .Advertisement, iframe[id^="google_ads"], #adplus-anchor').forEach((el) => el.remove());
  });
}

test('@external DemoQA — drag the box and assert it moved', async ({ page }) => {
  await page.goto('https://demoqa.com/dragabble', { waitUntil: 'domcontentloaded' });
  await dismissDemoQaNoise(page);

  const box = page.locator('#dragBox');
  await expect(box).toBeVisible();

  const before = await box.boundingBox();
  expect(before).toBeTruthy();

  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await page.mouse.move(before!.x + before!.width / 2 + 140, before!.y + before!.height / 2 + 90, { steps: 16 });
  await page.mouse.up();

  const after = await box.boundingBox();
  expect(after).toBeTruthy();
  expect(Math.abs(after!.x - before!.x) + Math.abs(after!.y - before!.y)).toBeGreaterThan(40);
});
