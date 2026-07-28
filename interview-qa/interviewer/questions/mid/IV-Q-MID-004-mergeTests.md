---
id: IV-Q-MID-004
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: mergeTests
crosslinks: []
---

## Question

When do you use `mergeTests` and what problem does it solve?

## What this tests

Fixture module composition.

## Model answer

`mergeTests` combines fixture definitions from modules without inheritance trees:

```ts
import { mergeTests } from '@playwright/test';
import { test as authTest } from './auth-fixtures';
import { test as apiTest } from './api-fixtures';
export const test = mergeTests(authTest, apiTest);
```

Use when teams own separate fixture files. Avoid name collisions — two modules exporting same fixture key fails at merge.

## Strong answer signals

- Names Playwright mechanism for mergeTests
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse mergeTests in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for mergeTests.

</details>

<details>
<summary>Hint 2</summary>

Consider test isolation and parallel workers.

</details>

<details>
<summary>Hint 3</summary>

Name one anti-pattern you would reject in code review.

</details>

## Scoring guide

| Score | Anchor |
|-------|--------|
| 1 | No meaningful answer on mergeTests; guesses or silent. |
| 2 | Partial mergeTests answer with major gaps; needs heavy hints (mid). |
| 3 | Solid mergeTests explanation with one missing trade-off or weak example. |
| 4 | Complete mergeTests answer: mechanism, TypeScript example, trade-offs, real context. |
