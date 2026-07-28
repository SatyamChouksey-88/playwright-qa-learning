---
id: IV-Q-MID-002
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: fixture-scope
crosslinks: []
---

## Question

What is the difference between test scope and worker scope fixtures?

## What this tests

Parallel safety and performance trade-offs.

## Model answer

**Test scope** (default): new instance per test — `page`, per-test data. **Worker scope**: one instance per parallel worker — expensive clients (`APIRequestContext`, DB pool).

```ts
export const test = base.extend<{ api: ApiClient }, { workerApi: ApiClient }>({
  workerApi: [async ({}, use) => { const c = new ApiClient(); await use(c); await c.dispose(); }, { scope: 'worker' }],
  api: async ({ workerApi }, use) => { await use(workerApi); },
});
```

Wrong scope causes pollution (test scope too wide) or slowness (worker scope for page).

## Strong answer signals

- Names Playwright mechanism for fixture-scope
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse fixture-scope in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for fixture-scope.

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
| 1 | No meaningful answer on fixture-scope; guesses or silent. |
| 2 | Partial fixture-scope answer with major gaps; needs heavy hints (mid). |
| 3 | Solid fixture-scope explanation with one missing trade-off or weak example. |
| 4 | Complete fixture-scope answer: mechanism, TypeScript example, trade-offs, real context. |
