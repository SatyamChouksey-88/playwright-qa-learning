---
id: IV-Q-MID-013
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: quarantine
crosslinks: []
---

## Question

What is a quarantine policy for flaky tests?

## What this tests

Operational flake management.

## Model answer

Tag flaky tests `@quarantine`, exclude from merge gates, track owner + expiry. Fix within SLA or delete. Metrics: quarantine count trending down. Never silently retry forever — quarantine makes debt visible.

## Strong answer signals

- Names Playwright mechanism for quarantine
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse quarantine in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for quarantine.

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
| 1 | No meaningful answer on quarantine; guesses or silent. |
| 2 | Partial quarantine answer with major gaps; needs heavy hints (mid). |
| 3 | Solid quarantine explanation with one missing trade-off or weak example. |
| 4 | Complete quarantine answer: mechanism, TypeScript example, trade-offs, real context. |
