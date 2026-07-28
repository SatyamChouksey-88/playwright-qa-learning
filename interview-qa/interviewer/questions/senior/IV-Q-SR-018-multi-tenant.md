---
id: IV-Q-SR-018
type: iv-question
level: senior
round: design
kind: design
timebox: 10
difficulty: 4
topic: multi-tenant
crosslinks: []
---

## Question

Isolate tenants in parallel E2E for SaaS.

## What this tests

Enterprise isolation design.

## Model answer

Unique tenant per test via API, subdomain routing, or header — never shared tenant admin. Teardown deletes tenant. Worker-scoped tenant pool for speed with lease pattern.

## Strong answer signals

- Names Playwright mechanism for multi-tenant
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse multi-tenant in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for multi-tenant.

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
| 1 | No meaningful answer on multi-tenant; guesses or silent. |
| 2 | Partial multi-tenant answer with major gaps; needs heavy hints (senior). |
| 3 | Solid multi-tenant explanation with one missing trade-off or weak example. |
| 4 | Complete multi-tenant answer: mechanism, TypeScript example, trade-offs, real context. |
