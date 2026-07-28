import type { Page, Locator } from '@playwright/test';

/** Thin page object — selectors only; assertions stay in specs. */
export class LoginPage {
  readonly user: Locator;
  readonly pass: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly otpDialog: Locator;
  readonly verifyOtp: Locator;
  readonly passkey: Locator;

  constructor(private readonly page: Page) {
    this.user = page.getByTestId('bank-username');
    this.pass = page.getByTestId('bank-password');
    this.submit = page.getByTestId('bank-login');
    this.error = page.getByTestId('error-alert');
    this.otpDialog = page.getByTestId('otp-dialog');
    this.verifyOtp = page.getByTestId('verify-2fa');
    this.passkey = page.getByTestId('bank-passkey');
  }

  async signIn(username: string, password: string) {
    await this.user.fill(username);
    await this.pass.fill(password);
    await this.submit.click();
  }

  async enterOtp(code: string) {
    const inputs = this.page.locator('.otp-input');
    for (let i = 0; i < code.length; i++) {
      await inputs.nth(i).fill(code[i]!);
    }
    await this.verifyOtp.click();
  }
}
