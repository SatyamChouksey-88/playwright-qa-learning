import { test, expect, Page } from '@playwright/test';

/** DemoQA serves sticky ad iframes that intercept pointer events. */
async function dismissDemoQaNoise(page: Page) {
  await page.locator('#close-fixedban').click({ timeout: 2000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('#fixedban, .Advertisement, iframe[id^="google_ads"], #adplus-anchor').forEach((el) => el.remove());
    const footer = document.querySelector('footer');
    if (footer) footer.remove();
  });
}

test('@external DemoQA — drop draggable into droppable (Simple tab)', async ({ page }) => {
  await page.goto('https://demoqa.com/droppable', { waitUntil: 'domcontentloaded' });
  await dismissDemoQaNoise(page);

  const simpleTab = page.getByRole('tab', { name: 'Simple' });
  if (await simpleTab.isVisible().catch(() => false)) {
    await simpleTab.click();
  }

  const drag = page.locator('#simpleDropContainer #draggable, #draggable').first();
  const drop = page.locator('#simpleDropContainer #droppable').first();

  await expect(drag).toBeVisible();
  await expect(drop).toBeVisible();

  const dragBox = await drag.boundingBox();
  const dropBox = await drop.boundingBox();
  expect(dragBox && dropBox).toBeTruthy();

  await page.mouse.move(dragBox!.x + dragBox!.width / 2, dragBox!.y + dragBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(dropBox!.x + dropBox!.width / 2, dropBox!.y + dropBox!.height / 2, { steps: 12 });
  await page.mouse.up();

  await expect(drop).toContainText(/dropped/i);
});
