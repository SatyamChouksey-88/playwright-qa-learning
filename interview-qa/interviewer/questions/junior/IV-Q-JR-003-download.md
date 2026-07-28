---
id: IV-Q-JR-003
type: iv-question
level: junior
round: theory
kind: theory
timebox: 7
difficulty: 2
topic: download
crosslinks: []
---

## Question

How do you assert a file download in Playwright?

## What this tests

waitForEvent pattern.

## Model answer

```ts
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Export CSV' }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toMatch(/export\.csv$/);
await download.saveAs('test-results/export.csv');
```

Register `waitForEvent` before click — same pattern as dialogs and popups.

## Strong answer signals

- Names Playwright mechanism for download
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse download in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for download.

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
| 1 | No meaningful answer on download; guesses or silent. |
| 2 | Partial download answer with major gaps; needs heavy hints (junior). |
| 3 | Solid download explanation with one missing trade-off or weak example. |
| 4 | Complete download answer: mechanism, TypeScript example, trade-offs, real context. |
