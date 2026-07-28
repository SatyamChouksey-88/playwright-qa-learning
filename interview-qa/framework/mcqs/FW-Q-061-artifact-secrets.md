---
id: FW-Q-061
type: framework-mcq
topic: framework
subtopic: reporting
difficulty: advanced
stage: 4
answerIndex: 0
lesson: FW-L-404
---

## Question

Traces may contain passwords from fill(). Mitigation today?

## Options

1. Restrict artifact bucket access + disposable test creds — no built-in redaction yet
2. trace: off always
3. Publish reports publicly
4. Store traces in git

## Correct answer

Restrict artifact bucket access + disposable test creds — no built-in redaction yet

## Why correct

Known gap — access control and test env creds are real mitigation.

## Why the others are wrong

- Option 2: Traces needed for debug.
- Option 3: Security incident.
- Option 4: Never commit traces.
