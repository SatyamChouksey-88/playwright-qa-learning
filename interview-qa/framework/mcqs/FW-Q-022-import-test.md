---
id: FW-Q-022
type: framework-mcq
topic: framework
subtopic: fixtures
difficulty: beginner
stage: 2
answerIndex: 1
lesson: FW-L-203
---

## Question

After creating custom fixtures in fixtures/base.ts, specs should import:

## Options

1. test from @playwright/test directly always
2. test and expect from fixtures/base.ts
3. only describe from vitest
4. playwright.config default export

## Correct answer

test and expect from fixtures/base.ts

## Why correct

Ensures extended fixtures are available; mixing imports drops custom deps.

## Why the others are wrong

- Option 1: Bypasses custom extend.
- Option 3: Wrong test runner.
- Option 4: Config is not importable test entry.
