---
id: SK-SEC-L04
type: skill-lesson
track: SK-SEC
title: Broken access control / IDOR
topic: sec-session
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-SEC-Q004
  - SK-SEC-Q005
---

## Concept

Broken access control / IDOR: QA verifies defenses exist — output encoding, CSRF tokens, authorization checks — without exploit tutorials.

## Why it matters for QA

Regulated teams expect testers to recognize OWASP categories and write verification tests.

## Worked example

Assert Content-Security-Policy header present on login page; verify CSRF token field in transfer form.

## Common mistakes

Running exploit payloads in CI; storing prod creds in tests; skipping authz negative cases.

## Interview angle

How does QA verify XSS is mitigated without attacking production?

## Try it

Answer MCQs `SK-SEC-Q004`, `SK-SEC-Q005` in the Skills hub.

## Recap bullets

- Defensive verification only
- Check headers and tokens
- No secrets in repos
