---
id: SK-TS-L01
type: skill-lesson
track: SK-TS
title: Strict mode & compiler options
topic: ts-strict
estMinutes: 15
prereqIds: []
exerciseId: SK-TS-E01
mcqIds:
  - SK-TS-Q001
  - SK-TS-Q002
---

## Concept

Strict mode & compiler options: TypeScript gives compile-time safety for test code — treat specs and page objects as production code with strict null checks and explicit return types.

## Why it matters for QA

2026 SDET interviews test whether you model product states with types, not whether you memorized Partial<T> syntax alone.

## Worked example

```ts
type ApiUser = { id: string; email: string; role: 'admin' | 'member' };

function isApiUser(value: unknown): value is ApiUser {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.email === 'string';
}
```

## Common mistakes

Using any for API responses; ignoring strictNullChecks; @ts-ignore on awaits.

## Interview angle

Explain how strict mode & compiler options prevents a real test bug.

## Try it

Complete exercise `SK-TS-E01` — run `npm --prefix practice-suite run exercise:skills`.

## Recap bullets

- strict: true in tsconfig
- Narrow unknown API data
- Type fixtures explicitly
