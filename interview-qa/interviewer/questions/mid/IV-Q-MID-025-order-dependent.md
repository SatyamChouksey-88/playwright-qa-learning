---
id: IV-Q-MID-025
type: iv-question
level: mid
round: scenario
kind: scenario
timebox: 9
difficulty: 4
topic: order-dependent
crosslinks: []
---

## Question

Tests pass individually but fail when run together. How do you debug?

## What this tests

Shared state debugging.

## Model answer

Suspect shared data, leaked routes, global mutable, file collisions. Bisect with `--grep`, run pair combinations, enable `fullyParallel: true` locally. Inspect `beforeAll` mutations and static accounts. Fix isolation — never depend on run order.

## Strong answer signals

- Names Playwright mechanism for order-dependent
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse order-dependent in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for order-dependent.

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
| 1 | No meaningful answer on order-dependent; guesses or silent. |
| 2 | Partial order-dependent answer with major gaps; needs heavy hints (mid). |
| 3 | Solid order-dependent explanation with one missing trade-off or weak example. |
| 4 | Complete order-dependent answer: mechanism, TypeScript example, trade-offs, real context. |
