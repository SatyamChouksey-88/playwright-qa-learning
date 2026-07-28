---
id: FW-Q-004
type: framework-mcq
topic: framework
subtopic: tsconfig
difficulty: beginner
stage: 1
answerIndex: 3
lesson: FW-L-102
---

## Question

Why enable strict TypeScript for Playwright tests?

## Options

1. To run tests faster in headless mode
2. Because Playwright requires strict to install
3. To avoid writing page objects
4. To catch missing awaits and unsafe null access at compile time

## Correct answer

To catch missing awaits and unsafe null access at compile time

## Why correct

Tests are maintained code; strict + noFloatingPromises prevents locator races before CI.

## Why the others are wrong

- Option 1: TS strictness does not affect browser speed.
- Option 2: Playwright works without strict — it is a team quality choice.
- Option 3: Page objects are independent of strict mode.
