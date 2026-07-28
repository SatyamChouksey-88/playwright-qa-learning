---
id: FW-Q-050
type: framework-mcq
topic: framework
subtopic: mocking
difficulty: intermediate
stage: 3
answerIndex: 3
lesson: FW-L-305
---

## Question

After test registers page.route, best practice?

## Options

1. Leave routes for next test
2. Close browser only
3. Disable JavaScript
4. Unroute or use fixture to register/unregister per test scope

## Correct answer

Unroute or use fixture to register/unregister per test scope

## Why correct

Leaked routes affect subsequent tests in same context.

## Why the others are wrong

- Option 1: Cross-test pollution.
- Option 2: Context reuse may persist routes.
- Option 3: Breaks app.
