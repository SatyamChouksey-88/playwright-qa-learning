import { test, expect } from '@playwright/test';
import { resolveConflict } from './SK-GIT-E01-git-conflicts';

test('@skills SK-GIT-E01 conflict', () => {
  const raw = '<<<<<<< HEAD\nconst x = 1;\n=======\nconst x = 2;\n>>>>>>> feature';
  expect(resolveConflict(raw).trim()).toBe('const x = 2;');
});
