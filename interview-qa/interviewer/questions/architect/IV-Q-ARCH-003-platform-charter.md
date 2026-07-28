---
id: IV-Q-ARCH-003
type: iv-question
level: architect
round: design
kind: design
timebox: 15
difficulty: 5
topic: platform-charter
crosslinks: []
---

## Question

Write a charter for a Test Platform team supporting 200 engineers.

## What this tests

Org design for quality at scale.

## Model answer

Mission: reliable fast feedback loops. Services: CI runners, fixture libraries, seed envs, metrics, training. Non-goals: writing every feature test. SLAs: CI p95, flake budget, onboarding time. Interface: RFC process for breaking fixture changes.

## Strong answer signals

- Names Playwright mechanism for platform-charter
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse platform-charter in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for platform-charter.

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
| 1 | No meaningful answer on platform-charter; guesses or silent. |
| 2 | Partial platform-charter answer with major gaps; needs heavy hints (architect). |
| 3 | Solid platform-charter explanation with one missing trade-off or weak example. |
| 4 | Complete platform-charter answer: mechanism, TypeScript example, trade-offs, real context. |
