---
id: FW-Q-020
type: framework-mcq
topic: framework
subtopic: components
difficulty: beginner
stage: 2
answerIndex: 0
lesson: FW-L-202
---

## Question

When extract a component object?

## Options

1. Third duplication of same widget locators across pages
2. First line of first test
3. Never — only page objects allowed
4. When file exceeds 10 lines

## Correct answer

Third duplication of same widget locators across pages

## Why correct

Rule of three balances DRY vs premature abstraction.

## Why the others are wrong

- Option 2: Premature extraction adds indirection.
- Option 3: Components complement pages on SPAs.
- Option 4: Arbitrary line count is meaningless.
