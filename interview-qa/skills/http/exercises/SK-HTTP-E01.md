---
id: SK-HTTP-E01
type: skill-exercise
track: SK-HTTP
topic: http-cors
kind: text
specFile: practice-suite/exercises/skills/SK-HTTP-E01-http-cors.spec.ts
runCommand: npm --prefix practice-suite run exercise:skills
---

## Goal

Given headers, identify CORS issue type.

## Starter code

```ts
export function diagnoseCors(hasOrigin: boolean, hasCredentials: boolean): string {
  void hasOrigin;
  void hasCredentials;
  return 'unknown';
}
```

## Task

Given headers, identify CORS issue type.

## Hints

- Read the lesson recap for this topic.
- Run the self-check spec after editing the starter file.

## Solution

```ts
export function diagnoseCors(hasOrigin: boolean, hasCredentials: boolean): string {
  if (!hasOrigin) return 'missing-access-control-allow-origin';
  if (hasCredentials) return 'credentials-requires-specific-origin';
  return 'ok';
}
```

## Solution walkthrough

Compare your solution to the exemplar — focus on typing, edge cases, and Playwright idioms.

## Self-check

Run: `npm --prefix practice-suite run exercise:skills` — spec file: `practice-suite/exercises/skills/SK-HTTP-E01-http-cors.spec.ts`
