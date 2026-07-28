# ADR-0003: Bank-demo is the PR-CI centerpiece

## Status
Accepted

## Context
External demo hosts flake and go dark. A portfolio suite that turns red on third-party outages is not a credible gate.

## Decision
- PR CI runs only `@bank-demo` (self-hosted learning-site via `webServer`).
- Nightly CI runs `@external` (kept as hostile-environment evidence; never deleted).
- New suite code defaults to **fixtures exposing business intents** + thin page objects where UI churns.

## Consequences
Bank Demo must stay deterministic. Expand it (Clock OTP, mocks, personas, WebAuthn) before adding more PR-gated journeys.
