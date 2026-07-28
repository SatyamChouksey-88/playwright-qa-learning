---
id: FW-Q-031
type: framework-mcq
topic: framework
subtopic: auth
difficulty: beginner
stage: 2
answerIndex: 0
lesson: FW-L-207
---

## Question

storageState files store:

## Options

1. Cookies and localStorage for browser context reuse
2. Page object source code
3. Git credentials
4. Shard timing metadata

## Correct answer

Cookies and localStorage for browser context reuse

## Why correct

Setup project writes JSON; dependent projects load it to skip UI login.

## Why the others are wrong

- Option 2: Page objects are TS modules.
- Option 3: Never store git creds in auth state.
- Option 4: Sharding unrelated.
