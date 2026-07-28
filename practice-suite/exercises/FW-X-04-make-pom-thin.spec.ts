import { test, expect } from '@playwright/test';
import { LoginPage, loginPageSource } from './FW-X-04-make-pom-thin';

test('FW-X-04: thin POM', () => {
  expect(new LoginPage().hasAssertion).toBe(false);
  expect(LoginPage.violatesThinPom(loginPageSource())).toBe(false);
});