---
tier: C
tier_key: tierC
id: interview-tier-c
title: Tier C — Senior (5–9 years)
lead: Architecture, flake governance, hybrid design, and trade-off reasoning for
  5–9 years. Senior signal = restraint and naming what you deliberately will not
  build.
difficulty: senior
topic: scenarios
pw_version_introduced: "1.40"
---

# Tier C — Senior (5–9 years)

Architecture, flake governance, hybrid design, and trade-off reasoning for 5–9 years. Senior signal = restraint and naming what you deliberately will not build.

*Quick index: C1 team-scale architecture · C2 flaky-test governance · C3 parallel test-data patterns · C4 multi-context real-time · C5 WebKit-only failure · C6 a11y-as-locator-byproduct · C7 self-healing locators · C8 what not to automate · C9 flake observability · C10 SPA reliability · C11 axe-core blind spots · C12 cross-browser Core Web Vitals · C13 trading-dashboard strategy · C14 flag-combination testing · C15 parallel-auth flakiness · C16 15-language strategy · C17 major-version upgrade · C18 design-system component testing · C19 route method toolkit · C20 duplicate accessible names · C21 mid-session expiry · C22 payment test boundary · C23 Service Worker blocks routing · C24 no-mock-allowed payment provider · C25 clean trace, failed CI · C26 event-driven/Kafka testing · C27 microservice failure triage*

### C1. Design a Playwright test architecture for a team of ~30 engineers. What's in it, and what do you deliberately NOT build?
**Ideal approach:** Cover POM or component-object hybrid, shared/custom fixtures, a stable locator policy, a parallel-safe test-data strategy, environment-specific config via `projects`/env files, CI sharding, and reporting. Feature-grouped `tests/`, page objects with locators+actions (no assertions), fixtures for preconditions. Crucially name restraint: **avoid premature abstractions, do not write a custom framework on top of Playwright, do not hand-roll parallelism.**
**Why they get stuck:** They over-engineer, default to "POM for everything" without critiquing it, and can't name what *not* to build — the senior signal is restraint.

### C2. Your flaky-test list keeps growing. Turn "we have flaky tests" into "we manage flaky tests."
**Ideal approach:** Diagnose-first via traces, then categorize and fix by class (locator→role-based; timing→web-first assertions/remove sleeps; state→isolation; environment→infra). Retries as a *diagnostic*: `retries:2` + `trace:'on-first-retry'` + `--fail-on-flaky-tests` on PRs so retries surface rather than hide. Track flakiness across history (stability score), fix worst offenders first. Quarantine known-flaky tests behind a tag with a ticket + owner + review date; never let the list grow silently.
**Why they get stuck:** They lean on retries as a fix, have no historical tracking, and no quarantine governance (ownership/expiry).

### C3. Handle test data across a highly parallel, sharded suite.
**Ideal approach:** Know the three patterns — per-test data via API setup; per-worker isolation via user pools; DB snapshots restored per shard. Playwright isolates cookies/localStorage/session via fresh BrowserContext per test, but **DB records, server state, and filesystem artifacts are your responsibility.** Create shared datasets once per worker where safe; use factories/builders and namespacing; clean up in teardown. Senior insight: "shared seed data" causes most parallel-run flake.
**Why they get stuck:** They assume context isolation covers everything, rely on shared seed data, and can't distinguish per-test vs per-worker vs snapshot trade-offs.

### C4. Multi-user real-time scenario: a customer places an order while an admin approves it in the same test. How do you structure it?
**Ideal approach:** Two isolated contexts in one test (`browser.newContext({storageState:'customer.json'})` and `…'admin.json'`), a page in each. Drive both; assert the customer page reflects the admin's action in real time. Contexts can't see each other's cookies but can observe the app changing. Close contexts in teardown.
**Why they get stuck:** They try to do it with one context/page, or don't know contexts give true session isolation without new browsers.

### C5. A test passes on Chromium and Firefox but fails only on WebKit. How do you approach it?
**Ideal approach:** First determine if it's a **product bug** (real Safari/WebKit divergence — layout, sub-pixel rounding, sticky positioning, focus/date handling, event timing, unsupported web API) or a **test issue** (assertions on exact bounding boxes, hit-testing near edges, headless-vs-headed differences). Use the WebKit trace. If it's a real Safari behavior, it's a valuable catch; if it's brittle assertions, make them less pixel-exact. Remember WebKit ≈ Safari's engine but not byte-identical to the shipping Safari app.
**Why they get stuck:** They assume "Playwright is broken," skip the product-vs-test triage, and write assertions too tightly coupled to Chromium rendering.

