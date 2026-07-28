---
id: IV-Q-ARCH-002
type: iv-question
level: architect
round: theory
kind: theory
timebox: 10
difficulty: 4
topic: flake-budget-org
crosslinks: []
---

## Question

Design org-wide flake budget and accountability model.

## What this tests

Organizational quality strategy.

## Model answer

Central dashboard: flake rate per team, quarantine age, retry rate. Budget thresholds tie to release authority. Staff test platform sets policy; feature teams own remediation SLAs. Escalate repeat offenders to eng leadership with data.

## Strong answer signals

- Names Playwright mechanism for flake-budget-org
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse flake-budget-org in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for flake-budget-org.

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
| 1 | No meaningful answer on flake-budget-org; guesses or silent. |
| 2 | Partial flake-budget-org answer with major gaps; needs heavy hints (architect). |
| 3 | Solid flake-budget-org explanation with one missing trade-off or weak example. |
| 4 | Complete flake-budget-org answer: mechanism, TypeScript example, trade-offs, real context. |
