---
id: IV-CODE-007
type: iv-coding
level: senior
round: coding
timebox: 12
difficulty: 3
topic: isolation
specFile: practice-suite/exercises/interviewer/IV-CODE-007-isolation-audit.spec.ts
---

## Interviewer script

Say: "Audit this test file string for isolation violations."

## Task statement

Implement `findIsolationViolations(code: string): string[]` returning tags: `global-mutable`, `shared-file`, `missing-unique-data` when detected.

## Starter code

```ts
export function findIsolationViolations(code: string): string[] {
  return [];
}
```

## What to evaluate

- Detects global mutable
- Detects shared file path
- Detects hardcoded email

## Exemplar solution

```ts
export function findIsolationViolations(code: string): string[] {
  const violations: string[] = [];
  if (/let\s+shared\s*=/.test(code) || /var\s+globalUser/.test(code)) {
    violations.push('global-mutable');
  }
  if (code.includes('writeFileSync') && code.includes('/tmp/shared')) {
    violations.push('shared-file');
  }
  if (code.includes('test@example.com') && !code.includes('unique')) {
    violations.push('missing-unique-data');
  }
  return violations;
}
```

## Common candidate mistakes

- Missing subtle globals
- Flagging legitimate fixtures

## Hint ladder

<details>
<summary>Hint 1</summary>

Look for module-level let shared.

</details>

<details>
<summary>Hint 2</summary>

/tmp/shared path.

</details>

<details>
<summary>Hint 3</summary>

Static email without factory.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Technical depth | Isolation patterns |
| Judgment | Proposes fix per violation |
