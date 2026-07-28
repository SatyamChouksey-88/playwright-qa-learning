---
id: FW-Q-065
type: framework-mcq
topic: framework
subtopic: restraint
difficulty: beginner
stage: 4
answerIndex: 0
lesson: FW-L-407
---

## Question

What should you NOT build in year one?

## Options

1. Custom test runner on top of Playwright
2. Fixtures folder
3. eslint config
4. storageState auth setup

## Correct answer

Custom test runner on top of Playwright

## Why correct

Playwright Test already is the runner — custom CLI is YAGNI.

## Why the others are wrong

- Option 2: Fixtures are core.
- Option 3: Lint is cheap win.
- Option 4: Auth setup is high ROI.
