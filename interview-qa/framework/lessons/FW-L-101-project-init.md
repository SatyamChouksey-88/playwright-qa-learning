---
id: FW-L-101
type: framework-lesson
stage: 1
title: Project initialization
objective: Scaffold a TypeScript-strict Playwright project with the right
  defaults from day one.
topic: framework
subtopics:
  - init
  - package.json
  - playwright-install
diagram: DIAG-FW-TREE
mcqs:
  - FW-Q-001
  - FW-Q-002
  - FW-Q-003
exercise: FW-X-01
related:
  - FW-L-102
  - FW-L-103
---

## Concept

A Playwright framework starts with `@playwright/test`, strict TypeScript, and a single `playwright.config.ts` at the repo root (or practice-suite root). Run `npm init playwright@latest` or add dependencies manually, then commit a minimal config with explicit `testDir`, reporter, and trace policy.

## Why it matters

Interviewers probe whether you understand that the framework is Playwright itself — your job is conventions and glue, not a custom runner. Starting strict avoids retrofitting types and lint rules after 200 tests exist.

## Architecture decision

Keep one config entry point. Split environment-specific overrides later via `projects[]` and env vars — not separate runner scripts. The init scaffold should include ESLint + TypeScript strict from commit one.

## TypeScript implementation

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
});
```

## Trade-offs

Official init template is opinionated (single browser). That is fine for day one — add `projects[]` when you need matrix coverage. Pin `@playwright/test` in package.json; avoid floating "latest" in CI.

## What NOT to do

Do not wrap Playwright in a custom CLI on day one. Do not copy a Selenium folder layout (drivers/, pageFactories/). Do not disable strict TypeScript "temporarily".

## Interview angle

"Walk me through bootstrapping Playwright for a new repo." — Name strict TS, single config, trace-on-first-retry, and that you will add fixtures before the tenth test.

## Related

- FW-L-102
- FW-L-103
