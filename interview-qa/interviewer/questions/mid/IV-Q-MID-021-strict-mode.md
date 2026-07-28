---
id: IV-Q-MID-021
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: strict-mode
crosslinks: []
---

## Question

What is a strict mode locator violation and how do you fix it?

## What this tests

Locator ambiguity handling.

## Model answer

Playwright throws when a locator resolves to **multiple elements**. Fix: narrow with `filter`, `nth`, parent scope, or more specific role name — never `force: true`.

```ts
await page.getByRole('listitem').filter({ hasText: 'Checking' }).click();
```

## Strong answer signals

- Names Playwright mechanism for strict-mode
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse strict-mode in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for strict-mode.

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
| 1 | No meaningful answer on strict-mode; guesses or silent. |
| 2 | Partial strict-mode answer with major gaps; needs heavy hints (mid). |
| 3 | Solid strict-mode explanation with one missing trade-off or weak example. |
| 4 | Complete strict-mode answer: mechanism, TypeScript example, trade-offs, real context. |
