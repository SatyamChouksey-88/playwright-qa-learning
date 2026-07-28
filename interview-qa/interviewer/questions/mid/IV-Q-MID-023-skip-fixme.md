---
id: IV-Q-MID-023
type: iv-question
level: mid
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: skip-fixme
crosslinks: []
---

## Question

Difference between `test.skip`, `test.fixme`, and quarantine tags?

## What this tests

Test status hygiene.

## Model answer

`skip`: conditional or permanent omit with reason. `fixme`: known broken — fails if unexpectedly passes. Quarantine: operational tag excluding from gates with owner tracking. All require ticket link.

## Strong answer signals

- Names Playwright mechanism for skip-fixme
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse skip-fixme in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for skip-fixme.

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
| 1 | No meaningful answer on skip-fixme; guesses or silent. |
| 2 | Partial skip-fixme answer with major gaps; needs heavy hints (mid). |
| 3 | Solid skip-fixme explanation with one missing trade-off or weak example. |
| 4 | Complete skip-fixme answer: mechanism, TypeScript example, trade-offs, real context. |
