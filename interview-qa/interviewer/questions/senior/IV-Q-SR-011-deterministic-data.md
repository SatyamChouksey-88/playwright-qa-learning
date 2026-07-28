---
id: IV-Q-SR-011
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: deterministic-data
crosslinks: []
---

## Question

Strategies for deterministic test data at scale.

## What this tests

Data strategy depth.

## Model answer

Factories with unique ids, API seed, sweeper cron for e2e- prefix, avoid shared "golden" accounts, snapshot DB for integration envs where legal.

## Strong answer signals

- Names Playwright mechanism for deterministic-data
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse deterministic-data in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for deterministic-data.

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
| 1 | No meaningful answer on deterministic-data; guesses or silent. |
| 2 | Partial deterministic-data answer with major gaps; needs heavy hints (senior). |
| 3 | Solid deterministic-data explanation with one missing trade-off or weak example. |
| 4 | Complete deterministic-data answer: mechanism, TypeScript example, trade-offs, real context. |
