---
id: SK-TS-E04
type: skill-exercise
track: SK-TS
topic: ts-factories
kind: playwright
specFile: practice-suite/exercises/skills/SK-TS-E04-ts-factories.spec.ts
runCommand: npm --prefix practice-suite run exercise:skills
---

## Goal

TS drill 4: implement buildUser with typed email.

## Starter code

```ts
export type User = { email: string; role: 'admin' | 'member' };
export function buildUser(email: string): User {
  return { email, role: 'admin' };
}
```

## Task

TS drill 4: implement buildUser with typed email.

## Hints

- Read the lesson recap for this topic.
- Run the self-check spec after editing the starter file.

## Solution

```ts
export type User = { email: string; role: 'admin' | 'member' };
export function buildUser(email: string, role: User['role'] = 'member'): User {
  return { email, role };
}
```

## Solution walkthrough

Compare your solution to the exemplar — focus on typing, edge cases, and Playwright idioms.

## Self-check

Run: `npm --prefix practice-suite run exercise:skills` — spec file: `practice-suite/exercises/skills/SK-TS-E04-ts-factories.spec.ts`
