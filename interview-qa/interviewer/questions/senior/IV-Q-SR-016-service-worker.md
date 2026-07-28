---
id: IV-Q-SR-016
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 4
topic: service-worker
crosslinks: []
---

## Question

How can service workers break `page.route` mocks?

## What this tests

Advanced network debugging.

## Model answer

SW may cache responses bypassing route. Bypass: `serviceWorkers: 'block'` in config for tests requiring mocks, or mock at SW registration level. Document when prod uses SW.

## Strong answer signals

- Names Playwright mechanism for service-worker
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse service-worker in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for service-worker.

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
| 1 | No meaningful answer on service-worker; guesses or silent. |
| 2 | Partial service-worker answer with major gaps; needs heavy hints (senior). |
| 3 | Solid service-worker explanation with one missing trade-off or weak example. |
| 4 | Complete service-worker answer: mechanism, TypeScript example, trade-offs, real context. |
