---
id: FW-Q-040
type: framework-mcq
topic: framework
subtopic: factories
difficulty: beginner
stage: 3
answerIndex: 1
lesson: FW-L-301
---

## Question

Why add UUID suffix to factory emails?

## Options

1. Email validation requires UUID
2. Parallel tests avoid colliding on same email unique constraint
3. Playwright mandates it
4. Makes tests slower for reliability

## Correct answer

Parallel tests avoid colliding on same email unique constraint

## Why correct

Shared static emails race in parallel workers against DB unique indexes.

## Why the others are wrong

- Option 1: Not validation requirement.
- Option 3: Playwright does not mandate.
- Option 4: Uniqueness is cheap.
