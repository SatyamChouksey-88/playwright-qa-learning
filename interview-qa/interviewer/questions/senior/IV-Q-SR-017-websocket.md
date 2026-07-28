---
id: IV-Q-SR-017
type: iv-question
level: senior
round: theory
kind: theory
timebox: 8
difficulty: 4
topic: websocket
crosslinks: []
---

## Question

Approaches for testing WebSocket-driven UI updates.

## What this tests

Realtime testing breadth.

## Model answer

Wait for UI state via `expect(locator)`, intercept WS at CDP level for diagnostics, or inject test double server. Prefer asserting user-visible outcome over message sniffing.

## Strong answer signals

- Names Playwright mechanism for websocket
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse websocket in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for websocket.

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
| 1 | No meaningful answer on websocket; guesses or silent. |
| 2 | Partial websocket answer with major gaps; needs heavy hints (senior). |
| 3 | Solid websocket explanation with one missing trade-off or weak example. |
| 4 | Complete websocket answer: mechanism, TypeScript example, trade-offs, real context. |
