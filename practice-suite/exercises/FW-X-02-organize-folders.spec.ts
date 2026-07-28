import { test, expect } from '@playwright/test';
import { validateFolderStructure } from './FW-X-02-organize-folders';

test('FW-X-02: folder structure', () => {
  expect(validateFolderStructure(['tests', 'pages', 'fixtures'])).toBe(true);
  expect(validateFolderStructure(['tests'])).toBe(false);
});