---
id: IV-Q-ARCH-004
type: iv-question
level: architect
round: theory
kind: theory
timebox: 10
difficulty: 4
topic: build-vs-buy
crosslinks: []
---

## Question

Build vs buy for test infrastructure (runners, reporting, data).

## What this tests

Strategic vendor judgment.

## Model answer

Buy/hosted runners when infra ops costly; build fixtures/domain seeds in-house (competitive advantage). Avoid proprietary lock-in for test code — Playwright stays portable. Evaluate TCO: engineer hours vs vendor spend.

## Strong answer signals

- Names Playwright mechanism for build-vs-buy
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse build-vs-buy in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for build-vs-buy.

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
| 1 | No meaningful answer on build-vs-buy; guesses or silent. |
| 2 | Partial build-vs-buy answer with major gaps; needs heavy hints (architect). |
| 3 | Solid build-vs-buy explanation with one missing trade-off or weak example. |
| 4 | Complete build-vs-buy answer: mechanism, TypeScript example, trade-offs, real context. |
