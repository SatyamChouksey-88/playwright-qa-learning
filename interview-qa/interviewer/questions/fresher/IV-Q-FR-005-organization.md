---
id: IV-Q-FR-005
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 6
difficulty: 1
topic: organization
crosslinks: []
---

## Question

How do `test.describe` blocks help organize a spec file?

## What this tests

Basic suite structure and readability.

## Model answer

`test.describe` groups related tests with shared context in titles and optional hooks. It improves report readability and allows scoped `beforeEach`.

```ts
test.describe('Bank transfer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transfer');
  });

  test('valid transfer shows success', async ({ page }) => { /* ... */ });
  test('insufficient funds shows error', async ({ page }) => { /* ... */ });
});
```

Avoid deep nesting (>2 levels) — flatten into separate files when groups grow large.

## Strong answer signals

- Names Playwright mechanism for organization
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse organization in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for organization.

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
| 1 | No meaningful answer on organization; guesses or silent. |
| 2 | Partial organization answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid organization explanation with one missing trade-off or weak example. |
| 4 | Complete organization answer: mechanism, TypeScript example, trade-offs, real context. |
