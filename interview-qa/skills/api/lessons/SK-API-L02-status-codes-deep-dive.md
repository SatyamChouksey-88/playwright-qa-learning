---
id: SK-API-L02
type: skill-lesson
track: SK-API
title: Status codes deep-dive
topic: api-status-codes
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q002
  - SK-API-Q003
---

## Concept

2xx success, 3xx redirect, 4xx client error, 5xx server error. In tests, assert the code that matches intent: 201 on create, 404 when resource missing, 401/403 for auth, 422 for validation.

## Why it matters for QA

Interviewers ask which code proves a bug vs expected validation — conflating 401 and 403 is a common fail.

## Worked example

```ts
test('@skills create returns 201', async ({ request }) => {
  const res = await request.post('/api/accounts', { data: { email: 'e2e@test.com' } });
  expect(res.status()).toBe(201);
});
```

## Common mistakes

Only asserting 200; ignoring 204 No Content bodies; treating 500 as pass with retries.

## Interview angle

Explain difference between 401, 403, and 404 with examples from banking APIs.

## Try it

Answer MCQs `SK-API-Q002`, `SK-API-Q003` in the Skills hub.

## Recap bullets

- Assert status before parsing body
- 4xx often expected in negative tests
- 5xx is a product bug signal