### C6. Make accessibility a first-class outcome of the framework rather than a separate effort.
**Ideal approach:** Role-based locators (`getByRole`, `getByLabel`) force tests to depend on accessible names/roles, so passing tests tend to run against an accessible app; when a control is hard to locate by role, that's often a real a11y bug to raise. Layer explicit `@axe-core/playwright` audits gating serious/critical violations. Frame a11y as a byproduct of locator policy, not a bolt-on suite.
**Why they get stuck:** They treat a11y as a separate checklist and miss that locator strategy already drives it.

### C7. Design a "self-healing" locator strategy. What does real self-healing require — and what are its limits?
**Ideal approach:** The lightweight built-in version: chain fallbacks with `locator.or(...)` so an alternative resolves if the primary breaks. True self-healing = tries genuinely different strategies (role/text/attribute/position), **completes** the run, and **reports** which locator failed and what worked so the root cause gets fixed. Advanced setups use an LLM to propose a locator from the DOM, gated by a confidence threshold, cached, and — critically — the heal is only accepted if downstream assertions still pass (a repair, not a cover-up). Treat healing as a backup; refactor fragile locators with stable `data-testid`/role selectors; audit every heal event as tech debt.
**Why they get stuck:** They think try/catch-and-continue or retrying the same XPath is self-healing; they don't gate on confidence/assertions, so healing hides bugs.

### C8. What should NOT be automated in Playwright E2E, and where should those checks live instead?
**Ideal approach:** Keep E2E a thin layer over business-critical journeys (login, search, checkout, payment). Push field-level validation, edge cases, and error branches down to unit/component/API tests (faster, more stable). Also name Playwright's scope limits: no native mobile apps (use Appium/Maestro/Detox), not for pure unit tests, not IE11. Apply the test pyramid.
**Why they get stuck:** They chase 100% E2E coverage and claim Playwright fits everything — losing credibility.

### C9. Your CI report answers "what failed in this run" but not "which test has been flaky all month." How do you get observability?
**Ideal approach:** The built-in HTML report is per-run and local; for trends aggregate across runs/branches/PRs. Options: `blob` + `merge-reports`, `junit` for CI test tabs, `allure-playwright` dashboards, or a test-intelligence platform that indexes runs and links traces to PRs. Track flake rate, duration, and stability score over time; attach traces/screenshots to failures.
**Why they get stuck:** They stop at the HTML report and manually diff CI artifacts run-by-run.

### C10. How do you keep tests reliable when the app is a constantly re-rendering SPA (React/Vue/Svelte)?
**Ideal approach:** Lean on Locators (lazy, re-queried each use, immune to stale references) and web-first assertions that retry; avoid `ElementHandle`. Locate by role/label/text so re-renders and class changes don't break tests. Wait on observable outcomes/network responses, never fixed sleeps. Understand actionability checks (attached/visible/stable/enabled/receives-events) to reason about "why did this time out."
**Why they get stuck:** They cache ElementHandles or read state with non-retrying getters and get stale-element/timing flakes.

### C11. Your automated axe-core scan reports zero violations on a modal, but a screen-reader user says it's unusable. What's the scan missing, and how do you test for it?
**Ideal approach:** Automated scanners like axe-core check static/structural rules (missing labels, contrast, ARIA attributes) but generally can't verify dynamic keyboard behavior: that focus actually moves into the modal on open, that Tab doesn't escape its boundary, that Escape closes it, and that focus returns to the triggering control on close. These map to real WCAG criteria but need scripted keyboard-interaction tests alongside the axe scan, not instead of it.
**Why they get stuck:** Senior candidates often treat "the axe scan is green" as "accessible," missing that a large share of WCAG success criteria need behavioral or human judgment that static analysis structurally can't verify.

### C12. Leadership wants a CI gate that fails a PR if Core Web Vitals regress — but your suite runs Chromium, Firefox, and WebKit. Design it.
**Ideal approach:** Lighthouse (and CDP-based tracing generally) only works against Chromium, so a dedicated Chromium-only project carries the performance gate while cross-browser E2E projects run unrelated to it. For metrics captured directly in-browser (LCP, CLS, INP), a `PerformanceObserver`-based approach gives more control over test conditions than a Lighthouse audit. Gate on regressions against a budget, and remember Lighthouse measures initial load well but is blind to post-load interactions (search, filtering) that a Playwright journey can trigger it against.
**Why they get stuck:** They try to force Lighthouse onto Firefox/WebKit (no CDP support there), or don't distinguish a Lighthouse synthetic audit from Core Web Vitals measured live via the Performance API — related but not identical.

