---
id: FW-L-103
type: framework-lesson
stage: 1
title: Config anatomy
objective: Know every meaningful key in playwright.config.ts and what belongs
  there vs in tests.
topic: framework
subtopics:
  - defineConfig
  - use
  - projects
  - reporter
diagram: DIAG-FW-CONFIG
mcqs:
  - FW-Q-006
  - FW-Q-007
  - FW-Q-008
exercise: null
related:
  - FW-L-101
  - FW-L-209
---

## Concept

`defineConfig` merges defaults: global `use`, per-project overrides, timeouts, grep, snapshot paths, and dependencies between projects. Config sets policy; tests express behavior.

## Why it matters

Misplaced config (per-test retries in code, global baseURL duplicated in every spec) is the #1 source of "works locally, fails in CI" framework debates.

## Architecture decision

Centralize timeout, trace, screenshot, and retry policy in config. Use `projects[]` for browser/env matrix — not copy-pasted config files with drift.

## TypeScript implementation

```ts
export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: { baseURL: process.env.BASE_URL, trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
```

## Trade-offs

Heavy config indirection (five imported partial configs) helps at 50k tests, hurts at 50. Start flat; extract when duplication hurts.

## What NOT to do

Do not set `navigationTimeout: 999999`. Do not put test data in config. Do not use deprecated `globalSetup` for things fixtures handle cleanly.

## Interview angle

"What goes in playwright.config vs a fixture?" — Config: environment-wide policy. Fixtures: per-test or per-worker setup/teardown with typed dependencies.

## Related

- FW-L-101
- FW-L-209
