---
tier: B
tier_key: tierB
id: interview-tier-b
title: Tier B — Intermediate / Mid-level (2–5 years)
lead: Fixtures, auth, mocking, CI, and reliability scenarios for 2–5 years.
  Panels push past syntax here — diagnosis order matters more than memorised
  snippets.
difficulty: intermediate
topic: scenarios
pw_version_introduced: "1.40"
---

# Tier B — Intermediate / Mid-level (2–5 years)

Fixtures, auth, mocking, CI, and reliability scenarios for 2–5 years. Panels push past syntax here — diagnosis order matters more than memorised snippets.

*Quick index: B1 CI-only flake · B2 parallel-load timeout · B3 multi-role auth · B4 hybrid API+UI setup · B5 mocking states · B6 blocking noisy third parties · B7 iframe+shadow DOM · B8 POM+fixtures · B9 cutting CI time · B10 visual regression · B11 CI integration · B12 order-dependent test · B13 mock vs real · B14 drag-drop/hover · B15 WebSocket ack · B16 feature-flag matrix · B17 OAuth mock-vs-real · B18 expired-token injection · B19 RTL visual test · B20 network throttling · B21 staging-only CAPTCHA · B22 WebSocket reconnect · B23 OTP mocking · B24 soft assertions · B25 mock validates outgoing request · B26 version-conflict/409 · B27 storageState hygiene · B28 data-testid contract · B29 GraphQL testing · B30 dual-UI-version testing*

### B1. A test is green 9 runs out of 10 in CI but you can't reproduce it locally. Walk me through your process.
**Ideal approach:** Reproduce under stress: `npx playwright test file:line --repeat-each=100` (and throttle CPU / raise `--workers` to mimic contended CI). Disable retries while investigating so flakiness isn't hidden. Open the **trace** (`trace: 'on-first-retry'`): inspect the DOM snapshot at the failing action, the network panel (did an API never resolve?), the console, and the longest bar on the timeline. Categorize: async/wait, resource contention, selector, order-dependency, environment drift, or test bug. Fix root cause, then re-run `--repeat-each` to confirm.
**Why they get stuck:** They "just add a retry" or bump timeouts; they don't know `--repeat-each`/CPU throttling to reproduce, or how to read a trace to localize the failing action.

### B2. Under heavy parallel load, a test times out waiting for a backend response that's fine locally. What's happening and how do you stabilize it?
**Ideal approach:** The backend is slower because many workers hammer it simultaneously; it's a resource/timing issue, not a code bug. Options: start the wait before the trigger (`waitForResponse` set up before the click), route-intercept known-slow non-critical endpoints, seed state via API instead of clicking through prerequisites, reduce worker count against a capacity-limited staging env, or add capacity. Assert on the user-visible end-state.
**Why they get stuck:** They raise the timeout globally instead of recognizing shared-environment capacity; they don't know network-first wait patterns.

### B3. You need an authenticated session for admin, editor, and viewer roles across many tests. Design it.
**Ideal approach:** A setup project (or worker-scoped fixture) logs in once per role and saves `auth/<role>.json` via `storageState()`. Dependent projects load the right file with `use.storageState`; per-test override with `test.use({storageState:'auth/admin.json'})`. For token-based apps, hit the auth API and inject the token (`addInitScript` to localStorage or `extraHTTPHeaders`) — faster than UI login. Address MFA, expiry, and per-role variation.
**Why they get stuck:** They save one shared state and mutate it across tests, or can't articulate token-injection vs UI-login trade-offs, or forget MFA/expiry.

### B4. A test must set up a specific order, then verify it in the UI. How do you make it fast and reliable?
**Ideal approach:** Hybrid API+UI: create the order via `request.post('/api/orders', …)` (the fast, stable door), capture the returned id, then `page.goto` and assert the order appears in the UI. Two wins: much faster than clicking prerequisites, and it isolates the order-history UI regression from the order-placement UI.
**Why they get stuck:** They drive the entire setup through the UI (slow, flaky), or don't realize the `request` fixture can share/seed state.

### B5. You want deterministic tests of a loading spinner, an error banner, and an empty state. How?
**Ideal approach:** Use `page.route` to control the boundary: fulfill a fake 200 with a fixed body for the happy path, `route.fulfill({status:500})` for errors, an empty array for empty state, and add an artificial delay (`await new Promise(r=>setTimeout(r,2000)); route.continue()`) to exercise the spinner. Keep at least one happy-path test against the real backend so you don't mock away the integration.
**Why they get stuck:** They can't produce backend edge states on demand and either skip them or make them flaky; or they over-mock and stop testing the real integration.

