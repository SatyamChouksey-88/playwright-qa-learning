---
id: FW-Q-025
type: framework-mcq
topic: framework
subtopic: scope
difficulty: intermediate
stage: 2
answerIndex: 1
lesson: FW-L-204
---

## Question

Good candidate for worker-scoped fixture?

## Options

1. Browser Page with logged-in UI state
2. Read-only ApiClient with connection reuse
3. Per-test unique user record
4. Mutable shopping cart contents

## Correct answer

Read-only ApiClient with connection reuse

## Why correct

Expensive, stateless, parallel-safe — classic worker scope.

## Why the others are wrong

- Option 1: Page state must be test-scoped.
- Option 3: Unique data cannot share worker without isolation.
- Option 4: Mutable state leaks across tests.
