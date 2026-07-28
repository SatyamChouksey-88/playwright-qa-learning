import { test, expect } from '@playwright/test';
import { buildAuthProjects } from './FW-X-06-auth-setup-project';

test('FW-X-06: auth projects', () => {
  const projects = buildAuthProjects();
  expect(projects[0]?.name).toBe('setup');
  expect(projects[1]?.dependencies).toEqual(['setup']);
  expect(projects[1]?.storageState).toBe('playwright/.auth/user.json');
});