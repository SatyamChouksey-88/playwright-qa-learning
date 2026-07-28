---
id: FW-L-407
type: framework-lesson
stage: 4
title: What not to build
objective: Name abstractions you deliberately skip until scale forces them.
topic: framework
subtopics:
  - restraint
  - yagni
  - anti-patterns
diagram: DIAG-FW-DECIDE
mcqs:
  - FW-Q-065
  - FW-Q-066
exercise: null
related:
  - FW-L-201
  - FW-L-406
---

## Concept

Do not build: custom test runner, Selenium-style BaseTest inheritance, hand-rolled parallelism, plugin architecture day one, Screenplay without org buy-in, visual DSL on top of Playwright.

## Why it matters

Architect interviews reward restraint — "what would you NOT build?" separates experience from resume buzzwords.

## Architecture decision

Revisit decisions at checkpoints (~500, ~5k, ~50k tests). Document deferred items in ADR.

## TypeScript implementation

```ts
// Good: thin wrapper exporting test + expect from merged fixtures
export { test, expect } from './fixtures';

// Avoid: abstract TestExecutor with strategy factories before you have 2 teams
```

## Trade-offs

Under-building delays pain at 5k tests; over-building delays shipping at 50 tests. Default under-build.

## What NOT to do

Do not adopt every new Playwright feature in production week one. Do not rewrite to microservices pattern for tests.

## Interview angle

"What not to build in year one?" — Custom runner, deep inheritance, multi-repo shared utils without versioning.

## Related

- FW-L-201
- FW-L-406
