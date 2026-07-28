import { test, expect } from '@playwright/test';

test('ExpandTesting — alert, confirm, and prompt dialogs', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/js-dialogs', { waitUntil: 'domcontentloaded' });

  // Alert
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    await dialog.accept();
  });
  await page.locator('#js-alert, button#js-alert').or(page.getByRole('button', { name: /js alert/i })).first().click();

  // Confirm — dismiss
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.dismiss();
  });
  await page.locator('#js-confirm, button#js-confirm').or(page.getByRole('button', { name: /js confirm/i })).first().click();
  await expect(page.locator('#dialog-response')).toContainText(/cancel|false|no/i);

  // Prompt — accept with text
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept('Playwright');
  });
  await page.locator('#js-prompt, button#js-prompt').or(page.getByRole('button', { name: /js prompt/i })).first().click();
  await expect(page.locator('#dialog-response')).toContainText(/Playwright/i);
});
