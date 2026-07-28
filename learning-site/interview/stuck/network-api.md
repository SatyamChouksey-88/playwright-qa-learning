## Mocking a JSON API response the right way

id: stuck-network-api-mock-json-correctly
category: network-api
severity: common

### Symptom
A `page.route()` mock either doesn't take effect (the real network call still happens), or takes effect but the app doesn't render the mocked data correctly even though the JSON "looks right" when logged.

### Why it happens
Two distinct failure modes hide behind this one symptom: (1) the route's URL glob/predicate doesn't actually match the real request (wrong path, missing query params, or a request method mismatch), so `route.continue()` effectively happens by default and the real network fires; or (2) the mock's shape doesn't match exactly what the app's client code expects (missing a field the UI reads, wrong nesting, wrong types like a string where a number is expected), so the app either crashes silently or renders an empty/error state.

### How to debug it
1. Add a temporary `console.log` inside the route handler to confirm it's actually being invoked at all — if it never logs, the URL pattern doesn't match.
2. Compare the mocked payload's exact shape against a real captured response (from a HAR or the Network tab) field by field.
3. Check the browser console for a client-side error (a `TypeError: Cannot read properties of undefined`) that would explain a "looks right in the mock" payload still failing to render.

### Fix
```ts
test('dashboard renders mocked account data', async ({ page }) => {
  await page.route('**/api/accounts', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accounts: [{ id: 'acc_1', type: 'checking', balance: 4250, currency: 'USD' }],
      }),
    }),
  );
  await page.goto('/dashboard');
  await expect(page.getByTestId('checking-balance')).toContainText('4,250');
});
```

### Best practice
Derive mock shapes from a real captured response (or a shared TypeScript type/schema both the app and tests import) rather than hand-typing JSON from memory, and always register the route before navigation so the very first request is intercepted.

### Common wrong fixes
1. Registering the route *after* `page.goto()` — the initial request may already have fired against the real API before the mock existed.
2. Using `route.fulfill()` with a `body` that's already an object instead of a JSON string with the right `contentType` — some clients then fail to `JSON.parse()` it correctly.
3. Matching the route with an overly broad glob (`**/api/**`) that also intercepts unrelated calls (auth refresh, analytics) — see the JWT-refresh-mid-test entry for what that breaks.

### Interview angle
"Your route mock doesn't seem to work — how do you diagnose whether it's a matching problem or a shape problem?" — senior answer: log inside the handler to confirm it's invoked at all (matching problem if not), then diff the mocked payload against a real response and check the console for client-side errors (shape problem if it is invoked but rendering still fails).

### Related
stuck-network-api-route-not-intercepting, stuck-network-api-graphql-assertion

---

## `page.route()` doesn't intercept anything — a service worker is in the way

id: stuck-network-api-route-not-intercepting
category: network-api
severity: tricky

### Symptom
A `page.route()` handler is registered correctly, matches the right URL pattern by all appearances, and simply never fires — the real network response comes through untouched.

