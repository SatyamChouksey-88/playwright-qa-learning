---
id: IV-Q-MID-001
type: iv-question
level: mid
round: theory
kind: theory
timebox: 10
difficulty: 3
topic: fixtures
crosslinks:
  - b8
---

## Question

Explain custom fixtures with `test.extend`. Why prefer fixtures over global variables?

## What this tests

Fixture composition and isolation.

## Model answer

Fixtures declare setup/teardown with typed injection. Playwright manages lifecycle and parallel safety.

```ts
type ShopFixtures = { shop: ShopPage };
export const test = base.extend<ShopFixtures>({
  shop: async ({ page }, use) => {
    const shop = new ShopPage(page);
    await shop.open();
    await use(shop);
  },
});
```

Globals leak across parallel workers; fixtures scope resources per test and compose via `mergeTests`.

## Strong answer signals

- Names Playwright mechanism for fixtures
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse fixtures in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for fixtures.

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
| 1 | No meaningful answer on fixtures; guesses or silent. |
| 2 | Partial fixtures answer with major gaps; needs heavy hints (mid). |
| 3 | Solid fixtures explanation with one missing trade-off or weak example. |
| 4 | Complete fixtures answer: mechanism, TypeScript example, trade-offs, real context. |
