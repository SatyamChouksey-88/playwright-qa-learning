import { test, expect } from '@playwright/test';

test('@external GlobalSQA — drag a photo into the trash (inside demo iframe)', async ({ page }) => {
  await page.goto('https://www.globalsqa.com/demo-site/draganddrop/');

  // Cookie consent if shown
  await page.getByRole('button', { name: /accept|agree|allow/i }).click({ timeout: 4000 }).catch(() => {});

  const frame = page.frameLocator('iframe.demo-frame, iframe[src*="photo-manager"]').first();
  const galleryItem = frame.locator('#gallery li').first();
  const trash = frame.locator('#trash');

  await expect(galleryItem).toBeVisible();
  await expect(trash).toBeVisible();

  const before = await frame.locator('#gallery li').count();
  await galleryItem.dragTo(trash);

  await expect(frame.locator('#trash li')).toHaveCount(1);
  await expect(frame.locator('#gallery li')).toHaveCount(before - 1);
});
