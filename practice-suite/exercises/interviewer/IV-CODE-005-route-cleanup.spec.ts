import { test, expect } from '@playwright/test';
import { hasRouteCleanup } from './IV-CODE-005-route-cleanup';

test('IV-CODE-005: route cleanup', () => {
  expect(hasRouteCleanup('await page.route("**", h); await page.unroute("**")')).toBe(true);
  expect(hasRouteCleanup('await page.route("**", h)')).toBe(false);
});
