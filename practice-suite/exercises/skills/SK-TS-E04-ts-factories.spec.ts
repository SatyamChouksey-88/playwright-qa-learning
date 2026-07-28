import { test, expect } from '@playwright/test';
import { buildUser } from './SK-TS-E04-ts-factories';

test('@skills SK-TS-E04', () => {
  expect(buildUser('a@test.com').role).toBe('member');
});
