---
id: FW-Q-048
type: framework-mcq
topic: framework
subtopic: hybrid
difficulty: advanced
stage: 3
answerIndex: 2
lesson: FW-L-304
---

## Question

Where should API delete run in hybrid tests?

## Options

1. Never — sweeper only
2. test.afterEach in every file
3. Fixture after await use(entity)
4. Comment in README

## Correct answer

Fixture after await use(entity)

## Why correct

Runs on failure; colocated with create; idempotent delete.

## Why the others are wrong

- Option 1: Sweeper is backstop not primary.
- Option 2: Duplicated across files.
- Option 4: Not executable.
