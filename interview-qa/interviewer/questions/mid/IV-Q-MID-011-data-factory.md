---
id: IV-Q-MID-011
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: data-factory
crosslinks: []
---

## Question

Design a test data factory for parallel-safe emails.

## What this tests

Data collision prevention.

## Model answer

```ts
let seq = 0;
export function createUser(overrides: Partial<User> = {}): User {
  seq += 1;
  return {
    email: `e2e-${Date.now()}-${seq}@example.test`,
    role: 'member',
    ...overrides,
  };
}
```

Prefix `e2e-` for sweeper jobs; never hardcode `test@example.com` across specs.

## Strong answer signals

- Names Playwright mechanism for data-factory
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse data-factory in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for data-factory.

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
| 1 | No meaningful answer on data-factory; guesses or silent. |
| 2 | Partial data-factory answer with major gaps; needs heavy hints (mid). |
| 3 | Solid data-factory explanation with one missing trade-off or weak example. |
| 4 | Complete data-factory answer: mechanism, TypeScript example, trade-offs, real context. |