### B6. Third-party analytics/tag-manager calls are slowing and destabilizing your runs. What do you do?
**Ideal approach:** Abort noisy hosts with `page.route(/(analytics|googletagmanager|hotjar)\./, r=>r.abort())`. Legitimate speed/determinism tactic since those aren't under test. Be careful not to abort anything the flow depends on.
**Why they get stuck:** They don't know request interception can abort, or they block too broadly and break the app.

### B7. Payment fields live inside a Stripe iframe, and a custom web component uses shadow DOM. How do you automate both?
**Ideal approach:** iframe → `page.frameLocator('iframe[name="stripe-card"]').getByLabel('Card number').fill(...)` (chain for nested frames). Shadow DOM → role/text/label locators pierce **open** shadow roots automatically, so usually no special syntax; closed shadow roots can't be reached by Playwright or Selenium. Java binding uses `page.frameLocator(...)` identically.
**Why they get stuck:** They think shadow DOM can't be tested or reach for `evaluate` hacks; they try to locate iframe contents with `page.locator` without `frameLocator`.

### B8. Implement the Page Object Model, then explain how fixtures relate to it.
**Ideal approach:** POM = a class per page/component holding `readonly` Locators initialized from the injected `Page`, plus intent methods (`login()`, `addToCart()`). Fixtures provide *state* (logged-in user, seeded data, API client) and inject the page objects so specs stay short. They compose: fixture builds the POM + preconditions, POM exposes actions, test reads like a user story. Keep business assertions visible in tests (or in explicit `expectX()` methods), not buried everywhere in POMs.
**Why they get stuck:** They conflate POM with fixtures, put `test()` or heavy assertions inside page objects, or expose raw selector strings instead of Locators.

### B9. Your suite takes 45 minutes in CI. How do you cut wall-clock time?
**Ideal approach:** First enable `fullyParallel: true` and tune `workers` to saturate one machine. Then **shard** across machines (`--shard=i/n`) via a CI matrix, emit `blob` reports per shard, and `merge-reports` into one HTML report. Also: seed via API + storageState to cut per-test time, mock unreliable third parties, and tier smoke vs regression. Sharding only helps after parallelism saturates a machine — and not if a shared staging app is the bottleneck.
**Why they get stuck:** They confuse workers (one machine) with shards (many machines), forget to merge blob reports, or shard before parallelizing.

### B10. Set up visual regression for a dashboard that includes a live clock and user avatars.
**Ideal approach:** `await expect(page).toHaveScreenshot('dashboard.png', {mask:[…dynamic regions…], animations:'disabled', maxDiffPixelRatio:…})`. Mask timestamps/avatars/ads, disable animations, hide caret. Generate baselines in the **same Docker image CI uses** because fonts/OS rendering differ, else you'll chase phantom diffs. Visual tests complement — don't replace — functional E2E.
**Why they get stuck:** They don't mask volatile regions (noisy diffs), generate baselines on a laptop but run CI in Linux Docker (font diffs), or confuse visual with functional testing.

### B11. Integrate the suite into CI (GitHub Actions / Jenkins / Azure DevOps). What are the must-haves?
**Ideal approach:** Node setup → `npm ci` → `npx playwright install --with-deps` (or the official `mcr.microsoft.com/playwright` image with a version-matched tag) → run with sharding → upload trace/HTML reports as artifacts (`if: always()`). CI-only: `retries: 2`, `forbidOnly: true`, `trace: 'on-first-retry'`. Cache browser binaries or use the Docker image. Secrets in the CI secret store. Jenkins: a Jenkinsfile stage running the same commands; Azure DevOps: a YAML pipeline with NodeTool + scripts (browsers install headless without Docker on hosted agents).
**Why they get stuck:** They forget `--with-deps`/binary caching (startup balloons), don't upload artifacts, or hardcode secrets.

