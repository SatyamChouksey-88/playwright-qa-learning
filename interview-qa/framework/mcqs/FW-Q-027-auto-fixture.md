---
id: FW-Q-027
type: framework-mcq
topic: framework
subtopic: fixtures
difficulty: intermediate
stage: 2
answerIndex: 0
lesson: FW-L-205
---

## Question

What does `{ auto: true }` on a fixture mean?

## Options

1. It runs even if not listed in the test function parameters
2. It runs only on CI
3. It disables parallel execution
4. It merges with Cucumber

## Correct answer

It runs even if not listed in the test function parameters

## Why correct

Auto fixtures inject hidden setup — use sparingly for cheap universal hooks.

## Why the others are wrong

- Option 2: Auto is not CI-specific.
- Option 3: Parallel still works.
- Option 4: Unrelated to Cucumber.
