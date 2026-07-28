---
id: FW-Q-018
type: framework-mcq
topic: framework
subtopic: pom
difficulty: advanced
stage: 2
answerIndex: 2
lesson: FW-L-201
---

## Question

A 600-line Page class covers an entire SPA. Best refactor direction?

## Options

1. Add BasePage inheritance
2. Move all expects into the page to shrink tests
3. Split into route page + component objects
4. Convert to Selenium

## Correct answer

Split into route page + component objects

## Why correct

Component objects reuse nav/modal/table; pages compose them — scales on SPAs.

## Why the others are wrong

- Option 1: Deep inheritance hurts more at scale.
- Option 2: Thick POM worsens maintainability.
- Option 4: Platform swap is unrelated refactor.
