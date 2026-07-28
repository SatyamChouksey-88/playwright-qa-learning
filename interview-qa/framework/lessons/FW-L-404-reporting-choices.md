---
id: FW-L-404
type: framework-lesson
stage: 4
title: Reporting choices
objective: Pick reporters (list, html, blob, json) for local dev vs CI aggregation.
topic: framework
subtopics:
  - reporter
  - html
  - json
diagram: null
mcqs:
  - FW-Q-060
  - FW-Q-061
exercise: null
related:
  - FW-L-402
  - FW-L-405
---

## Concept

Local: list + html. CI matrix: blob per shard + merge html. JSON for dashboards. Attach traces to failed steps automatically.

## Why it matters

Bad reporting → ignored failures. Interviewers ask how devs access artifacts without SSH into CI.

## Architecture decision

Upload merged html + trace zip as CI artifacts. Link from PR comment via script.

## TypeScript implementation

```ts
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results/report.json' }],
],
```

## Trade-offs

Custom reporters maintenance cost — use built-ins until Jira integration truly needs custom.

## What NOT to do

Do not commit html-report folders. Do not publish reports with secrets in traces.

## Interview angle

"Aggregate reports from 8 shards?" — blob reporter + merge-reports CLI + artifact upload.

## Related

- FW-L-402
- FW-L-405
