---
id: FW-X-09
type: framework-exercise
topic: framework
stage: 3
difficulty: intermediate
lesson: FW-L-301
specFile: practice-suite/exercises/FW-X-09-data-factory.spec.ts
runCommand: npm run exercise -- --grep FW-X-09
---

## Goal

Factory produces unique emails and applies overrides.

## Starter code

```ts
export type User = { email: string; name: string; role: 'member' | 'admin' };

let counter = 0;

export function createUser(overrides: Partial<User> = {}): User {
  counter += 1;
  return {
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    ...overrides,
  };
}

export function resetFactoryForTests(): void {
  counter = 0;
}
```

## Task

Generate unique email per call; still apply overrides last.

## Hints

<details>
<summary>Hint 1</summary>

Use counter + timestamp in email.

</details>

<details>
<summary>Hint 2</summary>

Domain example.test avoids real mail.

</details>

<details>
<summary>Hint 3</summary>

Overrides can replace email explicitly.

</details>

## Solution

```ts
export type User = { email: string; name: string; role: 'member' | 'admin' };

let counter = 0;

export function createUser(overrides: Partial<User> = {}): User {
  counter += 1;
  const id = `${Date.now()}-${counter}`;
  return {
    email: `user-${id}@example.test`,
    name: 'Test User',
    role: 'member',
    ...overrides,
  };
}

export function resetFactoryForTests(): void {
  counter = 0;
}
```

## Solution walkthrough

Parallel-safe factory from FW-L-301.

## Self-check

Run `npm run exercise -- --grep FW-X-09`.
