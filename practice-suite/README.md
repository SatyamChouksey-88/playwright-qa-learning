# Playwright practice suite

Two tiers:

| Tier | Tag / project | When |
|------|---------------|------|
| **Bank Demo** (deterministic) | `--project=bank-demo` / `@bank-demo` | Every PR |
| **Bank Demo, pre-authenticated** | `--project=bank-demo-authed` | Every PR (depends on `setup`) |
| **External sandboxes** | `--project=chromium-external` / `@external` | Nightly only |
| **Cross-browser** | `firefox-bank-demo` / `webkit-bank-demo` | Weekly |

## Quick start

```bash
npm install
npx playwright install chromium
npm run typecheck       # tsc --noEmit
npm run lint            # eslint .
npm run test:bank-demo  # runs setup + bank-demo + bank-demo-authed
```

Bank Demo is served from `../learning-site` via `webServer` on port 4173. Copy `.env.example` to `.env` to override `BASE_URL` locally.

## Layout

- `fixtures/test.ts` — fixtures-first (`loginAs`, thin pages)
- `fixtures/personas.ts` — centralized test credentials/personas (never hardcode passwords in specs)
- `pages/` — LoginPage, DashboardPage
- `setup/auth.setup.ts` — logs in once, writes `storageState` to `playwright/.auth/` (gitignored) for the `bank-demo-authed` project
- `types/global.d.ts` — typed `Window` globals shared by tests and the bank-demo app
- `tests/bank-demo/` — PR-gated specs: `auth.spec.ts`, `a11y.spec.ts` (axe-core), `visual.spec.ts` (screenshot regression), `site-smoke.spec.ts`, `authed-dashboard.spec.ts`
- `tests/<category>/` — `@external` hostile-host specs (kept; see `SKIPPED.md` for dropped hosts)

## Auth & storageState

Most new bank-demo specs should use the `bank-demo-authed` project (depends on the `setup` project) instead of driving a UI login every test. Reach for a fresh UI login (via `loginAs`) only when the test's actual subject is authentication itself (login, 2FA, lockout, passkey).

## Visual & accessibility

- `tests/bank-demo/visual.spec.ts` uses `toHaveScreenshot` with `maxDiffPixelRatio` and masking for anything dynamic; baselines are platform-agnostic filenames (no OS suffix) — regenerate with `--update-snapshots` inside the same environment CI uses.
- `tests/bank-demo/a11y.spec.ts` runs `@axe-core/playwright` against the login and dashboard screens.

## Flake visibility

`npm run test:bank-demo` writes a JSON report (`test-results/report.json`); `node ../tools/flake-report.mjs` (wired into CI) summarizes which tests needed a retry, so flakiness is visible instead of silently hidden by `retries`.

See `SKIPPED.md` for dead third-party hosts.
