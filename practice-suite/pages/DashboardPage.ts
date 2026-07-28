import type { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly welcome: Locator;
  readonly checking: Locator;
  readonly logout: Locator;
  readonly refreshBalances: Locator;
  readonly apiOut: Locator;
  readonly transactionsTable: Locator;

  constructor(private readonly page: Page) {
    this.welcome = page.getByTestId('welcome-banner');
    this.checking = page.getByTestId('checking-balance');
    this.logout = page.getByTestId('bank-logout');
    this.refreshBalances = page.getByTestId('refresh-balances');
    this.apiOut = page.getByTestId('api-balance-out');
    this.transactionsTable = page.locator('#transactions-table');
  }

  async openTab(tab: 'dash' | 'transfers' | 'loans' | 'cards' | 'support' | 'settings') {
    await this.page.locator(`[data-tab="${tab}"]`).click();
  }
}
