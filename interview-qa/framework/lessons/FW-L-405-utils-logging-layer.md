---
id: FW-L-405
type: framework-lesson
stage: 4
title: Utils and logging layer
objective: Add small typed utils and structured logging without a junk-drawer
  helpers folder.
topic: framework
subtopics:
  - utils
  - logging
  - debug
diagram: null
mcqs:
  - FW-Q-062
exercise: null
related:
  - FW-L-404
  - FW-L-406
---

## Concept

Utils are pure functions with tests: date formatting, id generators. Logging wraps `test.info().attach` and step labels — not console.log spam.

## Why it matters

Mega helpers.ts becomes unmaintainable — interviewers ask how you prevent shared utility breaks.

## Architecture decision

Unit-test utils separately. Framework owners review changes to `utils/` and `fixtures/`.

## TypeScript implementation

```ts
export function logStep(testInfo: TestInfo, message: string) {
  testInfo.annotations.push({ type: 'step', description: message });
}

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
}
```

## Trade-offs

Too granular utils files — group by domain when file exceeds ~150 lines.

## What NOT to do

Do not log PII/passwords. Do not add utils that wrap one line of Playwright API without value.

## Interview angle

"Shared util broke 500 tests — prevention?" — Unit tests on utils + codeowners + semver on framework package.

## Related

- FW-L-404
- FW-L-406
