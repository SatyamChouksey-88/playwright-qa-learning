---
id: IV-Q-ARCH-014
type: iv-question
level: architect
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: executive-reporting
crosslinks: []
---

## Question

One-page quality dashboard for CTO — what tiles?

## What this tests

Communication upward.

## Model answer

Flake rate, gate pass rate, p95 CI duration, quarantine count, escaped defects P1/P2, coverage of critical journeys (not line %). Red/yellow/green with owner per tile.

## Strong answer signals

- Names Playwright mechanism for executive-reporting
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse executive-reporting in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for executive-reporting.

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
| 1 | No meaningful answer on executive-reporting; guesses or silent. |
| 2 | Partial executive-reporting answer with major gaps; needs heavy hints (architect). |
| 3 | Solid executive-reporting explanation with one missing trade-off or weak example. |
| 4 | Complete executive-reporting answer: mechanism, TypeScript example, trade-offs, real context. |
