---
id: FW-Q-060
type: framework-mcq
topic: framework
subtopic: reporting
difficulty: intermediate
stage: 4
answerIndex: 2
lesson: FW-L-404
---

## Question

CI sharded jobs should use which reporter combo?

## Options

1. html only on each shard without merge
2. json only locally
3. blob per shard + merge-reports html artifact
4. No reporter

## Correct answer

blob per shard + merge-reports html artifact

## Why correct

Standard pattern for unified CI report.

## Why the others are wrong

- Option 1: Partial html per shard hard to browse.
- Option 2: Wrong context.
- Option 4: No visibility.
