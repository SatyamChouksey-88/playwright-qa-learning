---
id: SK-API-E02
type: skill-exercise
track: SK-API
topic: api-hybrid-ui
kind: playwright
specFile: practice-suite/exercises/skills/SK-API-E02-api-hybrid-ui.spec.ts
runCommand: npm --prefix practice-suite run exercise:skills
---

## Goal

Implement hasAuthCookie(cookies) returning true when session cookie present.

## Starter code

```ts
export type Cookie = { name: string; value: string };
export function hasAuthCookie(cookies: Cookie[]): boolean {
  void cookies;
  return false;
}
```

## Task

Implement hasAuthCookie(cookies) returning true when session cookie present.

## Hints

- Read the lesson recap for this topic.
- Run the self-check spec after editing the starter file.

## Solution

```ts
export type Cookie = { name: string; value: string };
export function hasAuthCookie(cookies: Cookie[]): boolean {
  return cookies.some((c) => c.name === 'session' && c.value.length > 0);
}
```

## Solution walkthrough

Compare your solution to the exemplar — focus on typing, edge cases, and Playwright idioms.

## Self-check

Run: `npm --prefix practice-suite run exercise:skills` — spec file: `practice-suite/exercises/skills/SK-API-E02-api-hybrid-ui.spec.ts`
