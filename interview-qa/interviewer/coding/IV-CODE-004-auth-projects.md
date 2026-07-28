---
id: IV-CODE-004
type: iv-coding
level: mid
round: coding
timebox: 15
difficulty: 3
topic: storageState
specFile: practice-suite/exercises/interviewer/IV-CODE-004-auth-projects.spec.ts
---

## Interviewer script

Say: "Return playwright.config projects for setup writing storageState and chromium depending on it." No live auth needed.

## Task statement

Implement `buildAuthProjects()` returning `[setup, chromium]` where setup has `testMatch: /auth\.setup\.ts/` and chromium has `dependencies: ['setup']` and `storageState: 'playwright/.auth/user.json'`.

## Starter code

```ts
export type AuthProject = {
  name: string;
  testMatch?: RegExp;
  dependencies?: string[];
  storageState?: string;
};

export function buildAuthProjects(): AuthProject[] {
  return [{ name: 'chromium' }];
}
```

## What to evaluate

- Setup project first
- Consumer depends on setup
- storageState path correct

## Exemplar solution

```ts
export type AuthProject = {
  name: string;
  testMatch?: RegExp;
  dependencies?: string[];
  storageState?: string;
};

export function buildAuthProjects(): AuthProject[] {
  return [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      storageState: 'playwright/.auth/user.json',
    },
  ];
}
```

## Common candidate mistakes

- Missing dependencies
- Same project for setup and tests
- Wrong path

## Hint ladder

<details>
<summary>Hint 1</summary>

Two projects minimum.

</details>

<details>
<summary>Hint 2</summary>

Consumer name chromium.

</details>

<details>
<summary>Hint 3</summary>

testMatch is RegExp for setup only.

</details>

## Rubric

| Dimension | Look for |
|-----------|----------|
| Technical depth | Setup project pattern |
| Judgment | Explains why not UI login every test |
