---
id: IV-Q-SR-013
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 4
topic: performance-budget
crosslinks: []
---

## Question

How do you set performance budgets for the E2E suite?

## What this tests

Suite economics.

## Model answer

Track p95 per spec in CI, fail PR when smoke >N minutes, cap file count per shard, nightly full run separate from PR gate. Optimize slowest 10 tests monthly.

## Strong answer signals

- Names Playwright mechanism for performance-budget
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse performance-budget in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for performance-budget.

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
| 1 | No meaningful answer on performance-budget; guesses or silent. |
| 2 | Partial performance-budget answer with major gaps; needs heavy hints (senior). |
| 3 | Solid performance-budget explanation with one missing trade-off or weak example. |
| 4 | Complete performance-budget answer: mechanism, TypeScript example, trade-offs, real context. |
