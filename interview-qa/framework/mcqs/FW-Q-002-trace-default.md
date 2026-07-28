---
id: FW-Q-002
type: framework-mcq
topic: framework
subtopic: project-init
difficulty: beginner
stage: 1
answerIndex: 2
lesson: FW-L-101
---

## Question

Which trace setting is a sensible default for a new CI-friendly Playwright config?

## Options

1. trace: "on" for every test always
2. trace: "off" everywhere to save disk
3. trace: "on-first-retry"
4. trace: "retain-on-failure" only locally

## Correct answer

trace: "on-first-retry"

## Why correct

Captures diagnostics when retries run in CI without storing traces for every passing test.

## Why the others are wrong

- Option 1: Always-on traces balloon artifact storage on large suites.
- Option 2: No traces makes flaky diagnosis painful — opposite of framework goals.
- Option 4: retain-on-failure is valid but on-first-retry pairs directly with CI retry policy.
