import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PERSONAS, type PersonaId } from './personas';

type BankFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  loginAs: (user: PersonaId) => Promise<void>;
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
      const persona = PERSONAS[user];
      await page.goto('/index.html#bank-demo');
      await loginPage.signIn(user, persona.password);
      await expect(page.getByTestId('welcome-banner')).toBeVisible();
    });
  },
});

export { expect };
