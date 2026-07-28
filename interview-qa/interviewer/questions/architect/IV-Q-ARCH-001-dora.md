---
id: IV-Q-ARCH-001
type: iv-question
level: architect
round: theory
kind: theory
timebox: 10
difficulty: 4
topic: dora
crosslinks:
  - d2
---

## Question

Which DORA metrics relate to test automation and how would you move them?

## What this tests

Executive-level quality metrics.

## Model answer

**Deployment frequency** and **lead time** improve with fast reliable gates; **change fail rate** drops with good E2E signal; **MTTR** improves with traces + ownership. Move metrics by shrinking flake rate, parallel CI, and quarantine discipline — not by disabling tests.

## Strong answer signals

- Names Playwright mechanism for dora
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse dora in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for dora.

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
| 1 | No meaningful answer on dora; guesses or silent. |
| 2 | Partial dora answer with major gaps; needs heavy hints (architect). |
| 3 | Solid dora explanation with one missing trade-off or weak example. |
| 4 | Complete dora answer: mechanism, TypeScript example, trade-offs, real context. |
