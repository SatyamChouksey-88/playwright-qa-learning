---
id: FW-L-203
type: framework-lesson
stage: 2
title: Fixtures replace beforeEach
objective: Use test.extend for typed setup instead of shared mutable beforeEach hooks.
topic: framework
subtopics:
  - fixtures
  - test.extend
  - setup
diagram: DIAG-FW-FIXTURES
mcqs:
  - FW-Q-021
  - FW-Q-022
  - FW-Q-023
exercise: FW-X-05
related:
  - FW-L-204
  - FW-L-205
---

## Concept

`test.extend` declares dependencies (page objects, API clients) with setup/teardown scopes. Playwright injects them per test — no manual construction in beforeEach.

## Why it matters

Shared `beforeEach` with module-level state breaks parallel runs. Fixtures encode scope explicitly (test vs worker).

## Architecture decision

Export `test` and `expect` from `fixtures/base.ts`. App-specific fixtures extend once; specs import from fixtures, never from `@playwright/test` directly.

## TypeScript implementation

```ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

type Fixtures = { loginPage: LoginPage };

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
export { expect } from '@playwright/test';
```

## Trade-offs

Fixture chains can become hard to trace — keep depth ≤2 and name fixtures after domain concepts.

## What NOT to do

Do not mutate global variables in beforeEach. Do not mix `@playwright/test` import in specs when using custom fixtures.

## Interview angle

"Why fixtures over beforeEach?" — Parallel-safe, typed, composable, and visible in test signature as dependencies.

## Related

- FW-L-204
- FW-L-205
