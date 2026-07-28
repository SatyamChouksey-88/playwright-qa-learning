---
id: IV-Q-SR-001
type: iv-question
level: senior
round: design
kind: design
timebox: 15
difficulty: 4
topic: architecture
crosslinks:
  - c1
---

## Question

Draw the four-layer Playwright framework architecture for a 50-person org.

## What this tests

Scale architecture communication.

## Model answer

Layers: **Config** (env, projects, reporters) → **Fixtures** (auth, API, data) → **Pages/Components** (thin locators) → **Tests** (assertions, tags). Reporting wraps CI. Enforce via lint + templates + CODEOWNERS on fixtures/

## Strong answer signals

- Names Playwright mechanism for architecture
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse architecture in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for architecture.

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
| 1 | No meaningful answer on architecture; guesses or silent. |
| 2 | Partial architecture answer with major gaps; needs heavy hints (senior). |
| 3 | Solid architecture explanation with one missing trade-off or weak example. |
| 4 | Complete architecture answer: mechanism, TypeScript example, trade-offs, real context. |
