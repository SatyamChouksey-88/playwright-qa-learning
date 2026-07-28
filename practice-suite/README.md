# Playwright practice suite

Two tiers:

| Tier | Tag / project | When |
|------|---------------|------|
| **Bank Demo** (deterministic) | `--project=bank-demo` / `@bank-demo` | Every PR |
| **External sandboxes** | `--project=chromium-external` / `@external` | Nightly only |

## Quick start

```bash
npm install
npx playwright install chromium
npm run test:bank-demo
```

Bank Demo is served from `../learning-site` via `webServer` on port 4173.

## Layout

- `fixtures/test.ts` — fixtures-first (`loginAs`, thin pages)
- `pages/` — LoginPage, DashboardPage
- `tests/bank-demo/` — PR-gated specs
- `tests/<category>/` — `@external` hostile-host specs (kept)

See `SKIPPED.md` for dead third-party hosts.
