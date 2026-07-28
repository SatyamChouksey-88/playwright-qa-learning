---
id: IV-Q-SR-004
type: iv-question
level: senior
round: design
kind: design
timebox: 12
difficulty: 4
topic: sharding
crosslinks:
  - c4
---

## Question

How do you shard a 45-minute suite to fit a 12-minute CI budget?

## What this tests

CI throughput design.

## Model answer

Increase workers + shard count until p95 < budget:

```bash
npx playwright test --shard=${INDEX}/${TOTAL} --reporter=blob
```

Balance by runtime not file count long-term (use report history). Merge blobs; cap shards when infra cost dominates.

## Strong answer signals

- Names Playwright mechanism for sharding
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse sharding in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for sharding.

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
| 1 | No meaningful answer on sharding; guesses or silent. |
| 2 | Partial sharding answer with major gaps; needs heavy hints (senior). |
| 3 | Solid sharding explanation with one missing trade-off or weak example. |
| 4 | Complete sharding answer: mechanism, TypeScript example, trade-offs, real context. |
