---
id: FW-Q-045
type: framework-mcq
topic: framework
subtopic: seed
difficulty: intermediate
stage: 3
answerIndex: 0
lesson: FW-L-303
---

## Question

Test asserts checkout total. Best arrange strategy?

## Options

1. API seed cart/order; start UI on checkout page
2. UI click through catalog every time regardless
3. Skip arrange — empty cart
4. Manual SQL in test without cleanup

## Correct answer

API seed cart/order; start UI on checkout page

## Why correct

Test the checkout assertion path, not catalog navigation unless that is the subject.

## Why the others are wrong

- Option 2: Slow when checkout is the focus.
- Option 3: Wrong precondition.
- Option 4: SQL without cleanup orphans data.
