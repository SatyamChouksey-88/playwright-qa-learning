---
id: FW-L-304
type: framework-lesson
stage: 3
title: Hybrid API + UI tests
objective: Combine API arrange, UI act/assert, and API teardown in one typed flow.
topic: framework
subtopics:
  - hybrid
  - arrange-act-assert
  - fixtures
diagram: null
mcqs:
  - FW-Q-047
  - FW-Q-048
exercise: FW-X-10
related:
  - FW-L-302
  - FW-L-303
---

## Concept

Fixtures inject both `page` and `api`. Arrange creates entities, UI validates what customers see, teardown deletes via API in fixture auto cleanup.

## Why it matters

Senior tests read like stories but run in seconds — hybrid pattern is the hallmark of mature suites.

## Architecture decision

Use test-scoped fixture teardown for delete. Worker-scoped API client with test-scoped entity ids.

## TypeScript implementation

```ts
export const test = base.extend<{ user: User }>({
  user: async ({ api }, use) => {
    const user = await api.createUser(createUser());
    await use(user);
    await api.deleteUser(user.id);
  },
});
```

## Trade-offs

Teardown failures orphan data — tolerate 404 on delete and run periodic sweeper (see data cleanup lesson).

## What NOT to do

Do not leave teardown only in afterEach without fixture — skipped tests skip afterEach patterns inconsistently.

## Interview angle

"Fast stable E2E for order flow?" — API arrange + UI assert on confirmation + API verify side effect optional.

## Related

- FW-L-302
- FW-L-303
