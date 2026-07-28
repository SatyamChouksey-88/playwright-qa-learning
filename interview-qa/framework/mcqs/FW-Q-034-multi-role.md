---
id: FW-Q-034
type: framework-mcq
topic: framework
subtopic: auth
difficulty: intermediate
stage: 2
answerIndex: 2
lesson: FW-L-208
---

## Question

Best pattern to test RBAC (admin vs member)?

## Options

1. One admin user for all tests
2. Logout/login role switch every assertion
3. Separate storageState per role + projects or tagged suites
4. Disable auth tests

## Correct answer

Separate storageState per role + projects or tagged suites

## Why correct

Parallel-safe; reports show which role failed.

## Why the others are wrong

- Option 1: Cannot test forbidden paths.
- Option 2: Slow and flaky.
- Option 4: RBAC is core coverage.
