---
id: FW-X-06
type: framework-exercise
topic: framework
stage: 2
difficulty: intermediate
lesson: FW-L-207
specFile: practice-suite/exercises/FW-X-06-auth-setup-project.spec.ts
runCommand: npm run exercise -- --grep FW-X-06
---

## Goal

Build projects array with setup dependency and storageState on consumer.

## Starter code

```ts
export type ProjectDef = { name: string; dependencies?: string[]; storageState?: string };

export function buildAuthProjects(): ProjectDef[] {
  return [{ name: 'chromium' }];
}
```

## Task

Return setup project plus authenticated project with dependencies ['setup'] and storageState path.

## Hints

<details>
<summary>Hint 1</summary>

Setup project has no storageState.

</details>

<details>
<summary>Hint 2</summary>

Consumer depends on setup by name.

</details>

<details>
<summary>Hint 3</summary>

Path matches lesson convention.

</details>

## Solution

```ts
export type ProjectDef = { name: string; dependencies?: string[]; storageState?: string };

export function buildAuthProjects(): ProjectDef[] {
  return [
    { name: 'setup' },
    {
      name: 'authenticated',
      dependencies: ['setup'],
      storageState: 'playwright/.auth/user.json',
    },
  ];
}
```

## Solution walkthrough

Mirrors playwright.config projects for auth setup lesson.

## Self-check

Run `npm run exercise -- --grep FW-X-06`.
