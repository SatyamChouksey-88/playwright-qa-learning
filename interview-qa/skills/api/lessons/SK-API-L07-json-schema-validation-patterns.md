---
id: SK-API-L07
type: skill-lesson
track: SK-API
title: JSON schema validation patterns
topic: api-json-assertions
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q008
---

## Concept

Assert shape with toMatchObject, property checks, and TypeScript narrowing. Prefer explicit fields over snapshotting entire payloads.

## Why it matters for QA

Untyped JSON assertions hide contract drift until production.

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

Snapshotting timestamps; asserting entire response when only id matters; using any.

## Interview angle

How do you validate API contracts without a heavy schema library?

## Try it

Answer MCQs `SK-API-Q008` in the Skills hub.

## Recap bullets

- toMatchObject for shape
- Type guards for unknown
- Avoid full snapshots on dynamic fields
