---
id: IV-Q-JR-006
type: iv-question
level: junior
round: theory
kind: theory
timebox: 8
difficulty: 2
topic: async
crosslinks:
  - a2
---

## Question

A test passes locally but the assertion never runs in CI. What is the most common cause?

## What this tests

Missing await detection.

## Model answer

**Missing `await`** on Playwright async calls — the test exits before the assertion runs, sometimes passing vacuously.

```ts
// Bug
page.getByRole('button').click();
expect(page).toHaveURL(/done/);

// Fix
await page.getByRole('button').click();
await expect(page).toHaveURL(/done/);
```

Enable ESLint rules for floating promises; use `@typescript-eslint/no-floating-promises` in test repos.

## Strong answer signals

- Names Playwright mechanism for async
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse async in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for async.

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
| 1 | No meaningful answer on async; guesses or silent. |
| 2 | Partial async answer with major gaps; needs heavy hints (junior). |
| 3 | Solid async explanation with one missing trade-off or weak example. |
| 4 | Complete async answer: mechanism, TypeScript example, trade-offs, real context. |
