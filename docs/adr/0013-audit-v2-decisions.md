# ADR 0013 — Audit v2 decisions (SW, lazy load, CI blob, index.html)

**Status:** Accepted  
**Date:** 2026-07-29

## Context

Post–Product Enhancement Pack audit (`f71e9a0`) identified correctness gaps (SW precache, stale HTML, tsconfig), CI dead weight (blob reporter), and UX debt (lazy scripts, token migration, innerHTML sinks).

## Decisions

### Service worker (A3 + A4 + C6)

- **Author-time generator:** `tools/generate-sw.mjs` reads `index.html` shell scripts + all `SECTION_LAZY_SCRIPTS` bundles from `app.js`, writes committed `learning-site/sw.js`.
- **Cache name:** content-hash suffix (`pw-learn-<hash>`) bumped when asset list changes.
- **Strategy:** network-first for HTML navigations; stale-while-revalidate for static assets.
- **Update UX:** in-app toast (`#swUpdateToast`) on `updatefound`; `[data-sw-refresh]` posts `SKIP_WAITING` then reloads.

### Lazy script loading (C4)

- **Initial shell (7 scripts):** `safe-html`, `storage`, `minisearch`, `interview-data`, `bank-demo`, `app`, `ui-2026`.
- **Route bundles:** injected on first `show(id)` via `ensureSectionData` + `SECTION_BOOT` render hooks.
- **file:// preserved:** dynamic `<script src>` insertion, no bundler, no fetch for core content.

### CI blob reporter (A2)

- Blob reporter enabled only when `PW_BLOB=1` (external nightly shards).
- `merge-external-report` job merges shards; bank-demo PR job uses HTML reporter only — no dead blob artifacts.

### TLS (A5)

- Removed global `ignoreHTTPSErrors`; scoped to `chromium-external` project only (third-party sandboxes).

### index.html monolith (C5)

- **Deferred:** extracting lesson markup into data JS risks Bank Demo regression contract (`data-testid` inventory ADR-0008). Shell stays monolithic; content already flows through `build-content` for interview tiers. Revisit only with dedicated extraction tool + bank-demo gate.

### CSS tokens (C1)

- Hex values outside `:root` / theme blocks migrated incrementally; remaining literals tracked until full token pass.

### innerHTML (C3)

- Shared `learning-site/safe-html.js` (`escapeHtml`, `safeHtml`); user-influenced strings route through helper; static templates marked in audit doc.

## Consequences

- Run `npm run generate:sw` after changing script tags or lazy bundles.
- Run `npm run test:bank-demo` after any `learning-site/` change affecting Bank Demo subtree.
- Offline PWA works after first online visit (full lazy corpus precached).
