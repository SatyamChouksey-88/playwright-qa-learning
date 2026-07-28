import { test, expect } from '@playwright/test';
import { PERSONAS } from '../../fixtures/personas';

/**
 * Starts already logged in via storageState from setup/auth.setup.ts.
 * Interview scenario B27: never commit playwright/.auth/*.json.
 */
test.describe('Bank Demo authed session @bank-demo', () => {
  test('dashboard is already visible without login @bank-demo @smoke', async ({ page }) => {
    await page.goto('/index.html#bank-demo');
    await expect(page.getByTestId('welcome-banner')).toContainText(PERSONAS.apex_user.displayName);
    await expect(page.getByTestId('checking-balance')).toBeVisible();
  });
});
