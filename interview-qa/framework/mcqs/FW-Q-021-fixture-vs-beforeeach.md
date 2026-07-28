---
id: FW-Q-021
type: framework-mcq
topic: framework
subtopic: fixtures
difficulty: intermediate
stage: 2
answerIndex: 2
lesson: FW-L-203
---

## Question

Why prefer test.extend fixtures over shared beforeEach for page objects?

## Options

1. Fixtures are faster because they skip TypeScript
2. beforeEach cannot call page.goto
3. Fixtures are parallel-safe, typed, and listed as test dependencies
4. Playwright bans beforeEach

## Correct answer

Fixtures are parallel-safe, typed, and listed as test dependencies

## Why correct

Explicit deps + scopes beat mutable shared setup for parallel workers.

## Why the others are wrong

- Option 1: Fixtures still TS — not a speed magic.
- Option 2: beforeEach can goto — but shared mutable state breaks parallel.
- Option 4: beforeEach exists but is poor for DI.
