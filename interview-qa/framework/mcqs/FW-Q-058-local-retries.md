---
id: FW-Q-058
type: framework-mcq
topic: framework
subtopic: retries
difficulty: beginner
stage: 4
answerIndex: 3
lesson: FW-L-403
---

## Question

Local dev retries should usually be:

## Options

1. Same as CI × 2
2. 5 minimum
3. Match production
4. 0 — fix flake at source

## Correct answer

0 — fix flake at source

## Why correct

Local zero retries forces deterministic tests; CI gets limited retry.

## Why the others are wrong

- Option 1: Hides bugs locally.
- Option 2: Too many.
- Option 4: Production env unrelated.
