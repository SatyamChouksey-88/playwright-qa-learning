---
id: IV-Q-ARCH-013
type: iv-question
level: architect
round: theory
kind: theory
timebox: 8
difficulty: 4
topic: roi
crosslinks: []
---

## Question

How do you measure ROI of test automation to executives?

## What this tests

Business case articulation.

## Model answer

Escaped defect reduction, MTTR, deployment frequency, manual regression hours saved, cost per CI run vs incident cost. Avoid vanity metrics (total test count). Show trend lines quarter over quarter.

## Strong answer signals

- Names Playwright mechanism for roi
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse roi in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for roi.

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
| 1 | No meaningful answer on roi; guesses or silent. |
| 2 | Partial roi answer with major gaps; needs heavy hints (architect). |
| 3 | Solid roi explanation with one missing trade-off or weak example. |
| 4 | Complete roi answer: mechanism, TypeScript example, trade-offs, real context. |
