---
id: IV-Q-SR-007
type: iv-question
level: senior
round: design
kind: design
timebox: 10
difficulty: 4
topic: config-layering
crosslinks: []
---

## Question

How do you layer playwright configs for local, staging, and prod-like runs?

## What this tests

Environment matrix design.

## Model answer

Base config + env overlays via `defineConfig` merge or separate files imported. Secrets via CI vars only. Prod-like: read-only accounts, no destructive tests, separate project grep.

## Strong answer signals

- Names Playwright mechanism for config-layering
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse config-layering in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for config-layering.

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
| 1 | No meaningful answer on config-layering; guesses or silent. |
| 2 | Partial config-layering answer with major gaps; needs heavy hints (senior). |
| 3 | Solid config-layering explanation with one missing trade-off or weak example. |
| 4 | Complete config-layering answer: mechanism, TypeScript example, trade-offs, real context. |
