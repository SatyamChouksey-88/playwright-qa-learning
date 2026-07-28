---
id: FW-Q-012
type: framework-mcq
topic: framework
subtopic: eslint
difficulty: intermediate
stage: 1
answerIndex: 1
lesson: FW-L-106
---

## Question

Which ESLint rule class catches missing await on Playwright locators?

## Options

1. no-unused-vars only
2. @typescript-eslint/no-floating-promises
3. prefer-const
4. no-console

## Correct answer

@typescript-eslint/no-floating-promises

## Why correct

Locator actions return promises; floating promises are the #1 race bug lint catches.

## Why the others are wrong

- Option 1: Unused vars do not detect missing await.
- Option 3: prefer-const is unrelated.
- Option 4: console rules do not cover async.
