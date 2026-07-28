---
id: IV-Q-FR-002
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 8
difficulty: 1
topic: locators
crosslinks:
  - a3
---

## Question

Describe Playwright locator priority. Why is `getByRole` preferred over CSS selectors?

## What this tests

Web-first locator strategy — core hiring signal for any level.

## Model answer

Priority (most resilient first): **role + accessible name**, **label**, **placeholder**, **text**, **test id**, then CSS/XPath as last resort. `getByRole` mirrors how assistive tech finds elements — when the app is accessible, role locators survive CSS refactors.

```ts
// Preferred
await page.getByRole('button', { name: 'Transfer' }).click();
// Acceptable when stable contract exists
await page.getByTestId('transfer-submit').click();
// Avoid — breaks on styling changes
await page.locator('.btn-primary.transfer').click();
```

Role locators also enable strict mode violations to catch ambiguous matches early.

## Strong answer signals

- Names Playwright mechanism for locators
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse locators in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for locators.

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
| 1 | No meaningful answer on locators; guesses or silent. |
| 2 | Partial locators answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid locators explanation with one missing trade-off or weak example. |
| 4 | Complete locators answer: mechanism, TypeScript example, trade-offs, real context. |
