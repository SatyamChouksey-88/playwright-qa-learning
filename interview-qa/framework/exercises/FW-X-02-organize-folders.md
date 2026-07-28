---
id: FW-X-02
type: framework-exercise
topic: framework
stage: 1
difficulty: beginner
lesson: FW-L-104
specFile: practice-suite/exercises/FW-X-02-organize-folders.spec.ts
runCommand: npm run exercise -- --grep FW-X-02
---

## Goal

Validate that a folder list includes the v1 framework directories.

## Starter code

```ts
const REQUIRED = ['tests', 'pages', 'fixtures'] as const;

export function validateFolderStructure(paths: string[]): boolean {
  // TODO: every REQUIRED folder must appear in paths (any order)
  return paths.includes('tests');
}
```

## Task

Return true only when `paths` includes `tests`, `pages`, and `fixtures`.

## Hints

<details>
<summary>Hint 1</summary>

Use Array.every over REQUIRED.

</details>

<details>
<summary>Hint 2</summary>

Extra folders like config/ are allowed.

</details>

<details>
<summary>Hint 3</summary>

Order of paths does not matter.

</details>

## Solution

```ts
const REQUIRED = ['tests', 'pages', 'fixtures'] as const;

export function validateFolderStructure(paths: string[]): boolean {
  return REQUIRED.every((folder) => paths.includes(folder));
}
```

## Solution walkthrough

Feature-first layout needs tests, pages, fixtures at minimum — matches FW-L-104 tree.

## Self-check

Run `npm run exercise -- --grep FW-X-02`.
