---
id: IV-Q-SR-021
type: iv-question
level: senior
round: scenario
kind: scenario
timebox: 10
difficulty: 4
topic: mass-failure
crosslinks:
  - c3
---

## Question

50 tests fail after a merge. Your first 15 minutes?

## What this tests

Incident triage leadership.

## Model answer

Check deploy correlation → sample one failure trace → classify (env vs app vs test) → if shared root (auth endpoint down), fix once not 50 tests → communicate status. Do not mass-skip without owner.

## Strong answer signals

- Names Playwright mechanism for mass-failure
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse mass-failure in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for mass-failure.

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
| 1 | No meaningful answer on mass-failure; guesses or silent. |
| 2 | Partial mass-failure answer with major gaps; needs heavy hints (senior). |
| 3 | Solid mass-failure explanation with one missing trade-off or weak example. |
| 4 | Complete mass-failure answer: mechanism, TypeScript example, trade-offs, real context. |
