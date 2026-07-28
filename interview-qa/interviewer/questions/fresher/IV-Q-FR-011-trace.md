---
id: IV-Q-FR-011
type: iv-question
level: fresher
round: theory
kind: theory
timebox: 6
difficulty: 2
topic: trace
crosslinks: []
---

## Question

What artifacts does Playwright capture on failure and how do you open a trace?

## What this tests

Debugging literacy.

## Model answer

Common artifacts: **screenshot** (`only-on-failure`), **video** (optional), **trace** (timeline of actions, network, snapshots). Open trace:

```bash
npx playwright show-trace path/to/trace.zip
```

Config example:

```ts
use: { trace: 'on-first-retry', screenshot: 'only-on-failure' }
```

Traces are the first tool in flake triage — inspect action before/after, network, and console.

## Strong answer signals

- Names Playwright mechanism for trace
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse trace in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for trace.

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
| 1 | No meaningful answer on trace; guesses or silent. |
| 2 | Partial trace answer with major gaps; needs heavy hints (fresher). |
| 3 | Solid trace explanation with one missing trade-off or weak example. |
| 4 | Complete trace answer: mechanism, TypeScript example, trade-offs, real context. |
