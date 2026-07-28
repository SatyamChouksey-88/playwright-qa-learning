---
id: SK-API-E03
type: skill-exercise
track: SK-API
topic: network-mocking
kind: playwright
specFile: practice-suite/exercises/skills/SK-API-E03-network-mocking.spec.ts
runCommand: npm --prefix practice-suite run exercise:skills
---

## Goal

Implement mockJsonRoute(body) returning a fulfill handler.

## Starter code

```ts
export function mockJsonRoute(body: unknown) {
  void body;
  return async () => {};
}
```

## Task

Implement mockJsonRoute(body) returning a fulfill handler.

## Hints

- Read the lesson recap for this topic.
- Run the self-check spec after editing the starter file.

## Solution

```ts
import type { Route } from '@playwright/test';

export function mockJsonRoute(body: unknown) {
  return async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  };
}
```

## Solution walkthrough

Compare your solution to the exemplar — focus on typing, edge cases, and Playwright idioms.

## Self-check

Run: `npm --prefix practice-suite run exercise:skills` — spec file: `practice-suite/exercises/skills/SK-API-E03-network-mocking.spec.ts`
