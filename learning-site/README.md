# Playwright learning site

Self-contained study guide for **Playwright + TypeScript** — theory, examples, practice labs, interview Q&A, and a quiz.

**Runtime invariant:** open `index.html` from `file://` with **zero install**. No bundler required at runtime.

**Owner:** [SatyamChouksey-88](https://github.com/SatyamChouksey-88)  
**Monorepo:** [playwright-qa-learning](https://github.com/SatyamChouksey-88/playwright-qa-learning)  
**Pages (when enabled):** https://satyamchouksey-88.github.io/playwright-qa-learning/learning-site/

## Quick start

```bash
# Zero install
start index.html

# Or local static server
npx serve -l 8080 .
```

Deep links use the URL hash, e.g. `index.html#fixtures` or `index.html#whats-new`.

## What's inside

| Area | Topics |
|---|---|
| **Getting started** | Overview, roadmap, setup, first test, TypeScript |
| **Core API** | Locators, actions, assertions, waiting, frames, clipboard |
| **Structure** | Hooks, fixtures, config, POM ↔ fixtures trade-off, data-driven |
| **Advanced** | Auth, API, network, visual & ARIA snapshots, Clock, WebAuthn, Agents/MCP |
| **Practice** | Labs, bank demo, anti-patterns, flake playbook, interview bank, quiz |

## Features

- Full-text search via **prebuilt MiniSearch** (`search-index.js` + `vendor/minisearch.js`) — press `/`; works on `file://` (no `fetch`)
- Keyboard help — press `?`
- Copy on code blocks
- Dark / light theme (saved in `localStorage`)
- Progress checklists (local only)

## Author: regenerate search / interview data

From the monorepo root (not required for readers):

```bash
npm install
npm run build:content
```

See `docs/adr/0001-search-minisearch.md` and `docs/adr/0002-interview-md-ssot.md`.

## License

See monorepo root (MIT planned in Phase 1 foundations).
