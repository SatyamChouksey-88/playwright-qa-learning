import { test, expect } from '@playwright/test';

test('@external The Internet — open iframe page and type in TinyMCE', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/iframe', { waitUntil: 'domcontentloaded' });

  await page.locator('.tox-notification__dismiss, button.tox-notification__dismiss').click({ timeout: 3000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('.tox-notification, .tox-notifications-container').forEach((n) => n.remove());
    const iframe = document.querySelector('#mce_0_ifr') as HTMLIFrameElement | null;
    const body = iframe?.contentDocument?.getElementById('tinymce');
    if (body) {
      body.setAttribute('contenteditable', 'true');
      body.classList.remove('mce-content-readonly');
    }
  });

  // Wait for any leftover notification overlay to be gone, then click via frameLocator (no force).
  await expect(page.locator('.tox-notification').first()).toBeHidden({ timeout: 5000 }).catch(() => {});
  const editor = page.frameLocator('#mce_0_ifr').locator('#tinymce');
  await expect(editor).toBeVisible();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Hello from Playwright frame');
  await expect(editor).toContainText('Hello from Playwright frame');
});
