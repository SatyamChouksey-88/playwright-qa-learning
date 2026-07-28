---
id: FW-Q-026
type: framework-mcq
topic: framework
subtopic: scope
difficulty: advanced
stage: 2
answerIndex: 2
lesson: FW-L-204
---

## Question

Tests pass alone but fail in parallel after adding worker-scoped userId counter. Likely cause?

## Options

1. Too many browsers
2. Strict TypeScript
3. Mutable shared state at worker scope
4. HTML reporter enabled

## Correct answer

Mutable shared state at worker scope

## Why correct

Worker fixtures persist across tests in same worker — shared counters/arrays race.

## Why the others are wrong

- Option 1: Browser count is config not this symptom.
- Option 2: TS does not change runtime isolation.
- Option 4: Reporter unrelated to data races.
