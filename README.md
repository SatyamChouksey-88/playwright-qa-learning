# Playwright QA Learning (all-in-one)

Owned by **[SatyamChouksey-88](https://github.com/SatyamChouksey-88)** — Playwright study site + practice suite + interview bank.

[![Content check](https://github.com/SatyamChouksey-88/playwright-qa-learning/actions/workflows/content-check.yml/badge.svg)](https://github.com/SatyamChouksey-88/playwright-qa-learning/actions/workflows/content-check.yml)
[![Practice suite](https://github.com/SatyamChouksey-88/playwright-qa-learning/actions/workflows/practice-suite.yml/badge.svg)](https://github.com/SatyamChouksey-88/playwright-qa-learning/actions/workflows/practice-suite.yml)

![Study dashboard, dark theme](./docs/screenshots/dashboard-dark.png)

<details>
<summary>More screens — command palette, review, light theme</summary>

| | |
|---|---|
| ![Command palette](./docs/screenshots/command-palette.png) | ![FSRS review](./docs/screenshots/fsrs-review.png) |
| ![Dashboard, light theme](./docs/screenshots/dashboard-light.png) | |

</details>

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
| Interview scenarios | **135** (A25 + B34 + C32 + D44) |
| Essentials pack | ~53 |
| Search corpus | **461** MiniSearch docs |
| SDET guide & labs | **16** curated teaching pages (clarity-templated) |
| External practice specs | 46 `@external` (nightly) |
| Bank-demo PR specs | auth + site smoke (`@bank-demo`) |
| Runtime install for site | **0** |
| Dashboard charts | 4 hand-rolled SVG (heatmap, rings, retention curve, mastery bars) |
| Contrast floor measured | **5.1:1** dark and light (AA body text) |

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
- Pages: workflow deploys `learning-site/` from `main`

**If the live demo 404s:** enable **Settings → Pages → Source: GitHub Actions**, then re-run “Deploy Pages” (or push a `learning-site/**` change). Until Pages is enabled, GitHub cannot publish and the `github.io` URL stays 404. Local forever works: open `learning-site/index.html` via `file://`.

Live (when enabled): https://satyamchouksey-88.github.io/playwright-qa-learning/learning-site/

## Governed AI note

Playwright Test Agents/MCP are taught as **scaffolding with review gates**. Healer skips change suite signal — humans own architecture (see `#agents-mcp`, D10/D36).

## License

MIT — see [`LICENSE`](./LICENSE).
