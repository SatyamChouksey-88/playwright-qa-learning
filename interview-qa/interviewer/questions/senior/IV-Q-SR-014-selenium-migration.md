---
id: IV-Q-SR-014
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: selenium-migration
crosslinks: []
---

## Question

Key differences when migrating from Selenium to Playwright.

## What this tests

Migration leadership.

## Model answer

Auto-wait eliminates explicit waits; locators lazy-evaluate; built-in trace/video; no separate grid required; parallel by default. Rewrite selectors to web-first — do not transliterate CSS 1:1.

## Strong answer signals

- Names Playwright mechanism for selenium-migration
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse selenium-migration in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for selenium-migration.

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
| 1 | No meaningful answer on selenium-migration; guesses or silent. |
| 2 | Partial selenium-migration answer with major gaps; needs heavy hints (senior). |
| 3 | Solid selenium-migration explanation with one missing trade-off or weak example. |
| 4 | Complete selenium-migration answer: mechanism, TypeScript example, trade-offs, real context. |
