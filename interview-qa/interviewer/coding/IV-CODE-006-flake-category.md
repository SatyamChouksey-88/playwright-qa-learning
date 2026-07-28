---
id: IV-CODE-006
type: iv-coding
level: mid
round: coding
timebox: 10
difficulty: 3
topic: flaky
specFile: practice-suite/exercises/interviewer/IV-CODE-006-flake-category.spec.ts
---

## Interviewer script

Say: "Triage these CI failures — return category for each message."

## Task statement

Implement `categorizeFailure(message: string): FlakeCategory` using keyword rules: timeout/wait→timing; duplicate/unique→data; linux/mac/docker→environment; else assertion.

## Starter code

```ts
export type FlakeCategory = 'timing' | 'data' | 'environment' | 'assertion';

export function categorizeFailure(message: string): FlakeCategory {
  return 'assertion';
}
```

## What to evaluate

- Timing keywords
- Data collision keywords
- Environment keywords

## Exemplar solution

```ts
export type FlakeCategory = 'timing' | 'data' | 'environment' | 'assertion';

export function categorizeFailure(message: string): FlakeCategory {
  const m = message.toLowerCase();
  if (m.includes('timeout') || m.includes('waiting')) return 'timing';
  if (m.includes('duplicate') || m.includes('unique')) return 'data';
  if (m.includes('linux') || m.includes('mac') || m.includes('docker')) return 'environment';
  return 'assertion';
}
```

## Common candidate mistakes

- Everything assertion
- Ignoring environment signals

## Hint ladder

<details>
<summary>Hint 1</summary>

Check timeout first.

</details>

<details>
<summary>Hint 2</summary>

duplicate → data.

</details>

<details>
<summary>Hint 3</summary>

OS names → environment.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Problem-solving | Systematic triage |
| Technical depth | Category rules |
