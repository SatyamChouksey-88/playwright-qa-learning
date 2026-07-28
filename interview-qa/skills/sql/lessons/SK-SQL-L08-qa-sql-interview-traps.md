---
id: SK-SQL-L08
type: skill-lesson
track: SK-SQL
title: QA SQL interview traps
topic: sql-subqueries
estMinutes: 15
prereqIds: []
exerciseId: null
mcqIds: []
---

## Concept

QA SQL interview traps: SQL lets testers verify backend truth — row counts, orphans, duplicates — faster than clicking through UI.

## Why it matters for QA

SQL appears in most SDET interviews for data verification and debugging failed tests.

## Worked example

```sql
SELECT u.email, COUNT(s.id) AS sessions
FROM users u
LEFT JOIN sessions s ON s.user_id = u.id
GROUP BY u.email;
```

## Common mistakes

NULL in outer joins; forgetting GROUP BY columns; using SELECT * in production checks.

## Interview angle

Write a query to find duplicate emails in a users table.

## Try it

Review recap bullets and explain each out loud.

## Recap bullets

- LEFT JOIN for optional relations
- HAVING filters groups
- COUNT for integrity checks
