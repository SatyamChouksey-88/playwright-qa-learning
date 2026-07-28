---
id: FW-L-105
type: framework-lesson
stage: 1
title: Naming conventions
objective: Apply consistent file, test, and locator naming so reviews and grep stay fast.
topic: framework
subtopics:
  - naming
  - test-titles
  - file-names
diagram: null
mcqs:
  - FW-Q-011
exercise: null
related:
  - FW-L-104
  - FW-L-107
---

## Concept

Files: `kebab-case.spec.ts`. Tests: behavior-focused sentences. Page objects: `<Feature>Page` or component name. Tags: `@smoke`, `@regression` in title or grep config.

## Why it matters

Naming is cheap enforcement. "test1" and `PageObjectLogin` mixed with `login_page` tell interviewers your team has no standards.

## Architecture decision

Document in CONTRIBUTING.md: file pattern, tag policy, and that test names must read as specifications for failure messages.

## TypeScript implementation

```ts
test.describe('Account settings', () => {
  test('@smoke user can update display name', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('textbox', { name: 'Display name' }).fill('Ada Lovelace');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Profile updated')).toBeVisible();
  });
});
```

## Trade-offs

Over-long test names clutter reports — put data variations in `test.describe` or parameterized tests, not 200-char titles.

## What NOT to do

Do not encode environment in file names (`login-staging.spec.ts`). Use projects. Do not abbreviate domain terms (`chkout.spec.ts`).

## Interview angle

"How do you name tests for CI grep?" — Tags for tier (`@smoke`), describe blocks for feature, test title states role + outcome.

## Related

- FW-L-104
- FW-L-107
