---
id: IV-Q-MID-024
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: global-setup
crosslinks: []
---

## Question

When is `globalSetup` appropriate vs setup projects?

## What this tests

Setup scope judgment.

## Model answer

`globalSetup`: once per entire run (seed DB, warm cache). Setup **projects**: per-worker auth files, parallel-friendly. Prefer setup projects for auth — globalSetup serializes and complicates sharding.

## Strong answer signals

- Names Playwright mechanism for global-setup
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse global-setup in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for global-setup.

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
| 1 | No meaningful answer on global-setup; guesses or silent. |
| 2 | Partial global-setup answer with major gaps; needs heavy hints (mid). |
| 3 | Solid global-setup explanation with one missing trade-off or weak example. |
| 4 | Complete global-setup answer: mechanism, TypeScript example, trade-offs, real context. |
