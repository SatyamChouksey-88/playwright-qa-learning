---
id: IV-Q-SR-006
type: iv-question
level: senior
round: theory
kind: theory
timebox: 10
difficulty: 4
topic: api-client-fixture
crosslinks: []
---

## Question

Design a worker-scoped API client fixture with disposal.

## What this tests

Resource lifecycle at scale.

## Model answer

```ts
export const test = base.extend<{}, { api: ApiClient }>({
  api: [async ({}, use) => {
    const client = await ApiClient.create();
    await use(client);
    await client.dispose();
  }, { scope: 'worker' }],
});
```

Dispose closes connections — critical in long CI workers.

## Strong answer signals

- Names Playwright mechanism for api-client-fixture
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse api-client-fixture in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for api-client-fixture.

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
| 1 | No meaningful answer on api-client-fixture; guesses or silent. |
| 2 | Partial api-client-fixture answer with major gaps; needs heavy hints (senior). |
| 3 | Solid api-client-fixture explanation with one missing trade-off or weak example. |
| 4 | Complete api-client-fixture answer: mechanism, TypeScript example, trade-offs, real context. |
