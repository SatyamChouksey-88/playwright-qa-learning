---
id: IV-Q-SR-009
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: ownership
crosslinks: []
---

## Question

How do you assign test ownership in a monorepo?

## What this tests

Governance model.

## Model answer

CODEOWNERS on `tests/e2e/<team>`, tags map to Slack channels, quarantine owner field. Feature teams own specs for their surface; platform team owns fixtures/CI.

## Strong answer signals

- Names Playwright mechanism for ownership
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse ownership in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for ownership.

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
| 1 | No meaningful answer on ownership; guesses or silent. |
| 2 | Partial ownership answer with major gaps; needs heavy hints (senior). |
| 3 | Solid ownership explanation with one missing trade-off or weak example. |
| 4 | Complete ownership answer: mechanism, TypeScript example, trade-offs, real context. |
