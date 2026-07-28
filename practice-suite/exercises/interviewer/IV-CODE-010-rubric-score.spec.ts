import { test, expect } from '@playwright/test';
import { hireRecommendation } from './IV-CODE-010-rubric-score';

test('IV-CODE-010: rubric score', () => {
  const result = hireRecommendation({
    technical: 4,
    process: 3,
    communication: 3,
    codeQuality: 4,
    judgment: 3,
  });
  expect(result.tier).toBe('Strong hire');
  expect(result.total).toBeGreaterThan(3.2);
});
