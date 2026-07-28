---
id: FW-Q-039
type: framework-mcq
topic: framework
subtopic: projects
difficulty: advanced
stage: 2
answerIndex: 2
lesson: FW-L-210
---

## Question

Matrix explosion (roles × browsers × envs) should be managed by:

## Options

1. Running everything on every PR
2. Removing roles from tests
3. Tiering: smoke on PR, full matrix scheduled
4. Deleting projects[]

## Correct answer

Tiering: smoke on PR, full matrix scheduled

## Why correct

Architect answer balances cost vs coverage with tiers and schedule.

## Why the others are wrong

- Option 1: Blocks merges.
- Option 2: Loses RBAC.
- Option 4: projects are the control knob.