### B12. A test relies on data another test created and fails when run alone or out of order. How do you fix the class of problem?
**Ideal approach:** Make each test self-seeding and independent: no shared mutable globals, unique data per test (faker/UUID) or per-worker pools, storageState instead of a UI-login chain, cleanup in fixture teardown. Verify with `--workers=4 --repeat-each=3` and randomized order. Use `test.describe.serial` only for genuinely sequential journeys.
**Why they get stuck:** They fix the one test instead of the ordering dependency; they don't know how to prove independence.

### B13. When would you choose to mock a network call versus hit the real backend?
**Ideal approach:** Mock to isolate the UI (rendering/error/empty states) and to remove flaky third parties; hit the real service when the journey *is* the integration (e.g., "checkout talks to payments"). Hybrid is usually right: mock at the boundary, keep one happy-path test against the real backend. HAR replay for hermetic CI, refreshed when APIs change.
**Why they get stuck:** They over-mock (green tests, broken integration) or under-mock (can't reproduce edge states).

### B14. Drag-and-drop and a hover-only menu both fail intermittently. How do you handle each?
**Ideal approach:** Try `source.dragTo(target)` first; for custom HTML5 DnD do it manually: `hover() → mouse.down() → hover(target) → mouse.up()`, sometimes with intermediate moves. Hover menus: `hover()` then assert the submenu is visible before clicking. Avoid `force:true` (it can silently "succeed" while nothing happens).
**Why they get stuck:** They rely on `dragTo` for finicky DnD, or use `force:true` and get false greens.

### B15. A chat "Send" button should show "Delivered" only after the server acknowledges receipt over the WebSocket — not just after the click. How do you assert that reliably?
**Ideal approach:** Don't assert right after the click or use a fixed sleep. Listen for the specific WebSocket frame the server sends back, resolve a promise when an ack frame of the right type arrives, `await` it, then assert the UI shows "Delivered." This ties the assertion to the actual event the UI reacts to, not a guessed elapsed time.
**Why they get stuck:** They either poll the DOM in a loop (slow, still occasionally flaky) or use `waitForTimeout` — both are indirect proxies for "did the ack arrive" instead of checking it directly.

### B16. A pricing feature is live behind a flag for 20% of users. How do you test both the on and off states without needing five separate real accounts?
**Ideal approach:** Toggle the flag programmatically for the test — via the flag provider's API/SDK for a dedicated test user, or by intercepting the flag-evaluation network call — then parameterize one test body over both states so both run predictably in every CI run, independent of the live rollout percentage. Reset the flag afterward so state doesn't leak into other tests.
**Why they get stuck:** They either hardcode against whatever the flag happens to be at run time (non-deterministic) or maintain two separate, drifting test files instead of one parameterized test.

### B17. Login goes through Google OAuth via a popup with its own consent screen. Do you automate the real Google login in CI?
**Ideal approach:** Mock the identity-provider response for the bulk of tests — intercept the OAuth callback and return a pre-crafted token/assertion, exercising your app's auth handling without depending on Google's UI, rate limits, or bot detection. Reserve a small separate suite that exercises a real IdP login, since some regressions only show up in the actual redirect/popup/consent flow — don't make every test pay that cost.
**Why they get stuck:** They either try to automate the real provider everywhere (slow, rate-limited, breaks on UI changes) or mock so completely that a real integration bug would never surface anywhere.

### B18. QA needs to test "a session that expired 2 minutes ago" without waiting 2 real minutes. How?
**Ideal approach:** Since the app trusts whatever token is present, craft a token with an already-past expiry (or a malformed claim) and inject it directly via storageState/cookies rather than logging in and waiting — the same token-injection technique used for role-based auth, applied to an edge case that would otherwise be slow or flaky to reproduce naturally.
**Why they get stuck:** They try to reproduce expiry by actually waiting, or assume expired/malformed-token states can only be tested manually.

### B19. Marketing wants the confirmation page screenshot-tested in English (LTR) and Arabic (RTL). What's different about the RTL screenshot test?
**Ideal approach:** Set locale as with any localization test, but pay specific attention to layout mirroring — element order, icon direction, and alignment flip in RTL, so the Arabic baseline is a genuinely different image, not translated text in the same layout. Keep masks for dynamic content consistent across both baselines.
**Why they get stuck:** They screenshot-test the translated text but don't expect the whole layout to mirror, so real RTL bugs (icons still pointing the LTR way) never get caught because nobody set an RTL-aware baseline.

### B20. Product wants proof a "saving…" spinner behaves correctly on a slow 3G connection, not just on your dev machine's fast one. How, without a slow network in the room?
**Ideal approach:** Throttle the network at the DevTools Protocol (CDP session) level — set download/upload throughput and latency to slow-3G-like values for the test — so requests genuinely take longer and the spinner's real behavior gets exercised, then assert loading and success states in sequence.
**Why they get stuck:** They either treat this as "not really automatable" or fake it with `page.route` delays, without knowing CDP throttling exists and behaves closer to real degraded-network conditions.

### B21. The exact same hCaptcha challenge appears only when tests run against staging, never locally. What's different?
**Ideal approach:** Same environment-drift triage muscle as any CI-only flake: bot-detection scores requests on signals like IP reputation, ASN, and traffic patterns that differ between a developer's home network and shared CI infrastructure, so staging can trigger a challenge local never sees. The fix lives at the environment level — a test-key bypass or allowlisted CI IP range coordinated with security — not in test code.
**Why they get stuck:** They assume it's a flaky test to fix with retries, when it's actually a signal that staging's bot-detection posture needs an explicit test exception.

### B22. A live-updating dashboard must reconnect and catch up if the WebSocket drops mid-session. How do you test that?
**Ideal approach:** Combine offline emulation with the WebSocket-aware wait pattern: drop the connection mid-test with `context.setOffline(true)`, assert a "reconnecting" state appears, restore with `setOffline(false)`, then assert the dashboard catches up to the latest data — not merely that the socket reopened.
**Why they get stuck:** They verify the socket reconnects but stop there, missing whether the app actually resyncs the data it missed while disconnected — the more common real bug.

### B23. Signup requires a one-time code sent by SMS/email, and you don't control that provider in CI. How do you test the flow?
**Ideal approach:** Intercept and mock the OTP verification endpoint the app calls, returning success/failure bodies for the cases you need (correct code, wrong code, expired code) rather than trying to receive a real SMS or email in CI. This exercises the app's handling of the verification response without a slow, non-deterministic delivery channel in the loop; reserve any real-provider test for a small, separate, non-blocking suite.
**Why they get stuck:** They either wire a real test phone number/inbox into CI (slow, flaky, costly) or skip testing the OTP step entirely, missing that the verification endpoint is just another API to mock.

### B24. A form has five independent validation rules. QA wants one test run to report all five failures on empty submit, not stop at the first. How?
**Ideal approach:** Use a soft assertion for each field-level check instead of a normal one. Soft assertions don't halt the test on failure — they're collected, and the test is marked failed at the end with every failure reported, which is far more useful than a hard assertion that stops at field one and leaves fields two through five unverified.
**Why they get stuck:** They either write five separate tests (more setup duplication, slower) or don't know soft assertions exist and settle for only ever seeing the first failing field per run.

### B25. A route mock makes a "create user" test pass, but in production the same form sends malformed request bodies the real API rejects. How does a mock hide a bug like this?
**Ideal approach:** A route handler that unconditionally returns success proves the frontend can handle a success response — it proves nothing about whether the frontend sent a valid request. Guard against this by asserting on the intercepted request's method, path, and body shape inside the handler before fulfilling, so the mock only returns success when the outgoing request actually looks right; an unexpected shape fails the test instead of silently passing.
**Why they get stuck:** They treat mocking as one-directional — controlling what comes back — and don't think to validate what went out, so a mock can pass while masking a client-side bug that would fail against the real backend.

### B26. Two people edit the same record; the second save should be rejected with a conflict, not silently overwrite the first. How do you test that, and what should the UI preserve?
**Ideal approach:** Mock the save endpoint to return a version-conflict response after submission, and assert two things: the conflict message appears, and the user's own unsaved edits are still visible in the form rather than wiped out by the failed save. Losing someone's typed input on a conflict is usually the more damaging bug than the conflict itself.
**Why they get stuck:** They test that a conflict is detected but forget to assert the input-preservation half — which is usually the actual source of user complaints in production.

### B27. A teammate commits `playwright/.auth/admin.json` to the repo so CI can reuse it. What's wrong, and what should happen instead?
**Ideal approach:** A storageState file contains live cookies and tokens — it's a credential, not a fixture. Committing it leaks real session access to anyone with repo read access, and it will silently go stale. Generate it fresh in a protected CI-only setup step, write it to a gitignored output directory, and handle it exactly like any other secret in the pipeline.
**Why they get stuck:** Because it looks like "just a JSON file with cookies in it" rather than a labeled password, candidates don't immediately categorize it as something needing the same handling as an API key.

### B28. A developer refactors a form and, not realizing tests depend on it, removes the `data-testid` attributes "because they're not used by the app." What's the fix — for this instance, and going forward?
**Ideal approach:** The immediate fix is mechanical — restore the attributes, or migrate those locators to role/label-based selectors if that's actually more robust long-term. The real fix is process: a test-only attribute is a contract between test code and product code, and needs to be visible to whoever could break it — a lint or code-owners rule flagging `data-testid` removal in PRs touching tested components, or, better, migrating to role/label locators wherever a real accessible name exists, so the "contract" is the same accessibility attributes the app needs anyway rather than a test-only add-on nobody outside QA has a reason to preserve.
**Why they get stuck:** They fix the immediate breakage and move on, without addressing that a test-only attribute with no other purpose in the app will keep getting stripped by anyone who doesn't know it's load-bearing.

### B29. Your product exposes a GraphQL API instead of REST. How does testing change?
**Ideal approach:** The mechanics are similar to REST via the `request` fixture (POST a query/variables body, assert on the JSON shape), but interception differs: nearly all GraphQL traffic hits a single endpoint, so `page.route()` matching by URL alone can't distinguish operations — match the URL, then inspect the parsed request body's operation name to route only the specific operation you want to mock, letting everything else through. Errors look different too: a GraphQL response can return HTTP 200 with an `errors` array in the body instead of a non-2xx status, so status-code-based error assertions silently miss GraphQL-level failures — assert on the response body's `errors` field explicitly.
**Why they get stuck:** They apply REST assumptions wholesale — routing purely by URL, checking only HTTP status for success/failure — and don't realize GraphQL's single-endpoint, always-200 conventions break both.

### B30. The product is mid-redesign: some users see the legacy UI, others the new one, based on account creation date — not a flag you control in a test. How do you keep one suite covering both?
**Ideal approach:** Treat "which UI version" as just another piece of context the test needs, the same way role or locale is: parameterize page objects or locators by UI version, and drive version selection from a test account whose creation date is deliberately set to fall on the side you want, rather than hoping a random real account lands on the right variant. Run the core journeys against both versions; retire the legacy-version tests on the same day the legacy UI is retired, not before.
**Why they get stuck:** They either maintain two entirely separate, drifting test suites (double the maintenance) or only test whichever version the CI test accounts happen to have gotten, silently losing coverage of the other.

---
### B31. How do you design test cases for an age field that accepts 18–65?
**Ideal approach:** Use equivalence partitioning (invalid below 18, valid 18–65, invalid above 65) plus boundary-value analysis at 17/18/19 and 64/65/66. Automate the critical boundaries in API/unit where cheap; keep a thin UI check for the user-visible error message. Do not invent dozens of mid-range E2E paths.
**Why they get stuck:** They only list happy-path ages (30, 40) or explode into combinatorial UI cases without naming EP/BVA.

### B32. Playwright pierces open shadow roots automatically. What breaks with a closed shadow root, and what is `css:light` for?
**Ideal approach:** Closed shadow roots cannot be pierced — you need a public API, test IDs on the host, or slots that surface content to light DOM. `css:light` restricts matching to light DOM only when you must avoid piercing open roots. Interview signal: know the limit, not just “Playwright handles shadow DOM.”
**Why they get stuck:** They claim all shadow DOM is auto-pierced, then fail a closed-root follow-up.

### B33. When would you use Appium (or Maestro/Detox) instead of Playwright for “mobile”?
**Ideal approach:** Playwright covers mobile-*web* emulation (viewport, user-agent, touch). Native and hybrid apps need Appium/Maestro/Detox with context switching for webviews. Saying “Playwright does mobile” without that distinction is a classic gotcha.
**Why they get stuck:** They conflate device emulation with native automation.

### B34. How do worker-scoped fixtures differ from test-scoped ones, and what is `mergeTests` for?
**Ideal approach:** Worker-scoped fixtures set up once per worker process (expensive shared resources); test-scoped run per test. `mergeTests` composes fixture sets from different modules without hand-rolling a mega-fixture file. Prefer worker scope only when isolation still holds.
**Why they get stuck:** They put mutable shared DB state in a worker fixture and cause parallel flakes.

---
