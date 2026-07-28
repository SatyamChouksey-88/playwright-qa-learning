---
id: FW-Q-033
type: framework-mcq
topic: framework
subtopic: auth
difficulty: beginner
stage: 2
answerIndex: 1
lesson: FW-L-207
---

## Question

Should `.auth/*.json` storageState files be committed?

## Options

1. Yes — speeds CI for everyone
2. No — gitignore them; regenerate in CI setup
3. Only on main branch
4. Only if encrypted with repo password

## Correct answer

No — gitignore them; regenerate in CI setup

## Why correct

Contains session tokens; stale on disk; CI setup project recreates.

## Why the others are wrong

- Option 1: Security and staleness risk.
- Option 3: Branch policy does not fix secret leak.
- Option 4: Still should not commit sessions.
