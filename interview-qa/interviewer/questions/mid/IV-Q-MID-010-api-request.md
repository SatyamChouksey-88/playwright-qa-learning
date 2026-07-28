---
id: IV-Q-MID-010
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: api-request
crosslinks: []
---

## Question

When do you use `request` fixture vs `page` for setup?

## What this tests

Hybrid API+UI pattern.

## Model answer

`request` (`APIRequestContext`) seeds data fast without UI:

```ts
test('shows new account', async ({ page, request }) => {
  await request.post('/api/accounts', { data: { type: 'savings' } });
  await page.goto('/accounts');
  await expect(page.getByText('Savings')).toBeVisible();
});
```

Use UI only for flows under test; use API for arrange steps when endpoint exists.

## Strong answer signals

- Names Playwright mechanism for api-request
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse api-request in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for api-request.

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
| 1 | No meaningful answer on api-request; guesses or silent. |
| 2 | Partial api-request answer with major gaps; needs heavy hints (mid). |
| 3 | Solid api-request explanation with one missing trade-off or weak example. |
| 4 | Complete api-request answer: mechanism, TypeScript example, trade-offs, real context. |
