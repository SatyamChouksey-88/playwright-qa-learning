---
tier: PF
tier_key: productionFailures
id: production-failures
title: Production failure war room — 14 real incident shapes
lead: These aren't flaky-test trivia — they're the "the pager went off, walk me
  through it" questions senior and lead loops use to separate people who can
  read a symptom from people who can find a root cause. Every entry follows
  the same shape investigators actually use — Symptom → Investigation → Root
  cause → Fix → Prevention — because interviewers are grading your *order of
  operations*, not just your final answer.
difficulty: senior
topic: production-incidents
pw_version_introduced: "1.40"
---

# Production failure war room

Fourteen incident shapes, each with the exact symptom a teammate would paste into Slack, the investigation steps in the order a competent on-call engineer would actually take them, the root cause, the fix, and — the part candidates skip — how you stop it from paging you again. Read the symptom line out loud before reading further; most of the signal is in whether your first three investigation steps match.

*Quick index: PF1 login fails only after deploy · PF2 CAPTCHA only in CI · PF3 token expires mid-suite · PF4 download OK local, fails Jenkins · PF5 parallel collisions on shared staging · PF6 random timeouts after deploy · PF7 shadow DOM breaks after library upgrade · PF8 micro-frontend locator drift · PF9 API 500s only in staging · PF10 dynamic iframe id churn · PF11 flake wave after browser update · PF12 CI-provider pipeline failure · PF13 intermittent TLS/DNS failures · PF14 worker OOM after N tests*

---

### PF1. Every login test was green before the release and starts failing right after — the deploy notes don't mention auth

**Symptom:** `npx playwright test auth.spec.ts` goes from 100% green to failing on `expect(page).toHaveURL('/dashboard')` immediately after a production/staging deploy finishes. No code review mentions the login form.

**Investigation:**
1. Don't touch the test first — reproduce manually in a real browser against the same environment. If a human also can't log in, this is a product incident, not a test problem, and the fix is a bug ticket, not a locator change.
2. If a human *can* log in but the test can't, open the trace and compare the failing run's network panel against a known-good one. Look specifically at the login POST/redirect chain and response headers (`Set-Cookie`, CORS, CSP).
3. Check whether the deploy shipped a CSRF token rotation, a cookie `SameSite`/`Secure` attribute change, a new redirect hop (e.g., an added SSO intermediate page), or a renamed field/route that the test's locator or `waitForURL` pattern no longer matches.
4. Diff the deploy's changelog against infra config, not just app code — a load balancer/CDN config change (new domain, HTTPS-only cookie flag) breaks auth without a single line of frontend code changing.

**Root cause (typical):** The deploy enabled a stricter cookie policy (`SameSite=Strict` or added a new auth redirect step for a security fix) that a real user's browser handles transparently, but the test's `waitForURL('/dashboard')` was matching an intermediate URL that no longer exists, or the test's stored `storageState` predates the cookie policy change and is now silently rejected.

**Fix:** Re-record `storageState` post-deploy (stale auth artifacts are themselves a common false failure — see PF3), broaden or correct the `waitForURL` pattern to the *actual* final URL rather than a hardcoded guess, and if a redirect hop was added, assert on the intermediate step explicitly instead of skipping past it.

**Prevention:** Treat auth as a canary, not just another suite — run the login smoke test immediately post-deploy in a dedicated fast gate before the rest of regression runs, so an auth break pages someone in minutes, not after a 45-minute suite finishes. Version `storageState` generation alongside the deploy pipeline so stale auth artifacts can't silently mask (or fake) a real break.

**Related:** A9 (storageState setup), B27 (storageState hygiene), C21 (mid-session expiry).

---

### PF2. The suite hits a CAPTCHA challenge in CI but never locally, on the same branch

**Symptom:** `npx playwright test` is clean on every engineer's laptop. The exact same commit in CI shows a reCAPTCHA/hCaptcha widget on the login page and every downstream test fails.

