---
id: IV-Q-MID-014
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: route-cleanup
crosslinks: []
---

## Question

Why must `page.unroute` run in fixture teardown?

## What this tests

Parallel pollution understanding.

## Model answer

Routes persist on the browser context until removed. Worker B may inherit mocked response from Worker A's test without unroute — false pass/fail. Fixture pattern:

```ts
mockBalances: async ({ page }, use) => {
  await page.route('**/api/**', handler);
  await use();
  await page.unroute('**/api/**');
},
```

## Strong answer signals

- Names Playwright mechanism for route-cleanup
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse route-cleanup in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for route-cleanup.

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
| 1 | No meaningful answer on route-cleanup; guesses or silent. |
| 2 | Partial route-cleanup answer with major gaps; needs heavy hints (mid). |
| 3 | Solid route-cleanup explanation with one missing trade-off or weak example. |
| 4 | Complete route-cleanup answer: mechanism, TypeScript example, trade-offs, real context. |
