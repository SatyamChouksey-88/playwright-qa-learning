---
id: SK-GIT-L01
type: skill-lesson
track: SK-GIT
title: Repo/branch model
topic: git-workflow
estMinutes: 15
prereqIds: []
exerciseId: SK-GIT-E01
mcqIds:
  - SK-GIT-Q001
  - SK-GIT-Q002
---

## Concept

Repo/branch model: Git is how QA engineers collaborate on test code, bisect flaky commits, and understand CI triggers.

## Why it matters for QA

Universal interview topic for any team using GitHub/GitLab.

## Worked example

```bash
git bisect start
git bisect bad HEAD
git bisect good v1.2.0
# run test, then git bisect good|bad
```

## Common mistakes

Rebasing shared branches; force-push to main; huge PRs without description.

## Interview angle

When would you use repo/branch model in a test repo?

## Try it

Complete exercise `SK-GIT-E01` — run `npm --prefix practice-suite run exercise:skills`.

## Recap bullets

- Small PRs with tests
- Never rebase shared main
- Bisect links commits to flakes
