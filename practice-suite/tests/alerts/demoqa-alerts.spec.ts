import { test, expect } from '@playwright/test';

test('@external DemoQA — immediate alert, confirm, and prompt', async ({ page }) => {
  await page.goto('https://demoqa.com/alerts');
  await page.locator('#close-fixedban').click({ timeout: 3000 }).catch(() => {});

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    await dialog.accept();
  });
  await page.locator('#alertButton').click();

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });
  await page.locator('#confirmButton').click();
  await expect(page.locator('#confirmResult')).toContainText(/Ok/i);

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept('QA Engineer');
  });
  await page.locator('#promtButton').click();
  await expect(page.locator('#promptResult')).toContainText('QA Engineer');
});
