import { test, expect } from '@playwright/test';

/**
 * No dedicated copy page — use two inputs + Clipboard API (permissions required).
 */
test.describe('ExpandTesting inputs clipboard', () => {
  test.use({
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  test('write to clipboard, paste into number input via keyboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('https://practice.expandtesting.com/inputs');

    const input = page.getByRole('spinbutton').or(page.locator('input[type="number"]')).first();
    await expect(input).toBeVisible();

    await page.evaluate(async () => {
      await navigator.clipboard.writeText('42');
    });

    await input.click();
    await input.fill('');
    const mod = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${mod}+V`);

    await expect(input).toHaveValue('42');

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe('42');
  });
});
