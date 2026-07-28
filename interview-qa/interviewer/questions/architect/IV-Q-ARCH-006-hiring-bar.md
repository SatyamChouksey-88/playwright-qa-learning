---
id: IV-Q-ARCH-006
type: iv-question
level: architect
round: theory
kind: theory
timebox: 8
difficulty: 4
topic: hiring-bar
crosslinks: []
---

## Question

How do you calibrate hiring bar across sites and levels?

## What this tests

Interview system design.

## Model answer

Written rubric (IV-RUBRIC), recorded calibration sessions, kits per level, shadow loops, quarterly bar review. Local sites use same kits; adjust pass threshold not questions.

## Strong answer signals

- Names Playwright mechanism for hiring-bar
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse hiring-bar in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for hiring-bar.

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
| 1 | No meaningful answer on hiring-bar; guesses or silent. |
| 2 | Partial hiring-bar answer with major gaps; needs heavy hints (architect). |
| 3 | Solid hiring-bar explanation with one missing trade-off or weak example. |
| 4 | Complete hiring-bar answer: mechanism, TypeScript example, trade-offs, real context. |
