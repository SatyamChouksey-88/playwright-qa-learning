---
id: FW-L-107
type: framework-lesson
stage: 1
title: Web-first locators
objective: Standardize on getByRole, getByLabel, and getByTestId as the team
  locator policy.
topic: framework
subtopics:
  - locators
  - getByRole
  - resilience
diagram: null
mcqs:
  - FW-Q-014
  - FW-Q-015
exercise: FW-X-03
related:
  - FW-L-106
  - FW-L-201
---

## Concept

Playwright locators re-query on action. Prefer user-facing attributes (role, name, label) over CSS/XPath. Store locators as readonly fields on page objects, not strings scattered in tests.

## Why it matters

Locator policy is the framework's longest-lived decision — it affects every test and every code review.

## Architecture decision

Document priority: role → label → test id → CSS. Ban XPath in new tests via lint or CODEOWNERS policy.

## TypeScript implementation

```ts
export class LoginPage {
  constructor(private readonly page: Page) {}
  readonly email = this.page.getByRole('textbox', { name: 'Email' });
  readonly submit = this.page.getByRole('button', { name: 'Sign in' });

  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.submit.click();
  }
}
```

## Trade-offs

getByRole fails on poorly accessible UIs — push back on product for labels, do not permanently downgrade to CSS.

## What NOT to do

Do not use deprecated element handle APIs. Do not use `.nth(3)` without scoping to a container. Do not share locators across unrelated pages without context.

## Interview angle

"Locator strategy for 50 engineers?" — Written priority list, ESLint, examples in page objects, reject XPath in review.

## Related

- FW-L-106
- FW-L-201
