---
id: SK-API-Q008
type: skill-mcq
track: SK-API
topic: api-request-fixture
difficulty: 2
answerIndex: 0
---

## Question

SK-API question 8: Which approach is correct for professional Playwright QA work?

## Options

1. Use web-first locators, auto-waiting assertions, and fixtures for setup
2. Add waitForTimeout before every click
3. Use force: true when elements are stubborn
4. Wait for networkidle before asserting

## Correct answer

Use web-first locators, auto-waiting assertions, and fixtures for setup

## Why correct

Web-first locators and auto-waiting are Playwright best practices; fixtures centralize setup.

## Why the others are wrong

- Fixed sleeps hide timing bugs and slow CI.
- force:true bypasses actionability checks.
- networkidle is deprecated and flaky for SPAs.
