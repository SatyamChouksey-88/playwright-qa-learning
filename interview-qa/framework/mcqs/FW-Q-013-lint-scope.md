---
id: FW-Q-013
type: framework-mcq
topic: framework
subtopic: eslint
difficulty: beginner
stage: 1
answerIndex: 0
lesson: FW-L-106
---

## Question

When should eslint-plugin-playwright run in CI?

## Options

1. Same gate as tsc --noEmit before Playwright tests
2. Only on markdown files
3. Never — lint slows CI
4. Only after tests fail

## Correct answer

Same gate as tsc --noEmit before Playwright tests

## Why correct

Cheap static checks prevent expensive flaky runs.

## Why the others are wrong

- Option 2: Plugin targets test TS files.
- Option 3: Lint seconds save minute-scale reruns.
- Option 4: Prevention beats post-failure lint.
