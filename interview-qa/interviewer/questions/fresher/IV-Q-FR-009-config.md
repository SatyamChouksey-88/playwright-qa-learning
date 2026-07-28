---
id: IV-Q-FR-009
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 7
difficulty: 2
topic: config
crosslinks: []
---

## Question

Name three important fields in `playwright.config.ts` and what each controls.

## What this tests

Breadth of config knowledge.

## Model answer

1. **`projects`** — browser/device matrix and per-project `use` options.
2. **`use.trace` / `screenshot` / `video`** — artifact capture policy for debugging.
3. **`retries` / `workers`** — CI flake policy and parallelism (use retries only in CI with trace on first retry).

```ts
export default defineConfig({
  retries: process.env.CI ? 1 : 0,
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

## Strong answer signals

- Names Playwright mechanism for config
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse config in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for config.

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
| 1 | No meaningful answer on config; guesses or silent. |
| 2 | Partial config answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid config explanation with one missing trade-off or weak example. |
| 4 | Complete config answer: mechanism, TypeScript example, trade-offs, real context. |
