---
id: IV-Q-JR-011
type: iv-question
level: junior
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: soft-assertions
crosslinks: []
---

## Question

When are soft assertions appropriate?

## What this tests

Assertion strategy.

## Model answer

```ts
await expect.soft(page.getByText('Header')).toBeVisible();
await expect.soft(page.getByText('Footer')).toBeVisible();
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
```

Soft asserts collect failures until test end — good for **non-blocking UI surveys** (many labels on a dashboard). Critical path gates stay hard asserts.

## Strong answer signals

- Names Playwright mechanism for soft-assertions
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse soft-assertions in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for soft-assertions.

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
| 1 | No meaningful answer on soft-assertions; guesses or silent. |
| 2 | Partial soft-assertions answer with major gaps; needs heavy hints (junior). |
| 3 | Solid soft-assertions explanation with one missing trade-off or weak example. |
| 4 | Complete soft-assertions answer: mechanism, TypeScript example, trade-offs, real context. |
