import { test, expect } from '@playwright/test';
import { buildUser } from './SK-TS-E01-ts-factories';

test('@skills SK-TS-E01', () => {
  expect(buildUser('a@test.com').role).toBe('member');
});
