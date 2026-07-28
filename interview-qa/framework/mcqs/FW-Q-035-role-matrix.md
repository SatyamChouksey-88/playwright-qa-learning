---
id: FW-Q-035
type: framework-mcq
topic: framework
subtopic: auth
difficulty: advanced
stage: 2
answerIndex: 0
lesson: FW-L-208
---

## Question

4 roles × 3 browsers = 12 projects. PR pipeline should:

## Options

1. Run smoke subset (e.g. chromium + admin/member) not full 12
2. Run all 12 on every commit
3. Disable multi-role
4. Use one browser only forever

## Correct answer

Run smoke subset (e.g. chromium + admin/member) not full 12

## Why correct

Tiering controls CI cost; full matrix nightly.

## Why the others are wrong

- Option 2: Cost explosion.
- Option 3: Loses RBAC signal.
- Option 4: Cross-browser still matters nightly.
