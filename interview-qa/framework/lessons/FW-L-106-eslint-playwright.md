---
id: FW-L-106
type: framework-lesson
stage: 1
title: ESLint for Playwright
objective: Enforce await-on-locators and ban anti-patterns via eslint-plugin-playwright.
topic: framework
subtopics:
  - eslint
  - lint
  - ci-gate
diagram: null
mcqs:
  - FW-Q-012
  - FW-Q-013
exercise: null
related:
  - FW-L-102
  - FW-L-107
---

## Concept

Use `@typescript-eslint` for promises and `eslint-plugin-playwright` rules on test globs: no focused tests in CI, valid expect, no page.pause in commits.

## Why it matters

Missing `await` on locators is the most common source of race failures — lint catches it; code review does not reliably.

## Architecture decision

Run `eslint` + `tsc --noEmit` in the same CI job as Playwright. Scope plugin to `**/*.spec.ts` and `tests/**`.

## TypeScript implementation

```ts
// eslint.config.mjs excerpt
import playwright from 'eslint-plugin-playwright';
export default [
  { ...playwright.configs['flat/recommended'], files: ['**/*.spec.ts', 'tests/**'] },
];
```

## Trade-offs

Too many custom rules early creates friction. Start with recommended + no-floating-promises; add team rules when patterns repeat.

## What NOT to do

Do not disable `playwright/no-wait-for-timeout` globally. Do not lint generated artifacts. Do not skip lint on "quick fix" PRs.

## Interview angle

"How enforce locator discipline?" — ESLint + PR checklist + shared fixtures that encode the locator strategy.

## Related

- FW-L-102
- FW-L-107
