---
id: FW-Q-010
type: framework-mcq
topic: framework
subtopic: folders
difficulty: intermediate
stage: 1
answerIndex: 0
lesson: FW-L-104
---

## Question

Where do shared page objects typically live in v1 structure?

## Options

1. pages/ at suite root (or feature-colocated when single-use)
2. Inside node_modules
3. Only inline in spec files forever
4. In playwright.config.ts

## Correct answer

pages/ at suite root (or feature-colocated when single-use)

## Why correct

Shared locators/actions centralized; colocate when only one feature uses them.

## Why the others are wrong

- Option 2: Page objects are your code, not dependencies.
- Option 3: Inline locators duplicate on second test.
- Option 4: Config is not application code storage.
