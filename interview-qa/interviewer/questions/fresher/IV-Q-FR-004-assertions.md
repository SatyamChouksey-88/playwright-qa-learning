---
id: IV-Q-FR-004
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 6
difficulty: 1
topic: assertions
crosslinks: []
---

## Question

Why use `expect` from `@playwright/test` instead of `assert` from Node?

## What this tests

Understanding of web-first assertions with auto-retry.

## Model answer

Playwright `expect` is **web-first**: it retries until timeout for locators and page state. Node `assert` checks once immediately — flaky for async UI.

```ts
await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
await expect(page).toHaveURL(/accounts/);
await expect(page.getByTestId('balance')).toHaveText(/\$[\d,]+/);
```

Use soft assertions (`expect.soft`) when collecting multiple UI checks in one test, but default to hard assertions for critical path gates.

## Strong answer signals

- Names Playwright mechanism for assertions
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse assertions in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for assertions.

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
| 1 | No meaningful answer on assertions; guesses or silent. |
| 2 | Partial assertions answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid assertions explanation with one missing trade-off or weak example. |
| 4 | Complete assertions answer: mechanism, TypeScript example, trade-offs, real context. |
