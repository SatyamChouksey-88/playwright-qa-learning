---
id: IV-KIT-MID-THEORY-45
type: iv-kit
level: mid
round: theory
duration: 45
---

## Agenda

| Segment | Minutes |
|---------|---------|
| Intro | 3 |
| Fixtures and scope | 10 |
| storageState auth pattern | 10 |
| Network mocking boundaries | 8 |
| Flake triage scenario | 9 |
| Candidate Q&A | 3 |
| Scoring | 2 |
| **Total** | **45** |

## Ordered questions

- `IV-Q-MID-001` (10 min)
- `IV-Q-MID-003` (10 min)
- `IV-Q-MID-005` (8 min)
- `IV-Q-MID-007` (9 min)

## Backup questions

- `IV-Q-MID-002`
- `IV-Q-MID-012`

## Scoring sheet

Use `IV-RUBRIC` dimensions (1–4 each). Record evidence bullets per question id.

| Dimension | Score (1–4) | Evidence |
|-----------|-------------|----------|
| Technical depth | | |
| Problem-solving process | | |
| Communication | | |
| Code quality | | |
| Judgment / trade-offs | | |

## Hire bar

Pass if candidate explains fixture scopes, auth setup project, and flake triage (reproduce→trace→fix root) at score 3+ without defaulting to retries-only.

## Do's & don'ts

**Do's**

- Probe trade-offs on mock vs live API
- Ask for TypeScript sketch of fixture

**Don'ts**

- Accept networkidle as wait strategy
- Skip isolation discussion
