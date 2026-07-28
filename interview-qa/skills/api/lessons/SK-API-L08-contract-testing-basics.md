---
id: SK-API-L08
type: skill-lesson
track: SK-API
title: Contract testing basics
topic: contract-testing
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q009
---

## Concept

Consumer tests define expected provider behavior; versioning and backward compatibility prevent breaking clients. Playwright API tests often serve as lightweight contract checks.

## Why it matters for QA

Microservice teams ask how you catch breaking API changes before merge.

## Worked example

```ts
test('@skills contract: account shape', async ({ request }) => {
  const res = await request.get('/api/accounts/1');
  expect(res.status()).toBe(200);
  await expect(res).toMatchObject({ json: { id: expect.any(String), balance: expect.any(Number) } });
});
```

## Common mistakes

Testing provider internals; no version header checks; duplicating same contract in 50 E2E tests.

## Interview angle

Difference between contract tests and full E2E for an API change?

## Try it

Answer MCQs `SK-API-Q009` in the Skills hub.

## Recap bullets

- Consumer-driven contracts
- Version breaking changes explicitly
- Keep contract tests fast
