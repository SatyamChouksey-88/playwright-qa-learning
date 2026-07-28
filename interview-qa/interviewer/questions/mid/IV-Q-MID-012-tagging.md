---
id: IV-Q-MID-012
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: tagging
crosslinks: []
---

## Question

How do tags and grep speed up CI feedback loops?

## What this tests

Selective test execution.

## Model answer

```ts
test('checkout @smoke', async ({ page }) => { /* ... */ });
```

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @slow
```

Smoke on every PR; full regression nightly. Document tag contract in CONTRIBUTING.

## Strong answer signals

- Names Playwright mechanism for tagging
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse tagging in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for tagging.

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
| 1 | No meaningful answer on tagging; guesses or silent. |
| 2 | Partial tagging answer with major gaps; needs heavy hints (mid). |
| 3 | Solid tagging explanation with one missing trade-off or weak example. |
| 4 | Complete tagging answer: mechanism, TypeScript example, trade-offs, real context. |
