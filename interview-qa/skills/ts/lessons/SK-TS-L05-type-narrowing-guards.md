---
id: SK-TS-L05
type: skill-lesson
track: SK-TS
title: Type narrowing & guards
topic: ts-type-guards
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-TS-Q009
  - SK-TS-Q010
---

## Concept

Type narrowing & guards: TypeScript gives compile-time safety for test code — treat specs and page objects as production code with strict null checks and explicit return types.

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

Explain how type narrowing & guards prevents a real test bug.

## Try it

Answer MCQs `SK-TS-Q009`, `SK-TS-Q010` in the Skills hub.

## Recap bullets

- strict: true in tsconfig
- Narrow unknown API data
- Type fixtures explicitly
