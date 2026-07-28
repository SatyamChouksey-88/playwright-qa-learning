# Content templates (validated by `tools/content/build-content.mjs`)

This file documents the two mandatory templates new content must follow. The generator parses and validates structure; `npm run check:content` fails the build if a required section is missing.

## TEMPLATE 1 — Stuck entry (`interview-qa/stuck/*.md`)

One or more entries per file, each starting with a `## ` heading (the problem title, phrased how an engineer would actually search it). Required metadata lines immediately follow the heading (`id:`, `category:`, `severity:`). Required sections, in order, each as a `### ` heading: `Symptom`, `Why it happens`, `How to debug it`, `Fix`, `Best practice`, `Common wrong fixes`, `Interview angle`. `Related` is optional.

```markdown
## <Problem title, phrased how an engineer would search it>
id: stuck-<category>-<slug>
category: <login-auth|locators|frames-windows|waits-timing|network-api|files-data|parallel-ci|flaky-debug>
severity: common | tricky | rare

### Symptom
What you see — the exact error message / behavior.

### Why it happens
Root cause in 3–6 sentences, naming the underlying Playwright mechanism.

### How to debug it
Ordered steps: what to check first, which artifact to open, what to look for.

### Fix
Working TypeScript (Playwright Test), strict-mode clean, no anti-patterns.

### Best practice
How to prevent this class of problem permanently.

### Common wrong fixes
2–3 fixes that "work" but are wrong, and why.

### Interview angle
One interview question this maps to, with a 2-line senior answer.

### Related
Optional links to related stuck entries / site sections by id.
```

`category` must be one of the eight categories used by the Stuck hub (`login-auth`, `locators`, `frames-windows`, `waits-timing`, `network-api`, `files-data`, `parallel-ci`, `flaky-debug`); `severity` must be one of `common`, `tricky`, `rare`.

## TEMPLATE 2 — Scenario v2 (extends the existing tier scenario format)

Existing tier files (`01-junior.md` … `04-architect.md`) keep their `### <ID>. <question>` / **Ideal approach** / **Why they get stuck** shape as the required core (parsed as `ideal` / `stuck`). Scenario v2 adds five *optional* sections, in this order when present, each as a labeled paragraph directly inside the question block:

```markdown
### A1. <Scenario question>

**Think first:** 2–3 bullets nudging what to consider before reading on (rendered as a collapsed disclosure).

**Ideal approach:** <existing answer content — unchanged>

**Why they get stuck:** <existing content — unchanged>

**Why the interviewer asks this:** 1–3 sentences on the signal this question extracts.

**Common wrong answer:** The typical answer that fails, and why.

**Real project example:** A concrete 4–8 line mini-story with the TypeScript fix/decision that resolved it.

**Follow-up questions:** 2–3 follow-ups, each with a one-line direction of the right answer.
```

`Think first` / `Why the interviewer asks this` / `Common wrong answer` / `Real project example` / `Follow-up questions` are **required for Tier A and Tier B**, **optional for Tier C and Tier D** (the generator does not fail the build if they're absent on C/D, but does fail if they're absent on A/B). `Ideal approach` and `Why they get stuck` remain required on every tier, unchanged, so existing scenario counts and ids never move.

## Case study format (`interview-qa/case-studies.md`)

Each story starts with a `## ` title and an `id: case-<slug>` line, followed by seven required `### ` sections in order — `Situation`, `Impact`, `Investigation`, `Root cause`, `Fix`, `What we changed permanently`, `Interview question this becomes` — plus a `### Related` section linking at least 2 Stuck-hub entry ids (comma- or newline-separated). The generator fails the build if a required section is missing or fewer than 2 related ids are listed.

## TEMPLATE 3 — Framework Lesson (`interview-qa/framework/lessons/FW-L-*.md`)

YAML frontmatter keys: `id`, `type: framework-lesson`, `stage` (1–4), `title`, `objective`, `topic: framework`, `subtopics`, `diagram` (id or null), `mcqs`, `exercise` (id or null), `related`.

Required `##` sections **in order**: `Concept`, `Why it matters`, `Architecture decision`, `TypeScript implementation`, `Trade-offs`, `What NOT to do`, `Interview angle`, `Related`.

Code blocks in `TypeScript implementation` must be strict-mode clean — no `waitForTimeout`, `force: true`, or `networkidle`.

```markdown
---
id: FW-L-101
type: framework-lesson
stage: 1
title: Project initialization
objective: One sentence learner outcome.
topic: framework
subtopics: []
diagram: DIAG-FW-TREE
mcqs: [FW-Q-001]
exercise: FW-X-01
related: [FW-L-102]
---

## Concept
...

## Why it matters
...

## Architecture decision
...

## TypeScript implementation
```ts
// strict, web-first locators
```

## Trade-offs
...

## What NOT to do
...

## Interview angle
...

## Related
- FW-L-102
```

Validated by `parseFrameworkLesson` in `tools/content/md-utils.mjs`.

## TEMPLATE 4 — Framework MCQ (`interview-qa/framework/mcqs/FW-Q-*.md`)

Frontmatter: `id`, `type: framework-mcq`, `topic: framework`, `subtopic`, `difficulty` (`beginner|intermediate|advanced`), `stage`, `answerIndex` (0–3), `lesson`.

Body headings: `## Question`, `## Options` (exactly 4 lines `1. ` … `4. `), `## Correct answer`, `## Why correct`, `## Why the others are wrong` (exactly 3 bullets starting `- Option`).

## TEMPLATE 5 — Framework Exercise (`interview-qa/framework/exercises/FW-X-*.md`)

Frontmatter: `id`, `type: framework-exercise`, `topic: framework`, `stage`, `difficulty`, `lesson`, `specFile`, `runCommand`.

Headings: `Goal`, `Starter code`, `Task`, `Hints` (three `<details><summary>Hint N</summary>`), `Solution`, `Solution walkthrough`, `Self-check`.

Companion TypeScript under `practice-suite/exercises/`: learner `.ts`, `.solution.ts`, validating `.spec.ts`. Run via `npm run exercise` from `practice-suite/`.

## Framework scenarios (`interview-qa/framework/scenarios/framework-scenarios.md`)

Frontmatter `topic: framework`. Each `### FW-S-NN.` uses Scenario v2 bold sections: `Think first`, `Ideal approach`, `Why they get stuck`, `Why the interviewer asks this`, `Common wrong answer`, `Real project example`, `Follow-up questions`.