### C13. Design the test strategy for a live trading dashboard where price updates must appear within strict latency bounds across concurrent users.
**Ideal approach:** Separate the concerns. Playwright is well suited to verify *correctness* — the right price update reaches the right element after a matching WebSocket frame arrives, exercised across two-plus contexts simulating concurrent users, using frame-event-driven waits rather than fixed sleeps. It is the wrong tool for proving strict latency/throughput SLAs under real load — that's dedicated WebSocket or load-testing tooling.
**Why they get stuck:** They try to make Playwright the source of truth for latency numbers, conflating "my assertion resolved quickly" with "the system meets its SLA" — the former is an artifact of test design, not a load measurement.

### C14. A checkout page has three independent feature flags live at once. A naive matrix is eight combinations, and QA can't realistically own 8× the checkout suite. What do you actually test?
**Ideal approach:** Don't test the full combinatorial matrix by default — test each flag's effect in isolation against a fixed baseline of the others (catches most real regressions at a fraction of the cost), and reserve a small number of deliberately-chosen "known risky" combinations, flagged by product/eng as likely to interact, for explicit combination tests.
**Why they get stuck:** They either brute-force every combination (suite explodes) or ignore combinations entirely (misses real flag-interaction bugs) — the senior signal is a deliberate, risk-based middle path.

### C15. Auth tests pass individually but fail intermittently only when the full suite runs in parallel against shared staging. Investigation steps?
**Ideal approach:** Playwright's context isolation covers client-side state (cookies, localStorage) but not server-side session state — if parallel tests authenticate as the same shared account, one test's token rotation or logout can invalidate another's session mid-run. Fix by giving each worker its own dedicated account/tenant, and keep auth-flow tests (login, logout, expiry) in a separate suite from feature tests that merely assume auth already works.
**Why they get stuck:** They debug the individual failing feature tests instead of recognizing shared-account server-side coupling as the root cause — the same "shared state" flakiness class as parallel test-data isolation, on the auth axis instead of the data axis.

### C16. A product ships in 15 languages. Do you E2E-test all 15 fully?
**Ideal approach:** No — full E2E coverage per locale mostly re-tests the translation vendor's copy, not your code. Run the full functional suite against one or two representative locales (including one RTL and one with longer strings, like German), and run a much thinner smoke test — page loads, key strings render, date/currency formatting is correct, no layout overflow — across the rest. This targets what actually breaks per locale rather than re-verifying business logic 15 times.
**Why they get stuck:** They either propose testing everything in every locale (unsustainable) or drop localization testing to unstructured spot checks, missing the tiered middle ground.

### C17. Playwright ships a new major version with breaking changes. You own a 500-test suite. How do you plan the upgrade?
**Ideal approach:** Trial the upcoming version via Playwright's canary release channel against a subset of the suite (or a shadow CI job) before it's generally available, so breaking changes surface early. Read the migration notes, get the full suite green in a branch before merging, and treat "our suite can't upgrade easily" as itself a signal of overly-coupled, version-fragile test code worth fixing regardless.
**Why they get stuck:** They plan to "just upgrade and fix what breaks" with no staging step, turning routine maintenance into a multi-day firefight that blocks the whole team's CI.

### C18. Fifteen product teams each maintain their own copy of the same design-system `<Button>`/`<Modal>` test logic, and it's drifted out of sync. Fix it with component testing.
**Ideal approach:** Centralize component tests for the shared design-system library itself, using component-testing mode to mount and assert on each shared component in isolation, and publish it as the source of truth for "how do you test our Button." Product teams import/extend those fixtures instead of re-authoring locator/assertion logic per team, turning a design-system regression into one failing suite instead of fifteen silently-drifting ones.
**Why they get stuck:** They propose "better documentation" or a shared style guide, missing that component testing lets the design-system team ship an executable, always-current contract instead of a document that drifts.

