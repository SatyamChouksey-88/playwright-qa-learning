---
id: FW-Q-044
type: framework-mcq
topic: framework
subtopic: api
difficulty: intermediate
stage: 3
answerIndex: 1
lesson: FW-L-302
---

## Question

Playwright built-in `request` fixture is best for:

## Options

1. Driving mobile native apps
2. In-test API calls without browser when simple
3. Replacing page fixture always
4. Sharding

## Correct answer

In-test API calls without browser when simple

## Why correct

request context shares config; ApiClient adds domain layer on top when needed.

## Why the others are wrong

- Option 1: Playwright is web.
- Option 3: UI tests still need page.
- Option 4: Unrelated.
