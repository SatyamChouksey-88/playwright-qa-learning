---
id: IV-Q-FR-007
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: getByRole
crosslinks:
  - a3
---

## Question

Write locators for a sign-in button and a username textbox using `getByRole`.

## What this tests

Practical locator API usage.

## Model answer

```ts
await page.getByRole('textbox', { name: 'Username' }).fill('demo');
await page.getByRole('button', { name: 'Sign in' }).click();
```

The accessible name comes from associated `<label>`, `aria-label`, or visible text. If role is wrong in DOM, fix accessibility or fall back to `getByLabel` — do not jump to CSS.

## Strong answer signals

- Names Playwright mechanism for getByRole
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse getByRole in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for getByRole.

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
| 1 | No meaningful answer on getByRole; guesses or silent. |
| 2 | Partial getByRole answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid getByRole explanation with one missing trade-off or weak example. |
| 4 | Complete getByRole answer: mechanism, TypeScript example, trade-offs, real context. |
