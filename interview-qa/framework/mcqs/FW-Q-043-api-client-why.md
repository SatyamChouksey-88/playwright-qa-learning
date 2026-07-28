---
id: FW-Q-043
type: framework-mcq
topic: framework
subtopic: api
difficulty: intermediate
stage: 3
answerIndex: 2
lesson: FW-L-302
---

## Question

Why wrap fetch in ApiClient instead of raw calls in tests?

## Options

1. fetch is banned in Node
2. Playwright requires it
3. Central auth, base URL, and error handling — one place to fix
4. To slow tests down

## Correct answer

Central auth, base URL, and error handling — one place to fix

## Why correct

DRY for headers and typed domain methods (createOrder).

## Why the others are wrong

- Option 1: fetch works in modern Node.
- Option 2: Not required — architectural choice.
- Option 4: API setup speeds tests.
