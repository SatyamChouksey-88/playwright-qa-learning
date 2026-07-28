---
id: FW-Q-053
type: framework-mcq
topic: framework
subtopic: tagging
difficulty: intermediate
stage: 4
answerIndex: 0
lesson: FW-L-401
---

## Question

Quarantined test (@quarantine) should:

## Options

1. Have ticket, owner, expiry; excluded from merge gate
2. Run on every PR blocking merge
3. Never be fixed
4. Delete trace artifacts

## Correct answer

Have ticket, owner, expiry; excluded from merge gate

## Why correct

Quarantine manages flake without hiding debt forever.

## Why the others are wrong

- Option 2: Opposite — excluded from gate.
- Option 3: Must expire/fix.
- Option 4: Traces help fix quarantined tests.
