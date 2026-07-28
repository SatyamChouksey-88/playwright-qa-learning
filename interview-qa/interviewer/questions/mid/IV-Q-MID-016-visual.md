---
id: IV-Q-MID-016
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: visual
crosslinks: []
---

## Question

What makes visual regression tests flaky and how do you stabilize them?

## What this tests

Visual testing maturity.

## Model answer

Flake sources: animations, fonts, dynamic timestamps, OS rendering. Stabilize: disable animations via CSS injection, mask dynamic regions, use consistent viewport, run in Docker image. Review diffs in PR — do not auto-approve.

## Strong answer signals

- Names Playwright mechanism for visual
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse visual in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for visual.

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
| 1 | No meaningful answer on visual; guesses or silent. |
| 2 | Partial visual answer with major gaps; needs heavy hints (mid). |
| 3 | Solid visual explanation with one missing trade-off or weak example. |
| 4 | Complete visual answer: mechanism, TypeScript example, trade-offs, real context. |
