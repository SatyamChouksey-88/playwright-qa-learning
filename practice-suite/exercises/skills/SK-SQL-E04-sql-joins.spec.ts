import { test, expect } from '@playwright/test';
import { normalizeSql } from './sql-utils';
import { verificationQuery } from './SK-SQL-E04-sql-joins';

test('@skills SK-SQL-E04', () => {
  const userAnswer = normalizeSql(verificationQuery());
  expect(userAnswer).toContain('select');
});
