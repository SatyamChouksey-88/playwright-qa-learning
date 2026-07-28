---
id: IV-CODE-009
type: iv-coding
level: senior
round: coding
timebox: 12
difficulty: 3
topic: pom
specFile: practice-suite/exercises/interviewer/IV-CODE-009-thin-pom.spec.ts
---

## Interviewer script

Say: "Return true if Page class source violates thin POM (contains expect() inside methods)."

## Task statement

Implement `violatesThinPom(source: string): boolean` — true if /expect\(/ appears inside class body.

## Starter code

```ts
export function violatesThinPom(source: string): boolean {
  return false;
}
```

## What to evaluate

- Detects expect in class
- False for spec files
- False for thin POM

## Exemplar solution

```ts
export function violatesThinPom(source: string): boolean {
  if (!source.includes('class ')) return false;
  const classMatch = source.match(/class\s+\w+[\s\S]*/);
  if (!classMatch) return false;
  return /expect\s*\(/.test(classMatch[0]);
}
```

## Common candidate mistakes

- Flagging spec files
- Missing nested expects

## Hint ladder

<details>
<summary>Hint 1</summary>

Scope to class body.

</details>

<details>
<summary>Hint 2</summary>

expect( triggers violation.

</details>

<details>
<summary>Hint 3</summary>

Specs outside class OK.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Code quality | POM boundaries |
| Communication | Explains assertion placement |
