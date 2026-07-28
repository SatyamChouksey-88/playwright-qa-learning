import { test, expect } from '../../fixtures/test';

test.describe('Bank Demo session & statements @bank-demo', () => {
  test('logout returns to auth screen @bank-demo @auth-flow', async ({ loginAs, dashboardPage, loginPage }) => {
    await loginAs('apex_user');
    await dashboardPage.logout.click();
    await expect(loginPage.user).toBeVisible();
    await expect(loginPage.submit).toBeVisible();
  });

  test('statements table visible on dashboard @bank-demo', async ({ loginAs, dashboardPage }) => {
    await loginAs('apex_user');
    await dashboardPage.openTab('dash');
    await expect(dashboardPage.transactionsTable).toBeVisible();
    await expect(dashboardPage.transactionsTable.locator('tbody tr').first()).toBeVisible();
  });
});
