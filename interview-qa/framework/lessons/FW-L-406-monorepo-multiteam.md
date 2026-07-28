---
id: FW-L-406
type: framework-lesson
stage: 4
title: Monorepo and multi-team
objective: Structure packages/test-framework for many teams without pattern anarchy.
topic: framework
subtopics:
  - monorepo
  - packages
  - ownership
diagram: DIAG-FW-ARCH
mcqs:
  - FW-Q-063
  - FW-Q-064
exercise: null
related:
  - FW-L-206
  - FW-L-407
---

## Concept

Publish internal `@corp/playwright-fixtures` package; teams keep tests in their app repo or `teams/<name>/tests`. CODEOWNERS on shared package.

## Why it matters

D26 scenario — 15 teams, three patterns — convergence via shared package, not neutrality.

## Architecture decision

Semver + changelog on framework package. Teams pin version; platform team ships migration guides.

## TypeScript implementation

```ts
// consumer repo
import { test, expect } from '@corp/playwright-fixtures';
import { CheckoutPage } from './pages/checkout-page';

test('checkout', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.open();
});
```

## Trade-offs

Monorepo vs multi-repo package — package avoids forcing one git tree while sharing code.

## What NOT to do

Do not let each team fork fixtures differently. Do not break fixture API without major version bump.

## Interview angle

"100 teams on one framework?" — Versioned package, RFC for breaking changes, one sanctioned pattern.

## Related

- FW-L-206
- FW-L-407
