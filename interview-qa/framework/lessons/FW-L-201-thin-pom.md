---
id: FW-L-201
type: framework-lesson
stage: 2
title: Thin Page Object Model
objective: Keep page objects as locators + actions; leave assertions in tests.
topic: framework
subtopics:
  - pom
  - separation
  - maintainability
diagram: DIAG-FW-DECIDE
mcqs:
  - FW-Q-016
  - FW-Q-017
  - FW-Q-018
exercise: FW-X-04
related:
  - FW-L-202
  - FW-L-104
---

## Concept

A page object exposes navigation helpers and locators; tests own `expect`. Thick POMs with `verifySuccessMessage()` hide intent and duplicate assertions across tests.

## Why it matters

Interviewers show a 400-line Page class — you must spot assertion leakage and suggest thin objects + readable specs.

## Architecture decision

One page class per route or major view. Methods return void or locators for test assertions — not boolean "isVisible" wrappers unless reused heavily.

## TypeScript implementation

```ts
export class OrdersPage {
  constructor(private readonly page: Page) {}
  readonly heading = this.page.getByRole('heading', { name: 'Orders' });
  readonly rows = this.page.getByRole('row');

  async open() {
    await this.page.goto('/orders');
    await expect(this.heading).toBeVisible();
  }
}

// test owns business assertion
test('lists open orders', async ({ ordersPage }) => {
  await ordersPage.open();
  await expect(ordersPage.rows).toHaveCount(3);
});
```

## Trade-offs

Some teams allow soft assertions in page objects for "wait until ready" — acceptable if named `waitForLoaded()`, not `assertLoaded()`.

## What NOT to do

Do not put `expect` for business outcomes inside every page method. Do not inherit from a mega BasePage with 80 methods. Do not use Screenplay unless the whole org commits.

## Interview angle

"POM vs no POM?" — Playwright fixtures + thin page objects: locators/actions centralized, assertions visible in spec.

## Related

- FW-L-202
- FW-L-104
