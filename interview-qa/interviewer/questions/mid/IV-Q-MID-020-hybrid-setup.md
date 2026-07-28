---
id: IV-Q-MID-020
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: hybrid-setup
crosslinks: []
---

## Question

Describe hybrid API seed + UI assert for a transfer test.

## What this tests

Practical arrange-act-assert split.

## Model answer

Arrange via API (fund accounts), Act via UI (submit transfer form), Assert UI success + optional API verify. Keeps test fast and focused on UI validation while avoiding lengthy setup clicks.

## Strong answer signals

- Names Playwright mechanism for hybrid-setup
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse hybrid-setup in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for hybrid-setup.

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
| 1 | No meaningful answer on hybrid-setup; guesses or silent. |
| 2 | Partial hybrid-setup answer with major gaps; needs heavy hints (mid). |
| 3 | Solid hybrid-setup explanation with one missing trade-off or weak example. |
| 4 | Complete hybrid-setup answer: mechanism, TypeScript example, trade-offs, real context. |
