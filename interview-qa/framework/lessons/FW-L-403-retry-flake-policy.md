---
id: FW-L-403
type: framework-lesson
stage: 4
title: Retry and flake policy
objective: Set retries, trace-on-retry, and quarantine rules that diagnose
  instead of masking.
topic: framework
subtopics:
  - retries
  - flaky
  - quarantine
diagram: null
mcqs:
  - FW-Q-057
  - FW-Q-058
  - FW-Q-059
exercise: null
related:
  - FW-L-401
  - FW-L-404
---

## Concept

CI retries 1–2 with trace on first retry. Local retries 0. Flaky tests get ticket, owner, expiry — not silent retry increase.

## Why it matters

Retry inflation hides product and test bugs — leadership interviews focus on governance.

## Architecture decision

Central retry in config only. Quarantine job runs `@quarantine` with higher retries for signal, not gating.

## TypeScript implementation

```ts
export default defineConfig({
  retries: process.env.CI ? 1 : 0,
  use: { trace: 'on-first-retry' },
});
```

## Trade-offs

Retries multiply CI time — balance with shard count and smoke scope.

## What NOT to do

Do not set retries to 5. Do not disable forbidOnly in CI.

## Interview angle

"Flaky test policy?" — Diagnose with trace, quarantine with owner+expiry, never raise retries without root cause.

## Related

- FW-L-401
- FW-L-404
