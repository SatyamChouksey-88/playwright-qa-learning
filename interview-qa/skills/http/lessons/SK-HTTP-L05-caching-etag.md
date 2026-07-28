---
id: SK-HTTP-L05
type: skill-lesson
track: SK-HTTP
title: Caching & ETag
topic: http-caching
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-HTTP-Q005
  - SK-HTTP-Q006
---

## Concept

Caching & ETag: HTTP fundamentals explain why API and browser tests behave differently — headers, cookies, CORS, cache.

## Why it matters for QA

Underpins API track and security awareness; interviewers connect HTTP to flaky tests.

## Worked example

Inspect `Set-Cookie` for HttpOnly and SameSite flags when testing session persistence.

## Common mistakes

Ignoring CORS in component tests; not clearing cookies between roles; assuming 304 is error.

## Interview angle

Explain CORS preflight in one minute.

## Try it

Answer MCQs `SK-HTTP-Q005`, `SK-HTTP-Q006` in the Skills hub.

## Recap bullets

- Content-Type matters
- SameSite cookies affect auth
- 304 is cache hit
