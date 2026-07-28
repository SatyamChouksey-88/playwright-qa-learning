# ADR-0001: Search via prebuilt MiniSearch JS global

## Status
Accepted (Stage 2)

## Context
The learning site must open from `file://index.html` with zero install. `fetch()` of a local JSON index is CORS-blocked on `file://`. Pagefind needs a build+HTTPS deploy path and is oversized for ~250–400 corpus items.

## Decision
- Author-time: build a MiniSearch index with `npm run build:content`.
- Commit `learning-site/search-index.js` that assigns `window.SEARCH_INDEX = {…}` (serialized MiniSearch + load options).
- Commit vendored `learning-site/vendor/minisearch.js` (UMD).
- Runtime: `MiniSearch.loadJS(window.SEARCH_INDEX.index, options)` — no network, no npm for readers.
- PWA/service worker remains GitHub Pages only (separate ADR path); `file://` stays first-class without SW.

## Consequences
- Editing interview MD or curriculum HTML requires regenerating and committing the index (`npm run build:content`).
- CI runs `npm run check:content` to fail PRs when generated artifacts drift.
- Search quality is BM25/prefix/fuzzy over a fixed corpus, not full-text DOM scrape at runtime.
