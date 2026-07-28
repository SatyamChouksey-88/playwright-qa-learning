import { test, expect } from '@playwright/test';
import { createUser, resetFactoryForTests } from './FW-X-09-data-factory';

test('FW-X-09: data factory', () => {
  resetFactoryForTests();
  const a = createUser();
  const b = createUser();
  expect(a.email).not.toBe(b.email);
  expect(a.email).toContain('@example.test');
  expect(createUser({ role: 'admin' }).role).toBe('admin');
});