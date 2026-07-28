---
id: FW-X-07
type: framework-exercise
topic: framework
stage: 2
difficulty: intermediate
lesson: FW-L-208
specFile: practice-suite/exercises/FW-X-07-multi-role-auth.spec.ts
runCommand: npm run exercise -- --grep FW-X-07
---

## Goal

Map roles to distinct storageState file paths.

## Starter code

```ts
export function roleStoragePaths(): Record<'admin' | 'member', string> {
  return {
    admin: 'playwright/.auth/user.json',
    member: 'playwright/.auth/user.json',
  };
}
```

## Task

Give admin and member separate files under playwright/.auth/.

## Hints

<details>
<summary>Hint 1</summary>

Same folder, different filenames.

</details>

<details>
<summary>Hint 2</summary>

Keys must be admin and member.

</details>

<details>
<summary>Hint 3</summary>

Do not share one path.

</details>

## Solution

```ts
export function roleStoragePaths(): Record<'admin' | 'member', string> {
  return {
    admin: 'playwright/.auth/admin.json',
    member: 'playwright/.auth/member.json',
  };
}
```

## Solution walkthrough

Multi-role parallel tests need isolated storageState files.

## Self-check

Run `npm run exercise -- --grep FW-X-07`.
