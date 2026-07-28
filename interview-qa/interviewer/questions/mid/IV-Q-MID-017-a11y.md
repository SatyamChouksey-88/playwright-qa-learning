---
id: IV-Q-MID-017
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: a11y
crosslinks: []
---

## Question

How do you integrate axe with Playwright?

## What this tests

Accessibility testing practice.

## Model answer

```ts
import AxeBuilder from '@axe-core/playwright';

test('accounts a11y', async ({ page }) => {
  await page.goto('/accounts');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

Run on key templates; fix critical violations — role locators complement but do not replace axe.

## Strong answer signals

- Names Playwright mechanism for a11y
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse a11y in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for a11y.

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
| 1 | No meaningful answer on a11y; guesses or silent. |
| 2 | Partial a11y answer with major gaps; needs heavy hints (mid). |
| 3 | Solid a11y explanation with one missing trade-off or weak example. |
| 4 | Complete a11y answer: mechanism, TypeScript example, trade-offs, real context. |
