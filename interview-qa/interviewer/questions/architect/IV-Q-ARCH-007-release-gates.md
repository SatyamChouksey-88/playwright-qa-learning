---
id: IV-Q-ARCH-007
type: iv-question
level: architect
round: design
kind: design
timebox: 10
difficulty: 4
topic: release-gates
crosslinks: []
---

## Question

Design release gate policy for monorepo with 30 deploys/day.

## What this tests

Risk-based delivery control.

## Model answer

Tiered gates: smoke on PR (blocking), full regression on main (blocking), nightly soak (inform). Risk-based selection maps code paths to tests via ownership graph. Manual waiver with VP for budget override.

## Strong answer signals

- Names Playwright mechanism for release-gates
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse release-gates in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for release-gates.

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
| 1 | No meaningful answer on release-gates; guesses or silent. |
| 2 | Partial release-gates answer with major gaps; needs heavy hints (architect). |
| 3 | Solid release-gates explanation with one missing trade-off or weak example. |
| 4 | Complete release-gates answer: mechanism, TypeScript example, trade-offs, real context. |
