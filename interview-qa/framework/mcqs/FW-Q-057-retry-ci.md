---
id: FW-Q-057
type: framework-mcq
topic: framework
subtopic: retries
difficulty: beginner
stage: 4
answerIndex: 0
lesson: FW-L-403
---

## Question

Sensible CI retries default?

## Options

1. 0–2 with trace on-first-retry
2. 5 always
3. 10 on main only
4. Unlimited

## Correct answer

0–2 with trace on-first-retry

## Why correct

Small retry aids infra flake; more hides product bugs.

## Why the others are wrong

- Option 2: Masks systemic issues.
- Option 3: Still too high.
- Option 4: Never unlimited.
