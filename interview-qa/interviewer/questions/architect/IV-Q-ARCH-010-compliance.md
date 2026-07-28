---
id: IV-Q-ARCH-010
type: iv-question
level: architect
round: theory
kind: theory
timebox: 8
difficulty: 4
topic: compliance
crosslinks: []
---

## Question

Audit trail requirements for regulated industries running E2E.

## What this tests

Compliance architecture.

## Model answer

Immutable CI logs, test case versioning, who-waived-gate records, data masking in artifacts, retention policy aligned with SOX/HIPAA. No PII in traces — use synthetic accounts.

## Strong answer signals

- Names Playwright mechanism for compliance
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse compliance in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for compliance.

</details>

<details>
<summary>Hint 2</summary>

Consider test isolation and parallel workers.

</details>

<details>
<summary>Hint 3</summary>

Name one anti-pattern you would reject in code review.

</details>

## Scoring guide

| Score | Anchor |
|-------|--------|
| 1 | No meaningful answer on compliance; guesses or silent. |
| 2 | Partial compliance answer with major gaps; needs heavy hints (architect). |
| 3 | Solid compliance explanation with one missing trade-off or weak example. |
| 4 | Complete compliance answer: mechanism, TypeScript example, trade-offs, real context. |
