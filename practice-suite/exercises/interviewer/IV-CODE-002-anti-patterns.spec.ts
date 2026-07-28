import { test, expect } from '@playwright/test';
import { findAntiPatterns } from './IV-CODE-002-anti-patterns';

test('IV-CODE-002: anti-patterns', () => {
  expect(findAntiPatterns('await page.waitForTimeout(1000)')).toContain('waitForTimeout');
  expect(findAntiPatterns('await page.getByRole("button").click()')).toEqual([]);
});
