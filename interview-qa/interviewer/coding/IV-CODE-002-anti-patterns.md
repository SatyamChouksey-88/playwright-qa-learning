---
id: IV-CODE-002
type: iv-coding
level: junior
round: coding
timebox: 15
difficulty: 2
topic: code-quality
specFile: practice-suite/exercises/interviewer/IV-CODE-002-anti-patterns.spec.ts
---

## Interviewer script

Say: "Our linter needs a `findAntiPatterns` helper for PR review. Return every banned token found." This mirrors real review duty.

## Task statement

Implement `findAntiPatterns(code: string): string[]` returning all matching banned tokens (may be multiple).

## Starter code

```ts
const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;

export function findAntiPatterns(code: string): string[] {
  return [];
}
```

## What to evaluate

- Detects each banned token
- Returns empty array when clean
- Does not false-positive on getByRole

## Exemplar solution

```ts
const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;

export function findAntiPatterns(code: string): string[] {
  return BANNED.filter((token) => code.includes(token));
}
```

## Common candidate mistakes

- Only returning first match
- Case-sensitive misses
- Modifying BANNED list

## Hint ladder

<details>
<summary>Hint 1</summary>

Filter BANNED with includes.

</details>

<details>
<summary>Hint 2</summary>

Return all matches.

</details>

<details>
<summary>Hint 3</summary>

Empty array when none.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Technical depth | Correct substring scan |
| Judgment | Can explain why each token is banned |
