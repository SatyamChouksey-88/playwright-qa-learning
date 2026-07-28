---
id: FW-Q-024
type: framework-mcq
topic: framework
subtopic: scope
difficulty: beginner
stage: 2
answerIndex: 3
lesson: FW-L-204
---

## Question

Default fixture scope in Playwright is:

## Options

1. worker
2. suite
3. global
4. test

## Correct answer

test

## Why correct

Each test gets fresh fixture unless explicitly worker-scoped.

## Why the others are wrong

- Option 1: Worker is opt-in.
- Option 2: No suite scope in Playwright fixtures.
- Option 3: globalSetup is different mechanism.
