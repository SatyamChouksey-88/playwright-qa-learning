---
id: FW-Q-049
type: framework-mcq
topic: framework
subtopic: mocking
difficulty: intermediate
stage: 3
answerIndex: 0
lesson: FW-L-305
---

## Question

When is page.route mocking appropriate?

## Options

1. Unstable third-party APIs (payments, maps)
2. Your own core checkout API in smoke
3. Database server
4. TypeScript compiler

## Correct answer

Unstable third-party APIs (payments, maps)

## Why correct

Remove external flake; keep own API real in regression.

## Why the others are wrong

- Option 2: Mocks false confidence on core paths.
- Option 3: DB not routed via page.
- Option 4: Nonsense.
