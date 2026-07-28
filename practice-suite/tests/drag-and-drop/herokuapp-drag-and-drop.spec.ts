import { test, expect } from '@playwright/test';

test('The Internet — drag column A onto column B', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/drag_and_drop');

  const columnA = page.locator('#column-a');
  const columnB = page.locator('#column-b');

  await expect(columnA.locator('header')).toHaveText('A');
  await expect(columnB.locator('header')).toHaveText('B');

  // HTML5 DnD on this page needs DragEvent + DataTransfer (Playwright dragTo is unreliable here)
  await page.evaluate(() => {
    function dispatchDrag(source: Element, target: Element) {
      const dataTransfer = new DataTransfer();
      source.dispatchEvent(new DragEvent('dragstart', { dataTransfer, bubbles: true }));
      target.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
      source.dispatchEvent(new DragEvent('dragend', { dataTransfer, bubbles: true }));
    }
    const a = document.querySelector('#column-a');
    const b = document.querySelector('#column-b');
    if (a && b) dispatchDrag(a, b);
  });

  await expect(columnA.locator('header')).toHaveText('B');
  await expect(columnB.locator('header')).toHaveText('A');
});