### C19. Walk through `route.fulfill()`, `route.continue()`, `route.fetch()` + `fulfill()`, and `route.abort()` — and when multiple handlers match one request, what decides which runs?
**Ideal approach:** `fulfill()` returns a fully controlled fake response without hitting the network. `continue()` lets the real request through, optionally with overridden headers/method/body. `fetch()` followed by `fulfill()` makes the real request and lets you patch the real response before returning it — useful for injecting one bad field into an otherwise-real payload. `abort()` simulates a transport-level failure (offline, DNS failure, connection reset), not an HTTP error status. When multiple handlers match, they run in reverse registration order, and a handler can call `fallback()` to pass the request to the next matching handler instead of finishing it itself — the basis for layered, composable routing (a global logging handler plus a test-specific override, for instance).
**Why they get stuck:** Most candidates know `fulfill()` and stop there; the `fetch()+fulfill()` patch pattern and `fallback()`-based chaining are rarely needed day to day, so candidates who've actually built layered routing stand out from those who've only ever used the simplest mock.

### C20. Your locator matches two "Save" buttons with the identical accessible name. Beyond scoping your locator to fix the test, what should this make you ask about the product?
**Ideal approach:** Fix the immediate test problem by scoping to the correct region or filtering — but flag it further: two controls sharing one accessible name is frequently a real accessibility defect, not just a locator inconvenience, since a screen-reader user hears "Save, Save" with no way to tell them apart either. Treat a strict-mode collision as a possible signal worth raising with product or design, not only an obstacle to script around.
**Why they get stuck:** Mid-level candidates fix the ambiguity and move on; the senior signal is noticing that the same ambiguity confusing your locator is also confusing an actual screen-reader user.

### C21. A user is halfway through a long form when their session expires in the background. What should the product do, and how do you test it — distinct from testing a session that's already expired before the test starts?
**Ideal approach:** This differs from starting a test with an already-expired token, which only tests "reject an old token." Here, expire the session while the user is actively interacting — via a test API, or by making the next request return the real 401 the backend would send — then assert on what happens to their in-progress input: ideally it's preserved (saved to a draft, or resubmitted after re-authentication) rather than silently lost, and the user is routed to re-authenticate rather than shown a confusing generic error.
**Why they get stuck:** They only test the "arrive already logged out" case, missing the more damaging and more common-in-production mid-session expiry, where the interesting question is whether unsaved work survives.

### C22. Design the test coverage for a checkout flow that hands off to a third-party payment provider.
**Ideal approach:** Define the boundary explicitly with the team first. The bulk of functional tests mock the application's own server-facing payment result (success, decline, specific error codes) to exercise every branch deterministically without touching real money; a small number of tests run against the provider's official sandbox/test-card environment to validate the actual redirect/iframe/webhook integration; and no test — mocked or sandboxed — should ever be able to create a real charge. Provider test credentials live in the CI secret store like any other credential, never in test code.
**Why they get stuck:** They either drive the real provider's UI for every test (slow, and sandbox outages block unrelated PRs) or mock so completely that a real break in the provider's actual redirect flow would go unnoticed by anything in the suite.

### C23. A page registers a Service Worker that intercepts and answers requests itself — and your `page.route()` mocks stop taking effect for those requests. What's happening?
**Ideal approach:** A Service Worker can intercept fetches at the browser network layer before Playwright's routing gets a chance to act on them, since the Service Worker effectively becomes its own network layer for requests it claims. Options: unregister or bypass the Service Worker for the test context (Playwright can disable Service Workers via a context option), or, if the Service Worker's caching/offline behavior is itself under test, mock at a layer the Service Worker can't shadow — the actual backend response it would fetch, via `route.fetch()`, or a dedicated test-only backend endpoint.
**Why they get stuck:** They assume `page.route()` is always the outermost layer intercepting network traffic and don't know a Service Worker can sit in front of it for the requests it owns.

### C24. Your payment provider's sandbox is unreliable, and their terms of service prohibit automated interaction with it entirely — you can't drive it and aren't permitted to script against it. How do you get any coverage of the integration at all?
**Ideal approach:** When you can't touch the third party at all — not even a sandbox — the integration boundary has to move entirely to your own backend: build and maintain a stub of the provider's webhook/callback contract that your own team owns and controls (validated periodically, manually or via a low-frequency scheduled check, against the provider's actual current contract so it doesn't quietly drift), and test against that stub for everything automated. This goes a step further than "mock the app's own server-facing result" — here, zero automated coverage ever touches the provider, by requirement, so contract-drift risk is managed by manual periodic verification instead.
**Why they get stuck:** They either assume there's always some sandbox to fall back to, or give up on automated coverage of the integration entirely, missing that a team-owned contract stub still catches most regressions even with zero real-provider contact.

