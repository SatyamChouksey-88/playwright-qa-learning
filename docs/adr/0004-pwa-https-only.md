# ADR-0004: PWA only on HTTPS / GitHub Pages

## Status
Accepted

## Context
Service workers do not run on `file://`. Readers must still open `index.html` with zero install.

## Decision
- Register `sw.js` only when `location.protocol === 'https:'` (or localhost).
- Never register on `file:`.
- Cache shell + static assets with explicit version; show no blocking update UX in v1.

## Consequences
Offline-from-disk remains the first-class path. HTTPS deploy gets optional offline caching as a bonus.
