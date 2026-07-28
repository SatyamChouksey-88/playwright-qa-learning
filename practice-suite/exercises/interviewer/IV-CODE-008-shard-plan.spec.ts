import { test, expect } from '@playwright/test';
import { planShards } from './IV-CODE-008-shard-plan';

test('IV-CODE-008: shard plan', () => {
  const shards = planShards(['a.spec.ts', 'b.spec.ts', 'c.spec.ts', 'd.spec.ts'], 2);
  expect(shards).toHaveLength(2);
  expect(shards[0]).toEqual(['a.spec.ts', 'c.spec.ts']);
  expect(shards[1]).toEqual(['b.spec.ts', 'd.spec.ts']);
});
