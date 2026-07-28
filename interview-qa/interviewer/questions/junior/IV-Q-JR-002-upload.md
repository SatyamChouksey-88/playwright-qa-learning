---
id: IV-Q-JR-002
type: iv-question
level: junior
round: theory
kind: theory
timebox: 7
difficulty: 2
topic: upload
crosslinks: []
---

## Question

How do you upload a file without opening the OS file picker?

## What this tests

Input setInputFiles pattern.

## Model answer

Set files directly on the `<input type="file">`:

```ts
await page.getByLabel('Upload statement').setInputFiles('fixtures/statement.pdf');
// Multiple files
await page.getByLabel('Attachments').setInputFiles(['a.pdf', 'b.pdf']);
```

Playwright bypasses the native picker — no robot needed. Clear with `setInputFiles([])`.

## Strong answer signals

- Names Playwright mechanism for upload
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse upload in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for upload.

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
| 1 | No meaningful answer on upload; guesses or silent. |
| 2 | Partial upload answer with major gaps; needs heavy hints (junior). |
| 3 | Solid upload explanation with one missing trade-off or weak example. |
| 4 | Complete upload answer: mechanism, TypeScript example, trade-offs, real context. |
