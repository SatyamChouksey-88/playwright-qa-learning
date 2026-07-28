# ADR-0011: Framework Academy curriculum

## Status
Accepted

## Context
Interviewers at every level ask candidates to “walk me through your framework.” The repo already taught Playwright APIs and scenarios, but lacked a dedicated zero-to-enterprise *framework engineering* track (fixtures-first architecture, scope discipline, auth setup projects, data factories, sharding/flake policy).

## Decision
Add a **Framework Academy** as Markdown SSOT under `interview-qa/framework/` with:
- 30 lessons (`FW-L-*`, stages 1–4)
- 66 MCQs (`FW-Q-*`)
- 10 coding exercises (`FW-X-*`) with an isolated `practice-suite/exercises/` Playwright config (never `@bank-demo` / `@external`)
- 20 Scenario v2 interview prompts (`FW-S-*`)
- 8 hand-rolled theme-aware SVG diagrams (`learning-site/framework-diagrams.js`)

Generator support lives in `tools/content/md-utils.mjs` + `build-content.mjs`, emitting `learning-site/framework-data.js` and MiniSearch docs under kind `framework*`. Site UI: `#framework` / `#framework-lesson` + `framework-academy.js`.

## Consequences
- Existing A/B/C/D scenario counts (135) unchanged; new ids only in `FW-*` namespace.
- `npm run exercise` is a learner workflow that intentionally fails on starters (red→green); CI PR gate remains `test:bank-demo` only.
- README + `check:metrics` track Framework counts so drift fails CI.
