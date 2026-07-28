import { test, expect } from '@playwright/test';
import { buildUser } from './SK-TS-E03-ts-factories';

test('@skills SK-TS-E03', () => {
  expect(buildUser('a@test.com').role).toBe('member');
});
