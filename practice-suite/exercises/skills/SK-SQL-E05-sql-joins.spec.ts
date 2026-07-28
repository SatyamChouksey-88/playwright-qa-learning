import { test, expect } from '@playwright/test';
import { normalizeSql } from './sql-utils';
import { verificationQuery } from './SK-SQL-E05-sql-joins';

test('@skills SK-SQL-E05', () => {
  const userAnswer = normalizeSql(verificationQuery());
  expect(userAnswer).toContain('select');
});
