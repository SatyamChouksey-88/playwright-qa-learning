import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import { PERSONAS } from '../fixtures/personas';

const authFile = path.join(__dirname, '../playwright/.auth/apex_user.json');

setup('authenticate apex_user', async ({ page }) => {
  await page.goto('/index.html#bank-demo');
  await page.getByTestId('bank-username').fill('apex_user');
  await page.getByTestId('bank-password').fill(PERSONAS.apex_user.password);
  await page.getByTestId('bank-login').click();
  await expect(page.getByTestId('welcome-banner')).toBeVisible();
  await page.context().storageState({ path: authFile });
});
