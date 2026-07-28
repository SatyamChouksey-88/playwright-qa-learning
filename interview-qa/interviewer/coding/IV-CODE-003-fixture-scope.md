---
id: IV-CODE-003
type: iv-coding
level: mid
round: coding
timebox: 15
difficulty: 3
topic: fixtures
specFile: practice-suite/exercises/interviewer/IV-CODE-003-fixture-scope.spec.ts
---

## Interviewer script

Say: "Review these fixture descriptors and return the scope each should use." Discuss worker vs test after implementation.

## Task statement

Implement `classifyFixture(name: string): 'test' | 'worker' | 'invalid'` using rules: apiClient/dbPool/browserContext→worker; page/user→test; unknown→invalid.

## Starter code

```ts
const WORKER = new Set(['apiClient', 'dbPool', 'sharedToken']);
const TEST = new Set(['page', 'user', 'checkoutCart']);

export function classifyFixture(name: string): 'test' | 'worker' | 'invalid' {
  return 'test';
}
```

## What to evaluate

- Correct worker fixtures
- Correct test fixtures
- Invalid for unknown names

## Exemplar solution

```ts
const WORKER = new Set(['apiClient', 'dbPool', 'sharedToken']);
const TEST = new Set(['page', 'user', 'checkoutCart']);

export function classifyFixture(name: string): 'test' | 'worker' | 'invalid' {
  if (WORKER.has(name)) return 'worker';
  if (TEST.has(name)) return 'test';
  return 'invalid';
}
```

## Common candidate mistakes

- Everything as test scope
- Using worker for page

## Hint ladder

<details>
<summary>Hint 1</summary>

Check WORKER set first.

</details>

<details>
<summary>Hint 2</summary>

page is always test scope.

</details>

<details>
<summary>Hint 3</summary>

Unknown names are invalid.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Technical depth | Scope rules correct |
| Communication | Explains pollution risk of wrong scope |
