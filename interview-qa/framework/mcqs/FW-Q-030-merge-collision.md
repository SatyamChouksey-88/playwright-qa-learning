---
id: FW-Q-030
type: framework-mcq
topic: framework
subtopic: mergeTests
difficulty: advanced
stage: 2
answerIndex: 2
lesson: FW-L-206
---

## Question

Two merged fixture modules define the same fixture name. What happens?

## Options

1. Silent override — last wins at runtime
2. Playwright picks randomly
3. Composition fails / conflict — names must be unique
4. Both run twice

## Correct answer

Composition fails / conflict — names must be unique

## Why correct

Prefix fixtures by domain (adminPage vs guestPage) before merge.

## Why the others are wrong

- Option 1: Not silent — must design unique names.
- Option 4: No double execution.
- Option 1 partially wrong.
