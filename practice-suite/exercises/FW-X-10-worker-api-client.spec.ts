import { test, expect } from '@playwright/test';
import { ApiClient } from './FW-X-10-worker-api-client';

test('FW-X-10: worker api client', async () => {
  const client = new ApiClient();
  expect(client.meta.scope).toBe('worker');
  expect(client.meta.disposed).toBe(false);
  await client.dispose();
  expect(client.meta.disposed).toBe(true);
});