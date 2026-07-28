---
id: FW-Q-042
type: framework-mcq
topic: framework
subtopic: factories
difficulty: beginner
stage: 3
answerIndex: 3
lesson: FW-L-301
---

## Question

Where should factories live?

## Options

1. Inline in every spec
2. Inside page objects
3. In playwright.config
4. data/factories/ (or similar domain folder)

## Correct answer

data/factories/ (or similar domain folder)

## Why correct

Shared builders are test data layer — not UI or config.

## Why the others are wrong

- Option 1: Duplication.
- Option 2: Mixes concerns.
- Option 3: Config is not data layer.
