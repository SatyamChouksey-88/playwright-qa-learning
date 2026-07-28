import { test, expect } from '@playwright/test';
import { buildAuthProjects } from './IV-CODE-004-auth-projects';

test('IV-CODE-004: auth projects', () => {
  const projects = buildAuthProjects();
  expect(projects[0]?.name).toBe('setup');
  expect(projects[1]?.dependencies).toEqual(['setup']);
  expect(projects[1]?.storageState).toBe('playwright/.auth/user.json');
});
