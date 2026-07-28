---
id: FW-Q-029
type: framework-mcq
topic: framework
subtopic: mergeTests
difficulty: intermediate
stage: 2
answerIndex: 1
lesson: FW-L-206
---

## Question

Why use mergeTests from @playwright/test?

## Options

1. To run tests without Node
2. To compose fixture modules without one giant fixtures.ts
3. To replace projects[]
4. To disable fixtures

## Correct answer

To compose fixture modules without one giant fixtures.ts

## Why correct

Domain modules export extended test; merge unions types for specs.

## Why the others are wrong

- Option 1: Still Node runner.
- Option 3: projects unrelated.
- Option 4: Opposite of purpose.
