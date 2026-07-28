import { test, expect } from '@playwright/test';

test.describe('Bank Demo visual @bank-demo @visual', () => {
  test('login card screenshot @bank-demo', async ({ page }) => {
    await page.goto('/index.html#bank-demo');
    await expect(page.getByTestId('auth-screen')).toBeVisible();

    const card = page.locator('#bank-demo .bank-card, #bank-demo [data-testid="auth-screen"]').first();
    await expect(card).toBeVisible();
    await expect(card).toHaveScreenshot('bank-login-card.png', {
      maxDiffPixelRatio: 0.06,
      mask: [page.locator('.bank-toast')],
    });
  });
});
