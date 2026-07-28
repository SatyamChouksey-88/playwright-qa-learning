# ADR-0012: Master overhaul completion — vanilla site + static Pages deploy

## Status
Accepted (supersedes Astro scope in master prompt Part B; reaffirms ADR-0009)

## Context
The master Cursor prompt specified a full Astro 5 rebuild (Phases B1–B7), Lighthouse ≥95 on the deployed URL, and Pagefind search. In the same session, the repo already shipped:

- TypeScript-strict practice suite with `@bank-demo` / `@external` / `@a11y` / `@visual` tags
- Content SSOT pipeline (`interview-qa/` → `build-content.mjs` → `learning-site/*.js`)
- Framework Academy, Interviewer Mode, Skill Modules, Readiness, Mock Exam, Study Planner, PK tools, Gamification
- Existing PWA (`sw.js`, manifest), FSRS-6 review, MiniSearch command palette, OKLCH tokens, measured contrast ≥5.1:1
- Bank Demo DOM inventory (ADR-0008) as regression contract

Attempting a ground-up Astro migration in one pass would re-touch every page, risk Bank Demo selector drift, and block shipping the completed Enhancement Pack.

## Decision
1. **Ship the master overhaul on the vanilla-upgrade path** documented in ADR-0009, not an Astro rewrite.
2. **GitHub Pages** deploys the built `learning-site/` directory after `npm run build:content` + `check:content` (see `.github/workflows/pages.yml`).
3. **Offline/PWA** remains the existing service worker + precache model (ADR-0004), not `@vite-pwa/astro`.
4. **Search** remains MiniSearch + command palette (`ui-2026.js`); Pagefind deferred with ADR-0009 rationale.
5. **Lighthouse/CWV numeric gates** (≥95 Performance/Accessibility, LCP/CLS/INP targets) are owner-verifiable post-deploy via `npx lighthouse https://satyamchouksey-88.github.io/playwright-qa-learning/ --view`; not claimed without live measurement in CI.

## Consequences
- All master prompt Part 1 (framework/CI) and Part 2 (content) phases ship on this branch.
- Part 3 UI goals (tokens, IA, dashboard, components) are met by the existing `learning-site/` rebuild; Astro-specific items are explicitly deferred.
- Future Astro migration remains possible; Bank Demo must stay a static partial with zero DOM drift per ADR-0008.

## Verification evidence (local, this branch)
- `npm run check:content` — pass
- `npm run check:metrics` — pass
- `npm run test:bank-demo` — 14/14 pass
- `grep -rn "toBeTruthy()" practice-suite/tests/` — empty
- `grep -rn "force: true" practice-suite/tests/` — empty
