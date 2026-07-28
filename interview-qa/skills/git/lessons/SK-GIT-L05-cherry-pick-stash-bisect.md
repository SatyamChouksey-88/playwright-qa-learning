---
id: SK-GIT-L05
type: skill-lesson
track: SK-GIT
title: Cherry-pick, stash, bisect
topic: git-bisect
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds:
  - SK-GIT-Q005
  - SK-GIT-Q006
---

## Concept

Cherry-pick, stash, bisect: Git is how QA engineers collaborate on test code, bisect flaky commits, and understand CI triggers.

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

When would you use cherry-pick, stash, bisect in a test repo?

## Try it

Answer MCQs `SK-GIT-Q005`, `SK-GIT-Q006` in the Skills hub.

## Recap bullets

- Small PRs with tests
- Never rebase shared main
- Bisect links commits to flakes
