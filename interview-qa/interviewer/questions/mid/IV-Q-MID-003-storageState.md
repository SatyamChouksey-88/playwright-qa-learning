---
id: IV-Q-MID-003
type: iv-question
level: mid
round: theory
kind: theory
timebox: 10
difficulty: 3
topic: storageState
crosslinks:
  - b9
---

## Question

Walk through the auth setup project pattern with `storageState`.

## What this tests

Auth efficiency — mid-level bar.

## Model answer

Setup project logs in once, saves cookies/localStorage, consumers reuse state:

```ts
// auth.setup.ts
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('bank-username').fill(process.env.USER!);
  await page.getByTestId('bank-password').fill(process.env.PASS!);
  await page.getByTestId('bank-login').click();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});

// config
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  { name: 'chromium', dependencies: ['setup'], use: { storageState: 'playwright/.auth/user.json' } },
]
```

Add `.auth/` to `.gitignore`; refresh state when auth changes.

## Strong answer signals

- Names Playwright mechanism for storageState
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse storageState in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for storageState.

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
| 1 | No meaningful answer on storageState; guesses or silent. |
| 2 | Partial storageState answer with major gaps; needs heavy hints (mid). |
| 3 | Solid storageState explanation with one missing trade-off or weak example. |
| 4 | Complete storageState answer: mechanism, TypeScript example, trade-offs, real context. |
