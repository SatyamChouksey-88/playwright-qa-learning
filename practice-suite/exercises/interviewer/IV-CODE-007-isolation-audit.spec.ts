import { test, expect } from '@playwright/test';
import { findIsolationViolations } from './IV-CODE-007-isolation-audit';

test('IV-CODE-007: isolation audit', () => {
  const code = 'let shared = {}; await writeFileSync("/tmp/shared", "x"); login("test@example.com")';
  expect(findIsolationViolations(code)).toContain('global-mutable');
  expect(findIsolationViolations(code)).toContain('shared-file');
});
