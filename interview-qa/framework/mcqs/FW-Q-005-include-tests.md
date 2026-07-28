---
id: FW-Q-005
type: framework-mcq
topic: framework
subtopic: tsconfig
difficulty: intermediate
stage: 1
answerIndex: 1
lesson: FW-L-102
---

## Question

What should tsconfig `include` cover in a Playwright suite?

## Options

1. Only playwright.config.ts
2. tests, pages, fixtures, and config files
3. node_modules/@playwright/test only
4. Compiled JavaScript output only

## Correct answer

tests, pages, fixtures, and config files

## Why correct

tsc --noEmit in CI must typecheck the same files ESLint and Playwright run.

## Why the others are wrong

- Option 1: Omitting tests defeats the CI typecheck gate.
- Option 3: Types come via devDependency; you include your source.
- Option 4: Playwright runs TypeScript directly — include sources not emit.
