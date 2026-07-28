---
id: IV-Q-JR-009
type: iv-question
level: junior
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: trace
crosslinks: []
---

## Question

Explain `trace: on-first-retry` and why teams use it in CI.

## What this tests

Artifact policy trade-off.

## Model answer

Records trace only when a failed test retries — balances **debuggability** vs **storage cost**.

```ts
retries: process.env.CI ? 1 : 0,
use: { trace: 'on-first-retry' },
```

First failure may be flake; trace on retry captures evidence without tracing every passing run. Pair with merge-reports for sharded CI.

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
| 2 | Partial trace answer with major gaps; needs heavy hints (junior). |
| 3 | Solid trace explanation with one missing trade-off or weak example. |
| 4 | Complete trace answer: mechanism, TypeScript example, trade-offs, real context. |
