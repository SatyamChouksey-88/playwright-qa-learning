---
id: IV-Q-MID-009
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: isolation
crosslinks:
  - a5
---

## Question

What is test isolation in Playwright and how do shared accounts break it?

## What this tests

Parallel data independence.

## Model answer

Each test must run independently — any order, any worker. Shared mutable accounts cause collisions (two tests transfer from same balance). Fix: unique data per test via factories, API seed, worker-scoped ids. Never depend on execution order or leftover state.

## Strong answer signals

- Names Playwright mechanism for isolation
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse isolation in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for isolation.

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
| 1 | No meaningful answer on isolation; guesses or silent. |
| 2 | Partial isolation answer with major gaps; needs heavy hints (mid). |
| 3 | Solid isolation explanation with one missing trade-off or weak example. |
| 4 | Complete isolation answer: mechanism, TypeScript example, trade-offs, real context. |
