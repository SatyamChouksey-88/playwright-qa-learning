---
id: IV-Q-ARCH-008
type: iv-question
level: architect
round: design
kind: design
timebox: 12
difficulty: 4
topic: multi-repo
crosslinks: []
---

## Question

E2E strategy when UI and API live in separate repos.

## What this tests

Cross-repo coordination.

## Model answer

Contract tests in API repo; smoke E2E in UI repo against deployed staging; shared test-id registry; versioned staging environment. Platform coordinates release train — tests pin environment version.

## Strong answer signals

- Names Playwright mechanism for multi-repo
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse multi-repo in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for multi-repo.

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
| 1 | No meaningful answer on multi-repo; guesses or silent. |
| 2 | Partial multi-repo answer with major gaps; needs heavy hints (architect). |
| 3 | Solid multi-repo explanation with one missing trade-off or weak example. |
| 4 | Complete multi-repo answer: mechanism, TypeScript example, trade-offs, real context. |
