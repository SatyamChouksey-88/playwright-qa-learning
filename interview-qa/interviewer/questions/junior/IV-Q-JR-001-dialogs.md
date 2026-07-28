---
id: IV-Q-JR-001
type: iv-question
level: junior
round: theory
kind: theory
timebox: 7
difficulty: 2
topic: dialogs
crosslinks:
  - b4
---

## Question

How do you handle a native `alert` dialog in Playwright?

## What this tests

Register-before-trigger pattern.

## Model answer

Register the dialog handler **before** the action that opens it:

```ts
page.once('dialog', (dialog) => {
  expect(dialog.type()).toBe('alert');
  expect(dialog.message()).toContain('Saved');
  dialog.accept();
});
await page.getByRole('button', { name: 'Delete' }).click();
```

Use `page.once` when a single dialog is expected; `page.on` for multiples. Never use sleeps to "wait for alert".

## Strong answer signals

- Names Playwright mechanism for dialogs
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse dialogs in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for dialogs.

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
| 1 | No meaningful answer on dialogs; guesses or silent. |
| 2 | Partial dialogs answer with major gaps; needs heavy hints (junior). |
| 3 | Solid dialogs explanation with one missing trade-off or weak example. |
| 4 | Complete dialogs answer: mechanism, TypeScript example, trade-offs, real context. |
