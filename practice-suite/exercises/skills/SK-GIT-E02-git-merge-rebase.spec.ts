import { test, expect } from '@playwright/test';
import { rebaseContinueSteps } from './SK-GIT-E02-git-merge-rebase';

test('@skills SK-GIT-E02 rebase', () => {
  expect(rebaseContinueSteps()).toEqual(['git add .', 'git rebase --continue']);
});
