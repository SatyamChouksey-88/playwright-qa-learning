---
id: IV-Q-SR-025
type: iv-question
level: senior
round: design
kind: design
timebox: 10
difficulty: 4
topic: restraint
crosslinks: []
---

## Question

Name three things you would NOT build in v1 of a test framework.

## What this tests

Judgment / anti-over-engineering.

## Model answer

Custom test runner, deep BaseTest inheritance tree, plugin marketplace, proprietary visual diff SaaS. Ship: fixtures, auth setup, tagging, CI sharding, lint.

## Strong answer signals

- Names Playwright mechanism for restraint
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse restraint in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for restraint.

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
| 1 | No meaningful answer on restraint; guesses or silent. |
| 2 | Partial restraint answer with major gaps; needs heavy hints (senior). |
| 3 | Solid restraint explanation with one missing trade-off or weak example. |
| 4 | Complete restraint answer: mechanism, TypeScript example, trade-offs, real context. |
