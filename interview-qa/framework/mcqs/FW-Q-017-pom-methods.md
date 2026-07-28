---
id: FW-Q-017
type: framework-mcq
topic: framework
subtopic: pom
difficulty: beginner
stage: 2
answerIndex: 3
lesson: FW-L-201
---

## Question

What should a page object method typically do?

## Options

1. Assert final business KPIs
2. Start a second browser
3. Wrap expect in try/catch
4. Perform user actions using locators (click, fill, navigate)

## Correct answer

Perform user actions using locators (click, fill, navigate)

## Why correct

Actions in POM; assertions visible in test unless waitForLoaded-style readiness helper.

## Why the others are wrong

- Option 1: Assertions in tests.
- Option 2: Browser lifecycle is fixture scope.
- Option 3: try/catch masks failures — use expect retry.
