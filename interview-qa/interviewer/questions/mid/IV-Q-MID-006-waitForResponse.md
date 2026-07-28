---
id: IV-Q-MID-006
type: iv-question
level: mid
round: theory
kind: theory
timebox: 8
difficulty: 3
topic: waitForResponse
crosslinks: []
---

## Question

Compare `waitForResponse` vs mocking for validating API calls.

## What this tests

Integration vs isolation judgment.

## Model answer

`waitForResponse` observes real network — good for integration confidence:

```ts
const respPromise = page.waitForResponse((r) => r.url().includes('/transfer') && r.ok());
await page.getByRole('button', { name: 'Submit' }).click();
const resp = await respPromise;
expect(await resp.json()).toMatchObject({ status: 'posted' });
```

Mock when external deps are flaky/ costly. Hybrid: seed via API, assert UI via real responses.

## Strong answer signals

- Names Playwright mechanism for waitForResponse
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse waitForResponse in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for waitForResponse.

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
| 1 | No meaningful answer on waitForResponse; guesses or silent. |
| 2 | Partial waitForResponse answer with major gaps; needs heavy hints (mid). |
| 3 | Solid waitForResponse explanation with one missing trade-off or weak example. |
| 4 | Complete waitForResponse answer: mechanism, TypeScript example, trade-offs, real context. |
