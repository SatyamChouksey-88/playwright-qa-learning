---
id: SK-GIT-L06
type: skill-lesson
track: SK-GIT
title: Branch protection & CI gates
topic: git-ci
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-GIT-Q006
  - SK-GIT-Q007
---

## Concept

Branch protection & CI gates: Git is how QA engineers collaborate on test code, bisect flaky commits, and understand CI triggers.

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

When would you use branch protection & ci gates in a test repo?

## Try it

Answer MCQs `SK-GIT-Q006`, `SK-GIT-Q007` in the Skills hub.

## Recap bullets

- Small PRs with tests
- Never rebase shared main
- Bisect links commits to flakes
