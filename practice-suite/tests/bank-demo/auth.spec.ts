import { test, expect } from '../../fixtures/test';
import { PERSONAS } from '../../fixtures/personas';

test.describe('Bank Demo @bank-demo', () => {
  test('happy path login shows dashboard @bank-demo @smoke', async ({ loginAs, dashboardPage }) => {
    await loginAs('apex_user');
    await expect(dashboardPage.welcome).toContainText(PERSONAS.apex_user.displayName);
    await expect(dashboardPage.checking).toBeVisible();
  });

  test('locked persona is rejected @bank-demo', async ({ page, loginPage }) => {
    await page.goto('/index.html#bank-demo');
    await loginPage.signIn('apex_locked', PERSONAS.apex_locked.password);
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toContainText(/locked/i);
  });

  test('2FA OTP succeeds within TTL @bank-demo', async ({ page, loginPage, dashboardPage }) => {
    await page.goto('/index.html#bank-demo');
    await loginPage.signIn('apex_2fa', PERSONAS.apex_2fa.password);
    await expect(loginPage.otpDialog).toBeVisible();
    await loginPage.enterOtp('123456');
    await expect(dashboardPage.welcome).toContainText(PERSONAS.apex_2fa.displayName);
  });

  test('2FA OTP expires when clock advances @bank-demo', async ({ page, loginPage }) => {
    await page.clock.install({ time: new Date('2026-07-28T10:00:00Z') });
    await page.goto('/index.html#bank-demo');
    await loginPage.signIn('apex_2fa', PERSONAS.apex_2fa.password);
    await expect(loginPage.otpDialog).toBeVisible();
    await page.clock.fastForward('01:30');
    await loginPage.enterOtp('123456');
    await expect(loginPage.error).toContainText(/expired/i);
  });

  test('balance API mock override @bank-demo', async ({ page, loginAs, dashboardPage }) => {
    await page.addInitScript(() => {
      window.BankDemoMocks = {
        '/api/bank/balance': () => ({ checking: 99, savings: 1, mocked: true }),
      };
    });
    await loginAs('apex_user');
    await dashboardPage.refreshBalances.click();
    await expect(dashboardPage.apiOut).toContainText('mocked');
    await expect(dashboardPage.apiOut).toContainText('99');
  });

  test('passkey path with test flag @bank-demo @smoke', async ({ page, loginPage, dashboardPage }) => {
    await page.addInitScript(() => {
      window.__BANK_PASSKEY_OK = true;
    });
    await page.goto('/index.html#bank-demo');
    await loginPage.passkey.click();
    await expect(dashboardPage.welcome).toContainText('Passkey User');
  });

  test('network-layer balance mock via page.route @bank-demo', async ({ page, loginAs, dashboardPage }) => {
    // Contrast with BankDemoMocks (init-script / in-app mock):
    // page.route intercepts at the Playwright network layer before the request hits the page.
    // BankDemoMocks patches the demo's fake fetch inside the page — useful when there is no real HTTP.
    // Prefer page.route when asserting against real XHR/fetch; prefer init-script mocks for pure SPA fakes.
    await page.route('**/api/bank/balance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ checking: 42, savings: 7, mocked: true, via: 'page.route' }),
      });
    });
    await loginAs('apex_user');
    await dashboardPage.refreshBalances.click();
    await expect(dashboardPage.apiOut).toContainText('page.route');
    await expect(dashboardPage.apiOut).toContainText('42');
  });
});
