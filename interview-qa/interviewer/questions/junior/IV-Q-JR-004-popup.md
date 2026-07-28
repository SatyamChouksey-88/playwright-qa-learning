---
id: IV-Q-JR-004
type: iv-question
level: junior
round: theory
kind: theory
timebox: 7
difficulty: 2
topic: popup
crosslinks:
  - b6
---

## Question

How do you interact with a page opened via `target=_blank`?

## What this tests

Multi-page context handling.

## Model answer

```ts
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Open statement' }).click();
const popup = await popupPromise;
await expect(popup.getByRole('heading')).toHaveText('Statement');
await popup.close();
```

Each tab/window is a `Page` object — always switch context instead of assuming single page.

## Strong answer signals

- Names Playwright mechanism for popup
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse popup in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for popup.

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
| 1 | No meaningful answer on popup; guesses or silent. |
| 2 | Partial popup answer with major gaps; needs heavy hints (junior). |
| 3 | Solid popup explanation with one missing trade-off or weak example. |
| 4 | Complete popup answer: mechanism, TypeScript example, trade-offs, real context. |
