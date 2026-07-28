---
id: IV-Q-SR-012
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 4
topic: contract-testing
crosslinks: []
---

## Question

Where does Pact/contract testing fit alongside Playwright?

## What this tests

Integration boundary judgment.

## Model answer

Contracts validate API shapes between services — fast, pre-E2E. Playwright validates user journeys with real integrated stack. Do not duplicate contract assertions in every E2E test.

## Strong answer signals

- Names Playwright mechanism for contract-testing
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse contract-testing in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for contract-testing.

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
| 1 | No meaningful answer on contract-testing; guesses or silent. |
| 2 | Partial contract-testing answer with major gaps; needs heavy hints (senior). |
| 3 | Solid contract-testing explanation with one missing trade-off or weak example. |
| 4 | Complete contract-testing answer: mechanism, TypeScript example, trade-offs, real context. |
