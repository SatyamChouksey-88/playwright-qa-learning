import { test, expect } from '@playwright/test';
import { pickBestLocator, isBanned } from './IV-CODE-001-locator-strategy';

test('IV-CODE-001: locator strategy', () => {
  expect(isBanned('await page.waitForTimeout(1)')).toBe(true);
  const best = pickBestLocator([
    { strategy: 'css', value: '.btn-primary' },
    { strategy: 'testid', value: 'submit' },
    { strategy: 'role', value: 'button[name="Sign in"]', name: 'Sign in' },
  ]);
  expect(best).toBe('button[name="Sign in"]');
  expect(() =>
    pickBestLocator([{ strategy: 'css', value: '.x' }]),
  ).toThrow();
});
