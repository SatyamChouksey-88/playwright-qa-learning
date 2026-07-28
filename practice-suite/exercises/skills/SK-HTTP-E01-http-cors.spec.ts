import { test, expect } from '@playwright/test';
import { diagnoseCors } from './SK-HTTP-E01-http-cors';

test('@skills SK-HTTP-E01 cors', () => {
  expect(diagnoseCors(false, false)).toBe('missing-access-control-allow-origin');
});
