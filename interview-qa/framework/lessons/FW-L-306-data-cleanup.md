---
id: FW-L-306
type: framework-lesson
stage: 3
title: Data cleanup
objective: Design teardown, sweeper jobs, and naming conventions so orphaned
  data does not accumulate.
topic: framework
subtopics:
  - teardown
  - cleanup
  - isolation
diagram: DIAG-FW-DATA
mcqs:
  - FW-Q-051
exercise: null
related:
  - FW-L-301
  - FW-L-304
---

## Concept

Fixture teardown deletes created entities; tolerate already-deleted. Nightly job removes records matching `e2e-%` prefix older than 24h.

## Why it matters

CI kills mid-test leave orphans; interviewers ask what happens when teardown fails.

## Architecture decision

Prefix all test data `e2e-<uuid>`. Log created ids on failure. Sweeper is backstop, not primary cleanup.

## TypeScript implementation

```ts
user: async ({ api }, use) => {
  const user = await api.createUser(createUser({ email: `e2e-${crypto.randomUUID()}@test.local` }));
  await use(user);
  try {
    await api.deleteUser(user.id);
  } catch {
    // already deleted — sweeper will catch stragglers
  }
},
```

## Trade-offs

Sweeper delayed deletion — ensure prefix never collides with real users in shared envs.

## What NOT to do

Do not rely only on happy-path afterEach. Do not use production DB without isolation strategy.

## Interview angle

"Teardown failed — now what?" — Idempotent delete + tagged data + scheduled sweeper + alert on growth.

## Related

- FW-L-301
- FW-L-304
