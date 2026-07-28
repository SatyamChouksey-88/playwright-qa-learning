---
id: FW-L-301
type: framework-lesson
stage: 3
title: Data factories
objective: Build parallel-safe test data with factories that default sensible
  values and accept overrides.
topic: framework
subtopics:
  - factories
  - faker
  - isolation
diagram: DIAG-FW-DATA
mcqs:
  - FW-Q-040
  - FW-Q-041
  - FW-Q-042
exercise: FW-X-09
related:
  - FW-L-303
  - FW-L-306
---

## Concept

Factories are functions `createUser(overrides?)` returning typed objects with unique emails/ids per call. Tests pass only fields they assert on.

## Why it matters

Hardcoded "test@example.com" causes parallel collisions — interviewers listen for uniqueness strategy.

## Architecture decision

Factories live in `data/factories/`. Use timestamp/uuid suffixes. Pair with API create when UI setup is slow.

## TypeScript implementation

```ts
export type User = { email: string; name: string; role: 'member' | 'admin' };

export function createUser(overrides: Partial<User> = {}): User {
  const id = crypto.randomUUID().slice(0, 8);
  return {
    email: `user-${id}@example.test`,
    name: 'Test User',
    role: 'member',
    ...overrides,
  };
}
```

## Trade-offs

Faker adds dependency — UUID suffix is enough for emails. Keep factories dumb; no DB calls inside factory.

## What NOT to do

Do not share one global user object across tests. Do not use production-like real emails.

## Interview angle

"Parallel-safe test data?" — Factory with unique keys + API seed + teardown or sweeper job.

## Related

- FW-L-303
- FW-L-306
