---
id: FW-L-303
type: framework-lesson
stage: 3
title: API seed vs UI setup
objective: Choose API seeding for speed and UI setup when the journey under test
  requires it.
topic: framework
subtopics:
  - seed
  - api
  - ui
diagram: DIAG-FW-DATA
mcqs:
  - FW-Q-045
  - FW-Q-046
exercise: null
related:
  - FW-L-301
  - FW-L-304
---

## Concept

If the test asserts checkout, seed cart via API and start on checkout page. If the test is "user adds item to cart", drive UI from empty state.

## Why it matters

Everything-through-UI suites are slow and flaky — interviewers ask where you draw the line.

## Architecture decision

Document decision tree in framework README. Tag slow full-journey tests `@regression`.

## TypeScript implementation

```ts
test('checkout shows order total', async ({ page, api, user }) => {
  const order = await api.createOrder({ userId: user.id, items: [{ sku: 'ABC', qty: 1 }] });
  await page.goto(`/checkout/${order.id}`);
  await expect(page.getByTestId('order-total')).toHaveText('$19.99');
});
```

## Trade-offs

Over-API-ing skips bugs in UI creation flows — maintain a balanced pyramid within E2E.

## What NOT to do

Do not API-seed when testing the wizard you skip. Do not UI-login when testing unrelated admin settings.

## Interview angle

"When UI vs API setup?" — Test the path you need to prove; shortcut everything else via API.

## Related

- FW-L-301
- FW-L-304
