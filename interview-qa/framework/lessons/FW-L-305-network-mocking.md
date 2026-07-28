---
id: FW-L-305
type: framework-lesson
stage: 3
title: Network mocking
objective: Use page.route and HAR responsibly for third-party and edge-case coverage.
topic: framework
subtopics:
  - route
  - mock
  - har
diagram: null
mcqs:
  - FW-Q-049
  - FW-Q-050
exercise: null
related:
  - FW-L-205
  - FW-L-303
---

## Concept

Mock unstable third parties (payments, maps) at the network layer. Prefer fulfilling JSON over recording HAR for dynamic APIs.

## Why it matters

Teams mock too much (false confidence) or too little (flaky externals) — interviewers test your boundary.

## Architecture decision

Option fixture `mockStripe` registers routes. Document what must never be mocked (your own API contract tests separate).

## TypeScript implementation

```ts
await page.route('**/api/weather', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ tempC: 21, condition: 'Clear' }),
  });
});
```

## Trade-offs

HAR replay brittle on query params — use handlers for logic, HAR for static assets only.

## What NOT to do

Do not mock your own core API in regression — that belongs in contract tests. Do not leave routes registered globally without unroute.

## Interview angle

"When mock network?" — Third-party/unstable; never for your primary user journey in smoke.

## Related

- FW-L-205
- FW-L-303
