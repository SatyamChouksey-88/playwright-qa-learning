---
id: SK-API-E01
type: skill-exercise
track: SK-API
topic: api-request-fixture
kind: playwright
specFile: practice-suite/exercises/skills/SK-API-E01-api-request-fixture.spec.ts
runCommand: npm --prefix practice-suite run exercise:skills
---

## Goal

Implement getStatusCode(path) using Playwright request fixture pattern in pure TS helper.

## Starter code

```ts
export async function getStatusCode(baseUrl: string, path: string): Promise<number> {
  void baseUrl;
  void path;
  return 0;
}
```

## Task

Implement getStatusCode(path) using Playwright request fixture pattern in pure TS helper.

## Hints

- Read the lesson recap for this topic.
- Run the self-check spec after editing the starter file.

## Solution

```ts
import { request as pwRequest } from '@playwright/test';

export async function getStatusCode(baseUrl: string, path: string): Promise<number> {
  const ctx = await pwRequest.newContext({ baseURL: baseUrl });
  const res = await ctx.get(path);
  const code = res.status();
  await ctx.dispose();
  return code;
}
```

## Solution walkthrough

Compare your solution to the exemplar — focus on typing, edge cases, and Playwright idioms.

## Self-check

Run: `npm --prefix practice-suite run exercise:skills` — spec file: `practice-suite/exercises/skills/SK-API-E01-api-request-fixture.spec.ts`
