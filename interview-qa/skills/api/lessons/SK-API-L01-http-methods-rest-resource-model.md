---
id: SK-API-L01
type: skill-lesson
track: SK-API
title: HTTP methods & REST resource model
topic: api-http-methods
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q001
---

## Concept

REST maps nouns (resources) to URLs and verbs (HTTP methods) to actions. GET reads, POST creates, PUT/PATCH updates, DELETE removes. Idempotent methods (GET, PUT, DELETE) should not change server state on repeat; POST is not idempotent.

## Why it matters for QA

API tests fail when teams treat every endpoint as POST or ignore idempotency — duplicate charges and phantom records follow.

## Worked example

```ts
import { test, expect } from '@playwright/test';

test('@skills GET account is idempotent', async ({ request }) => {
  const res = await request.get('/api/accounts/1');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toMatchObject({ id: '1' });
});
```

## Common mistakes

Using GET to mutate data; assuming 200 on DELETE without checking body; hard-coding URLs without baseURL.

## Interview angle

"Which HTTP method for a transfer?" — POST for create; GET must not move money.

## Try it

Answer MCQs `SK-API-Q001` in the Skills hub.

## Recap bullets

- Resources are nouns; methods are verbs
- GET/PUT/DELETE are idempotent
- Use typed JSON assertions
