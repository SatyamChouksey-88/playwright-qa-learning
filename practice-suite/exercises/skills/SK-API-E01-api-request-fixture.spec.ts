import { test, expect } from '@playwright/test';
import { getStatusCode } from './SK-API-E01-api-request-fixture';

test('@skills SK-API-E01 status helper', async () => {
  const code = await getStatusCode('https://example.com', '/');
  expect(code).toBeGreaterThanOrEqual(200);
  expect(code).toBeLessThan(500);
});
