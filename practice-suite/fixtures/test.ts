import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

type BankFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  loginAs: (user: 'apex_user' | 'apex_2fa' | 'apex_locked' | 'apex_glitch') => Promise<void>;
};

export const test = base.extend<BankFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  loginAs: async ({ page, loginPage }, use) => {
    await use(async (user) => {
      const passwords: Record<string, string> = {
        apex_user: 'Password123!',
        apex_2fa: 'Password2FA!',
        apex_locked: 'Password123!',
        apex_glitch: 'Password123!',
      };
      await page.goto('/index.html#bank-demo');
      await loginPage.signIn(user, passwords[user]);
    });
  },
});

export { expect };
