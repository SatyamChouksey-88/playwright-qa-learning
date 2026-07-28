---
id: FW-Q-006
type: framework-mcq
topic: framework
subtopic: config
difficulty: intermediate
stage: 1
answerIndex: 2
lesson: FW-L-103
---

## Question

What belongs in playwright.config.ts rather than a fixture?

## Options

1. Creating a user via API for each test
2. Per-test page object instances
3. Global retry, trace, and timeout policy
4. Business assertions on order totals

## Correct answer

Global retry, trace, and timeout policy

## Why correct

Config sets environment-wide policy; fixtures handle per-test/worker setup with typed dependencies.

## Why the others are wrong

- Option 1: API seeding is fixture or test arrange logic.
- Option 2: Page objects are injected via fixtures, not config.
- Option 4: Assertions stay in tests.
