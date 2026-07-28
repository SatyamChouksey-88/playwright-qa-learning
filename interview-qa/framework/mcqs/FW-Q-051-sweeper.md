---
id: FW-Q-051
type: framework-mcq
topic: framework
subtopic: cleanup
difficulty: advanced
stage: 3
answerIndex: 1
lesson: FW-L-306
---

## Question

Nightly data sweeper job purpose?

## Options

1. Replace all tests
2. Delete orphaned e2e-prefixed records when teardown missed
3. Speed up locators
4. Merge HTML reports

## Correct answer

Delete orphaned e2e-prefixed records when teardown missed

## Why correct

CI kill mid-test skips teardown — sweeper is backstop.

## Why the others are wrong

- Option 1: Sweeper is hygiene not replacement.
- Option 3: Unrelated.
- Option 4: Report merge unrelated.
