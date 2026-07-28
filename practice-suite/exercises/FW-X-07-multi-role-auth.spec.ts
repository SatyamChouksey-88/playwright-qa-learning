import { test, expect } from '@playwright/test';
import { roleStoragePaths } from './FW-X-07-multi-role-auth';

test('FW-X-07: multi-role paths', () => {
  const paths = roleStoragePaths();
  expect(paths.admin).toBe('playwright/.auth/admin.json');
  expect(paths.member).toBe('playwright/.auth/member.json');
  expect(paths.admin).not.toBe(paths.member);
});