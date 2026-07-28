import { test, expect } from '../../fixtures/test';

test.describe('Bank Demo @bank-demo', () => {
  test('happy path login shows dashboard @bank-demo', async ({ page, loginAs, dashboardPage }) => {
    await loginAs('apex_user');
    await expect(dashboardPage.welcome).toContainText('Apex User');
    await expect(dashboardPage.checking).toBeVisible();
  });

  test('locked persona is rejected @bank-demo', async ({ page, loginPage }) => {
    await page.goto('/index.html#bank-demo');
    await loginPage.signIn('apex_locked', 'Password123!');
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toContainText(/locked/i);
  });

  test('2FA OTP succeeds within TTL @bank-demo', async ({ page, loginPage, dashboardPage }) => {
    await page.goto('/index.html#bank-demo');
    await loginPage.signIn('apex_2fa', 'Password2FA!');
    await expect(loginPage.otpDialog).toBeVisible();
    await loginPage.enterOtp('123456');
    await expect(dashboardPage.welcome).toContainText('Apex 2FA');
  });

  test('2FA OTP expires when clock advances @bank-demo', async ({ page, loginPage }) => {
    await page.clock.install({ time: new Date('2026-07-28T10:00:00Z') });
    await page.goto('/index.html#bank-demo');
    await loginPage.signIn('apex_2fa', 'Password2FA!');
    await expect(loginPage.otpDialog).toBeVisible();
    await page.clock.fastForward('01:30');
    await loginPage.enterOtp('123456');
    await expect(loginPage.error).toContainText(/expired/i);
  });

  test('balance API mock override @bank-demo', async ({ page, loginAs, dashboardPage }) => {
    await page.addInitScript(() => {
      (window as unknown as { BankDemoMocks: Record<string, () => unknown> }).BankDemoMocks = {
        '/api/bank/balance': () => ({ checking: 99, savings: 1, mocked: true }),
      };
    });
    await loginAs('apex_user');
    await dashboardPage.refreshBalances.click();
    await expect(dashboardPage.apiOut).toContainText('mocked');
    await expect(dashboardPage.apiOut).toContainText('99');
  });

  test('passkey path with test flag @bank-demo', async ({ page, loginPage, dashboardPage }) => {
    await page.addInitScript(() => {
      (window as unknown as { __BANK_PASSKEY_OK: boolean }).__BANK_PASSKEY_OK = true;
    });
    await page.goto('/index.html#bank-demo');
    await loginPage.passkey.click();
    await expect(dashboardPage.welcome).toContainText('Passkey User');
  });
});
