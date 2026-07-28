import { test, expect } from '@playwright/test';
import { buildUser } from './SK-TS-E02-ts-factories';

test('@skills SK-TS-E02', () => {
  expect(buildUser('a@test.com').role).toBe('member');
});
