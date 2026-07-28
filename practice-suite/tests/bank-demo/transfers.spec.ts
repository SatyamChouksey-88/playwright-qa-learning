import { test, expect } from '../../fixtures/test';

test.describe('Bank Demo transfers @bank-demo', () => {
  test.beforeEach(async ({ loginAs, page }) => {
    await loginAs('apex_user');
    await page.locator('[data-tab="transfers"]').click();
  });

  test('internal transfer between accounts succeeds @bank-demo', async ({ page }) => {
    await page.locator('#transfer-amount').fill('100');
    await page.locator('#from-acc').selectOption('Checking');
    await page.locator('#transfer-type').selectOption('Between My Accounts');
    await page.locator('#exec-transfer').click();
    await expect(page.getByTestId('transfer-success')).toBeVisible();
    await expect(page.getByTestId('transfer-success')).toContainText(/complete/i);
  });

  test('rejects zero amount @bank-demo', async ({ page }) => {
    await page.locator('#transfer-amount').fill('0');
    await page.locator('#exec-transfer').click();
    await expect(page.getByTestId('transfer-error')).toBeVisible();
    await expect(page.getByTestId('transfer-error')).toContainText(/greater than zero/i);
  });

  test('rejects insufficient funds @bank-demo', async ({ page }) => {
    await page.locator('#transfer-amount').fill('999999');
    await page.locator('#from-acc').selectOption('Checking');
    await page.locator('#transfer-type').selectOption('Between My Accounts');
    await page.locator('#exec-transfer').click();
    await expect(page.getByTestId('transfer-error')).toBeVisible();
    await expect(page.getByTestId('transfer-error')).toContainText(/insufficient funds/i);
  });

  test('wire transfer completes with OTP @bank-demo', async ({ page }) => {
    await page.locator('#add-beneficiary').click();
    await page.locator('#bene-name').fill('Test Payee');
    await page.locator('#bene-account').fill('999888777');
    await page.locator('[data-save-bene]').click();
    await page.locator('#transfer-amount').fill('50');
    await page.locator('#to-acc').selectOption({ label: 'Test Payee' });
    await page.locator('#initiate-wire').click();
    await expect(page.getByTestId('wire-otp')).toBeVisible();
    const code = await page.getByTestId('wire-otp-code').textContent();
    await page.getByTestId('wire-otp-input').fill(code?.trim() || '847291');
    await page.getByTestId('submit-wire-otp').click();
    await expect(page.getByTestId('transfer-success')).toBeVisible();
  });
});
