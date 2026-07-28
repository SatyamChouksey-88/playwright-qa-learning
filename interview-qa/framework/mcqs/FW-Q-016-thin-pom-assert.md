---
id: FW-Q-016
type: framework-mcq
topic: framework
subtopic: pom
difficulty: intermediate
stage: 2
answerIndex: 0
lesson: FW-L-201
---

## Question

In a thin POM, where do business outcome assertions belong?

## Options

1. In the test spec, not hidden in page.verify* methods
2. Only in page object private methods
3. In a BaseTest superclass
4. In playwright.config.ts expect section

## Correct answer

In the test spec, not hidden in page.verify* methods

## Why correct

Tests read as specifications; page objects expose actions and locators for expect().

## Why the others are wrong

- Option 2: Hides intent and duplicates assertions.
- Option 3: BaseTest inheritance is an anti-pattern in Playwright.
- Option 4: Config expect is timeout policy not business rules.
