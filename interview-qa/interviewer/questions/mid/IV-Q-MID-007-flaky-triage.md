---
id: IV-Q-MID-007
type: iv-question
level: mid
round: scenario
kind: scenario
timebox: 9
difficulty: 3
topic: flaky-triage
crosslinks:
  - a1
  - b12
---

## Question

A test fails 2/10 runs in CI. Describe your triage process.

## What this tests

Systematic flake diagnosis — key mid signal.

## Model answer

Order: **Reproduce** (CI shard + seed if available) → **Trace** (on-first-retry) → **Categorize** (timing/data/env/assertion) → **Fix root** (locator, race, data collision) → **Guard** (quarantine if needed, never merge with sleep-only fix).

Reject: blanket retries, `force: true`, arbitrary timeouts. Document category in ticket.

## Strong answer signals

- Names Playwright mechanism for flaky-triage
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse flaky-triage in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for flaky-triage.

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
| 1 | No meaningful answer on flaky-triage; guesses or silent. |
| 2 | Partial flaky-triage answer with major gaps; needs heavy hints (mid). |
| 3 | Solid flaky-triage explanation with one missing trade-off or weak example. |
| 4 | Complete flaky-triage answer: mechanism, TypeScript example, trade-offs, real context. |
