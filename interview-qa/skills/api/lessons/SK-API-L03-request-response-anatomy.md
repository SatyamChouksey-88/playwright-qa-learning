---
id: SK-API-L03
type: skill-lesson
track: SK-API
title: Request/response anatomy
topic: api-rest-basics
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-API-Q004
---

## Concept

An HTTP message has start line, headers, optional body. Content-Type drives parsing. Playwright `request` returns APIResponse with status(), headers(), json(), text().

## Why it matters for QA

Misreading Content-Type causes flaky JSON parse errors and wrong assertions.

## Worked example

```ts
const res = await request.get('/api/health');
expect(res.headers()['content-type']).toContain('application/json');
const body = await res.json();
expect(body.status).toBe('ok');
```

## Common mistakes

Calling json() on empty 204; ignoring charset in Content-Type; not logging response on failure.

## Interview angle

Walk through headers you inspect when an API test fails in CI.

## Try it

Answer MCQs `SK-API-Q004` in the Skills hub.

## Recap bullets

- Check Content-Type
- Use json() or text() appropriately
- Log response on failure
