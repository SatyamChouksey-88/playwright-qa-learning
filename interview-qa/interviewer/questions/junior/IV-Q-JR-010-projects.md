---
id: IV-Q-JR-010
type: iv-question
level: junior
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: projects
crosslinks: []
---

## Question

How do you run tests only in Chromium from the CLI?

## What this tests

Project selection.

## Model answer

```bash
npx playwright test --project=chromium
```

Projects are defined in config — each can set browser, viewport, storageState. Smoke jobs run subset of projects; full regression runs all.

## Strong answer signals

- Names Playwright mechanism for projects
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse projects in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for projects.

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
| 1 | No meaningful answer on projects; guesses or silent. |
| 2 | Partial projects answer with major gaps; needs heavy hints (junior). |
| 3 | Solid projects explanation with one missing trade-off or weak example. |
| 4 | Complete projects answer: mechanism, TypeScript example, trade-offs, real context. |
