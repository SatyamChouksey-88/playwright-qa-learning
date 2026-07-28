---
id: IV-Q-MID-008
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: trace
crosslinks: []
---

## Question

What do you inspect first in Trace Viewer for a timeout failure?

## What this tests

Practical debugging workflow.

## Model answer

Open failing action → check **before/after DOM snapshot**, **network panel** (pending requests?), **console** errors, **prior action** duration. Identify whether locator never matched, element hidden, or prior navigation incomplete. Timeout on `toHaveURL` often means redirect never happened — inspect network 401/500.

## Strong answer signals

- Names Playwright mechanism for trace
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse trace in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for trace.

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
| 1 | No meaningful answer on trace; guesses or silent. |
| 2 | Partial trace answer with major gaps; needs heavy hints (mid). |
| 3 | Solid trace explanation with one missing trade-off or weak example. |
| 4 | Complete trace answer: mechanism, TypeScript example, trade-offs, real context. |
