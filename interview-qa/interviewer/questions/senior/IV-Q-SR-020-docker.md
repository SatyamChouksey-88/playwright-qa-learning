---
id: IV-Q-SR-020
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: docker
crosslinks: []
---

## Question

Why run Playwright in official Docker images on CI?

## What this tests

Environment parity.

## Model answer

Pinned browsers + OS deps match local `playwright install --with-deps`. Reduces "passes on one runner only" visual flakes. Tag image version to @playwright/test version.

## Strong answer signals

- Names Playwright mechanism for docker
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse docker in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for docker.

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
| 1 | No meaningful answer on docker; guesses or silent. |
| 2 | Partial docker answer with major gaps; needs heavy hints (senior). |
| 3 | Solid docker explanation with one missing trade-off or weak example. |
| 4 | Complete docker answer: mechanism, TypeScript example, trade-offs, real context. |