**Investigation:**
1. Confirm it's really CAPTCHA and not a false read — screenshot the failing step; some bot-detection systems show a generic "verify you're human" interstitial that looks different from the dev-facing CAPTCHA widget.
2. Compare the *identity* CI presents to the app: IP range (cloud CI egress IPs are shared and frequently pre-flagged by bot-detection vendors), User-Agent, TLS fingerprint, and whether CI runs headless vs headed (some bot-detection specifically flags headless signals).
3. Check whether the CAPTCHA is truly random/risk-based (Google reCAPTCHA v3-style scoring) — if so, it may pass most of the time and only trip when CI's shared IP has recently been used for scraping by someone else entirely, which explains "usually fine, sometimes not."
4. Ask: is there a test-only bypass (site key swap, env flag) that's configured for local `.env` but missing from CI secrets?

**Root cause (typical):** The non-prod/test environment's CAPTCHA is driven by a real (or misconfigured) site key instead of a test key, and/or CI's shared cloud IP range has a worse bot-reputation score than a developer's residential/office IP, so risk-based CAPTCHA triggers there specifically.

**Fix:** Get a CAPTCHA-provider test key issued for non-production environments (Google and hCaptcha both support this) and wire it into CI secrets exactly like the local `.env`, so CI presents the same low-friction path a developer's browser does. Never attempt to solve a real CAPTCHA programmatically or via a solver service — that's a fragile arms race and a legal/policy red flag in most orgs.

**Prevention:** Make "CAPTCHA disabled or on a test key in every non-prod environment" a checked item in environment provisioning, not something rediscovered per incident. If a real CAPTCHA ever appears in CI, treat it as a signal to fail fast and alert — not a trigger to add retries or a solver, which just hides an environment misconfiguration.

**Related:** A13 (CAPTCHA policy), B21 (staging-only CAPTCHA), S10 (CAPTCHA on login).

---

### PF3. A 90-minute nightly suite starts failing on authenticated requests around the 45-minute mark, every night, same spot

**Symptom:** The first half of the nightly regression run is green. Starting roughly halfway through, previously-passing authenticated tests begin failing with 401s or being redirected to the login page, and it gets worse toward the end of the run.

**Investigation:**
1. Note that it's time-based, not test-order-based — rerunning the exact tests that failed, in isolation, passes. That rules out a test-logic bug and points at something that expires on a clock.
2. Check the access/refresh token's TTL against the total suite runtime. A 60-minute access token in a 90-minute suite will start expiring mid-run for any worker whose storageState/token was minted at suite start.
3. Confirm whether the app's frontend has silent token-refresh logic (interceptor that refreshes on 401) that a real user's browser benefits from but the test's raw `storageState` cookie/token doesn't get, because the test never runs the app's own refresh interceptor before hitting an API directly.
4. Check whether all workers shared one `storageState` file generated once, versus each worker/project having independently minted, freshly-scoped tokens.

**Root cause (typical):** `storageState` (or an injected bearer token) was generated once at the start of the run and reused for the suite's full duration, and the access token's TTL is shorter than the suite's wall-clock time — so tests running late in the suite carry an expired token, while short local runs never surface it.

