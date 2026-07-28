---
id: FW-L-302
type: framework-lesson
stage: 3
title: API client layer
objective: Wrap fetch/request in a typed ApiClient used by fixtures for seed and assert.
topic: framework
subtopics:
  - api
  - request
  - fixtures
diagram: DIAG-FW-ARCH
mcqs:
  - FW-Q-043
  - FW-Q-044
exercise: null
related:
  - FW-L-303
  - FW-L-304
---

## Concept

Centralize base URL, auth headers, and error handling in `ApiClient`. Expose domain methods: `createOrder()`, not raw fetch in every test.

## Why it matters

Duplicated fetch in specs hides auth bugs and makes API setup inconsistent.

## Architecture decision

Client in `api/` or `clients/`. Worker-scoped fixture when connection reuse helps. Use Playwright `request` fixture for in-test API when simpler.

## TypeScript implementation

```ts
export class ApiClient {
  constructor(private readonly baseURL: string, private readonly token: string) {}
  async createUser(body: User) {
    const res = await fetch(`${this.baseURL}/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`createUser failed: ${res.status}`);
    return res.json() as Promise<User>;
  }
}
```

## Trade-offs

Thin wrapper vs full SDK — start with methods you seed twice; generate from OpenAPI only when API is huge.

## What NOT to do

Do not bypass client with copy-pasted curl in tests. Do not store prod API keys in repo.

## Interview angle

"API setup in UI tests?" — ApiClient in worker fixture + seed via API + UI asserts user-visible outcome.

## Related

- FW-L-303
- FW-L-304
