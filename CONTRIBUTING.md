# Contributing

Thanks for looking at this repo. It's a personal learning/portfolio project, but PRs that fix bugs, harden tests, or add well-scoped content are welcome.

## Before you start

- Read `docs/adr/` for the decisions already made (search engine choice, markdown SSOT, bank-demo-as-PR-gate, PWA scope, FSRS, suite hardening, content expansion). A PR that reverses one of these should explain why in the description.
- The learning site (`learning-site/`) must keep working when opened directly via `file://` with **zero installs**. Don't add a runtime dependency, a required build step, or a `fetch()`/`import` that fails offline.
- The practice suite (`practice-suite/`) is TypeScript-strict. No `any`, no non-null assertions, no `waitForTimeout`, no `networkidle`, no hand-rolled retry loops, no `force: true`.

## Repo layout

| Folder | What it is |
|--------|------------|
| `learning-site/` | Offline SPA — study content, Bank Demo, FSRS, MiniSearch |
| `practice-suite/` | Playwright TS suite — `@bank-demo` (PR gate) + `@external` (nightly) |
| `interview-qa/` | Markdown SSOT for all interview/study content |
| `tools/content/` | Author-time generator (`interview-qa/*.md` → `learning-site/*.js`) |
| `docs/adr/` | Architecture decision records |

## Adding or editing study content

All interview/study content is authored in `interview-qa/*.md` (or hand-authored directly in `learning-site/gap-pages-data.js` / `gap-practice-data.js` for non-tiered teaching pages — see ADR-0007). **Never hand-edit** `learning-site/interview-data.js`, `learning-site/search-index.js`, or `learning-site/reading-times.js` — they're generated.

```bash
npm install
npm run build:content    # regenerates the generated artifacts above
npm run check:content    # fails if generated output is stale (what CI runs)
npm run check:metrics    # fails if README's metrics table drifted from actual counts
```

If you add a new scenario tier or teaching page, update `README.md`'s "Metrics (portfolio snapshot)" table so `check:metrics` stays green.

## Working on the practice suite

```bash
cd practice-suite
npm install
npx playwright install chromium
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run test:bank-demo
```

- New PR-gated specs go under `tests/bank-demo/` and should use the `bank-demo` or `bank-demo-authed` project — prefer `loginAs`/`fixtures/personas.ts` over inline credentials.
- `tests/<category>/@external` specs hit real third-party demo sites and only run nightly; see `SKIPPED.md` for hosts that were dropped and why. Don't add new `@external` specs without a good reason — prefer expanding Bank Demo instead.
- Don't rename the `@bank-demo` / `@external` tags; CI and docs key off them.

## Working on the learning site

- Keep new sections dependency-free at runtime; if a data file is large, lazy-load it the way `search-index.js` and the mini-app/gap-practice data files already are (see `app.js`'s `ensureSearchIndex` / `ensureSectionData`).
- Respect the 5.1:1 contrast floor and both themes (dark/light) — check new colors against both before opening a PR.
- Respect `prefers-reduced-motion` for any new animation.

## Before opening a PR

Run the full gate locally:

```bash
npm run build:content && npm run check:content && npm run check:metrics && npm run lint
cd practice-suite && npm run typecheck && npm run test:bank-demo
```

Keep commits small and scoped, with conventional-commit-style messages (`fix:`, `feat:`, `docs:`, `chore:`, `test:`).
