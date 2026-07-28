---
id: IV-Q-MID-019
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: blob-reporter
crosslinks: []
---

## Question

Why use blob reporter with sharded CI?

## What this tests

Report merging knowledge.

## Model answer

Each shard writes blob report; merge step produces unified HTML:

```bash
npx playwright test --shard=1/4 --reporter=blob
npx playwright merge-reports ./blob-report
```

Devs get one artifact link with all failures — essential for large suites.

## Strong answer signals

- Names Playwright mechanism for blob-reporter
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse blob-reporter in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for blob-reporter.

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
| 1 | No meaningful answer on blob-reporter; guesses or silent. |
| 2 | Partial blob-reporter answer with major gaps; needs heavy hints (mid). |
| 3 | Solid blob-reporter explanation with one missing trade-off or weak example. |
| 4 | Complete blob-reporter answer: mechanism, TypeScript example, trade-offs, real context. |
