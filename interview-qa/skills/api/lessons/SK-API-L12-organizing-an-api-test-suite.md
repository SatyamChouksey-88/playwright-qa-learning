---
id: SK-API-L12
type: skill-lesson
track: SK-API
title: Organizing an API test suite
topic: api-client-fixture
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q013
  - SK-API-Q014
---

## Concept

Group by resource or user journey. Extract API client helpers in fixtures — thin wrappers around request with typed methods.

## Why it matters for QA

Maintainability question — fat tests vs layered API clients.

## Worked example

```ts
import { test as base } from '@playwright/test';

type AccountsApi = { create(email: string): Promise<string> };
export const test = base.extend<{ accounts: AccountsApi }>({
  accounts: async ({ request }, use) => {
    await use({
      async create(email) {
        const res = await request.post('/api/accounts', { data: { email } });
        const body = await res.json();
        return body.id as string;
      },
    });
  },
});
```

## Common mistakes

Copy-pasting URL strings; no baseURL; mixing API and UI assertions in one 200-line test.

## Interview angle

Folder structure for a growing API suite?

## Try it

Answer MCQs `SK-API-Q013`, `SK-API-Q014` in the Skills hub.

## Recap bullets

- Thin API fixtures
- Typed helpers
- Separate API vs E2E projects
