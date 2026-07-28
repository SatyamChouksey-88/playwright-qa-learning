---
id: FW-Q-015
type: framework-mcq
topic: framework
subtopic: locators
difficulty: intermediate
stage: 1
answerIndex: 1
lesson: FW-L-107
---

## Question

Where should locators live in a page object?

## Options

1. String selectors in tests only
2. Readonly Locator fields on the page class
3. Global singleton map
4. playwright.config.ts

## Correct answer

Readonly Locator fields on the page class

## Why correct

Centralizes queries as lazy locators; tests stay readable with page.email.fill().

## Why the others are wrong

- Option 1: Duplicates selectors across specs.
- Option 3: Singletons break parallel isolation.
- Option 4: Config is for runner policy.
