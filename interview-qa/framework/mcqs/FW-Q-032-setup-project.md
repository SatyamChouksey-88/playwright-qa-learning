---
id: FW-Q-032
type: framework-mcq
topic: framework
subtopic: auth
difficulty: intermediate
stage: 2
answerIndex: 3
lesson: FW-L-207
---

## Question

How do consumer projects wait for auth setup?

## Options

1. Manual sleep in each spec
2. dependencies: ['setup'] on the project
3. Duplicate login in beforeEach
4. Import auth from node_modules

## Correct answer

dependencies: ['setup'] on the project

## Why correct

Playwright runs setup project first; then tests start with storageState.

## Why the others are wrong

- Option 1: Sleep anti-pattern.
- Option 4: Auth is your generated file.
- Option 3: Defeats setup project purpose.
