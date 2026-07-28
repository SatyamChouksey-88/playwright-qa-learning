import { test, expect } from '@playwright/test';
import { categorizeFailure } from './IV-CODE-006-flake-category';

test('IV-CODE-006: flake category', () => {
  expect(categorizeFailure('Timeout 30000ms waiting for locator')).toBe('timing');
  expect(categorizeFailure('duplicate key email')).toBe('data');
  expect(categorizeFailure('snapshot differs on linux')).toBe('environment');
});