**Fix:** Either mint a longer-lived token specifically for the test environment (coordinate with backend — this is a config change, not a workaround), or implement token refresh in the test layer itself (a fixture that checks token age before each test and re-authenticates if it's past a safe threshold), or re-run the login/storageState setup project periodically (e.g., once per shard, or via a worker-scoped fixture that re-authenticates every N minutes) rather than once globally.

**Fix (code sketch):**
```ts
// fixtures/auth.ts — re-mint storageState if it's getting stale
export const test = base.extend<{}, { freshAuth: void }>({
  freshAuth: [async ({}, use) => {
    const state = readAuthFile();
    if (Date.now() - state.issuedAt > TOKEN_SAFE_WINDOW_MS) {
      await reauthenticateAndPersist();
    }
    await use();
  }, { scope: 'worker', auto: true }],
});
```

**Prevention:** Make token TTL a known, documented property of the test environment (it should be longer than your longest suite, or your suite should shard short enough to never approach it). Don't diagnose this as "flaky" — a symptom that reliably worsens toward the end of a long run is a decay pattern, not randomness, and decay patterns almost always trace to something with a clock (tokens, in-memory caches, log/disk rotation).

**Related:** B18 (expired-token injection), C21 (mid-session expiry), S16 (session expires mid long suite).

---

### PF4. File-download tests are green on every developer machine and fail every time on the Jenkins agent

**Symptom:** `download.spec.ts` passes locally on macOS and Windows dev machines. The identical test on the Jenkins Linux agent times out waiting for the `download` event, or the saved file has 0 bytes / can't be parsed.

**Investigation:**
1. Read the Jenkins console log fully, not just the failure summary — a `waitForEvent('download')` timeout with no other error usually means the click that should trigger the download never fired the browser's download machinery at all in that environment.
2. Check headless vs headed: some download flows (a `<a download>` link vs. a `window.open` to a blob URL vs. a server `Content-Disposition: attachment` response) behave differently under headless Chromium depending on version, and Jenkins agents often run an older cached browser binary than a developer's freshly-installed one.
3. Check the download *destination* — Jenkins agents frequently run as a restricted service account without a writable default download directory, or with `acceptDownloads` not explicitly configured, silently swallowing the event.
4. If the file downloads but reads as corrupt/empty, check whether Jenkins' workspace disk was actually full or being cleaned mid-run, and whether antivirus/security scanning software present only on the CI image is intercepting the file (a real thing on locked-down Windows CI agents).

**Root cause (typical):** Two common ones — (a) the Playwright/browser binary version on the Jenkins agent predates the one used locally, and older headless Chromium builds handle certain download-triggering patterns differently; or (b) `acceptDownloads` isn't explicitly set and/or the agent's user account has no writable temp/download directory, so the download silently fails to materialize where the test expects it.

**Fix:** Pin and cache the exact Playwright/browser version between local and CI (the official `mcr.microsoft.com/playwright` Docker image is the most reliable way to guarantee this), explicitly set `acceptDownloads: true` and a known-writable `downloadsPath` in config, and always start the wait before the triggering click:
```ts
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Export CSV' }).click(),
]);
const filePath = await download.path();
expect(fs.statSync(filePath!).size).toBeGreaterThan(0);
```

**Prevention:** Run CI inside the same Docker image family locally at least once per onboarding/debugging session so "works on my machine" stops being a believable excuse — parity is a Docker pull away, not a debugging session. Add a byte-size/parse assertion (not just "the download event fired") so a corrupt-but-present file still fails loudly.

**Related:** A7 (download capture), S34 (download content validation).

---

### PF5. Fifty tests pass one at a time; running the full suite against shared staging produces random failures in different tests each run

**Symptom:** `npx playwright test --workers=1` is 100% green. `npx playwright test` (parallel, default workers) against the shared staging environment fails 3–8 different tests each run, with no consistent culprit.

**Investigation:**
1. Confirm parallelism is the variable, not code — the same suite, same commit, only the worker count changes the outcome. That already rules out "the app is broken."
2. Grep the failing tests for anything that reads or writes a *named* resource instead of a unique one: a hardcoded username/email, a fixed order ID, a single "test customer" account, a shared uploaded file, a global feature-flag toggle.
3. Check whether `storageState` is a single shared file used by every worker simultaneously — Playwright isolates cookies/localStorage per `BrowserContext`, but if every context loads the *same* server-side session, the backend sees one user being hammered from N directions, and things like "logout in test A" can invalidate test B's session mid-run.
4. Look for shared mutable staging state outside the browser entirely: a database row, an inbox, a rate limiter, a queue — Playwright's per-test isolation only covers the browser side; server-side state is the team's responsibility.

**Root cause (typical):** Several tests were written assuming exclusive ownership of one seeded account/order/record, which was safe under serial execution but becomes a race the moment multiple workers touch the same row concurrently — worker A's teardown deletes the record worker B is mid-assertion on, or worker A's status-change overwrites worker B's expected state.

**Fix:** Generate unique data per test (faker-based emails/order references, not the same three "test users" reused everywhere), give each worker its own account/tenant via a worker-scoped fixture rather than one global login, and audit for any `DELETE`/`PUT` in a fixture teardown that isn't scoped to data that test alone created.

**Prevention:** Add a lightweight "parallel safety" checklist to PR review for new tests: does this test create its own data, or reach for something shared? Run new suites at 4x+ your normal worker count once before merging as a stress pass — races that show up 1-in-50 at normal concurrency often show up 1-in-5 at higher concurrency, which is a much cheaper way to find them than production nightly flake reports.

**Related:** C3 (test data across parallel/sharded suites), C15 (parallel-auth flakiness), S13 (50 tests pass serially, fail in parallel).

---

### PF6. Every timeout in the suite got noticeably worse the day after a routine deploy, but nothing in the diff touches the pages that are timing out

**Symptom:** Test durations across the board (not one feature) creep up, and previously-comfortable timeouts start tripping, starting exactly at a deploy timestamp. The deploy's diff is a backend service unrelated to the pages now timing out.

**Investigation:**
1. Resist the instinct to bump timeouts first — a suite-wide, deploy-correlated slowdown is an infrastructure signal, not 40 unrelated test bugs appearing simultaneously.
2. Check whether the deploy changed a shared dependency: a CDN cache invalidation (everything now fetches uncached, cold), a database migration running in the background consuming capacity, a new synchronous call added to a shared middleware/analytics layer that every page now waits on, or an autoscaling config regression that reduced available backend capacity.
3. Pull APM/infra metrics (response time percentiles, CPU, DB connection pool saturation) for the same window — if p95 latency across the board jumped at the same timestamp the deploy landed, that's your correlation, independent of what the deploy's code diff claims to touch.
4. Check whether the deploy included a dependency bump (ORM, HTTP client, logging library) with a known performance regression — these routinely ship without being called out in release notes as "affects unrelated endpoints."

**Root cause (typical):** A shared middleware layer (auth check, feature-flag evaluation, logging/analytics call) added a new synchronous network hop that every request now pays, or a cache was invalidated/misconfigured so every page request now does real work it used to skip — neither shows up as "changed" in the page-specific code the tests exercise.

**Fix:** This is a performance regression, not a test flakiness problem — file it as a product/infra bug with the correlating metrics attached, rather than quietly loosening timeouts across the suite (which hides the regression from the people who can actually fix it). Once the regression is fixed, timeouts should return to their prior comfortable margins without being touched.

**Prevention:** Track suite-wide median/p95 test duration over time as a metric, the same way you'd track app latency — a slow creep across many unrelated tests is a leading indicator of a shared-layer regression days before customers notice, and it's a much faster signal than waiting for a support ticket.

**Related:** C12 (Core Web Vitals gate), D28 (CI cost from over-provisioning is the inverse of this — worth contrasting).

---

### PF7. A component library upgrade turns every locator inside a design-system widget invisible to Playwright

**Symptom:** After bumping a UI component library (e.g., a design-system package) to its next major version, dozens of tests fail with "element not found" on controls that are visibly present and clickable when you look at the actual page.

**Investigation:**
1. Open DevTools Elements panel on the live page (not just the Playwright trace) and check whether the component now renders inside a **shadow root** where it previously rendered plain DOM — library upgrades that move to Web Components (common in design-system rewrites) do exactly this.
2. If it's a shadow root, determine **open vs closed** mode — `element.shadowRoot` returns non-null for open roots (Playwright pierces these automatically via role/text/label locators) and `null` for closed roots (unreachable by any automation tool, not a Playwright limitation).
3. Check the library's changelog/migration guide specifically for "Shadow DOM," "Web Components," or "encapsulation" — this is exactly the kind of breaking change vendors bury in a migration guide rather than a headline.
4. Confirm the locator strategy that broke — CSS selectors reaching into what's now a shadow boundary will silently return zero matches (no error about "shadow root," just "not found"), which is what makes this confusing to triage from the error message alone.

**Root cause (typical):** The library's new major version wraps its components in **open** shadow DOM for style encapsulation. Role/label/text-based locators keep working because Playwright pierces open shadow roots automatically; CSS selectors written against the old plain-DOM structure (especially anything crossing what's now the shadow boundary) stop matching.

