---
id: FW-Q-056
type: framework-mcq
topic: framework
subtopic: sharding
difficulty: advanced
stage: 4
answerIndex: 2
lesson: FW-L-402
---

## Question

Before adding CI shards, you must ensure:

## Options

1. All tests use serial mode
2. Tests share one user account
3. Tests are parallel-safe / isolated
4. Retries set to 10

## Correct answer

Tests are parallel-safe / isolated

## Why correct

Sharding multiplies parallel execution — data/auth collisions surface.

## Why the others are wrong

- Option 1: Serial defeats parallelism.
- Option 2: Shared account breaks shards.
- Option 4: Retries mask isolation bugs.
