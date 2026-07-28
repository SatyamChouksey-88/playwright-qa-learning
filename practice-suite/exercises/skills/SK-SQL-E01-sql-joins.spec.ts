import { test, expect } from '@playwright/test';
import { normalizeSql } from './sql-utils';
import { verificationQuery } from './SK-SQL-E01-sql-joins';

test('@skills SK-SQL-E01', () => {
  const userAnswer = normalizeSql(verificationQuery());
  expect(userAnswer).toContain('select');
});
