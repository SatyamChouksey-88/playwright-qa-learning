---
id: FW-Q-052
type: framework-mcq
topic: framework
subtopic: tagging
difficulty: beginner
stage: 4
answerIndex: 2
lesson: FW-L-401
---

## Question

Purpose of @smoke tag in framework CI?

## Options

1. Mark flaky tests
2. Skip tests permanently
3. Fast PR gate subset covering critical paths
4. Replace playwright.config

## Correct answer

Fast PR gate subset covering critical paths

## Why correct

Smoke runs on every PR; regression runs less frequently.

## Why the others are wrong

- Option 1: Flaky uses @quarantine/@flaky.
- Option 2: Smoke runs tests not skips.
- Option 4: Tags filter tests not replace config.
