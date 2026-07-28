---
id: IV-Q-MID-005
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: network-mock
crosslinks:
  - b11
---

## Question

How do you mock an API response with `page.route`? What cleanup is required?

## What this tests

Network interception hygiene.

## Model answer

```ts
await page.route('**/api/balances', async (route) => {
  await route.fulfill({ status: 200, body: JSON.stringify({ checking: 1000 }) });
});
await page.getByTestId('refresh-balances').click();
await expect(page.getByTestId('checking-balance')).toContainText('1000');

await page.unroute('**/api/balances');
```

Always `unroute` in fixture teardown or `afterEach` — leaked routes cause cross-test pollution in parallel runs.

## Strong answer signals

- Names Playwright mechanism for network-mock
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse network-mock in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for network-mock.

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
| 1 | No meaningful answer on network-mock; guesses or silent. |
| 2 | Partial network-mock answer with major gaps; needs heavy hints (mid). |
| 3 | Solid network-mock explanation with one missing trade-off or weak example. |
| 4 | Complete network-mock answer: mechanism, TypeScript example, trade-offs, real context. |
