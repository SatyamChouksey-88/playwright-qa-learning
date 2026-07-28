---
id: FW-X-01
type: framework-exercise
topic: framework
stage: 1
difficulty: beginner
lesson: FW-L-101
specFile: practice-suite/exercises/FW-X-01-scaffold-config.spec.ts
runCommand: npm run exercise -- --grep FW-X-01
---

## Goal

Export a minimal Playwright config object for the exercises project: testDir `./`, single project named `exercises`.

## Starter code

```ts
export type ExerciseConfig = { testDir: string; projects: { name: string }[] };

/** TODO: return testDir './' and one project named 'exercises' */
export function buildExerciseConfig(): ExerciseConfig {
  return { testDir: './tests', projects: [] };
}
```

## Task

Implement `buildExerciseConfig()` so it returns `testDir: './'` and exactly one project `{ name: 'exercises' }`.

## Hints

<details>
<summary>Hint 1</summary>

Match the shape in the type — no extra keys required.

</details>

<details>
<summary>Hint 2</summary>

Project name is case-sensitive: `exercises`.

</details>

<details>
<summary>Hint 3</summary>

testDir is relative to the config file location.

</details>

## Solution

```ts
export type ExerciseConfig = { testDir: string; projects: { name: string }[] };

export function buildExerciseConfig(): ExerciseConfig {
  return {
    testDir: './',
    projects: [{ name: 'exercises' }],
  };
}
```

## Solution walkthrough

The function is a pure config builder — no Playwright import needed. Spec validates shape for lesson FW-L-101 init conventions.

## Self-check

Run `npm run exercise -- --grep FW-X-01` from practice-suite.
