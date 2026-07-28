import { test, expect } from '@playwright/test';
import { violatesThinPom } from './IV-CODE-009-thin-pom';

test('IV-CODE-009: thin POM', () => {
  const fat = 'class LoginPage { async login() { expect(this.page).toHaveURL(/dash/); } }';
  const thin = 'class LoginPage { submit() { return this.page.getByRole("button").click(); } }';
  expect(violatesThinPom(fat)).toBe(true);
  expect(violatesThinPom(thin)).toBe(false);
});
