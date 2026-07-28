---
id: FW-L-208
type: framework-lesson
stage: 2
title: Multi-role auth
objective: Support admin, member, and guest roles with separate storageState
  files and projects.
topic: framework
subtopics:
  - roles
  - storageState
  - matrix
diagram: DIAG-FW-AUTH
mcqs:
  - FW-Q-034
  - FW-Q-035
exercise: FW-X-07
related:
  - FW-L-207
  - FW-L-210
---

## Concept

Run one setup test per role (or one setup file with multiple tests), each writing `playwright/.auth/<role>.json`. Map roles to projects via `use.storageState`.

## Why it matters

RBAC suites fail when every test uses the same admin cookie — interviewers ask how you test forbidden actions.

## Architecture decision

Fixtures expose asRole("member") only when dynamic; static matrix prefers separate projects for clarity in CI reports.

## TypeScript implementation

```ts
projects: [
  { name: 'setup', testMatch: /auth.setup.ts/ },
  {
    name: 'admin',
    dependencies: ['setup'],
    use: { storageState: 'playwright/.auth/admin.json' },
  },
  {
    name: 'member',
    dependencies: ['setup'],
    use: { storageState: 'playwright/.auth/member.json' },
  },
],
```

## Trade-offs

Many roles × browsers explode project count — use grep/tags for rare roles, full matrix nightly.

## What NOT to do

Do not hardcode one user for all RBAC tests. Do not switch roles mid-test via logout/login unless testing logout.

## Interview angle

"Test member cannot access admin route?" — Member project storageState + test expects redirect/forbidden.

## Related

- FW-L-207
- FW-L-210
