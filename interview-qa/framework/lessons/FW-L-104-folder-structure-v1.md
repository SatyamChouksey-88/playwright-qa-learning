---
id: FW-L-104
type: framework-lesson
stage: 1
title: Folder structure v1
objective: Lay out tests/, pages/, fixtures/, and config/ so new engineers know
  where files go.
topic: framework
subtopics:
  - folders
  - conventions
  - feature-grouping
diagram: DIAG-FW-ARCH
mcqs:
  - FW-Q-009
  - FW-Q-010
exercise: FW-X-02
related:
  - FW-L-105
  - FW-L-201
---

## Concept

Group tests by feature under `tests/<feature>/`. Page objects live in `pages/` or colocated `pages/` per feature. Shared fixtures in `fixtures/`. One config at root.

## Why it matters

Flat `tests/test47.spec.ts` does not scale past three engineers. Interviewers ask you to draw the tree — hesitation signals you have not run a growing suite.

## Architecture decision

Feature-first tests, shared pages when reused across features, fixtures for cross-cutting setup. Avoid `helpers/` junk drawer — name by domain (auth, api).

## TypeScript implementation

```ts
// tests/checkout/guest-checkout.spec.ts
import { test, expect } from '../../fixtures/base';
import { CheckoutPage } from '../../pages/checkout-page';

test('guest can complete checkout', async ({ checkoutPage }) => {
  await checkoutPage.open();
  await expect(checkoutPage.summary).toBeVisible();
});
```

## Trade-offs

Deep nesting (`tests/e2e/regression/payments/us/`) adds navigation cost. Two levels (domain + spec) is the sweet spot for most teams.

## What NOT to do

Do not mirror the entire app src tree in tests. Do not put assertions inside page objects at this stage. Do not create `utils/` without ownership.

## Interview angle

"Where does a new login test go?" — `tests/auth/login.spec.ts`, reusing `pages/login-page.ts` and auth fixtures — not a new top-level pattern.

## Related

- FW-L-105
- FW-L-201
