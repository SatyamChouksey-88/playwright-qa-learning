---
id: FW-Q-023
type: framework-mcq
topic: framework
subtopic: fixtures
difficulty: intermediate
stage: 2
answerIndex: 0
lesson: FW-L-203
---

## Question

Where should API cleanup run in fixture design?

## Options

1. After await use(...) in the same fixture function
2. Only in globalTeardown always
3. In test.afterAll at file bottom
4. Manual delete in every test end

## Correct answer

After await use(...) in the same fixture function

## Why correct

Fixture teardown runs even on failure; pairs with setup in one place.

## Why the others are wrong

- Option 2: globalTeardown is coarse — prefer fixture scope.
- Option 3: afterAll skips on some failures ordering.
- Option 4: Duplicates and gets forgotten.
