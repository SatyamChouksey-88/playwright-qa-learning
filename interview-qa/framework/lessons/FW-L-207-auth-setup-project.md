---
id: FW-L-207
type: framework-lesson
stage: 2
title: Auth setup project
objective: Authenticate once via a setup project and reuse storageState across
  dependent projects.
topic: framework
subtopics:
  - storageState
  - setup
  - projects
diagram: DIAG-FW-AUTH
mcqs:
  - FW-Q-031
  - FW-Q-032
  - FW-Q-033
exercise: FW-X-06
related:
  - FW-L-208
  - FW-L-203
---

## Concept

A `setup` project runs auth.setup.ts, saves `storageState` to disk, and `dependencies: ['setup']` on consumer projects loads cookies/localStorage before tests.

## Why it matters

Logging in via UI in every test wastes minutes and hits rate limits — interviewers expect storageState pattern.

## Architecture decision

Gitignore `.auth/*.json`. Setup project uses dedicated specMatch. Consumer projects set `use.storageState` path.

## TypeScript implementation

```ts
// setup/auth.setup.ts
import { test as setup } from '@playwright/test';
const authFile = 'playwright/.auth/user.json';
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.USER!);
  await page.getByLabel('Password').fill(process.env.PASS!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: authFile });
});
```

## Trade-offs

Disk persistence is fast but security-sensitive — restrict artifact access; rotate test credentials.

## What NOT to do

Do not commit storageState files. Do not run setup in every test file beforeEach. Prefer API login in setup when available.

## Interview angle

"Speed up auth across 2k tests?" — Setup project + storageState + API token login in setup spec.

## Related

- FW-L-208
- FW-L-203
