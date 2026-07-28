---
id: SK-API-L10
type: skill-lesson
track: SK-API
title: Negative & edge API testing
topic: api-negative-testing
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q011
---

## Concept

Test 400 validation, empty arrays, null optional fields, boundary values. Negative tests document API contracts as much as happy paths.

## Why it matters for QA

Interviewers probe whether you only test sunny-day scenarios.

## Worked example

```ts
test('@skills invalid email returns 422', async ({ request }) => {
  const res = await request.post('/api/users', { data: { email: 'not-an-email' } });
  expect(res.status()).toBe(422);
});
```

## Common mistakes

Only happy path; not asserting error body shape; using invalid data that passes client validation.

## Interview angle

Give three negative API test cases for a transfer endpoint.

## Try it

Answer MCQs `SK-API-Q011` in the Skills hub.

## Recap bullets

- Assert error status and body
- Boundary values
- Empty collections
