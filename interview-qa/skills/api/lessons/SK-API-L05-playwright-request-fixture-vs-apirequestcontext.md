---
id: SK-API-L05
type: skill-lesson
track: SK-API
title: Playwright request fixture vs APIRequestContext
topic: api-request-fixture
estMinutes: 15
prereqIds: []
exerciseId: SK-API-E01
mcqIds:
  - SK-API-Q006
---

## Concept

`request` fixture is a pre-configured APIRequestContext sharing config baseURL and extra headers. `playwright.request.newContext()` creates isolated contexts for multi-tenant tests.

## Why it matters for QA

This is the #1 API testing question in Playwright interviews.

## Worked example

```ts
test('@skills request fixture', async ({ request }) => {
  const res = await request.get('/api/ping');
  expect(res.status()).toBe(200);
});
```

## Common mistakes

Using page.request when browser not needed; creating new context per assertion without disposal.

## Interview angle

When would you use a standalone APIRequestContext instead of the fixture?

## Try it

Complete exercise `SK-API-E01` — run `npm --prefix practice-suite run exercise:skills`.

## Recap bullets

- request fixture uses config baseURL
- Dispose custom contexts
- Browserless API tests are fast
