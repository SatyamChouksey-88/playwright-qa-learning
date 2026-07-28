---
id: FW-X-05
type: framework-exercise
topic: framework
stage: 2
difficulty: intermediate
lesson: FW-L-203
specFile: practice-suite/exercises/FW-X-05-beforeeach-to-fixture.spec.ts
runCommand: npm run exercise -- --grep FW-X-05
---

## Goal

Express setup as fixture pattern metadata instead of beforeEach flag.

## Starter code

```ts
export type FixtureMeta = { usesFixtures: boolean; usesBeforeEach: boolean; exportsCustomTest: boolean };

export function describeSetupPattern(): FixtureMeta {
  return { usesFixtures: false, usesBeforeEach: true, exportsCustomTest: false };
}
```

## Task

Return metadata reflecting fixtures-first pattern: fixtures true, beforeEach false, custom test export true.

## Hints

<details>
<summary>Hint 1</summary>

FW-L-203 replaces beforeEach with test.extend.

</details>

<details>
<summary>Hint 2</summary>

Specs import test from fixtures/base.

</details>

<details>
<summary>Hint 3</summary>

No Playwright runtime needed here.

</details>

## Solution

```ts
export type FixtureMeta = { usesFixtures: boolean; usesBeforeEach: boolean; exportsCustomTest: boolean };

export function describeSetupPattern(): FixtureMeta {
  return { usesFixtures: true, usesBeforeEach: false, exportsCustomTest: true };
}
```

## Solution walkthrough

Pure metadata exercise — encodes the decision from the lesson.

## Self-check

Run `npm run exercise -- --grep FW-X-05`.
