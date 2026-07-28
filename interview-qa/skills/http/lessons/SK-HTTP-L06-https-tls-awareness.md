---
id: SK-HTTP-L06
type: skill-lesson
track: SK-HTTP
title: HTTPS/TLS awareness
topic: http-tls
estMinutes: 15
prereqIds: []
exerciseId: SK-HTTP-E01
mcqIds:
  - SK-HTTP-Q006
  - SK-HTTP-Q007
---

## Concept

HTTPS/TLS awareness: HTTP fundamentals explain why API and browser tests behave differently — headers, cookies, CORS, cache.

## Why it matters for QA

Underpins API track and security awareness; interviewers connect HTTP to flaky tests.

## Worked example

Inspect `Set-Cookie` for HttpOnly and SameSite flags when testing session persistence.

## Common mistakes

Ignoring CORS in component tests; not clearing cookies between roles; assuming 304 is error.

## Interview angle

Explain CORS preflight in one minute.

## Try it

Complete exercise `SK-HTTP-E01` — run `npm --prefix practice-suite run exercise:skills`.

## Recap bullets

- Content-Type matters
- SameSite cookies affect auth
- 304 is cache hit
