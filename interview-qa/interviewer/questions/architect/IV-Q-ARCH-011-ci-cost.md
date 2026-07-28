---
id: IV-Q-ARCH-011
type: iv-question
level: architect
round: design
kind: design
timebox: 10
difficulty: 4
topic: ci-cost
crosslinks: []
---

## Question

Cut CI cost 40% without raising escaped defects.

## What this tests

Economic optimization.

## Model answer

Shard optimization, smoke vs full split, cache browsers, disable video on green, schedule full runs off-peak, quarantine expensive flaky tests, right-size workers. Measure escaped defects weekly during cutover.

## Strong answer signals

- Names Playwright mechanism for ci-cost
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse ci-cost in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for ci-cost.

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
| 1 | No meaningful answer on ci-cost; guesses or silent. |
| 2 | Partial ci-cost answer with major gaps; needs heavy hints (architect). |
| 3 | Solid ci-cost explanation with one missing trade-off or weak example. |
| 4 | Complete ci-cost answer: mechanism, TypeScript example, trade-offs, real context. |
