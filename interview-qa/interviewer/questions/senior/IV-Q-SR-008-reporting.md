---
id: IV-Q-SR-008
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: reporting
crosslinks: []
---

## Question

How do developers access CI artifacts without SSH?

## What this tests

Developer experience for failures.

## Model answer

Upload HTML report + trace zip as CI artifacts; PR comment with link. Use merge-reports for shards. Integrate with Slack/JUnit for trends. Target: <2 min from red build to trace open.

## Strong answer signals

- Names Playwright mechanism for reporting
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse reporting in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for reporting.

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
| 1 | No meaningful answer on reporting; guesses or silent. |
| 2 | Partial reporting answer with major gaps; needs heavy hints (senior). |
| 3 | Solid reporting explanation with one missing trade-off or weak example. |
| 4 | Complete reporting answer: mechanism, TypeScript example, trade-offs, real context. |
