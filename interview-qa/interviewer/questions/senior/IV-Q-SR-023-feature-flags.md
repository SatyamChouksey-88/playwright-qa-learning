---
id: IV-Q-SR-023
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: feature-flags
crosslinks: []
---

## Question

Test both sides of a feature flag without doubling suite size.

## What this tests

Pragmatic coverage.

## Model answer

Default path = flag on in staging; single spec with matrix override via fixture/env for off path. Avoid combinatorial explosion — test flag logic at unit level.

## Strong answer signals

- Names Playwright mechanism for feature-flags
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse feature-flags in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for feature-flags.

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
| 1 | No meaningful answer on feature-flags; guesses or silent. |
| 2 | Partial feature-flags answer with major gaps; needs heavy hints (senior). |
| 3 | Solid feature-flags explanation with one missing trade-off or weak example. |
| 4 | Complete feature-flags answer: mechanism, TypeScript example, trade-offs, real context. |