**Fix:** Re-locate broken elements using accessible-role/label/text locators, which need no change for open shadow roots. If a control's accessible name/role didn't survive the rewrite (a real regression to flag separately), request a `data-testid` on the shadow host element. If the library ships **closed** shadow roots, there is no automation-side fix — that requires the library to expose a testing mode or stable host-level test IDs; escalate to the library maintainers or product, don't spend a sprint trying to defeat closed encapsulation.

**Prevention:** Treat every major version bump of a UI library as a spike, not a routine dependency update — run the full suite against the new version in an isolated branch before merging, specifically checking rendering structure (shadow DOM, portal/teleport rendering, iframe wrapping) since these change locator strategy even when the *visual* output looks identical.

**Related:** Multi-context & pages gap page (`#multi-context`, open vs closed shadow roots), B7 (Stripe iframe + shadow DOM).

---

### PF8. Three teams each own a slice of the same page as independent micro-frontends, and locators that worked last sprint now hit the wrong team's element

**Symptom:** A locator like `page.getByRole('button', { name: 'Continue' })` used to resolve to exactly one element. After another team's micro-frontend shipped a change, the same locator now throws a strict-mode violation or clicks the wrong team's button, even though your team touched nothing.

**Investigation:**
1. Confirm the page is genuinely composed of independently-deployed micro-frontends (check for multiple JS bundle origins, an iframe-per-team architecture, or a shell app that mounts separately versioned modules) rather than one monolithic frontend — this changes the whole diagnosis.
2. Identify which team's deploy landed around the time the locator broke — in a micro-frontend setup, "nobody on my team changed anything" is compatible with "something on this exact page changed," because ownership is split at a level your test doesn't see.
3. Check whether each micro-frontend was supposed to scope its own accessible names/test-ids uniquely and one team's component introduced a generic, unscoped name ("Continue," "Submit," "Close") that now collides with another team's control on the same composed page.
4. Determine whether the composition boundary is real isolation (separate iframes, genuinely separate DOM subtrees) or just visually-separate divs sharing one DOM tree — the fix differs.

