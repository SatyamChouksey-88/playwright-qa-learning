---
tier: FS
tier_key: frameworkAtScale
id: framework-at-scale
title: Framework design at scale — 500 to 50,000 tests
lead: Tier D treats "design a framework" as a discussion question. This is the
  concrete version — the folder structure, the decisions that actually change
  between 500 and 50,000 tests, and, for every stage, the thing a smart team
  deliberately does NOT build yet. Read D1/D3/D24–D28 first for the
  trade-off reasoning this section assumes.
difficulty: architect
topic: framework-scale
pw_version_introduced: "1.40"
---

# Framework design at scale

Every framework has the same four layers — **config → fixtures → page/component objects → tests**, with reporting wrapped around the outside. What changes as test count and team count grow isn't the layers themselves, it's *how much ceremony each layer can bear before it starts costing more than it saves*. This page walks that curve concretely: six checkpoints, each with a folder structure, the two or three decisions that actually matter at that size, and — the part interviewers listen for — what you deliberately refuse to build yet.

*Quick index: FS1 ~500 tests, single team · FS2 ~5,000 tests, growing team · FS3 ~50,000 tests, platform scale · FS4 multi-team shared framework · FS5 microservices/fan-out product · FS6 white-label / multi-tenant product*

---

### FS1. ~500 tests, one team, one product

At this size the entire suite runs comfortably on one CI job in a few minutes, and the biggest risk isn't scale — it's over-engineering for a future you don't have yet.

```
tests/
  auth/
    login.spec.ts
    logout.spec.ts
  checkout/
    checkout-happy-path.spec.ts
    checkout-declined-card.spec.ts
pages/
  LoginPage.ts
  CheckoutPage.ts
fixtures/
  test.ts              # base.extend: page objects + auth
utils/
  test-data.ts          # faker-based builders
playwright.config.ts
```

**Key decisions:**
- One `fixtures/test.ts` extending `base` with page objects injected — no fixture *packages*, no `mergeTests`, just one file.
- Page Object Model, plain and unapologetic — the "component-object hybrid" trade-off from D1 doesn't pay off yet; one team can hold the whole page-per-file mental model in their head.
- A single `playwright.config.ts` with one or two `projects` (Chromium + maybe one more) — no environment-layering abstraction yet.
- `storageState` via one setup project for the one role the product has.

**What NOT to build:** a custom test runner or DSL on top of Playwright, a plugin architecture, multi-package repo structure, a "framework team," or configurable reporter pipelines. At 500 tests, the person who wrote a test can also read any other test in the suite in under a minute — protect that property longer than feels necessary.

**Related:** D1 (framework-from-scratch reasoning).

---

### FS2. ~5,000 tests, one growing team (or two collaborating teams)

Somewhere between 500 and 5,000, "everyone can hold the whole suite in their head" stops being true, and the first real organizational decisions show up: how tests get grouped, how CI stays fast, and who owns flaky-test triage.

```
tests/
  smoke/                 # fast, PR-blocking subset (tagged, not duplicated)
  auth/
  checkout/
  account/
  admin/
pages/
  components/            # shared widgets: DatePicker, Modal, DataTable
  auth/LoginPage.ts
  checkout/CheckoutPage.ts
fixtures/
  auth.fixture.ts
  data.fixture.ts        # API-seeded test data
  index.ts               # mergeTests() composes the above
config/
  playwright.config.ts
  environments/
    staging.env
    qa.env
utils/
  api-client.ts           # request fixture wrapper for hybrid API+UI setup
  builders/               # order/user/product data builders
.github/workflows/
  pr-smoke.yml            # fast tier, blocks merge
  nightly-regression.yml  # full sharded run
```

**Key decisions:**
- Tests get **tagged**, not duplicated, into smoke vs regression (`test('...', { tag: '@smoke' }, ...)`) — a PR gate runs `--grep @smoke` in minutes; nightly runs everything sharded.
- Fixtures graduate from one file to a small composed set via `mergeTests` — auth, data-seeding, and API-client fixtures become independently testable/reusable pieces.
- Component-object objects appear for genuinely reused widgets (date pickers, modals, data tables used across a dozen pages) while simple pages stay plain POM — mixing the two is correct here, not a compromise.
- Environment config moves out of the single config file into `config/environments/*` loaded by env var, because more than one non-prod environment now exists.
- `fullyParallel: true` plus tuned `workers` on one machine, sharding (`--shard`) only once a single machine's parallelism is saturated — not before (see D3).

