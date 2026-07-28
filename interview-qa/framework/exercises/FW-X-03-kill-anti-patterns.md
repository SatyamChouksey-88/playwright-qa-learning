---
id: FW-X-03
type: framework-exercise
topic: framework
stage: 1
difficulty: intermediate
lesson: FW-L-107
specFile: practice-suite/exercises/FW-X-03-kill-anti-patterns.spec.ts
runCommand: npm run exercise -- --grep FW-X-03
---

## Goal

Scan code strings for framework anti-patterns banned in this academy.

## Starter code

```ts
const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;

export function findAntiPatterns(code: string): string[] {
  // TODO: return all BANNED tokens found in code (may be multiple)
  return [];
}
```

## Task

Return every banned substring present in the input code string.

## Hints

<details>
<summary>Hint 1</summary>

Filter BANNED with code.includes.

</details>

<details>
<summary>Hint 2</summary>

Return empty array when clean.

</details>

<details>
<summary>Hint 3</summary>

Do not modify BANNED list.

</details>

## Solution

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

## Solution walkthrough

Lint and review catch these in real repos — exercise teaches recognition.

## Self-check

Run `npm run exercise -- --grep FW-X-03`.
