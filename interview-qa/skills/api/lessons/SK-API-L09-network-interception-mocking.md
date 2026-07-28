---
id: SK-API-L09
type: skill-lesson
track: SK-API
title: Network interception & mocking
topic: network-mocking
estMinutes: 15
prereqIds: []
exerciseId: SK-API-E03
mcqIds:
  - SK-API-Q010
---

## Concept

Use page.route and route.fulfill for deterministic UI tests when backend is flaky or unavailable. Prefer fulfilling JSON over abort unless testing error UI.

## Why it matters for QA

Deterministic mocks separate UI logic tests from environment instability.

## Worked example

```ts
test('@skills mock accounts API', async ({ page }) => {
  await page.route('**/api/accounts', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: '1' }]) }),
  );
  await page.goto('/accounts');
  await expect(page.getByRole('row')).toHaveCount(1);
});
```

## Common mistakes

Using networkidle; mocking after navigation; forgetting to unroute in parallel workers.

## Interview angle

When mock vs hit real API in CI?

## Try it

Complete exercise `SK-API-E03` — run `npm --prefix practice-suite run exercise:skills`.

## Recap bullets

- route.fulfill for happy path
- Unroute in fixture teardown
- Never networkidle
