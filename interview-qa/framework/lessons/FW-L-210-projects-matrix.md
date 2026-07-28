---
id: FW-L-210
type: framework-lesson
stage: 2
title: Projects matrix
objective: Design projects[] for browser × environment × role without
  combinatorial explosion.
topic: framework
subtopics:
  - projects
  - matrix
  - ci
diagram: null
mcqs:
  - FW-Q-038
  - FW-Q-039
exercise: null
related:
  - FW-L-208
  - FW-L-402
---

## Concept

Each project is a named slice: browser device, storageState, grep tag, or dependency chain. CI selects subsets via `--project` and `--grep`.

## Why it matters

Uncontrolled matrix is CI cost death — interviewers want smoke vs full regression split.

## Architecture decision

PR: chromium + smoke tag. Nightly: all browsers + regression. Document matrix in README table.

## TypeScript implementation

```ts
projects: [
  { name: 'smoke-chromium', grep: /@smoke/, use: { ...devices['Desktop Chrome'] } },
  { name: 'regression-firefox', grep: /@regression/, use: { ...devices['Desktop Firefox'] } },
],
```

## Trade-offs

Cartesian product (3 browsers × 4 roles × 3 envs) = 36 projects — collapse rare combos to scheduled jobs.

## What NOT to do

Do not run full matrix on every PR. Do not create one project per test file.

## Interview angle

"Design CI matrix for 3 browsers and 2 envs?" — Named projects, PR runs chromium staging smoke, nightly full matrix.

## Related

- FW-L-208
- FW-L-402
