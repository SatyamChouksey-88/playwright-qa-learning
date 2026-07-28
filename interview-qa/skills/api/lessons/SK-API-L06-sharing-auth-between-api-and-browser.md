---
id: SK-API-L06
type: skill-lesson
track: SK-API
title: Sharing auth between API and browser
topic: api-hybrid-ui
estMinutes: 15
prereqIds: []
exerciseId: SK-API-E02
mcqIds:
  - SK-API-Q007
---

## Concept

Run auth via API, save storageState, load in UI project. Or set cookies on context via APIResponse headers.

## Why it matters for QA

Hybrid arrange-via-API / assert-via-UI is the professional pattern for stable E2E.

## Worked example

```ts
// setup/auth.setup.ts — login via API, save storage
test('authenticate', async ({ request }) => {
  const res = await request.post('/api/login', { data: { user: 'e2e', pass: 'secret' } });
  expect(res.ok()).toBeTruthy();
  await request.storageState({ path: 'playwright/.auth/user.json' });
});
```

## Common mistakes

UI login in every test; not invalidating storage when roles change.

## Interview angle

Describe storageState flow for admin vs member roles.

## Try it

Complete exercise `SK-API-E02` — run `npm --prefix practice-suite run exercise:skills`.

## Recap bullets

- API login once
- storageState for UI projects
- Separate roles = separate files
