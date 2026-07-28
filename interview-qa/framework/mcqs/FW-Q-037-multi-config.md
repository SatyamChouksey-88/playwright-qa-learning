---
id: FW-Q-037
type: framework-mcq
topic: framework
subtopic: config-layering
difficulty: intermediate
stage: 2
answerIndex: 3
lesson: FW-L-209
---

## Question

When are multiple playwright config files justified?

## Options

1. Always — one per developer
2. Never — Playwright allows only one
3. For each test case
4. When project shapes truly differ and merging via env is unreadable

## Correct answer

When project shapes truly differ and merging via env is unreadable

## Why correct

Default single config + env; split only when duplication hurts review.

## Why the others are wrong

- Option 1: Drift guaranteed.
- Option 2: You can have multiple but should minimize.
- Option 3: Absurd granularity.
