---
id: FW-L-204
type: framework-lesson
stage: 2
title: Worker vs test scope
objective: Choose fixture scope so expensive setup runs once per worker, not per test.
topic: framework
subtopics:
  - scope
  - worker
  - parallel
diagram: null
mcqs:
  - FW-Q-024
  - FW-Q-025
  - FW-Q-026
exercise: null
related:
  - FW-L-203
  - FW-L-304
---

## Concept

Default fixture scope is `test` — fresh for each test. `{ scope: 'worker' }` runs once per parallel worker process. Use worker scope for read-only clients, not for mutable browser state.

## Why it matters

Wrong scope causes cross-test pollution or redundant slow setup — classic senior interview scenario.

## Architecture decision

Test scope: page objects, per-test data. Worker scope: API client with connection pool, read-only config parse. Never share mutable DB rows at worker scope without isolation.

## TypeScript implementation

```ts
export const test = base.extend<{ api: ApiClient }>({
  api: [
    async ({}, use) => {
      const client = new ApiClient(process.env.API_URL!);
      await use(client);
      await client.dispose();
    },
    { scope: 'worker' },
  ],
});
```

## Trade-offs

Worker fixtures survive multiple tests — ensure they are stateless or self-clean. Document scope in fixture file header.

## What NOT to do

Do not store per-test user ids in worker-scoped fixtures. Do not assume worker count equals 1 locally.

## Interview angle

"When worker-scoped fixture?" — Expensive, read-only, parallel-safe resources — API client, parsed config — not browser page state.

## Related

- FW-L-203
- FW-L-304
