---
id: IV-Q-ARCH-015
type: iv-question
level: architect
round: design
kind: design
timebox: 10
difficulty: 5
topic: strategy
crosslinks:
  - d1
---

## Question

Three-year test automation strategy for cloud-native product.

## What this tests

Long-horizon planning.

## Model answer

Y1: stable gates + platform team + flake budget. Y2: risk-based selection + contract tests + perf budgets. Y3: predictive quality metrics tied to DORA; global calibration; self-service fixtures. Explicit non-goals each year documented.

## Strong answer signals

- Names Playwright mechanism for strategy
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse strategy in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for strategy.

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
| 1 | No meaningful answer on strategy; guesses or silent. |
| 2 | Partial strategy answer with major gaps; needs heavy hints (architect). |
| 3 | Solid strategy explanation with one missing trade-off or weak example. |
| 4 | Complete strategy answer: mechanism, TypeScript example, trade-offs, real context. |
