---
id: FW-Q-047
type: framework-mcq
topic: framework
subtopic: hybrid
difficulty: intermediate
stage: 3
answerIndex: 1
lesson: FW-L-304
---

## Question

Hybrid API+UI test pattern means:

## Options

1. Only API tests, no browser
2. API arrange + UI act/assert (+ API teardown)
3. UI only, no backend
4. Run API and UI in separate repos always

## Correct answer

API arrange + UI act/assert (+ API teardown)

## Why correct

Fast stable arrange; UI validates customer-visible behavior.

## Why the others are wrong

- Option 1: Hybrid includes browser.
- Option 3: Ignores speed benefit of API arrange.
- Option 4: Repo count independent of pattern.
