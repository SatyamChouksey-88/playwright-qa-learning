---
id: IV-Q-SR-015
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: mobile-emulation
crosslinks: []
---

## Question

What does mobile emulation test and what does it miss?

## What this tests

Coverage honesty.

## Model answer

Emulation tests responsive layout + touch events in Chromium — not real Safari WebKit or device GPU. Use for layout breakpoints; reserve device farm for release-critical mobile.

## Strong answer signals

- Names Playwright mechanism for mobile-emulation
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse mobile-emulation in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for mobile-emulation.

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
| 1 | No meaningful answer on mobile-emulation; guesses or silent. |
| 2 | Partial mobile-emulation answer with major gaps; needs heavy hints (senior). |
| 3 | Solid mobile-emulation explanation with one missing trade-off or weak example. |
| 4 | Complete mobile-emulation answer: mechanism, TypeScript example, trade-offs, real context. |
