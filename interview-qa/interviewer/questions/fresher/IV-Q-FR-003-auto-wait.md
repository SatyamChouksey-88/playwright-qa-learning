---
id: IV-Q-FR-003
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 8
difficulty: 1
topic: auto-wait
crosslinks:
  - a1
---

## Question

What is auto-waiting in Playwright? What happens when you call `click()` on a locator?

## What this tests

Foundational mechanism — separates Playwright-native thinking from Selenium-style sleeps.

## Model answer

Playwright **auto-waits** for actionability before each action. For `click()`, the locator retries until the element is attached, visible, stable, enabled, and receives events — up to the action timeout. No manual sleep required.

```ts
await page.getByRole('button', { name: 'Save' }).click();
// Internally waits for actionable state, then clicks
```

Assertions via `expect(locator)` auto-wait with their own timeout. If action fails, the error names the unmet condition (hidden, disabled, etc.) — use that in triage instead of adding delays.

## Strong answer signals

- Names Playwright mechanism for auto-wait
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse auto-wait in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for auto-wait.

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
| 1 | No meaningful answer on auto-wait; guesses or silent. |
| 2 | Partial auto-wait answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid auto-wait explanation with one missing trade-off or weak example. |
| 4 | Complete auto-wait answer: mechanism, TypeScript example, trade-offs, real context. |
