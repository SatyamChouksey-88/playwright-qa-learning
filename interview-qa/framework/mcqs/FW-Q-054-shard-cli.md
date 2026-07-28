---
id: FW-Q-054
type: framework-mcq
topic: framework
subtopic: sharding
difficulty: intermediate
stage: 4
answerIndex: 1
lesson: FW-L-402
---

## Question

CLI to run shard 2 of 4?

## Options

1. --worker=2/4
2. --shard=2/4
3. --split=50%
4. --parallel=4

## Correct answer

--shard=2/4

## Why correct

Official sharding syntax splits files across machines.

## Why the others are wrong

- Option 1: Workers are per-machine.
- Option 3: Not Playwright flag.
- Option 4: Workers != shards.
