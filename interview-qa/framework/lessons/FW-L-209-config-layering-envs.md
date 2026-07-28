---
id: FW-L-209
type: framework-lesson
stage: 2
title: Config layering for environments
objective: Layer base config with env-specific overrides using env vars and
  project metadata.
topic: framework
subtopics:
  - env
  - baseURL
  - layering
diagram: DIAG-FW-CONFIG
mcqs:
  - FW-Q-036
  - FW-Q-037
exercise: FW-X-08
related:
  - FW-L-103
  - FW-L-210
---

## Concept

Single config reads `process.env.BASE_URL`, `API_URL`, etc. Optional `playwright.config.staging.ts` imports base and overrides — or use CI env injection without multiple files.

## Why it matters

Hardcoded URLs in tests break when promoting staging → prod-like envs. Layering is a framework architect question.

## Architecture decision

`.env.example` documents vars; CI secret store holds values. Never branch test logic on env name strings — branch on config objects.

## TypeScript implementation

```ts
const baseURL = process.env.BASE_URL ?? 'http://localhost:4173';
export default defineConfig({
  use: { baseURL },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

## Trade-offs

Multiple config files drift — prefer one config + env vars until teams truly need incompatible project shapes.

## What NOT to do

Do not duplicate entire config per env. Do not store secrets in repo env files.

## Interview angle

"How run same tests against staging and prod-like?" — BASE_URL + project grep/smoke tier, not copy-pasted specs.

## Related

- FW-L-103
- FW-L-210
