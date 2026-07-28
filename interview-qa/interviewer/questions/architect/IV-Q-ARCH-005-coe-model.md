---
id: IV-Q-ARCH-005
type: iv-question
level: architect
round: theory
kind: theory
timebox: 10
difficulty: 4
topic: coe-model
crosslinks: []
---

## Question

Center of Excellence vs embedded QA in squads — trade-offs?

## What this tests

Operating model design.

## Model answer

CoE sets standards/tools; embedded owns domain tests. Pure CoE bottlenecks; pure embedded drifts. Hybrid: platform CoE + squad champions. Measure consistency via lint compliance + flake metrics.

## Strong answer signals

- Names Playwright mechanism for coe-model
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse coe-model in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for coe-model.

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
| 1 | No meaningful answer on coe-model; guesses or silent. |
| 2 | Partial coe-model answer with major gaps; needs heavy hints (architect). |
| 3 | Solid coe-model explanation with one missing trade-off or weak example. |
| 4 | Complete coe-model answer: mechanism, TypeScript example, trade-offs, real context. |
