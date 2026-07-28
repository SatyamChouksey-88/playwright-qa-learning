---
id: FW-Q-019
type: framework-mcq
topic: framework
subtopic: components
difficulty: intermediate
stage: 2
answerIndex: 1
lesson: FW-L-202
---

## Question

How does a component object scope locators?

## Options

1. Uses page.$ for each query
2. Accepts a root Locator (e.g. dialog) and queries within it
3. Stores CSS in global config
4. Requires iframes always

## Correct answer

Accepts a root Locator (e.g. dialog) and queries within it

## Why correct

Root locator prevents matching wrong duplicate buttons on page.

## Why the others are wrong

- Option 1: Element handles are deprecated pattern.
- Option 3: CSS globals are brittle.
- Option 4: Components work in main frame too.
