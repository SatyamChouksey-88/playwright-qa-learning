---
id: FW-L-402
type: framework-lesson
stage: 4
title: Sharding and merge reports
objective: Shard horizontally in CI and merge blob reports into one HTML artifact.
topic: framework
subtopics:
  - shard
  - blob
  - merge-reports
diagram: DIAG-FW-CI
mcqs:
  - FW-Q-054
  - FW-Q-055
  - FW-Q-056
exercise: null
related:
  - FW-L-401
  - FW-L-210
---

## Concept

`--shard=1/4` splits by file hash across machines. Each shard emits `blob` reporter; `playwright merge-reports` combines for one dashboard.

## Why it matters

45-minute suites block releases — sharding is architect-level CI knowledge.

## Architecture decision

Tune workers per shard before adding shards. Merge step is separate CI job after matrix completes.

## TypeScript implementation

```ts
reporter: process.env.CI
  ? [['blob'], ['list']]
  : [['html', { open: 'never' }], ['list']],
```

## Trade-offs

Static sharding imbalanced if one file is 10× slower — track timing, consider orchestrator at 10k+ tests.

## What NOT to do

Do not shard before fixing parallel-unsafe tests. Do not lose blob artifacts before merge.

## Interview angle

"Nightly still too slow after workers maxed?" — Horizontal sharding + blob merge + smoke tier on PR.

## Related

- FW-L-401
- FW-L-210
