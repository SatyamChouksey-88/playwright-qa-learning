---
id: FW-Q-041
type: framework-mcq
topic: framework
subtopic: factories
difficulty: intermediate
stage: 3
answerIndex: 0
lesson: FW-L-301
---

## Question

Good factory signature?

## Options

1. createUser(overrides?: Partial<User>)
2. createUser(hardcoded only)
3. createUser() returns global singleton
4. createUser requires 40 params

## Correct answer

createUser(overrides?: Partial<User>)

## Why correct

Defaults + overrides keep tests terse and explicit about what differs.

## Why the others are wrong

- Option 2: No flexibility.
- Option 3: Singleton breaks parallel.
- Option 4: Over-specified API.
