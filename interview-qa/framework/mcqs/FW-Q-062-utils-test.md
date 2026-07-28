---
id: FW-Q-062
type: framework-mcq
topic: framework
subtopic: utils
difficulty: intermediate
stage: 4
answerIndex: 1
lesson: FW-L-405
---

## Question

Shared util changed and broke 500 tests. Prevention?

## Options

1. Ban all utils
2. Unit test utils + CODEOWNERS on shared folder
3. Copy-paste util per team
4. Remove TypeScript

## Correct answer

Unit test utils + CODEOWNERS on shared folder

## Why correct

Shared code needs its own quality bar — D27 lesson.

## Why the others are wrong

- Option 1: Utils still needed with governance.
- Option 3: Duplication worse.
- Option 4: TS helps catch breaks.
