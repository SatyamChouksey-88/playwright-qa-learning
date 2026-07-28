# ADR-0007: Content expansion stays markdown-SSOT, site-authored pages for non-tiered content

## Status
Accepted

## Context
Growing the interview bank past the four scenario tiers (A–D) raised a question: does every new content track need to fit `_meta.yaml`'s `parseTierMarkdown` shape (`### A1. question` / ideal / stuck), or can content with a genuinely different shape (Symptom → Investigation → Root cause → Fix → Prevention; folder-structure walkthroughs; internals mechanism write-ups) live elsewhere?

## Decision
- New deep-dive tracks (production failures, framework-at-scale, internals, code-review lab, debugging-artifacts lab, BDD mapping, CI deep dive, contract/real-time) each get a durable markdown file under `interview-qa/` as the source of truth for the content's prose, even though their internal structure doesn't match the four-tier `_meta.yaml` schema.
- The **rendered** site surface for this content follows the existing `learning-site/gap-pages-data.js` (`window.GAP_PAGES`) convention already used for hand-authored teaching pages (test-design, pyramid-nft, postmortems, trace-lab, etc.) — condensed, cross-linked, and widget-backed where a drill format fits (`GAP_CODEREVIEW` for the code-review lab).
- `tools/content/build-content.mjs` still auto-indexes every `GAP_PAGES` entry and `GAP_CODEREVIEW` item into the MiniSearch corpus and reading-time map, so new content is discoverable and gets a reading-time badge without any generator changes.
- `tools/content/check-metrics.mjs` guards `README.md`'s portfolio-snapshot table against drift whenever scenario counts, search corpus size, or the curated-pages count change.

## Consequences
Not every markdown file under `interview-qa/` round-trips through `parseTierMarkdown` — only the four scenario tiers do. Contributors adding a new deep-dive track should: (1) write the `interview-qa/NN-topic.md` file as the durable source, (2) hand-author the condensed, linked rendering in `gap-pages-data.js` (or extend an existing page), and (3) run `npm run build:content && npm run check:content && npm run check:metrics` before opening a PR.
