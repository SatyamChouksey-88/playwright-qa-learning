import { test, expect } from '@playwright/test';
import { describeSetupPattern } from './FW-X-05-beforeeach-to-fixture';

test('FW-X-05: fixture pattern', () => {
  const m = describeSetupPattern();
  expect(m).toEqual({ usesFixtures: true, usesBeforeEach: false, exportsCustomTest: true });
});