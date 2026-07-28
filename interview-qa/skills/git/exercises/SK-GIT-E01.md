---
id: SK-GIT-E01
type: skill-exercise
track: SK-GIT
topic: git-conflicts
kind: text
specFile: practice-suite/exercises/skills/SK-GIT-E01-git-conflicts.spec.ts
runCommand: npm --prefix practice-suite run exercise:skills
expectedOutput: const x = 2;
---

## Goal

Resolve merge conflict markers in provided file text.

## Starter code

```ts
export function resolveConflict(raw: string): string {
  void raw;
  return '';
}
```

## Task

Resolve merge conflict markers in provided file text.

## Hints

- Read the lesson recap for this topic.
- Run the self-check spec after editing the starter file.

## Solution

```ts
export function resolveConflict(raw: string): string {
  const m = raw.match(/=======\r?\n([\s\S]*?)\r?\n>>>>>>>/);
  return (m?.[1] ?? '').trim();
}
```

## Solution walkthrough

Compare your solution to the exemplar — focus on typing, edge cases, and Playwright idioms.

## Self-check

Run: `npm --prefix practice-suite run exercise:skills` — spec file: `practice-suite/exercises/skills/SK-GIT-E01-git-conflicts.spec.ts`
