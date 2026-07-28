---
id: FW-Q-001
type: framework-mcq
topic: framework
subtopic: project-init
difficulty: beginner
stage: 1
answerIndex: 1
lesson: FW-L-101
---

## Question

What is the recommended first step when bootstrapping a new Playwright TypeScript test suite in an empty repo?

## Options

1. Write a custom Node runner that wraps Playwright
2. Add @playwright/test, strict tsconfig, and a root playwright.config.ts
3. Copy a Selenium PageFactory base class
4. Disable TypeScript strict until tests pass

## Correct answer

Add @playwright/test, strict tsconfig, and a root playwright.config.ts

## Why correct

Playwright Test is the runner; your framework adds conventions around it — strict TS and one config entry point from day one.

## Why the others are wrong

- Option 1: Playwright already ships a runner — wrapping it adds maintenance with no interview-grade benefit.
- Option 3: Selenium patterns (PageFactory, drivers/) fight Playwright's fixture model.
- Option 4: Strict mode is cheaper to enable at init than retrofit after hundreds of tests.
