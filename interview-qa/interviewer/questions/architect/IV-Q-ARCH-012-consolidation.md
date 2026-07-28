---
id: IV-Q-ARCH-012
type: iv-question
level: architect
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: consolidation
crosslinks: []
---

## Question

Consolidating Cypress + Selenium + Playwright — approach?

## What this tests

Tool consolidation strategy.

## Model answer

Pick Playwright for new work; migrate critical paths first; freeze old suites; shared tagging for coverage map; sunset date with executive sponsor. Train via academy + pair migration sprints.

## Strong answer signals

- Names Playwright mechanism for consolidation
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse consolidation in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for consolidation.

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
| 1 | No meaningful answer on consolidation; guesses or silent. |
| 2 | Partial consolidation answer with major gaps; needs heavy hints (architect). |
| 3 | Solid consolidation explanation with one missing trade-off or weak example. |
| 4 | Complete consolidation answer: mechanism, TypeScript example, trade-offs, real context. |
