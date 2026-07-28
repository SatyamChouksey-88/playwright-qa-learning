---
id: IV-Q-FR-010
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 5
difficulty: 1
topic: debugging
crosslinks: []
---

## Question

What is the difference between headed and headless mode? When do you run headed locally?

## What this tests

Debugging workflow basics.

## Model answer

**Headless** runs browsers without UI — faster, default in CI. **Headed** shows the browser window — useful when writing new tests or reproducing visual timing issues.

```bash
npx playwright test --headed
npx playwright test --debug  # opens inspector with step-through
```

Use headed sparingly in CI (costly); prefer trace viewer for post-mortems.

## Strong answer signals

- Names Playwright mechanism for debugging
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse debugging in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for debugging.

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
| 1 | No meaningful answer on debugging; guesses or silent. |
| 2 | Partial debugging answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid debugging explanation with one missing trade-off or weak example. |
| 4 | Complete debugging answer: mechanism, TypeScript example, trade-offs, real context. |
