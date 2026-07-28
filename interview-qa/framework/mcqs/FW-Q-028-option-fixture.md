---
id: FW-Q-028
type: framework-mcq
topic: framework
subtopic: fixtures
difficulty: intermediate
stage: 2
answerIndex: 3
lesson: FW-L-205
---

## Question

Option fixtures are best for:

## Options

1. Mandatory login on every test
2. Replacing storageState
3. Deleting tsconfig
4. Expensive mocks activated only when test requests them

## Correct answer

Expensive mocks activated only when test requests them

## Why correct

Option pattern keeps default tests fast; opt-in for network mocks etc.

## Why the others are wrong

- Option 1: Auth belongs in setup project.
- Option 2: storageState is project config.
- Option 3: Nonsensical distractor.
