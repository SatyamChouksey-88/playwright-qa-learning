---
id: IV-Q-FR-001
type: iv-question
level: fresher
round: screening
kind: theory
timebox: 5
difficulty: 1
topic: playwright-intro
crosslinks: []
---

## Question

What is the difference between `@playwright/test` and the `playwright` library?

## What this tests

Whether the candidate understands the test runner vs browser automation library split.

## Model answer

`@playwright/test` is the **test runner** — it provides `test`, `expect`, fixtures, config, reporters, and parallel orchestration. The `playwright` package (often via `chromium.launch`) is the **library** for scripts and tools. In QA interviews we expect specs to import from `@playwright/test`:

```ts
import { test, expect } from '@playwright/test';

test('login', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/dashboard/);
});
```

Use the library for one-off automation; use the test runner for maintainable suites with isolation and reporting.

## Strong answer signals

- Names Playwright mechanism for playwright-intro
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse playwright-intro in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for playwright-intro.

</details>

<details>
<summary>Hint 2</summary>

Consider test isolation and parallel workers.

</details>

<details>
<summary>Hint 3</summary>

Name one anti-pattern you would reject in code review.

</details>

## Scoring guide

| Score | Anchor |
|-------|--------|
| 1 | No meaningful answer on playwright-intro; guesses or silent. |
| 2 | Partial playwright-intro answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid playwright-intro explanation with one missing trade-off or weak example. |
| 4 | Complete playwright-intro answer: mechanism, TypeScript example, trade-offs, real context. |
