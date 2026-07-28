# Stuck Entry — Authoring Template

Use this template for every entry under `interview-qa/stuck/`. Frontmatter is required.

```yaml
---
id: stuck-<category>-<slug>
type: stuck-entry
category: <files-data|flaky-debug|frames-windows|locators|login-auth|network-api|parallel-ci|waits-timing>
title: <Short symptom headline>
symptom: <One-line user-visible symptom>
tags: [<playwright-topic>, <failure-mode>]
---
```

## Symptom

What the tester sees in CI, locally, or in the trace viewer. Be concrete (error text, screenshot description, timing).

## Why it happens

Root cause in Playwright/browser/DOM terms — not generic advice.

## How to debug

Ordered steps: trace → network → console → locator log → isolation check.

## Fix

Minimal correct fix with a TypeScript snippet (strict, no `waitForTimeout`, `force: true`, `networkidle`, or retry loops).

## Best practice

What to adopt going forward so this class of failure does not recur.

## Common wrong fixes

2–3 anti-patterns candidates reach for (fixed sleeps, force clicks, disabling parallel).

## Interview angle

How a senior/staff SDET explains this in a loop or postmortem.
