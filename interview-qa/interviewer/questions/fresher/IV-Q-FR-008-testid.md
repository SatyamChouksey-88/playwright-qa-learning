---
id: IV-Q-FR-008
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: testid
crosslinks: []
---

## Question

When is `getByTestId` appropriate? What are the trade-offs?

## What this tests

Judgment on stable selectors vs accessibility-first.

## Model answer

Use `getByTestId` when no stable role/label exists (canvas widgets, icon-only controls without aria) and your team maintains `data-testid` as a **testing contract** (not changed for styling).

```ts
await page.getByTestId('otp-input').fill('123456');
```

Trade-offs: bypasses accessibility tree — prefer role first; test ids do not validate a11y; require dev cooperation. Configure `testIdAttribute` if not using default `data-testid`.

## Strong answer signals

- Names Playwright mechanism for testid
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse testid in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for testid.

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
| 1 | No meaningful answer on testid; guesses or silent. |
| 2 | Partial testid answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid testid explanation with one missing trade-off or weak example. |
| 4 | Complete testid answer: mechanism, TypeScript example, trade-offs, real context. |
