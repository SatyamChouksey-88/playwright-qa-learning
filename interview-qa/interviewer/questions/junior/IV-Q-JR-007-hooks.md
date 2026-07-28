---
id: IV-Q-JR-007
type: iv-question
level: junior
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: hooks
crosslinks: []
---

## Question

When should you use `test.beforeEach` vs a custom fixture?

## What this tests

Setup pattern judgment (junior level).

## Model answer

`beforeEach` for simple shared navigation. **Fixtures** when setup has teardown, multiple exports, or scope control (worker vs test).

```ts
// beforeEach — fine for goto
test.beforeEach(async ({ page }) => { await page.goto('/app'); });

// fixture — when returning composed helpers
const test = base.extend<{ shop: Shop }>({
  shop: async ({ page }, use) => { const s = new Shop(page); await use(s); },
});
```

Migrate to fixtures when `beforeEach` chains grow or need cleanup.

## Strong answer signals

- Names Playwright mechanism for hooks
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse hooks in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for hooks.

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
| 1 | No meaningful answer on hooks; guesses or silent. |
| 2 | Partial hooks answer with major gaps; needs heavy hints (junior). |
| 3 | Solid hooks explanation with one missing trade-off or weak example. |
| 4 | Complete hooks answer: mechanism, TypeScript example, trade-offs, real context. |
