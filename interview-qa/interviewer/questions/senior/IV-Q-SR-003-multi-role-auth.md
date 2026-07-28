---
id: IV-Q-SR-003
type: iv-question
level: senior
round: design
kind: design
timebox: 10
difficulty: 4
topic: multi-role-auth
crosslinks: []
---

## Question

Design multi-role auth for admin vs member test projects.

## What this tests

RBAC test architecture.

## Model answer

Separate setup specs write `admin.json` / `member.json`. Projects:

```ts
{ name: 'admin-tests', use: { storageState: '.auth/admin.json' }, grep: /@admin/ },
{ name: 'member-tests', use: { storageState: '.auth/member.json' } },
```

Never test forbidden actions with admin cookie — negative RBAC needs member project.

## Strong answer signals

- Names Playwright mechanism for multi-role-auth
- Uses web-first locator vocabulary where relevant
- Mentions trade-off unprompted

## Weak answer / red flags

- Fixed sleeps or forced clicks as default
- Cannot explain why approach fails in parallel CI
- Buzzwords without TypeScript grounding

## Follow-up probes

- What breaks if you misuse multi-role-auth in a sharded CI run?
- Show a minimal TypeScript snippet.
- How would you review this in a PR?

## Hint ladder

<details>
<summary>Hint 1</summary>

Think about what Playwright auto-waits on for multi-role-auth.

</details>

<details>
<summary>Hint 2</summary>

Consider test isolation and parallel workers.

</details>

<details>
<summary>Hint 3</summary>

Name one anti-pattern you would reject in code review.

</details>

## Scoring guide

| Score | Anchor |
|-------|--------|
| 1 | No meaningful answer on multi-role-auth; guesses or silent. |
| 2 | Partial multi-role-auth answer with major gaps; needs heavy hints (senior). |
| 3 | Solid multi-role-auth explanation with one missing trade-off or weak example. |
| 4 | Complete multi-role-auth answer: mechanism, TypeScript example, trade-offs, real context. |
