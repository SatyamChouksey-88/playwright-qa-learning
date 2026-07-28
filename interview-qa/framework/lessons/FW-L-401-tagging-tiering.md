---
id: FW-L-401
type: framework-lesson
stage: 4
title: Tagging and tiering
objective: Split smoke, regression, and quarantine tiers with grep and CI policy.
topic: framework
subtopics:
  - tags
  - grep
  - smoke
diagram: null
mcqs:
  - FW-Q-052
  - FW-Q-053
exercise: null
related:
  - FW-L-402
  - FW-L-403
---

## Concept

Tags in titles or `@tag` annotations map to projects or `--grep`. Smoke runs on PR; regression nightly; `@quarantine` excluded from merge gate.

## Why it matters

Without tiers, teams either run everything on PR (slow) or nothing (risk). Tagging is org-scale framework design.

## Architecture decision

Document tag meanings. Enforce quarantine ticket + owner in CONTRIBUTING. Visible quarantine count in CI summary.

## TypeScript implementation

```ts
// PR job
// npx playwright test --grep @smoke
// Nightly
// npx playwright test --grep-invert @quarantine
```

## Trade-offs

Tag sprawl (@flaky @slow @staging-only) — periodic tag audit.

## What NOT to do

Do not use quarantine as permanent parking lot. Do not tag without CI job that uses the tag.

## Interview angle

"PR vs nightly suite?" — Smoke grep on PR blocks merge; full regression + cross-browser nightly.

## Related

- FW-L-402
- FW-L-403
