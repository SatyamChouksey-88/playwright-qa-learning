import { test, expect } from '@playwright/test';
import { classifyFixture } from './IV-CODE-003-fixture-scope';

test('IV-CODE-003: fixture scope', () => {
  expect(classifyFixture('apiClient')).toBe('worker');
  expect(classifyFixture('page')).toBe('test');
  expect(classifyFixture('unknownFixture')).toBe('invalid');
});