### Why it happens
If the page under test registers its own Service Worker (for offline caching, as this very repo's learning site does), the service worker can intercept the `fetch` at a layer that sits *between* the page and Playwright's route interception in certain configurations, effectively serving a cached response before your route handler ever sees the request. This is a common, easy-to-miss interaction between PWA caching and network mocking.

### How to debug it
1. Check whether the app under test registers a service worker (`navigator.serviceWorker`) and, if so, whether it's active for the origin/scope your test runs against.
2. Try unregistering/bypassing the service worker for the test context and see if the route suddenly starts working — if so, that confirms the theory.
3. Check Playwright's version/docs for current service-worker interception support (`serviceWorkers: 'block'` context option), since behavior here has evolved across versions.

### Fix
```ts
// playwright.config.ts (or per-test context option) — block service workers
// entirely for tests that need full control over network responses.
export default defineConfig({
  use: { serviceWorkers: 'block' },
});
```

### Best practice
For any test relying on precise `page.route()` control, explicitly decide and document whether the service worker should be blocked, allowed-but-empty (fresh cache), or genuinely exercised (a dedicated offline/PWA-behavior test) — don't let it be accidental.

### Common wrong fixes
1. Adding cache-busting query params to try to dodge the service worker — treats the symptom, and can break app code that expects clean URLs.
2. Clearing browser cache manually between steps hoping it also clears the service-worker cache — service worker caches are a separate storage mechanism from HTTP cache.
3. Assuming Playwright's route interception is broken and filing it as a tool bug — usually it's working exactly as configured; the service worker is a genuine, separate interception layer.

### Interview angle
"A `page.route()` mock silently doesn't work on a PWA-style app — what's your first hypothesis?" — senior answer: check whether a service worker is intercepting the fetch before Playwright's route layer sees it, and use the `serviceWorkers: 'block'` context option (or a dedicated cache-bypass strategy) for tests that need precise network control.

### Related
stuck-network-api-mock-json-correctly, stuck-login-auth-jwt-refresh

---

## A HAR replay drifts from what the real API now returns

id: stuck-network-api-har-replay-drift
category: network-api
severity: tricky

### Symptom
Tests using `page.routeFromHAR()` for deterministic playback pass reliably for months, then start failing (or silently rendering stale-looking data) after the real API's response shape genuinely changed — but nobody updated the recorded HAR.

### Why it happens
A recorded HAR is a frozen snapshot of a real interaction at the moment it was captured — by design, it never re-verifies itself against the live API. As the real backend evolves (new required field, renamed field, different pagination shape), the HAR silently becomes an inaccurate stand-in, and the UI code changes that were built to consume the *new* shape then mismatch the *old* recorded response.

### How to debug it
1. Check the HAR file's age/last-updated date against recent API changes (changelog, migration notes) for the endpoints it covers.
2. Diff the HAR's recorded response body against a fresh live capture of the same endpoint/call.
3. Confirm whether the failure is "UI breaks because HAR has old shape" (drift) versus "route pattern in the HAR doesn't match the current request URL" (a different, matching-only problem).

### Fix
```ts
// Treat HAR files as content that needs a refresh workflow, not a one-time capture.
// tools/refresh-hars.mjs (conceptual):
// 1. Hit the real staging API for each recorded interaction.
// 2. Re-record via page.routeFromHAR({ ..., update: true }) against a live session.
// 3. Diff the new HAR against the old one in the PR for reviewers to see the drift.

test('order history renders from a HAR fixture', async ({ page }) => {
  await page.routeFromHAR('tests/fixtures/order-history.har', {
    url: '**/api/orders**',
    update: false, // set true only when intentionally refreshing the fixture
  });
  await page.goto('/orders');
  await expect(page.getByTestId('order-row').first()).toBeVisible();
});
```

### Best practice
Treat HAR fixtures like generated content with an explicit refresh workflow (a periodic job or a pre-release checklist item that re-captures and diffs them), not a "record once and forget" artifact — pair contract or schema tests against the real API so shape drift is caught independently of whether anyone remembers to refresh the HAR.

### Common wrong fixes
1. Hand-editing the HAR's JSON body to patch just the one field that's currently failing — HARs are meant to be captured, not hand-maintained, and manual edits drift further from reality over time.
2. Turning off HAR-based tests and switching to purely manual `page.route()` mocks with no connection to real API shapes at all — loses the main benefit of HAR (realistic recorded traffic) without solving the staleness problem.
3. Ignoring the failure and adding it to a permanent skip list — silently drops coverage instead of scheduling a fixture refresh.

### Interview angle
"A HAR-based test suite starts failing months after it was recorded, with no test code changes — why, and how do you prevent it long-term?" — senior answer: the real API's response shape drifted from the frozen recording; prevent it with a scheduled HAR-refresh workflow and independent contract/schema checks against the live API, not by hand-patching the HAR.

### Related
stuck-network-api-mock-json-correctly, stuck-contract-testing (see also `#contract-testing`)

---

## An API call returns 401 only in CI, never locally

id: stuck-network-api-401-only-ci
category: network-api
severity: common

### Symptom
A test that calls an authenticated API endpoint (directly via `request` fixture, or indirectly via the app) works fine on every developer's machine but returns 401 consistently in CI.

### Why it happens
The most common cause is an environment-specific secret or config value (an API key, a base URL pointing at a different environment, a required header) that's set in every developer's local `.env` but missing or different in CI secrets — CI runs with its own, separately-configured environment, and a value "just being there" locally doesn't mean it's wired into CI.

### How to debug it
1. Diff the exact request headers sent locally versus in CI (a temporary debug log of `request.headers()` in both environments) — look specifically for a missing/different `Authorization` header or API key.
2. Check the CI workflow file for whether the relevant secret is actually declared and passed as an env var to the test step.
3. Confirm the base URL/environment target is the same in both cases — a 401 can also mean "successfully talking to the wrong environment," not just "missing credential."

### Fix
```yaml
# .github/workflows/practice-suite.yml — ensure the secret is actually wired through
- run: npx playwright test
  env:
    API_KEY: ${{ secrets.API_KEY }}
    BASE_URL: ${{ vars.BASE_URL }}
```
```ts
test('authenticated API call succeeds', async ({ request }) => {
  const res = await request.get('/api/accounts', {
    headers: { Authorization: `Bearer ${process.env.API_KEY}` },
  });
  expect(res.status(), await res.text()).toBe(200);
});
```

### Best practice
Print (or assert on) the presence — never the value — of required secrets as an early, fast-failing CI step, so a missing-secret misconfiguration fails in seconds with a clear message instead of surfacing as a confusing 401 deep inside a test run.

### Common wrong fixes
1. Hardcoding a real API key directly into the workflow YAML "to make it work" — a serious secret-leak risk the moment that file is public or the key is ever rotated.
2. Adding retries around the 401 — a missing/invalid credential doesn't become valid on a second attempt.
3. Weakening the endpoint's auth requirement for the CI environment specifically — tests a materially different security posture than production.

### Interview angle
"An authenticated API test returns 401 only in CI — what's your first check?" — senior answer: diff the actual request headers/secrets between local and CI, since this is almost always a CI secrets/config wiring gap, not a code or timing bug — assert on secret presence as an early, fast-failing CI step going forward.

### Related
stuck-login-auth-rate-limited-ci, stuck-parallel-ci-github-actions-cache

---

## An API returns 500 only in staging, never in production or locally

id: stuck-network-api-500-only-staging
category: network-api
severity: tricky

### Symptom
A specific endpoint reliably 500s when tests hit the staging environment, while the exact same request against production or a local dev server succeeds.

### Why it happens
Staging environments frequently diverge from production in ways that are easy to forget: a thinner database with missing seed/reference data a query silently depends on, a feature flag defaulted differently, a downstream service staging depends on being down or misconfigured, or simply less capacity leading to resource-exhaustion errors under the exact load the test suite generates.

### How to debug it
1. Capture the 500 response body — many APIs include a stack trace or error code in non-production environments that names the actual failure (a missing row, a null dereference, a downstream timeout).
2. Compare staging's feature-flag/config state against production for the endpoint in question.
3. Check whether the failure only happens for specific test data (an account that doesn't exist in staging's thinner dataset) versus universally for the endpoint.

### Fix
```ts
test('order lookup succeeds for a seeded staging account', async ({ request }) => {
  // Ensure the test uses data known to exist in *this* environment's dataset,
  // not an assumption carried over from production.
  const res = await request.get('/api/orders/staging-seed-order-1');
  expect(res.status(), await res.text()).toBe(200);
});
```

### Best practice
Isolate whether a staging-only failure is a data problem, a config/flag problem, or a genuine capacity problem before touching the test — each has a completely different fix, and none of them are solved by changing test code. Seed staging with data your tests own and control, rather than assuming production-shaped data exists there.

### Common wrong fixes
1. Adding a retry loop around the 500 hoping it's "just flaky" — a consistent, reproducible 500 is a real bug, not flakiness, and retries just delay finding it.
2. Skipping the staging-only failing tests permanently — silently loses coverage of a real staging-environment problem that may also predict a future production issue.
3. Pointing the test at production instead "since staging is broken" — trades a real (if inconvenient) staging signal for tests running against live user data and systems.

### Interview angle
"An endpoint 500s reliably in staging but nowhere else — how do you narrow down the cause?" — senior answer: read the actual error body/stack trace staging often exposes, then check for the three usual suspects — thinner seed data, different feature-flag state, or a downstream dependency issue specific to that environment — not a test-code problem.

### Related
stuck-parallel-ci-docker-font-rendering, stuck-network-api-401-only-ci

---

## Simulating a slow 3G connection doesn't behave as expected

id: stuck-network-api-slow-3g-simulation
category: network-api
severity: rare

### Symptom
Using CDP-based network throttling to simulate a slow connection either has no visible effect on the test, or makes *everything* uniformly slow in a way that doesn't match how a real slow connection actually behaves (which affects different resources differently).

### Why it happens
Network throttling emulation (via `page.route()` with artificial delays, or CDP's `Network.emulateNetworkConditions`) approximates bandwidth/latency but doesn't perfectly replicate the connection-level behavior of a real cellular network (packet loss, jitter, variable latency per-connection) — and if throttling is applied at the wrong scope (only to the main document request, not to subsequent asset requests), the test won't see the effect it expects on the parts of the page that matter.

### How to debug it
1. Confirm what layer the throttling is actually applied at — a single delayed `page.route()` handler for one resource type versus a full connection-level emulation covering everything.
2. Check whether the thing you're trying to observe (a loading skeleton, a "slow connection" banner) is driven by a timing threshold that your simulated delay does or doesn't actually cross.
3. Compare against real device/network testing (or a dedicated performance-testing tool) if you need to validate genuine perceived-performance behavior rather than a single test's pass/fail.

### Fix
```ts
test('shows a loading skeleton under a simulated slow connection', async ({ page }) => {
  await page.route('**/api/dashboard', async (route) => {
    await new Promise((r) => setTimeout(r, 3000)); // simulate real latency, not a full block
    await route.continue();
  });
  await page.goto('/dashboard');
  await expect(page.getByTestId('dashboard-skeleton')).toBeVisible();
  await expect(page.getByTestId('dashboard-ready')).toBeVisible({ timeout: 10_000 });
});
```

### Best practice
Use targeted, per-route artificial delay for testing a specific loading-state UI behavior (this is deterministic and fast to run), and reserve full network-condition emulation or real device testing for genuine performance/Core-Web-Vitals investigations — don't expect one tool to answer both questions equally well.

### Common wrong fixes
1. Using `waitForTimeout` to "wait out" the simulated slowness instead of asserting on the loading-state UI the delay was meant to exercise — misses the actual point of the test.
2. Applying a uniform multi-second delay to every single request indiscriminately — makes the test slow to run without meaningfully testing anything beyond "everything is slow."
3. Concluding throttling emulation is "unreliable" and abandoning slow-connection UI testing altogether — usually the scope/threshold, not the tool, was the actual problem.

### Interview angle
"How do you test that a 'slow connection' loading state actually appears?" — senior answer: add a targeted artificial delay to the specific route via `page.route()` and assert on the loading-state UI directly, rather than relying on full network-condition emulation to reproduce an exact real-world scenario — that's a job better suited to dedicated performance testing.

### Related
stuck-waits-timing-networkidle-trap, stuck-waits-timing-spinner-never-detaches

---

## A request fires before the route handler is registered

id: stuck-network-api-request-before-route
category: network-api
severity: common

### Symptom
A `page.route()` mock is set up correctly and matches the right URL, but the *first* request after a navigation still goes to the real network — only requests *after* that one get intercepted.

### Why it happens
If `page.route()` is called after `page.goto()` (or after any action that immediately fires the request, like a component that calls an API on mount), the very first request has already been dispatched — sometimes before the route registration's own async setup completes — by the time the handler exists. Route registration must happen before the navigation/action that triggers the request it's meant to intercept, matching the same "register before triggering" rule as event listeners.

### How to debug it
1. Check the literal code order: is `page.route()` called before or after `page.goto()`/the triggering action?
2. Confirm in the network panel whether the first request of a given type actually reached the real server (a 200 from the real API, not the mocked shape) while subsequent identical requests were intercepted.
3. If registering earlier isn't possible for some reason, consider whether `context.route()` (registered once, before any page exists) is more appropriate than `page.route()`.

### Fix
```ts
test('dashboard mock intercepts from the very first load', async ({ page }) => {
  await page.route('**/api/dashboard', (route) => route.fulfill({ json: { ready: true } }));
  await page.goto('/dashboard'); // route registered BEFORE navigation
  await expect(page.getByTestId('dashboard-ready')).toBeVisible();
});
```

### Best practice
Always register `page.route()` (or `context.route()` for routes needed across multiple pages/navigations) before the navigation or action that triggers the request — treat this the same as the `waitForResponse`-before-click ordering rule, since it's the same underlying race.

### Common wrong fixes
1. Registering the route, then immediately re-navigating (`page.goto()` twice) so the "second" load is the one that gets mocked — works but is wasteful and confusing to read.
2. Adding a `waitForTimeout` between route registration and navigation "to let it register" — route registration is synchronous from the test's perspective; the fix is ordering, not timing.
3. Assuming Playwright's route API "doesn't work reliably" and switching to a browser-extension-based network mocking tool — usually an unnecessary complexity increase for an ordering bug in the test itself.

### Interview angle
"Your route mock intercepts the second request but not the first, right after navigation — why?" — senior answer: the route was registered after `page.goto()` fired, so the first request had already left before the handler existed — always register routes before the navigation/action that triggers the request they're meant to catch.

### Related
stuck-waits-timing-response-race, stuck-network-api-route-not-intercepting

---

## Asserting on a GraphQL response is harder than a REST one

id: stuck-network-api-graphql-assertion
category: network-api
severity: tricky

### Symptom
`page.route('**/api/data', ...)` or `page.waitForResponse('**/api/data')` either mocks/matches the *wrong* GraphQL operation, or matches all of them indiscriminately, because every GraphQL call hits the exact same URL.

### Why it happens
Unlike REST, where each operation typically has its own path, GraphQL APIs commonly expose a single endpoint (e.g., `/graphql`) for every query and mutation — the thing that actually distinguishes one call from another is the request body's `operationName` (or the query text itself), not the URL. A route/wait matched only by URL can't tell "GetBalance" apart from "GetTransactions."

### How to debug it
1. Inspect the request body of the calls hitting the shared endpoint — confirm the `operationName` field is present and reliably distinguishes the operations you care about.
2. Check whether the client library always sends `operationName` (some configurations omit it) — if not, matching on a substring of the query text is a fallback.
3. Confirm a broad URL-only route isn't accidentally intercepting/mocking an unrelated operation that happens to share the endpoint.

### Fix
```ts
test('mocks only the GetBalance GraphQL operation', async ({ page }) => {
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body.operationName === 'GetBalance') {
      return route.fulfill({ json: { data: { balance: { checking: 4250 } } } });
    }
    return route.continue(); // let every other operation through untouched
  });
  await page.goto('/dashboard');
  await expect(page.getByTestId('checking-balance')).toContainText('4,250');
});

const [response] = await Promise.all([
  page.waitForResponse((r) => r.url().includes('/graphql')
    && r.request().postDataJSON()?.operationName === 'GetBalance'),
  page.getByRole('button', { name: 'Refresh' }).click(),
]);
```

### Best practice
Always match GraphQL network activity on `operationName` (or a query-text fingerprint) from the parsed POST body, never on URL alone; validate mocked response shapes against the same generated TypeScript types the app uses (from GraphQL codegen) so a schema drift shows up as a type error, not a silent runtime mismatch.

### Common wrong fixes
1. Matching by URL only and assuming "there's only one GraphQL call on this page anyway" — breaks the moment a second query/mutation is added to the same page.
2. Intercepting and mocking *every* GraphQL call broadly to avoid the matching problem entirely — makes the test brittle to unrelated schema changes on operations it never meant to care about.
3. Falling back to string-matching the raw request body for a fragment of query text — fragile to query-text formatting/whitespace changes that don't affect behavior.

### Interview angle
"How do you mock a specific GraphQL query when every request hits the same `/graphql` URL?" — senior answer: match on the request body's `operationName` (or a stable fingerprint of the query), not the URL, since URL alone can't distinguish GraphQL operations from each other.

### Related
stuck-network-api-mock-json-correctly, stuck-contract-testing
