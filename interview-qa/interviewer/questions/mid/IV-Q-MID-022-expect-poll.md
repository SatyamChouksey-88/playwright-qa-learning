---
id: IV-Q-MID-022
type: iv-question
level: mid
round: theory
kind: theory
timebox: 7
difficulty: 3
topic: expect-poll
crosslinks: []
---

## Question

When is `expect.poll` better than a raw expect?

## What this tests

Async state polling.

## Model answer

`expect.poll` retries a custom function until pass — useful for non-DOM state:

```ts
await expect.poll(async () => getJobStatus(id)).toBe('complete');
```

Prefer locator assertions when possible; poll for backend job status or file system checks.

## Strong answer signals

- Names Playwright mechanism for expect-poll
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse expect-poll in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for expect-poll.

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
| 1 | No meaningful answer on expect-poll; guesses or silent. |
| 2 | Partial expect-poll answer with major gaps; needs heavy hints (mid). |
| 3 | Solid expect-poll explanation with one missing trade-off or weak example. |
| 4 | Complete expect-poll answer: mechanism, TypeScript example, trade-offs, real context. |
