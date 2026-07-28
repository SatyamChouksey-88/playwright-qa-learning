import { test, expect } from '@playwright/test';
import { hasAuthCookie } from './SK-API-E02-api-hybrid-ui';

test('@skills SK-API-E02 auth cookie', () => {
  expect(hasAuthCookie([{ name: 'session', value: 'abc' }])).toBe(true);
  expect(hasAuthCookie([{ name: 'other', value: 'x' }])).toBe(false);
});
