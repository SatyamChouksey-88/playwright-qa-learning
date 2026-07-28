---
id: FW-Q-066
type: framework-mcq
topic: framework
subtopic: restraint
difficulty: intermediate
stage: 4
answerIndex: 3
lesson: FW-L-407
---

## Question

Selenium-style BaseTest inheritance in Playwright is:

## Options

1. Required for senior roles
2. Recommended by Microsoft
3. Needed for parallel
4. An anti-pattern — use fixtures instead

## Correct answer

An anti-pattern — use fixtures instead

## Why correct

Composition via test.extend replaces fragile inheritance trees.

## Why the others are wrong

- Option 1: Opposite of modern Playwright.
- Option 2: Docs promote fixtures.
- Option 3: Parallel uses workers/contexts.
