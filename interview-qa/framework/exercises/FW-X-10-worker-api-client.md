---
id: FW-X-10
type: framework-exercise
topic: framework
stage: 3
difficulty: advanced
lesson: FW-L-304
specFile: practice-suite/exercises/FW-X-10-worker-api-client.spec.ts
runCommand: npm run exercise -- --grep FW-X-10
---

## Goal

ApiClient tracks worker scope metadata and disposes cleanly.

## Starter code

```ts
export type ClientMeta = { scope: 'test' | 'worker'; disposed: boolean };

export class ApiClient {
  meta: ClientMeta;

  constructor(scope: 'test' | 'worker' = 'test') {
    this.meta = { scope, disposed: false };
  }

  async dispose(): Promise<void> {
    // TODO: mark disposed
  }
}
```

## Task

Default scope worker; dispose() sets disposed true.

## Hints

<details>
<summary>Hint 1</summary>

FW-L-304 hybrid uses worker-scoped API client.

</details>

<details>
<summary>Hint 2</summary>

dispose is idempotent.

</details>

<details>
<summary>Hint 3</summary>

Default constructor arg worker.

</details>

## Solution

```ts
export type ClientMeta = { scope: 'test' | 'worker'; disposed: boolean };

export class ApiClient {
  meta: ClientMeta;

  constructor(scope: 'test' | 'worker' = 'worker') {
    this.meta = { scope, disposed: false };
  }

  async dispose(): Promise<void> {
    this.meta.disposed = true;
  }
}
```

## Solution walkthrough

Encodes worker-scoped client lifecycle from hybrid API+UI lesson.

## Self-check

Run `npm run exercise -- --grep FW-X-10`.
