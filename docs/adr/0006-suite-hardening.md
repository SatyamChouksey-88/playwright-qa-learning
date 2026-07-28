# ADR-0006: Practice-suite hardening (typecheck, storageState, cross-browser, flake reporting)

## Status
Accepted

## Context
The bank-demo suite is the PR-gate centerpiece (ADR-0003) but had no `typecheck`/`lint` CI step, no `storageState`-based auth project, no accessibility or visual-regression coverage, and no cross-browser signal beyond Chromium — all things a portfolio-grade suite is expected to demonstrate.

## Decision
- `tsconfig.json` targets `module: esnext` + `moduleResolution: bundler` with `noUncheckedIndexedAccess`; global `Window` shapes live in `types/global.d.ts` instead of ad-hoc casts.
- Credentials/personas are centralized in `fixtures/personas.ts`; no plaintext passwords duplicated across specs.
- A `setup` project (`setup/auth.setup.ts`) authenticates once and writes `storageState`; a `bank-demo-authed` project consumes it via `dependencies`, avoiding a UI login per test where the test isn't *about* login.
- `firefox-bank-demo` / `webkit-bank-demo` projects run weekly (not on every PR) to keep the PR gate fast while still proving cross-browser correctness.
- `tools/flake-report.mjs` summarizes retries per test from the JSON reporter output so flakiness is visible instead of silently masked by `retries`.
- CI runs `typecheck` and `lint` as required steps before the bank-demo job, and merges blob reports from the nightly `@external` shards into one HTML report.

## Consequences
New bank-demo specs should default to the `bank-demo-authed` project unless the test's subject is authentication itself. Visual and accessibility specs are first-class citizens of the PR gate, not an afterthought — see `tests/bank-demo/a11y.spec.ts` and `visual.spec.ts`.
