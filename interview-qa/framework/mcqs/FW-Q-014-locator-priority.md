---
id: FW-Q-014
type: framework-mcq
topic: framework
subtopic: locators
difficulty: beginner
stage: 1
answerIndex: 2
lesson: FW-L-107
---

## Question

Recommended locator priority in a team policy?

## Options

1. XPath → CSS → id
2. CSS class chains only
3. getByRole / getByLabel → getByTestId → CSS fallback
4. Coordinates from codegen

## Correct answer

getByRole / getByLabel → getByTestId → CSS fallback

## Why correct

User-facing locators align with accessibility and survive DOM refactors better.

## Why the others are wrong

- Option 1: XPath is hard to maintain — ban in new tests.
- Option 2: Classes change with styling.
- Option 4: Coordinates break on responsive layouts.