**Root cause (typical):** No cross-team naming contract for accessible names/test-ids, so two independently-shipped micro-frontends chose the same generic control name, and a locator written against "the page" instead of "this team's region of the page" now matches both.

**Fix:** Scope every locator to its owning micro-frontend's container first — `page.getByTestId('checkout-mfe').getByRole('button', { name: 'Continue' })` — rather than querying the whole page. If genuine iframe boundaries exist, use `frameLocator` per micro-frontend. Push back organizationally for a naming convention (team-prefixed test-ids, e.g. `data-testid="checkout-continue-btn"`) so this collision class stops recurring.

**Prevention:** In a micro-frontend architecture, locator scoping-to-container should be a written framework convention, not an individual test author's judgment call each time — bake a `withinModule(name)` helper into the shared framework so nobody writes an unscoped page-wide locator by habit. Cross-team a11y-name/test-id linting at build time catches the collision before it ships, not after a test fails.

**Related:** D35 (acquisitions + micro-frontends), C20 (duplicate accessible names — same underlying defect class, different cause).

---

### PF9. The API returns 500 on the exact same request in staging, but 200 in both production and local dev

**Symptom:** A Playwright API test (or a UI test whose page makes the call) gets a 500 from an endpoint only in the staging environment. The same payload against production and against a developer's local backend returns 200 every time.

**Investigation:**
1. Capture the full 500 response body and any request ID/correlation ID it returns — most backends emit a trace ID in a 500 response or header even without a friendly error message; without it you're debugging blind.
2. Get backend logs or APM traces for that request ID specifically, rather than guessing from the frontend — the actual stack trace almost always identifies the failing line in under a minute, versus hours of frontend-side guessing.
3. Diff staging's config against production's for the specific dependency the failing endpoint touches: feature flags enabled only in staging, a different (often smaller/differently-seeded) database, a third-party integration pointed at a sandbox that's down or rate-limiting, or staging running a newer/older service version than production due to deploy-order drift.
4. Check whether staging shares infrastructure with other test suites/teams running concurrently — a shared staging DB can be in a state (missing seed row, a record another suite just deleted) that neither prod nor a fresh local DB would ever be in.

