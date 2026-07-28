---
id: FW-Q-007
type: framework-mcq
topic: framework
subtopic: config
difficulty: beginner
stage: 1
answerIndex: 0
lesson: FW-L-103
---

## Question

What are `projects[]` primarily for in Playwright config?

## Options

1. Browser/env/role matrix slices with optional dependencies
2. Sharding files across Git branches
3. Replacing test.describe blocks
4. Storing environment secrets

## Correct answer

Browser/env/role matrix slices with optional dependencies

## Why correct

Projects name config variants — browser device, storageState, grep — and can depend on setup projects.

## Why the others are wrong

- Option 2: Sharding uses --shard CLI, not projects definition alone.
- Option 3: describe groups tests; projects select config.
- Option 4: Secrets belong in env/secret store, not config literals.
