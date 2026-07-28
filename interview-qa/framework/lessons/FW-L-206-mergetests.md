---
id: FW-L-206
type: framework-lesson
stage: 2
title: mergeTests composition
objective: Combine fixture modules with mergeTests without inheritance trees.
topic: framework
subtopics:
  - mergeTests
  - composition
  - modularity
diagram: DIAG-FW-FIXTURES
mcqs:
  - FW-Q-029
  - FW-Q-030
exercise: null
related:
  - FW-L-203
  - FW-L-406
---

## Concept

`mergeTests(authFixtures, apiFixtures, uiFixtures)` unions fixture types. Each module exports its own extended test — composition replaces monolithic fixture files.

## Why it matters

At scale, one 800-line fixtures.ts becomes merge conflicts daily. mergeTests is the Playwright-endorsed split.

## Architecture decision

One fixture file per domain (auth, api, pages). Root `fixtures/index.ts` merges and re-exports. Teams add modules without editing core.

## TypeScript implementation

```ts
import { mergeTests } from '@playwright/test';
import { test as authTest } from './auth-fixtures';
import { test as apiTest } from './api-fixtures';

export const test = mergeTests(authTest, apiTest);
export { expect } from '@playwright/test';
```

## Trade-offs

Name collisions across merged modules fail at import — prefix fixture names (`adminPage`, `guestPage`).

## What NOT to do

Do not deep-chain extend more than one level before merge. Do not duplicate fixture names across modules.

## Interview angle

"How split fixtures across teams?" — Domain fixture modules + mergeTests + semver on shared package.

## Related

- FW-L-203
- FW-L-406