**Root cause (typical):** Staging environment drift — most commonly a feature flag or config value that only exists in staging (testing an in-progress feature) hitting a code path that isn't fully implemented yet, or a downstream dependency (payment sandbox, email provider test mode) that's misconfigured or degraded specifically in the staging tier.

**Fix:** This is a real bug or environment misconfiguration, not a test problem — attach the request ID, response body, and environment diff to a ticket for the owning team. If the flag/config causing it is intentional (feature genuinely incomplete), the test should be tagged/skipped against staging with a tracked reason, not left red as unexplained noise, and not "fixed" by pointing the test at production instead.

**Prevention:** Treat environment parity as a tracked, owned thing (a checklist or automated drift-detector comparing staging/prod config keys), not an assumption. Attach correlation/request IDs to Playwright's failure output automatically (via a response header your fixture captures) so "which backend request failed and why" is answered by the test report itself, not a follow-up Slack thread.

**Related:** S3 (API 200 but UI blank — same "check the actual response, not just the status" discipline, inverted).

---

### PF10. An iframe's `id` attribute is different every deploy, and the frame locator that worked yesterday can't find it today

**Symptom:** `page.frameLocator('#payment-frame-a1b2c3')` (or similar) works right after it's written, then silently fails to find any elements a few deploys later — with no visible change to the payment widget itself.

**Investigation:**
1. Inspect the live DOM's iframe element and compare its `id`/`name` attribute across two different deploys or page loads — a build-hash-suffixed or randomly-generated id (common with bundlers or third-party embed scripts that namespace their iframe per session/build) will visibly differ.
2. Check whether the iframe is first-party (your own app) or third-party (an embedded payment/chat/support widget) — if third-party, the id format is entirely outside your team's control and can change on the vendor's schedule without any notice to you.
3. Determine what *is* stable about the frame: its position (nth iframe on the page), a stable parent container's test-id, the frame's `src` URL pattern, or its accessible title — one of these is usually deploy-invariant even when the raw `id` isn't.
4. Confirm this is really an id-churn issue and not the frame simply not being ready yet (a timing issue) — a trace comparison between a passing and failing run's timeline resolves this in seconds.

