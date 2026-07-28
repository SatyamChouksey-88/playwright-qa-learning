import { test, expect } from '@playwright/test';

test('@external The Internet — JS alert, confirm, and prompt', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('I am a JS Alert');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Click for JS Alert' }).click();
  await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('I am a JS Confirm');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
  await expect(page.locator('#result')).toHaveText('You clicked: Ok');

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept('Automation');
  });
  await page.getByRole('button', { name: 'Click for JS Prompt' }).click();
  await expect(page.locator('#result')).toHaveText('You entered: Automation');
});
