---
id: SK-API-L04
type: skill-lesson
track: SK-API
title: Auth types for API tests
topic: api-auth-headers
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q005
---

## Concept

Basic (Authorization: Basic …), Bearer JWT, API keys (header or query), session cookies. OAuth2 awareness: auth server issues token; resource server validates.

## Why it matters for QA

Senior roles expect you to seed auth once and reuse — not login via UI for every API call.

## Worked example

```ts
test('@skills bearer token', async ({ request }) => {
  const res = await request.get('/api/me', {
    headers: { Authorization: 'Bearer test-token' },
  });
  expect(res.ok()).toBeTruthy();
});
```

## Common mistakes

Committing real tokens; using UI login for pure API suites; mixing cookie and bearer without understanding.

## Interview angle

How do you store API credentials in CI safely?

## Try it

Answer MCQs `SK-API-Q005` in the Skills hub.

## Recap bullets

- Prefer Bearer or session from setup project
- Never commit secrets
- Use env vars in CI
