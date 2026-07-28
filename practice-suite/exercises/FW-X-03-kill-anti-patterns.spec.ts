import { test, expect } from '@playwright/test';
import { findAntiPatterns } from './FW-X-03-kill-anti-patterns';

test('FW-X-03: anti-patterns', () => {
  expect(findAntiPatterns('await page.waitForTimeout(1000)')).toContain('waitForTimeout');
  expect(findAntiPatterns('await page.getByRole("button").click()')).toEqual([]);
});