---
id: FW-Q-063
type: framework-mcq
topic: framework
subtopic: monorepo
difficulty: intermediate
stage: 4
answerIndex: 3
lesson: FW-L-406
---

## Question

Multi-repo org wants shared fixtures without monorepo. Pattern?

## Options

1. Email zip of fixtures
2. Copy fixtures manually each sprint
3. Git submodule per test
4. Versioned internal npm package @corp/playwright-fixtures

## Correct answer

Versioned internal npm package @corp/playwright-fixtures

## Why correct

Semver + changelog — teams pin and upgrade deliberately.

## Why the others are wrong

- Option 1: No versioning.
- Option 2: Drift guaranteed.
- Option 3: Submodule pain.