**What NOT to build:** a bespoke reporting dashboard (use `blob` + `merge-reports` and an existing tool), a homegrown test-data service (API-seeding through the app's own endpoints is enough), or a "smart" test-selection system — at this size, running everything nightly is still cheap enough that impact analysis (D31 territory) is premature optimization.

**Related:** B9 (cutting CI time), D3 (scaling execution beyond sharding).

---

### FS3. ~50,000 tests, platform scale, many teams, one shared framework

At this size the suite itself is a product with its own users (test authors across the org), and the framework's own reliability, versioning, and cost become first-class engineering concerns — not side effects of writing tests.

```
packages/
  test-framework/              # published internal package, versioned
    src/
      fixtures/
        auth.ts
        api.ts
        tracing.ts
      reporters/
        cost-tracker.ts
      lint-rules/               # custom eslint rules enforcing locator policy
    CHANGELOG.md
    package.json                # semver; teams pin a major version
  design-system-tests/          # component-testing suite owned centrally (see C18)
teams/
  checkout/
    tests/
    pages/
    playwright.config.ts        # extends shared base config
  payments/
    tests/
    pages/
  onboarding/
    tests/
    pages/
infra/
  orchestrator/                 # load-balances shards by historical timing, not lexical order
  flake-dashboard/              # aggregated stability score across all teams/runs
  ci-templates/
    smoke.yml
    regression.yml
```

**Key decisions:**
- The framework itself is a **versioned internal package** with a changelog, deprecation windows, and a migration guide for breaking changes (D25) — teams opt into major bumps, they aren't flag-dayed.
- One sanctioned test-architecture pattern, published with a reference implementation and enforced by lint rules, not left to organically diverge per team (D26) — the folder layout above assumes every team's `tests/` looks structurally similar, which is the point.
- A load-balancing orchestrator replaces native lexical sharding once static, file-order sharding starts producing unbalanced shard runtimes (D3).
- Shared utilities and fixtures carry their own unit/integration tests and a mandatory review gate from framework owners before merge (D27) — a break in shared code here has a blast radius of thousands of tests, not dozens.
- Cost and flake are tracked as first-class metrics per team (a `flake-dashboard` and a cost-tracking reporter), because at this volume "the suite is green" stops being informative on its own.

**What NOT to build:** a framework so configurable it accommodates every team's preferred pattern simultaneously (Screenplay *and* POM *and* Component Objects, all "supported") — that's the D26 failure mode. Don't build a fully custom distributed test orchestrator from scratch either; evaluate mature test-intelligence platforms before hand-rolling one, and reserve custom orchestration for the specific gap (usually timing-aware shard balancing) that off-the-shelf tools don't cover.

**Related:** D25 (framework semver for 100 teams), D26 (15 teams, different patterns), D27 (shared-utility breaks 500 tests), D3 (scaling execution beyond sharding).

---

### FS4. Multi-team shared framework — the ownership model, not just the code

This is the organizational layer sitting on top of FS3's folder structure: who's allowed to change what, and how a breaking change actually ships without freezing 15 teams at once.

```
CODEOWNERS
  /packages/test-framework/   @qa-platform-team
  /teams/checkout/            @checkout-team
  /teams/payments/            @payments-team

RFC-process/
  001-fixture-signature-v3.md   # proposal, migration plan, deprecation date
```

**Key decisions:**
- A `CODEOWNERS`-enforced boundary: any team can add tests inside their own `teams/<name>/` directory freely, but changes to `packages/test-framework/` require the platform team's review — mirroring D27's "shared code needs an independent quality bar."
- Breaking changes ship as: new major version published → deprecation warning on the old path → documented migration window → removal on a fixed date, never a single coordinated cutover (D25).
- A lightweight RFC process for framework-level changes (not for every PR — just fixture signature changes, new mandatory patterns, or anything that touches every team) so 15 teams get a say before, not after, a breaking change lands.
- One person or small group owns "the framework" as their actual job, not as a side responsibility split across whoever touched it last — accountability for a 50,000-test shared asset needs a name attached to it.

**What NOT to build:** a governance process so heavy that adding a single new fixture requires a multi-week RFC — reserve the RFC step for genuinely breaking, cross-team-impacting changes; anything additive and backward-compatible should ship on a normal PR review.

**Related:** D25, D26, D27, D34 (KPIs/ROI to leadership — the ownership model is what makes those numbers defensible).

---

### FS5. Microservices product — many services, one thin E2E layer on top

The mistake at this scale is treating the number of services as the number of things Playwright needs to verify end-to-end. It isn't — most of that surface belongs at the contract/API layer (see `interview-qa/15-contract-and-realtime.md`), and the E2E folder structure should look deliberately small next to the service count.

```
e2e/
  journeys/
    place-order-and-confirm.spec.ts     # crosses order → payment → inventory → notification
    account-signup.spec.ts
  fixtures/
    seed-via-api.ts                      # seeds through each service's own API, not the UI
contract-tests/                          # separate suite/tooling (Pact, schema tests) — not Playwright
  order-service.pact.ts
  payment-service.pact.ts
service-health/
  smoke-per-service.spec.ts              # thin per-service UI/API smoke, not full regression
```

**Key decisions:**
- Playwright owns a **small number of cross-service journeys** that matter to a user (place an order that fans out to five services) — not one E2E suite per microservice.
- Per-service correctness (does the payment service handle a declined card correctly in isolation) lives in that service's own contract/API tests, never re-verified by driving the whole UI just to reach it.
- Test data setup for an E2E journey seeds through each service's real API (fast, stable) rather than the UI, and rather than reaching directly into another service's database (that recreates tight coupling at the test layer that microservices were supposed to remove).
- A thin, tagged "service health" smoke checks that each service's slice of the UI renders and responds — useful for triage ("which service is actually down") without being a substitute for the journey tests.

**What NOT to build:** an E2E test per service per endpoint (that's the ice-cream cone applied to a microservices org chart instead of a monolith), or a single mega-journey test that silently depends on all fifteen services being simultaneously healthy for any test to pass — that turns "one service has a blip" into "the entire E2E suite is red."

**Related:** S19 (microservices order fans out to 5 services), C27 (microservice failure triage), contract-testing gap page (`#contract-testing`).

---

### FS6. White-label / multi-tenant product — one framework, many brands

The product is functionally one codebase serving many customer-facing brands (different logos, copy, feature toggles, sometimes different domains) — and the temptation is to either duplicate the whole suite per brand or write one suite so generic it stops catching brand-specific regressions.

```
tests/
  shared/
    checkout-flow.spec.ts        # parameterized by tenant, runs once per tenant in the matrix
tenants/
  acme-corp/
    tenant.config.ts             # branding assertions, feature-flag defaults, base URL
    overrides/                   # brand-specific test additions (rare, deliberate)
  globex/
    tenant.config.ts
fixtures/
  tenant.fixture.ts               # loads the right tenant.config.ts based on a project/env var
playwright.config.ts              # projects: one per tenant (or a representative subset)
```

**Key decisions:**
- Core functional tests are written **once**, parameterized by a `tenant` fixture that supplies base URL, branding strings to assert, and feature-flag defaults — not copy-pasted per brand.
- Full functional coverage runs against every tenant only where genuinely cheap; for a large tenant count, run the full suite against one or two representative tenants and a much thinner brand-specific smoke (logo/color/copy/domain routing) against the rest — the same logic as C16's 15-language strategy, applied to brands instead of locales.
- Brand-specific *behavioral* differences (not just cosmetic ones — e.g., one tenant has a feature the others don't) get an explicit `overrides/` test, not a growing pile of `if (tenant === 'acme')` branches inside shared spec files.
- Tenant config is data, not code — adding a new white-label customer should mean adding a `tenant.config.ts` entry, not modifying test logic.

**What NOT to build:** a full duplicate test suite per tenant (maintenance cost multiplies linearly with sales, which is the wrong shape for a test suite), or so much conditional branching inside shared specs that no single spec file is readable without knowing every tenant's quirks by heart.

**Related:** C16 (15-language strategy — same thinning pattern applied to a different multiplier), D22 (multi-tenant SaaS coverage).

---
