---
id: FW-L-205
type: framework-lesson
stage: 2
title: Auto and option fixtures
objective: Use auto fixtures for mandatory setup and option fixtures for opt-in behavior.
topic: framework
subtopics:
  - auto
  - option
  - fixtures
diagram: null
mcqs:
  - FW-Q-027
  - FW-Q-028
exercise: null
related:
  - FW-L-203
  - FW-L-305
---

## Concept

`{ auto: true }` fixtures run even when not listed in the test args — useful for trace labels or coverage hooks. Option fixtures (default undefined) let tests opt into slow paths.

## Why it matters

Teams misuse auto fixtures and wonder why tests are slow — you must explain the cost and when to opt in.

## Architecture decision

Reserve auto for cheap, universal setup. Expensive mocks use option fixtures: `test('...', async ({ page, mockPayments }) => ...)`.

## TypeScript implementation

```ts
type Options = { mockPayments?: boolean };

export const test = base.extend<Options>({
  mockPayments: [async ({ page }, use, testInfo) => {
    if (!testInfo.project.use.mockPayments) {
      await use(undefined);
      return;
    }
    await page.route('**/api/pay', (route) => route.fulfill({ json: { ok: true } }));
    await use(true);
  }, { option: true }],
});
```

## Trade-offs

Auto fixtures hide dependencies — prefer explicit args for anything that changes test meaning.

## What NOT to do

Do not make database seeding auto for every test. Do not use auto fixtures for login — use project storageState instead.

## Interview angle

"Difference auto vs option fixture?" — Auto runs always; option activates when test or config requests it.

## Related

- FW-L-203
- FW-L-305
