---
id: FW-Q-055
type: framework-mcq
topic: framework
subtopic: sharding
difficulty: intermediate
stage: 4
answerIndex: 3
lesson: FW-L-402
---

## Question

Why blob reporter in sharded CI?

## Options

1. Encrypt tests
2. Replace HTML locally
3. Disable traces
4. Each shard emits blob; merge-reports combines into one HTML

## Correct answer

Each shard emits blob; merge-reports combines into one HTML

## Why correct

Unified dashboard after parallel machines finish.

## Why the others are wrong

- Option 1: Not encryption.
- Option 2: Local still uses html.
- Option 3: Traces independent.
