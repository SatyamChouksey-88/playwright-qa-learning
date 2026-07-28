# Interviewer Mode content templates

Validated structure for `interview-qa/interviewer/` content. Regenerate via `node tools/content/generate-interviewer-mode.mjs`.

## TEMPLATE 1 — Interview question (`questions/<level>/IV-Q-*.md`)

Frontmatter keys: `id`, `type: iv-question`, `level` (fresher|junior|mid|senior|architect), `round` (screening|theory|coding|design|behavioral-technical), `kind` (theory|scenario|coding|design), `timebox`, `difficulty` (1–5), `topic`, `crosslinks` (optional tier ids like a1, b12).

Required `##` sections **in order**: `Question`, `What this tests`, `Model answer`, `Strong answer signals`, `Weak answer / red flags`, `Follow-up probes`, `Hint ladder`, `Scoring guide`.

Scoring guide is a markdown table with columns **Score | Anchor** and rows **1, 2, 3, 4** only (no score 5).

Code in model answers must be strict TypeScript — no `waitForTimeout`, `force: true`, `networkidle`, hand-rolled retries, or legacy `page.$`.

## TEMPLATE 2 — Live coding task (`coding/IV-CODE-*.md`)

Frontmatter: `id`, `type: iv-coding`, `level`, `round: coding`, `timebox`, `difficulty`, `topic`, `specFile`.

Sections **in order**: `Interviewer script`, `Task statement`, `Starter code`, `What to evaluate`, `Exemplar solution`, `Common candidate mistakes`, `Hint ladder`, `Rubric`.

Companion runnable files under `practice-suite/exercises/interviewer/`: `IV-CODE-NNN.ts` (starter), `IV-CODE-NNN.solution.ts`, `IV-CODE-NNN.spec.ts`. Run via `npm run exercise:interviewer`.

## TEMPLATE 3 — Interview kit (`kits/IV-KIT-*.md`)

Frontmatter: `id`, `type: iv-kit`, `level`, `round`, `duration` (45 or 60).

Sections: `Agenda` (table, minutes sum to duration), `Ordered questions`, `Backup questions`, `Scoring sheet`, `Hire bar`, `Do's & don'ts`.

## TEMPLATE 4 — Interviewer craft lesson (`craft/IV-CRAFT-*.md`)

Frontmatter: `id`, `type: iv-craft`, `title`, `objective`.

Sections **in order**: `Concept`, `Why it matters`, `Practice`, `Common mistakes`, `Related`.

Reference hiring science (Schmidt & Hunter 1998, Huffcutt & Arthur 1994, Sackett et al. 2022, Google re:Work) — no banned content tokens in generated material.
