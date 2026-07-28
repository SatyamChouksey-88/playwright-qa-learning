---
id: IV-Q-FR-012
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 5
difficulty: 1
topic: install
crosslinks: []
---

## Question

What does `npx playwright install` do? Why is it separate from npm install?

## What this tests

Onboarding and CI setup knowledge.

## Model answer

`npm install @playwright/test` installs the npm package; `npx playwright install` downloads **browser binaries** (Chromium, Firefox, WebKit) matched to the installed version. CI caches these separately. Use `playwright install --with-deps` on Linux CI for OS dependencies.

## Strong answer signals

- Names Playwright mechanism for install
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse install in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for install.

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
| 1 | No meaningful answer on install; guesses or silent. |
| 2 | Partial install answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid install explanation with one missing trade-off or weak example. |
| 4 | Complete install answer: mechanism, TypeScript example, trade-offs, real context. |
