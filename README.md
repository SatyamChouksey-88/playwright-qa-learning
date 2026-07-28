# Playwright QA Learning (all-in-one)

Owned by **[SatyamChouksey-88](https://github.com/SatyamChouksey-88)** — Playwright study site + practice suite + interview bank.

[![Content check](https://github.com/SatyamChouksey-88/playwright-qa-learning/actions/workflows/content-check.yml/badge.svg)](https://github.com/SatyamChouksey-88/playwright-qa-learning/actions/workflows/content-check.yml)
[![Practice suite](https://github.com/SatyamChouksey-88/playwright-qa-learning/actions/workflows/practice-suite.yml/badge.svg)](https://github.com/SatyamChouksey-88/playwright-qa-learning/actions/workflows/practice-suite.yml)

| Folder | What it is |
|--------|------------|
| [`learning-site/`](./learning-site/) | Offline SPA — currency modules, Bank Demo, FSRS, MiniSearch (`file://` zero install) |
| [`practice-suite/`](./practice-suite/) | Playwright TS — **PR:** `@bank-demo` · **Nightly:** `@external` |
| [`interview-qa/`](./interview-qa/) | Markdown SSOT (tiers A–D + QA-75 + agentic D36–D40) |
| [`tools/content/`](./tools/content/) | Author-time generator |
| [`docs/adr/`](./docs/adr/) | ADRs (search, MD SSOT, bank-demo CI, PWA, FSRS) |

## Metrics (portfolio snapshot)

| Signal | Value |
|--------|-------|
| Interview scenarios | 122 (A25+B30+C27+D40) |
| Essentials pack | ~53 |
| Search corpus | ~400 MiniSearch docs |
| External practice specs | 46 `@external` (nightly) |
| Bank-demo PR specs | auth + site smoke (`@bank-demo`) |
| Runtime install for site | **0** |

## Quick start

### Learning site
```bash
start learning-site/index.html
```

### Author regenerate
```bash
npm install
npm run build:content
npm run check:content
```

### Practice suite
```bash
cd practice-suite
npm install
npx playwright install chromium
npm run test:bank-demo          # PR gate
npm run test:external           # nightly / hostile hosts
```

## CI / Pages

- PR: content check + bank-demo Chromium
- Nightly / `workflow_dispatch`: sharded `@external`
- Pages: deploys `learning-site/` on main (enable GitHub Pages → Actions)

Live (when enabled): https://satyamchouksey-88.github.io/playwright-qa-learning/learning-site/

## Governed AI note

Playwright Test Agents/MCP are taught as **scaffolding with review gates**. Healer skips change suite signal — humans own architecture (see `#agents-mcp`, D10/D36).

## License

MIT — see [`LICENSE`](./LICENSE).
