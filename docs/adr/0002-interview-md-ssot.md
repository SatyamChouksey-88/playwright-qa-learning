# ADR-0002: Interview markdown as SSOT

## Status
Accepted (Stage 2)

## Context
Interview content lived in three places (`interview-qa/*.md`, `learning-site/interview/*.md`, `learning-site/interview-data.js`), so drift became teaching bugs.

## Decision
- **SSOT:** `interview-qa/01-junior.md` … `04-architect.md` plus `interview-qa/_meta.yaml` (hub, recommendations, tier metadata, YAML frontmatter fields: tier, difficulty, topic, `pw_version_introduced`).
- **Generated (committed):** `learning-site/interview-data.js`, mirrored `learning-site/interview/*.md`, consolidated `scenario-based-question-bank.md`.
- **Author command:** `npm run build:content` (devDependency tooling only — does not affect `file://` readers).
- **Gate:** `npm run check:content` fails if generated ≠ committed.

## Consequences
- Edit markdown, regenerate, commit both source and outputs.
- Essentials / quiz / labs remain hand-authored JS for now; they are still indexed into MiniSearch.
- FSRS deck emission waits for the learning-engine stage.
