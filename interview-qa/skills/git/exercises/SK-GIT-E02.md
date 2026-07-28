---
id: SK-GIT-E02
type: skill-exercise
track: SK-GIT
topic: git-merge-rebase
kind: text
specFile: practice-suite/exercises/skills/SK-GIT-E02-git-merge-rebase.spec.ts
runCommand: npm --prefix practice-suite run exercise:skills
---

## Goal

Return correct ordered git commands after failed rebase.

## Starter code

```ts
export function rebaseContinueSteps(): string[] {
  return [];
}
```

## Task

Return correct ordered git commands after failed rebase.

## Hints

- Read the lesson recap for this topic.
- Run the self-check spec after editing the starter file.

## Solution

```ts
export function rebaseContinueSteps(): string[] {
  return ['git add .', 'git rebase --continue'];
}
```

## Solution walkthrough

Compare your solution to the exemplar — focus on typing, edge cases, and Playwright idioms.

## Self-check

Run: `npm --prefix practice-suite run exercise:skills` — spec file: `practice-suite/exercises/skills/SK-GIT-E02-git-merge-rebase.spec.ts`
