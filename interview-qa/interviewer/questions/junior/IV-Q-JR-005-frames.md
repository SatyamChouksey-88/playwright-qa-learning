---
id: IV-Q-JR-005
type: iv-question
level: junior
round: theory
kind: theory
timebox: 7
difficulty: 2
topic: frames
crosslinks:
  - b7
---

## Question

How do you locate an element inside an iframe?

## What this tests

FrameLocator API.

## Model answer

```ts
const frame = page.frameLocator('iframe[title="Payment"]');
await frame.getByRole('button', { name: 'Pay' }).click();
```

Prefer `frameLocator` over raw `page.frames()` indexing — resilient when frame order changes. Chain locators inside the frame scope.

## Strong answer signals

- Names Playwright mechanism for frames
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse frames in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for frames.

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
| 1 | No meaningful answer on frames; guesses or silent. |
| 2 | Partial frames answer with major gaps; needs heavy hints (junior). |
| 3 | Solid frames explanation with one missing trade-off or weak example. |
| 4 | Complete frames answer: mechanism, TypeScript example, trade-offs, real context. |
