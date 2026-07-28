---
id: FW-Q-008
type: framework-mcq
topic: framework
subtopic: config
difficulty: beginner
stage: 1
answerIndex: 1
lesson: FW-L-103
---

## Question

Where should baseURL usually be set?

## Options

1. Hardcoded in every test file
2. In config `use.baseURL` from an environment variable
3. Only in page object constructors
4. In package.json scripts exclusively

## Correct answer

In config `use.baseURL` from an environment variable

## Why correct

Central baseURL + env var enables same tests against local, staging, and CI without edits.

## Why the others are wrong

- Option 1: Duplication drifts between specs.
- Option 3: Page objects consume baseURL via page.goto relative paths.
- Option 4: Scripts can set env but config reads it for Playwright.