### C25. Your Playwright trace shows a completely clean run — every action succeeded, every assertion passed — but the CI job is still reported as failed. How is that possible, and where do you look?
**Ideal approach:** A trace only captures what happened inside the browser; it can't see the CI runner itself. A clean trace with a failed job points outside the test: disk full while writing artifacts, the process running out of memory and getting killed after the test itself finished, a container crash during artifact upload, or the test runner's own timeout firing on a step after the last recorded action. Check the raw CI job logs and resource metrics (memory/disk) for the run, not just the Playwright report, whenever the trace and the job status disagree.
**Why they get stuck:** They keep re-examining the trace looking for something they missed, because "the trace shows success" feels like it should be authoritative — not realizing the trace's scope stops at the browser boundary.

### C26. Your application publishes an event to a message queue (Kafka, SQS, etc.) after a user action, and a consumer processes it asynchronously before the UI reflects the result. How do you test the whole path, not just the UI trigger?
**Ideal approach:** Don't assert on the UI alone and call it covered — the UI update is the last of several hops (publish → consume → process → persist → UI refresh), and a UI-only test can pass even if the consumer silently fails, because the UI might poll or the test might get lucky on timing. Where you own the infrastructure, verify intermediate state directly: that the event was actually published (via a test consumer or the queue's own inspection API) and that the downstream side effect landed (a database row, a follow-up API becoming available) — then assert the UI reflects it, waiting on the real end condition rather than a fixed delay. Where you don't own the queue in the test environment, at minimum assert on the API/database state the consumer is supposed to produce, not only the UI.
**Why they get stuck:** They test the trigger (the user action) and the eventual UI state, and treat that as full coverage of an asynchronous pipeline where any of several intermediate hops could be the thing that's actually broken.

### C27. "Place order" fails somewhere behind the UI — could be the API gateway, payment, inventory, notifications, or shipping. Where do you start, and what should you never do first?
**Ideal approach:** Never start by re-running the UI test and staring at the browser — in a microservices system the UI is the last hop, not the first place to look. Start from what the request actually did behind the scenes: pull the correlation/trace ID for that request, follow it through the API gateway and each service's logs, check response times and error rates per service, and confirm which service actually returned the failure before touching the frontend at all. Only once the failing service is identified does it make sense to reproduce and debug at the UI layer, if the UI layer is even where the fix belongs.
**Why they get stuck:** They debug from the browser inward (checking selectors, checking the click) on a failure that has nothing to do with the UI, burning time before ever looking at the actual failing service.

---
### C28. Design a Playwright test where an admin and a customer interact in the same scenario (e.g., support chat).
**Ideal approach:** Two `browser.newContext()` instances (or two storageStates) with independent pages; never share cookies. Coordinate via API seeds or UI assertions on each side. Handle popups with `waitForEvent('popup')` when OAuth/help opens a tab. This is a top Mid→Senior discriminator.
**Why they get stuck:** They reuse one context/page and “log out / log in,” destroying isolation and creating races.

### C29. How do you mock or assert WebSocket traffic in Playwright for live balance updates?
**Ideal approach:** Register `page.routeWebSocket()` / listeners *before* `goto`. Mock frames or observe real ones; assert the UI end state, not every wire frame. Know close codes (1000 vs 1006). Prefer UI contracts for Bank Demo notifications.
**Why they get stuck:** They attach listeners after navigation and miss the handshake, or over-assert protocol trivia.

### C30. How would you capture Core Web Vitals in a Playwright check, and what caveats do you mention?
**Ideal approach:** Inject `PerformanceObserver` (LCP/CLS/INP) in Chromium; note CWV APIs are Chromium-centric, single runs are noisy (median of 3–5), and CI budgets beat vanity screenshots. Optional: playwright-lighthouse / CDP throttling.
**Why they get stuck:** They treat one LCP number as a hard gate or claim cross-browser CWV parity.

### C31. “How would you test a microservices architecture?” — outline beyond E2E.
**Ideal approach:** Consumer-driven contracts (Pact), service virtualization (WireMock), Testcontainers for real deps, API tests for business rules, thin Playwright for critical journeys. Mention ice-cream-cone risk if everything is UI E2E.
**Why they get stuck:** They answer with only Selenium/Playwright end-to-end flows.

### C32. axe-core reports zero violations but a screen-reader user cannot complete a form. How do you explain that?
**Ideal approach:** Cite automation coverage limits — Deque’s own research found ~57% of *issue volume* covered on average; the “20–40% / ~a third” figure refers to WCAG *success criteria* coverage. Automation is necessary but insufficient; manual keyboard + NVDA/VoiceOver/JAWS remains mandatory. Know WCAG A/AA/AAA and POUR.
**Why they get stuck:** They treat axe green as “accessible.”

---
