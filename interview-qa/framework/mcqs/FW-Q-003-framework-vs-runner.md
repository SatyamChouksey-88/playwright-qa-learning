---
id: FW-Q-003
type: framework-mcq
topic: framework
subtopic: project-init
difficulty: intermediate
stage: 1
answerIndex: 0
lesson: FW-L-101
---

## Question

In interview terms, what IS the "framework" when using Playwright Test?

## Options

1. Conventions (folders, fixtures, config policy) on top of Playwright Test — not a replacement runner
2. A mandatory BaseTest class every spec must extend
3. A fork of Playwright with custom commands
4. Cucumber layer required for scale

## Correct answer

Conventions (folders, fixtures, config policy) on top of Playwright Test — not a replacement runner

## Why correct

Senior answer: Playwright Test already provides runner, parallelism, and reporting — you add structure and restraint.

## Why the others are wrong

- Option 2: Inheritance BaseTest is a Selenium habit Playwright fixtures replace.
- Option 3: Forking Playwright is almost never justified.
- Option 4: BDD is optional; many high-scale suites use plain TypeScript tests.
