# ADR-0009: Redesign architecture — vanilla-upgrade path, not a full Astro rewrite

## Status
Accepted

## Context
A staff-level research brief proposed rebuilding `learning-site/` on Astro 5 + a custom Starlight-inspired theme, with content collections, per-island hydration, Pagefind search, `@vite-pwa/astro`, and hard Lighthouse/CWV gates verified against the live deployed Pages URL. The brief itself commits to an explicit fallback: *"if the content generator cannot be adapted to content-collection-compatible output within your time budget, fall back to the documented vanilla-upgrade path and record it in an ADR."*

Three facts changed the calculus for this specific repo, at this point in its lifecycle:

1. **The site is already hardened, not greenfield.** Eight prior phases produced a fully TypeScript-strict practice suite, a11y and visual-regression coverage, a working service worker, FSRS review, quiz, dashboard SVG charts, an existing MiniSearch-backed command palette with grouping/recents/keyboard nav (`ui-2026.js`), and a `check:content`-gated markdown pipeline. A framework migration touches literally every file in that surface area at once, with no incremental rollback if `@bank-demo` regresses partway through.
2. **The hard gates in the brief require infrastructure not available in this session.** Lighthouse Performance/Accessibility ≥95 and Core Web Vitals must be measured against the *deployed* GitHub Pages URL under real network conditions — not locally reproducible or verifiable inside this agent session. Shipping an unverified claim of meeting those gates would be worse than not claiming them.
3. **Most of the requested 2026 visual language is already implemented.** `styles.css` already documents measured contrast (15.1:1 dark / 16.9:1 light body text, far above the 5.1:1 floor), uses a near-black (never pure-black) three-elevation dark surface system, hairline borders, and a single signature accent — the exact pattern the brief asks Linear/Astro Starlight to justify. The command palette already has recents (`pw-cmdk-recent`), grouped sections (`cmdk-sec`), ARIA `option`/`listbox` roles, and keyboard nav.

## Decision
**Take the vanilla-upgrade fallback for the UI/UX redesign (Part B), not the Astro rewrite.** Concretely:

- Convert the core color tokens in `styles.css` to OKLCH (keeping the same measured contrast ratios) so future scale generation is perceptually even, per the brief's OKLCH guidance — without a framework change.
- Ship the flagship UX feature the brief prioritizes — a search-first **"What problem are you facing?"** hero backed by a new Stuck-hub content type — as a new home-dashboard section and site section, reusing the existing lazy-loaded MiniSearch/command-palette infrastructure rather than introducing Pagefind.
- Polish the existing command palette (`ui-2026.js`): rank Stuck-hub results first when the query looks error-shaped, keep grouping/recents/keyboard-nav as-is since they already meet the brief's functional requirements.
- Do **not** introduce Astro, Pagefind, `@vite-pwa/astro`, or a build step. The site's zero-install `file://` guarantee (a hard constraint carried through every prior phase, re-affirmed in ADR-0004) is preserved rather than traded for a PWA-only offline story.
- Do **not** attempt to independently verify the Lighthouse ≥95 / CWV numeric gates from the brief in this session, since there is no deployed URL or Lighthouse CLI available here. This is flagged as a follow-up for the repo owner to run in their own environment (`npx lighthouse <pages-url> --view`) after deploying the changes in this session.

## Consequences
- All content additions (Stuck hub, case studies, Scenario v2 sections) flow through the existing `interview-qa/` → `tools/content/build-content.mjs` → `learning-site/*.js` pipeline, per ADR-0002/ADR-0007, so this decision does not block Part A at all.
- A future contributor who *does* want the full Astro migration can still follow the original brief; this ADR does not foreclose it, it just declines to attempt it unverified in a single session against a hardened, tested site.
- The full sidebar/breadcrumb/TOC/prev-next IA overhaul described in the brief's Phase B3 is a large, separate, page-template-level undertaking; this pass focuses on the highest-leverage subset (search-first hero, Stuck hub, palette ranking) rather than a partial, inconsistent attempt at the entire IA rebuild.
