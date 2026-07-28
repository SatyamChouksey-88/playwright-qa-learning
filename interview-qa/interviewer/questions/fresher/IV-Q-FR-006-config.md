---
id: IV-Q-FR-006
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 6
difficulty: 1
topic: config
crosslinks: []
---

## Question

What is `baseURL` in `playwright.config.ts` and how does it affect `page.goto`?

## What this tests

Config literacy for real projects.

## Model answer

`baseURL` prefixes relative navigation paths so specs stay environment-portable.

```ts
// playwright.config.ts
export default defineConfig({ use: { baseURL: 'http://localhost:3000' } });

// spec
await page.goto('/login'); // navigates to http://localhost:3000/login
```

Override per environment via env vars in CI. Absolute URLs bypass baseURL — use relative paths in specs when possible.

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
