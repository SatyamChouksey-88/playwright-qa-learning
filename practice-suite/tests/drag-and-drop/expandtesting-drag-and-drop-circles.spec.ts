import { test, expect } from '@playwright/test';

test('ExpandTesting — drag colored circles into the target', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/drag-and-drop-circles');

  const target = page.locator('#target');
  await expect(target).toBeVisible();

  const red = page.locator('#source .red, #red, .circle.red').first();
  const green = page.locator('#source .green, #green, .circle.green').first();
  const blue = page.locator('#source .blue, #blue, .circle.blue').first();

  await expect(red).toBeVisible();
  await expect(green).toBeVisible();
  await expect(blue).toBeVisible();

  await red.dragTo(target);
  await green.dragTo(target);
  await blue.dragTo(target);

  // Circles should now live inside the drop target
  await expect(target.locator('.circle, [class*="red"], [class*="green"], [class*="blue"]')).toHaveCount(3);
});
