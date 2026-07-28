---
id: SK-API-L11
type: skill-lesson
track: SK-API
title: Data setup/teardown via API
topic: api-setup-teardown
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q012
---

## Concept

Create test data via POST, delete via DELETE in afterEach or fixture teardown. Faster and more reliable than UI-only setup.

## Why it matters for QA

Slow UI setup is the main cause of long CI times and order-dependent tests.

## Worked example

```ts
test('@skills seed via API', async ({ request }) => {
  const create = await request.post('/api/accounts', { data: { balance: 1000 } });
  const { id } = await create.json();
  const res = await request.get(`/api/accounts/${id}`);
  expect(res.ok()).toBeTruthy();
});
```

## Common mistakes

Shared golden accounts; no cleanup; setup in beforeAll without worker isolation.

## Interview angle

How do you isolate API-created data in parallel CI?

## Try it

Answer MCQs `SK-API-Q012` in the Skills hub.

## Recap bullets

- Unique data per test
- API teardown
- Fixtures own cleanup
