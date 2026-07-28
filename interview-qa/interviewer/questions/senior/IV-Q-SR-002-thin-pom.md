---
id: IV-Q-SR-002
type: iv-question
level: senior
round: theory
kind: theory
timebox: 10
difficulty: 4
topic: thin-pom
crosslinks: []
---

## Question

What is a thin Page Object and why keep assertions in specs?

## What this tests

POM discipline.

## Model answer

Page objects expose **locators and actions only** — no `expect` inside class. Specs read as behavior stories:

```ts
class TransferPage {
  constructor(private page: Page) {}
  amount = this.page.getByLabel('Amount');
  submit = () => this.page.getByRole('button', { name: 'Transfer' }).click();
}
// spec
await transfer.amount.fill('100');
await transfer.submit();
await expect(page.getByTestId('transfer-success')).toBeVisible();
```

## Strong answer signals

- Names Playwright mechanism for thin-pom
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse thin-pom in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for thin-pom.

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
| 1 | No meaningful answer on thin-pom; guesses or silent. |
| 2 | Partial thin-pom answer with major gaps; needs heavy hints (senior). |
| 3 | Solid thin-pom explanation with one missing trade-off or weak example. |
| 4 | Complete thin-pom answer: mechanism, TypeScript example, trade-offs, real context. |
