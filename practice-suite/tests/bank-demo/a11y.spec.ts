import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PERSONAS } from '../../fixtures/personas';

/**
 * WCAG A/AA scan of bank-demo login + dashboard.
 * Documented exclusions go in disableRules — keep intentional and reviewed.
 */
test.describe('Bank Demo accessibility @bank-demo', () => {
  test('login screen has no serious A/AA violations @bank-demo', async ({ page }) => {
    await page.goto('/index.html#bank-demo');
    await expect(page.getByTestId('auth-screen')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('#bank-demo')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('dashboard has no serious A/AA violations @bank-demo', async ({ page }) => {
    await page.goto('/index.html#bank-demo');
    await page.getByTestId('bank-username').fill('apex_user');
    await page.getByTestId('bank-password').fill(PERSONAS.apex_user.password);
    await page.getByTestId('bank-login').click();
    await expect(page.getByTestId('welcome-banner')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('#bank-demo')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
