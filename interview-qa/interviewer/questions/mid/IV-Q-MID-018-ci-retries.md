---
id: IV-Q-MID-018
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: ci-retries
crosslinks: []
---

## Question

Should retries be enabled locally? What is a healthy CI retry policy?

## What this tests

Retry discipline.

## Model answer

Local: **retries off** — fix flakes immediately. CI: `retries: 1` max with trace on first retry for evidence. Retries mask product bugs if unbounded. Track retry rate metric; alert when >2%.

## Strong answer signals

- Names Playwright mechanism for ci-retries
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse ci-retries in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for ci-retries.

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
| 1 | No meaningful answer on ci-retries; guesses or silent. |
| 2 | Partial ci-retries answer with major gaps; needs heavy hints (mid). |
| 3 | Solid ci-retries explanation with one missing trade-off or weak example. |
| 4 | Complete ci-retries answer: mechanism, TypeScript example, trade-offs, real context. |
