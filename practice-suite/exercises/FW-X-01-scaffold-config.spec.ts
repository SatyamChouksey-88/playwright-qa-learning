import { test, expect } from '@playwright/test';
import { buildExerciseConfig } from './FW-X-01-scaffold-config';

test('FW-X-01: scaffold config', () => {
  const cfg = buildExerciseConfig();
  expect(cfg.testDir).toBe('./');
  expect(cfg.projects).toHaveLength(1);
  expect(cfg.projects[0]?.name).toBe('exercises');
});