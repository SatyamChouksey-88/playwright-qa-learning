---
id: FW-Q-011
type: framework-mcq
topic: framework
subtopic: naming
difficulty: beginner
stage: 1
answerIndex: 3
lesson: FW-L-105
---

## Question

Which test title best follows framework naming conventions?

## Options

1. test1
2. clickButton
3. loginTest_staging
4. @smoke user with valid credentials can sign in and see dashboard

## Correct answer

@smoke user with valid credentials can sign in and see dashboard

## Why correct

Tag + behavior sentence reads as spec and filters in CI grep.

## Why the others are wrong

- Option 1: Meaningless in reports.
- Option 2: Describes implementation not outcome.
- Option 3: Environment belongs in projects, not file/title names.
