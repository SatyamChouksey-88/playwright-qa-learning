---
id: SK-SQL-L01
type: skill-lesson
track: SK-SQL
title: Relational model for testers
topic: sql-select
estMinutes: 15
prereqIds: []
exerciseId: SK-SQL-E01
mcqIds:
  - SK-SQL-Q001
  - SK-SQL-Q002
---

## Concept

Relational model for testers: SQL lets testers verify backend truth — row counts, orphans, duplicates — faster than clicking through UI.

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

Complete exercise `SK-SQL-E01` — run `npm --prefix practice-suite run exercise:skills`.

## Recap bullets

- LEFT JOIN for optional relations
- HAVING filters groups
- COUNT for integrity checks