**Root cause (typical):** The id is generated per-build or per-session (a bundler content hash, or a vendor-embedded widget's auto-generated container id) and was never a stable identifier to begin with — the original locator happened to work because it was written against one specific build's output.

**Fix:** Stop matching on the volatile `id` and match on something structurally stable instead:
```ts
// Fragile — id churns per build
page.frameLocator('#payment-frame-a1b2c3');

// Stable — match by src pattern or position within a stable parent
page.frameLocator('iframe[src*="/payments/widget"]');
// or, scoped to a stable container:
page.getByTestId('payment-section').frameLocator('iframe');
```
If it's a third-party embed with no stable attribute at all, ask the embedding team/vendor for a `data-testid`/`title` on the iframe element itself — that's a reasonable, common ask.

**Prevention:** Add "never locate by a build-generated id" to the same locator-priority guidance that already tells people to prefer role/label over CSS — the failure mode is the same instinct (grab whatever DevTools shows you) applied to a frame instead of a button.

**Related:** B7 (Stripe iframe + shadow DOM), A3 (unstable locators).

---

### PF11. A scheduled browser-binary update lands and hundreds of previously-stable tests fail overnight with no app deploy involved

**Symptom:** CI's nightly run (or a Dependabot-style bump of `@playwright/test`) fails 200+ tests across unrelated features, all on the same morning, with zero application changes in that window.

**Investigation:**
1. Confirm the correlation first — check whether the Playwright/browser version actually changed in that CI run versus the last green one (`npx playwright --version`, lockfile diff), before assuming it's the cause.
2. Pin the previous Playwright version locally (Playwright ships specific browser builds per release, so pinning the package also pins the browser) and re-run the same failing tests — if they pass on the old pin and fail on the new one with identical app code, the browser update is confirmed as the variable.
3. Triage by *pattern*, not test-by-test: pull the failure messages for 15–20 of the newly-broken tests and cluster them — a mass failure from one root cause (a stricter default security policy, a changed rendering behavior, a modified default timeout, a selector-engine edge case) usually clusters around one shared code path or API, not 200 independent breaks.
4. Check the Playwright/browser release notes for the specific version range for "breaking changes" — browser engine updates occasionally change real behavior (stricter CSP enforcement, changed default focus behavior, a fixed bug that some tests were unintentionally relying on).

**Root cause (typical):** Either the new browser build enforces something more strictly than before (surfacing test bugs that were always latent, like relying on force-clicking through an actionability check the old engine used to allow), or a genuine engine behavior change affects one shared pattern (e.g., a changed default for a permission, or timing around a specific event) that many tests happen to depend on.

**Fix:** Once the shared root cause is identified, fix that one code path or add one compatibility shim rather than patching 200 tests individually — in most real incidents of this shape, the actual fix is under 10 lines once correctly diagnosed, and the other 190 "failures" resolve themselves.

**Prevention:** Run new Playwright/browser versions against the full suite in a separate, non-blocking canary CI job *before* adopting them in the default pipeline — this converts "200 tests failed overnight in front of everyone" into "the canary job flagged 3 real issues last week, quietly."

**Related:** A24 (browser-upgrade breaks 2,000 tests — same shape at junior-tier framing), S32 (browser upgrade breaks 2000 tests overnight), D17-adjacent canary-first philosophy.

---

### PF12. The CI provider's own pipeline breaks the build — no test code, app code, or config in your repo changed

**Symptom:** Every job fails at the "install dependencies" or "run tests" step with an error that has nothing to do with your application — a runner image update removed a system library Playwright's browsers depend on, a hosted-runner default Node version bumped and something in the toolchain no longer resolves, or the CI provider is having a documented outage.

**Investigation:**
1. Check the CI provider's status page and recent changelog for hosted runner images *before* debugging your own pipeline — a same-day, org-wide pattern (multiple unrelated repos failing identically) points outward, not at your commit.
2. Read the actual failure line, not the job summary — `libnss3` / `libatk` / similar missing shared-library errors on a Linux runner almost always mean the runner's base image changed what's preinstalled, which is exactly what Playwright's own dependency-installation step (`npx playwright install --with-deps`) exists to make resilient to.
3. Confirm whether your pipeline pins a runner image/tag (`ubuntu-22.04` vs `ubuntu-latest`) — `latest`-style tags are the single most common cause of "nothing changed but the pipeline broke," because the provider silently moved what "latest" points to.
4. If using a self-hosted runner, check for host-level drift (an OS security patch, a Docker base image auto-update) the same way — self-hosted removes the "it's the vendor's fault" narrative but not the root cause pattern.

**Root cause (typical):** A floating/`latest`-tagged CI runner image moved out from under the pipeline, changing preinstalled system dependencies that Playwright's browser binaries need, or the official Docker image tag in use (`mcr.microsoft.com/playwright:vX.Y.Z`) drifted from the `@playwright/test` version pinned in `package.json`, so browser binaries and driver no longer match.

**Fix:** Pin exact runner/image versions (`ubuntu-22.04`, or better, a specific `mcr.microsoft.com/playwright:v1.4x.0-noble` tag matching your installed `@playwright/test` version exactly) instead of floating tags, and always run `npx playwright install --with-deps` rather than assuming system libraries are present. If it's a genuine vendor outage, the fix is to wait it out or fail over to a documented manual path — not to "fix" a pipeline that isn't actually broken on your end.

**Prevention:** Version-pin CI images the same way you pin npm dependencies — a `Dependabot`/renovate-style scheduled bump with its own CI run, reviewed like any other dependency change, instead of silent drift. Keep the actual test invocation (install, run, report) in a plain script any CI system calls identically, so a provider outage is a "point a different runner at the same script" problem, not a rewrite.

**Related:** D32 (CI-provider outage — build-vs-buy on redundancy), B11 (CI integration must-haves).

---

### PF13. A handful of tests fail once or twice a week with connection-reset or TLS errors, on no particular test, no particular time

**Symptom:** `net::ERR_CONNECTION_RESET`, `net::ERR_CERT_AUTHORITY_INVALID`, or a bare `page.goto: NS_ERROR_NET_TIMEOUT` shows up on a different test each week, with no pattern by feature, time of day, or recent deploy.

**Investigation:**
1. Resist categorizing this as "generic flakiness" immediately — connection-level errors (as opposed to application-level failures like a wrong assertion) point at network/infra between the runner and the target host, not at the test's logic.
2. Check whether the target environment's TLS certificate is close to expiry, or was recently rotated to a certificate the CI runner's trust store doesn't yet recognize (common with internal CAs on self-hosted staging environments).
3. Check DNS: is the environment behind a DNS name that occasionally resolves to a stale/decommissioned IP (a load balancer being cycled, a blue-green cutover leaving one old target briefly reachable but broken)?
4. Correlate failure timestamps against the target environment's own deploy/restart schedule — a service restart during a rolling deploy briefly drops connections for anyone mid-request, independent of anything in the test.

**Root cause (typical):** Either an internal CA certificate close to or past rotation that intermittently fails validation depending on which runner/cache state hits it, or the target environment does rolling restarts during business hours and a small percentage of requests land exactly during a brief connection-draining window.

**Fix:** For cert issues, fix the certificate/trust-store problem at the infra level (this is not something to work around with `ignoreHTTPSErrors: true` in a real environment — that flag is for genuinely intentional self-signed test setups, not a patch over an expiring prod-like cert). For rolling-restart windows, add a bounded retry specifically at the navigation/request level (not blanket test retries) so a one-off connection drop during a deploy doesn't fail an otherwise-passing test, while still surfacing a *pattern* of them.

**Prevention:** Alert on cert expiry dates for every environment Playwright touches, the same way you'd alert on a production cert (a 30/60/90-day warning avoids ever hitting this reactively). Ask infra whether rolling restarts can happen outside the CI suite's usual run window, or add connection-draining grace periods — a five-minute infra scheduling change is cheaper than months of "occasional flakiness" nobody can pin down.

**Related:** S11 (passes locally, fails only in CI — same "isolate the variable" method).

---

### PF14. The browser process crashes or the whole job gets OOM-killed after a few hundred tests, always around the same count

**Symptom:** A long-running suite (or one worker within it) reliably dies — Chromium crashes, or the CI job is OOM-killed — after roughly the same number of tests each time, regardless of which specific tests those are.

**Investigation:**
1. "Always around the same count" is the key clue — it points at accumulation (a leak) rather than any single test's content, since a content-specific bug would correlate with a *test*, not a *count*.
2. Watch worker memory (RSS) over the course of a local `--repeat-each` run of a representative test — a steadily climbing RSS that never comes back down between tests confirms a leak rather than normal memory churn.
3. Check for un-closed resources accumulating across tests: pages/contexts opened in a test or fixture but never explicitly closed, event listeners registered per-test that are never removed, or always-on video/trace recording retaining large in-memory buffers across an unusually long single worker lifetime.
4. Check whether downloads or large in-memory buffers (e.g., asserting on a big CSV/PDF's full contents in memory rather than streaming/checking a hash) are being retained instead of released.

**Root cause (typical):** A fixture or helper opens a `browser.newContext()` or `context.newPage()` without a matching `close()` in teardown — often inside a helper function nested a few calls deep from the actual test, easy to miss in review — so contexts/pages accumulate for the life of the worker process instead of being freed per test.

**Fix:** Audit every manual `newContext()`/`newPage()` call for a matching `close()`, preferring a fixture that owns both open and close so it can't be forgotten:
```ts
export const test = base.extend<{ extraContext: BrowserContext }>({
  extraContext: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    await use(ctx);
    await ctx.close(); // guaranteed even if the test throws
  },
});
```
Right-size worker count against actual available RAM/CPU rather than maximizing it, and set video/trace retention to failure-only (`retain-on-failure`) rather than always-on for very long runs.

**Prevention:** Monitor worker RSS as a CI metric over time, the same way you'd monitor a production service's memory — a slow climb per test is visible in that graph long before a job starts OOM-killing, and it turns "random crash after 300ish tests" into "caught in a canary run last Tuesday."

**Related:** S14 (Chromium crashes after hundreds of tests — same defect class, junior-tier framing).

---
