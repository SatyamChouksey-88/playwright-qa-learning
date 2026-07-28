---
id: IV-Q-JR-008
type: iv-question
level: junior
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: artifacts
crosslinks: []
---

## Question

How do you configure screenshots only on failure?

## What this tests

Config for CI cost control.

## Model answer

```ts
export default defineConfig({
  use: { screenshot: 'only-on-failure' },
});
```

Per-test override: `test.use({ screenshot: 'on' })` for debugging a single spec. Attach manual screenshots with `await page.screenshot({ path: 'debug.png' })` when investigating.

## Strong answer signals

- Names Playwright mechanism for artifacts
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse artifacts in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for artifacts.

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
| 1 | No meaningful answer on artifacts; guesses or silent. |
| 2 | Partial artifacts answer with major gaps; needs heavy hints (junior). |
| 3 | Solid artifacts explanation with one missing trade-off or weak example. |
| 4 | Complete artifacts answer: mechanism, TypeScript example, trade-offs, real context. |
