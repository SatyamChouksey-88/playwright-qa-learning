---
id: IV-Q-SR-010
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: code-review
crosslinks: []
---

## Question

What do you check in a Playwright PR review checklist?

## What this tests

Quality gate design.

## Model answer

Locators web-first, no banned patterns, isolated data, routes cleaned, assertions in spec, tags appropriate, no sleep, trace useful on failure, runtime impact noted.

## Strong answer signals

- Names Playwright mechanism for code-review
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse code-review in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for code-review.

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
| 1 | No meaningful answer on code-review; guesses or silent. |
| 2 | Partial code-review answer with major gaps; needs heavy hints (senior). |
| 3 | Solid code-review explanation with one missing trade-off or weak example. |
| 4 | Complete code-review answer: mechanism, TypeScript example, trade-offs, real context. |
