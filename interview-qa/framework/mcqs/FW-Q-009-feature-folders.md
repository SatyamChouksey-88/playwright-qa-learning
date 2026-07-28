---
id: FW-Q-009
type: framework-mcq
topic: framework
subtopic: folders
difficulty: beginner
stage: 1
answerIndex: 2
lesson: FW-L-104
---

## Question

How should test files be grouped in a growing suite?

## Options

1. Single flat tests/ folder with numbered files
2. Mirror every src/ subfolder exactly
3. By feature/domain under tests/<feature>/
4. One spec per engineer username

## Correct answer

By feature/domain under tests/<feature>/

## Why correct

Feature grouping scales with team ownership and grep-by-area in CI.

## Why the others are wrong

- Option 1: Flat folders fail around ~50 tests with multiple authors.
- Option 2: App tree != user journey tree.
- Option 4: Not a serious pattern — ownership via CODEOWNERS on paths.
