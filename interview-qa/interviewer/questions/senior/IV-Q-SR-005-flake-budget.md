---
id: IV-Q-SR-005
type: iv-question
level: senior
round: theory
kind: theory
timebox: 10
difficulty: 4
topic: flake-budget
crosslinks: []
---

## Question

Define a flake budget metric and escalation path.

## What this tests

Operational quality leadership.

## Model answer

Metric: **flake rate** = retried passes / total runs. Budget: <1% on main gate. Escalation: >2% blocks feature work → quarantine sprint. Weekly dashboard; root-cause categories tracked. Retries are measurement noise reduction, not fix.

## Strong answer signals

- Names Playwright mechanism for flake-budget
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse flake-budget in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for flake-budget.

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
| 1 | No meaningful answer on flake-budget; guesses or silent. |
| 2 | Partial flake-budget answer with major gaps; needs heavy hints (senior). |
| 3 | Solid flake-budget explanation with one missing trade-off or weak example. |
| 4 | Complete flake-budget answer: mechanism, TypeScript example, trade-offs, real context. |
