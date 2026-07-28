---
id: FW-Q-036
type: framework-mcq
topic: framework
subtopic: config-layering
difficulty: beginner
stage: 2
answerIndex: 1
lesson: FW-L-209
---

## Question

Preferred way to point same tests at staging vs local?

## Options

1. Duplicate spec files per env
2. BASE_URL env var read in config use.baseURL
3. Comment/uncomment URLs in tests
4. Separate git branches per env

## Correct answer

BASE_URL env var read in config use.baseURL

## Why correct

One spec suite; CI/local inject different env.

## Why the others are wrong

- Option 1: Doubles maintenance.
- Option 3: Error-prone manual edits.
- Option 4: Branch != environment target.
