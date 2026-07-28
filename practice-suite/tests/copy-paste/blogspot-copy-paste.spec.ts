import { test, expect } from '@playwright/test';

/**
 * Blogspot has #field1 (source) and a Copy Text button that fills #field2.
 * Also exercises clipboard permissions for a manual Clipboard API write/read.
 */
test.describe('Copy / paste', () => {
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  test('@external Blogspot — double-click Copy Text copies field1 into field2', async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/');

    const field1 = page.locator('#field1');
    const field2 = page.locator('#field2');
    await expect(field1).toBeVisible();
    await field1.scrollIntoViewIfNeeded();

    await field1.fill('Hello Playwright Clipboard');
    // This demo copies on double-click, not single click
    await page.getByRole('button', { name: 'Copy Text' }).dblclick();

    await expect(field2).toHaveValue('Hello Playwright Clipboard');
  });

  test('@external Blogspot — seed clipboard then paste into field2', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('https://testautomationpractice.blogspot.com/');

    const field2 = page.locator('#field2');
    await field2.scrollIntoViewIfNeeded();
    await field2.fill('');
    await field2.click();

    await page.evaluate(async (text) => {
      await navigator.clipboard.writeText(text);
    }, 'Pasted via Clipboard API');

    const mod = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${mod}+V`);

    await expect(field2).toHaveValue(/Pasted via Clipboard API/);
  });
});
