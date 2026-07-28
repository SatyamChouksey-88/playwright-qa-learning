import { test, expect } from '@playwright/test';

test('@external ExpandTesting — type into TinyMCE iframe', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/iframe', { waitUntil: 'domcontentloaded' });

  await page.locator('.tox-notification__dismiss, button.tox-notification__dismiss').click({ timeout: 3000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('.tox-notification, .tox-notifications-container').forEach((n) => n.remove());
  });

  const editor = page.frameLocator('#mce_0_ifr').locator('body#tinymce');
  await expect(editor).toBeVisible();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Hello from ExpandTesting iframe');
  await expect(editor).toContainText('Hello from ExpandTesting iframe');
});
