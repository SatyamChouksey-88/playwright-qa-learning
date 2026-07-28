---
id: FW-Q-059
type: framework-mcq
topic: framework
subtopic: retries
difficulty: advanced
stage: 4
answerIndex: 1
lesson: FW-L-403
---

## Question

Team raised retries from 1 to 5; pass rate up but bugs reach prod. Diagnosis?

## Options

1. Need more shards
2. Retries masking real failures — revert and quarantine with owners
3. Need fewer tests
4. Disable traces

## Correct answer

Retries masking real failures — revert and quarantine with owners

## Why correct

Green with high retries is false confidence — governance failure.

## Why the others are wrong

- Option 1: Sharding does not fix bad tests.
- Option 3: Coverage not root cause.
- Option 4: Traces help diagnosis.
