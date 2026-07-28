## OAuth popup login never completes in the test

id: stuck-login-auth-oauth-popup
category: login-auth
severity: common

### Symptom
Clicking "Sign in with Google/GitHub" opens a popup window, the test hangs until timeout, and the main page never reflects a logged-in state — even though the same flow works fine when you click through it by hand.

### Why it happens
OAuth popups are a genuinely separate `Page` in Playwright's model. If you don't explicitly capture the popup via `page.waitForEvent('popup')`, your test keeps driving the original `page` while the actual form (email/password/consent) lives in a second page object you never touched. The popup usually also needs its own `waitForLoadState` before you can interact with its fields.

### How to debug it
1. Run with `--headed` once and watch whether a second window actually opens — if a popup blocker or `noopener` policy silently prevented it, you'll see that immediately.
2. Open the trace: check whether a second page/tab appears in the trace viewer's page list at all.
3. If the popup exists but selectors fail, screenshot the popup specifically (not the opener) to confirm you're looking at the right document.

### Fix
```ts
test('OAuth login via Google popup', async ({ page, context }) => {
  await page.goto('/login');
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: 'Sign in with Google' }).click(),
  ]);
  await popup.waitForLoadState();
  await popup.getByLabel('Email').fill(process.env.OAUTH_TEST_EMAIL!);
  await popup.getByRole('button', { name: 'Next' }).click();
  await popup.getByLabel('Password').fill(process.env.OAUTH_TEST_PASSWORD!);
  await popup.getByRole('button', { name: 'Sign in' }).click();
  // popup closes itself after redirecting the opener
  await expect(page.getByTestId('welcome-banner')).toBeVisible();
});
```

### Best practice
Prefer bypassing the real OAuth provider entirely for most tests: seed a `storageState` once via a real login (in a setup project) and reuse it, or stub the provider's callback endpoint. Reserve the full popup flow for one canary test that actually proves OAuth still works end-to-end.

### Common wrong fixes
1. Adding `page.waitForTimeout(5000)` hoping the popup finishes on its own — it may still be waiting on the *original* page's context.
2. Calling `context.pages()[1]` immediately after the click — the popup may not exist yet; always await the `page` event first.
3. Disabling popup blocking in browser launch args as the "fix" when the real issue was never registering the event listener.

### Interview angle
"How do you test a third-party OAuth login flow?" — senior answer: capture the popup via `context.waitForEvent('page')` registered *before* the triggering click, drive it as its own page object, and prefer a stubbed/seeded `storageState` for every test except one real-provider canary.

### Related
stuck-login-auth-storage-expired, stuck-frames-windows-popup-handling

---

## SSO redirect loop never lands back on the app

id: stuck-login-auth-sso-redirect-loop
category: login-auth
severity: tricky

### Symptom
After submitting SSO credentials on the identity provider's page, the browser bounces between the IdP and the app's `/callback` URL repeatedly until Playwright's navigation timeout fires, or it lands back on the login page instead of the dashboard.

### Why it happens
SSO redirect chains are sensitive to cookie attributes (`SameSite`, `Secure`) and to the exact final URL the app expects after the IdP hands back a token. A loop usually means the app's session cookie wasn't accepted on the redirect (wrong `SameSite` for a cross-site redirect, or the app is on `http://` locally while the IdP requires `https://`), so the app thinks the user is still unauthenticated and redirects to the IdP again.

### How to debug it
1. Open the trace's network panel and read the full redirect chain in order — count how many hops and whether cookies are present on the request *after* the IdP handoff.
2. Check `Set-Cookie` response headers on the callback response for `SameSite=None; Secure` when the flow is cross-site.
3. Compare against a manual browser session: DevTools → Application → Cookies, same login, does the cookie actually get stored there either?

### Fix
```ts
test('SSO login lands on dashboard, not a redirect loop', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Sign in with company SSO' }).click();
  await page.getByLabel('Work email').fill('qa+sso@example.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  // Wait for the FINAL app URL explicitly rather than a generic "navigated" signal.
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await expect(page.getByTestId('welcome-banner')).toBeVisible();
});
```

### Best practice
Run SSO tests against an environment whose cookie/HTTPS configuration matches production exactly — testing SSO on plain `http://localhost` when prod requires `Secure` cookies reproduces this bug reliably and wastes debugging time on a non-representative environment.

### Common wrong fixes
1. Increasing the navigation timeout to "let it finish eventually" — a real redirect loop never converges; a longer timeout just fails slower.
2. Manually looping `page.goto()` calls to "help it along" — this fights the browser's own redirect handling and masks the cookie bug.
3. Disabling `Secure`/`SameSite` cookie flags in the test environment only — fixes the symptom in tests while leaving prod's real (stricter) behavior unverified.

### Interview angle
"A cross-domain SSO login redirects forever in your test env only — where do you look first?" — senior answer: the network panel's redirect chain and `Set-Cookie` headers, because a loop almost always means the session cookie from the callback isn't being accepted on the next request, not that the test is waiting wrong.

### Related
stuck-network-api-cookies-not-sent, stuck-login-auth-oauth-popup

---

## storageState looks valid but the suite is logged out mid-run

id: stuck-login-auth-storage-expired
category: login-auth
severity: common

### Symptom
The first few tests using a saved `storageState.json` pass; partway through the suite, tests start seeing the login screen instead of the dashboard, with no code change to blame.

### Why it happens
`storageState` is a snapshot taken once (usually in a setup project) — if the session token it captured has a shorter TTL than your full suite's wall-clock runtime, later tests replay an already-expired cookie/token. This gets worse as the suite grows: what was "plenty of time" at 50 tests silently becomes "not enough" at 500.

### How to debug it
1. Decode the token in the saved `storageState.json` (JWTs are base64 — check the `exp` claim) and compare it against your suite's typical wall-clock duration.
2. Confirm the exact test index/time where failures start — if it's a consistent elapsed-time threshold rather than a consistent test name, that's the signature of a TTL problem.
3. Check whether the setup project's login happens once per full run or is being cached across CI runs from a stale artifact.

### Fix
```ts
// setup/auth.setup.ts
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('apex_user');
  await page.getByLabel('Password').fill(process.env.APP_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByTestId('welcome-banner')).toBeVisible();
  await page.context().storageState({ path: authFile });
});

// playwright.config.ts — re-run setup if the suite runs longer than the token TTL
export default defineConfig({
  globalTimeout: 25 * 60 * 1000, // keep total runtime comfortably under token TTL
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'app', dependencies: ['setup'], use: { storageState: authFile } },
  ],
});
```

### Best practice
Either request a long-lived test-only token from the auth provider for CI accounts, or shard the suite so no single shard's runtime approaches the token TTL, and always assert freshness (re-run the setup project) rather than trusting a cached artifact from a previous CI run.

### Common wrong fixes
1. Adding a UI re-login inside a `beforeEach` "just in case" — reintroduces the slow, racy UI-login-per-test problem `storageState` exists to solve.
2. Blindly raising `retries` so expired-session failures pass on the second attempt — the second attempt fails identically since the token is still expired.
3. Increasing the token TTL in production to "fix CI" — a test infrastructure problem should not change a security control meant for real users.

### Interview angle
"Your storageState-based suite starts failing exactly 20 minutes into every run — diagnose." — senior answer: decode the token's `exp` claim, compare to suite runtime, and either get a longer-lived test token or shard the run so it never gets close to the TTL — not add retries or a UI-login fallback.

### Related
stuck-parallel-ci-sharding-uneven, stuck-waits-timing-clock-dependent-otp

---

## MFA/OTP step blocks every test that logs in

id: stuck-login-auth-mfa-otp
category: login-auth
severity: common

### Symptom
Every login-dependent test now has to click through a 6-digit OTP screen, and there's no real SMS/authenticator app available in CI to read the code from.

### Why it happens
MFA is, by design, meant to require a second factor a script can't produce on its own — so it can't be automated "for real" without either a deterministic test-mode OTP or a way to read the code programmatically (a seeded/predictable code, an API endpoint that returns the current code for test accounts, or a mocked clock so a fixed code never expires).

### How to debug it
1. Ask (or check the codebase) whether non-prod environments already expose a deterministic OTP for designated test accounts — many apps do, precisely for this reason (the Bank Demo app in this repo exposes its OTP directly in the DOM for exactly this purpose).
2. If not, check whether there's a test-only API endpoint that returns the current valid code for a given test user.
3. If truly nothing exists, that's a product gap to flag, not a testing problem to work around with a hack.

### Fix
```ts
// Using a deterministic, DOM-exposed test OTP (see Bank Demo's #bank-demo section)
test('2FA login succeeds with the known test OTP', async ({ page }) => {
  await page.goto('/index.html#bank-demo');
  await page.getByTestId('bank-username').fill('apex_2fa');
  await page.getByTestId('bank-password').fill(process.env.APEX_2FA_PASSWORD!);
  await page.getByTestId('bank-login').click();
  const code = await page.getByTestId('otp-hint').textContent();
  const inputs = page.locator('.otp-input');
  for (let i = 0; i < code!.length; i++) await inputs.nth(i).fill(code![i]);
  await page.getByTestId('verify-2fa').click();
  await expect(page.getByTestId('welcome-banner')).toBeVisible();
});
```

### Best practice
Push for a documented, audited "test OTP" mode gated behind an environment flag (never enabled in production) rather than every team reinventing an ad-hoc workaround; treat the OTP-entry UI itself as testable in isolation (wrong code, expired code) separately from "can I get logged in for an unrelated test."

### Common wrong fixes
1. Reading a real SMS via a third-party SMS-relay API in every test — slow, flaky, and couples your whole suite's reliability to an external vendor's uptime.
2. Hardcoding "123456" as a magic universal bypass with no environment gating — a serious security risk if it ever leaks into a build that reaches a non-test environment.
3. Skipping MFA-account tests entirely and only testing non-MFA accounts — silently drops real coverage of a security-critical path.

### Interview angle
"How do you automate a login flow that requires SMS-based 2FA?" — senior answer: get the app to expose a deterministic, environment-gated test OTP (or an API to fetch the current code for test accounts) rather than trying to intercept a real SMS; treat "can't automate a real SMS" as expected and design around it, not as a blocker.

### Related
stuck-waits-timing-clock-dependent-otp, stuck-login-auth-oauth-popup

---

## JWT expires mid-test on a long-running scenario

id: stuck-login-auth-jwt-refresh
category: login-auth
severity: tricky

### Symptom
A long end-to-end test (multi-step checkout, multi-page wizard) works fine for the first several minutes, then suddenly every subsequent API call returns 401 and the UI shows stale data or silently fails.

### Why it happens
Access tokens are usually short-lived by design (5–15 minutes) and rely on a refresh-token flow the *app* handles silently in the background. If the app's silent-refresh logic is broken, slow, or blocked by something the test does (e.g., intercepting requests in a way that swallows the refresh call), the token expires with nothing renewing it.

### How to debug it
1. Check the network panel for a refresh-token request (`/oauth/token` or similar) near the failure time — is it firing at all, and what does it return?
2. If you're using `page.route()` elsewhere in the test, confirm your route handler isn't accidentally intercepting the refresh endpoint and never calling `route.continue()`.
3. Time-box the test: does the failure always happen at roughly the access-token's TTL, confirming it's a refresh problem rather than a random flake?

### Fix
```ts
test('long checkout flow survives a token refresh mid-way', async ({ page }) => {
  // Ensure any route mocks explicitly pass through auth endpoints
  await page.route('**/oauth/token', (route) => route.continue());
  await page.goto('/checkout/start');
  // ... multi-step flow that legitimately takes several minutes ...
  await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 5 * 60_000 });
});
```

### Best practice
When mocking network requests broadly (e.g., `page.route('**/api/**')`), always explicitly allowlist or pass through auth/refresh endpoints rather than relying on a catch-all handler to happen to let them through; for very long flows, prefer breaking the test into smaller, independently-verifiable steps that don't require a single unbroken 10-minute token lifetime.

### Common wrong fixes
1. Extending the access-token TTL specifically for test environments — masks a genuine refresh-flow bug that will also affect real long-lived user sessions.
2. Manually re-authenticating mid-test by navigating back to `/login` — breaks the realism of the scenario you're actually trying to verify (does refresh work?).
3. Wrapping the assertion in a retry loop — the 401 is a real failure, not a timing race; retrying just delays discovering the refresh bug.

### Interview angle
"A long-running test starts failing with 401s exactly at your access-token's TTL — what's your hypothesis?" — senior answer: check whether the silent refresh-token flow is firing and succeeding, and whether any test-side route mocking is accidentally blocking it — don't just extend the token lifetime.

### Related
stuck-network-api-route-not-intercepting, stuck-login-auth-storage-expired

---

## Session expires while filling a long multi-step form

id: stuck-login-auth-session-expired-midform
category: login-auth
severity: tricky

### Symptom
A test that fills a long form (many fields, maybe a file upload, maybe waiting on an async validation) submits successfully most of the time, but occasionally lands back on the login screen with the form data lost.

### Why it happens
Session/idle timeouts are usually based on elapsed time since the *last request*, not since the form was opened — if a test fills fields slowly (many small `fill()` calls with real network validation between them) with no server request in between for longer than the idle window, the session can expire before submit, even though a real user typing at a normal pace with occasional "still there" pings might not trigger it.

### How to debug it
1. Time the gap between the form-open request and the submit request in the trace's network panel; compare it against the documented idle-session timeout.
2. Check whether the app has a "keep-alive" heartbeat request while a form is open, and whether test conditions (mocked network, paused JS timers) are suppressing it.
3. Reproduce with a deliberately slow fill and see if the timeout reproduces consistently at the same elapsed time.

### Fix
```ts
test('long form submits without hitting session idle timeout', async ({ page }) => {
  await page.goto('/forms/onboarding');
  await page.getByLabel('Full name').fill('Apex User');
  await page.getByLabel('Company').fill('Example Corp');
  // If the app has a real heartbeat, don't suppress it — let real timers run.
  await page.getByLabel('Notes').fill('A'.repeat(200));
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByTestId('onboarding-success')).toBeVisible();
});
```

### Best practice
If the app relies on a client-side heartbeat to keep the session alive, verify that heartbeat is untouched by any test-level network mocking (`page.route`) or clock manipulation (`page.clock`) — those two features are the most common accidental cause of a heartbeat silently stopping in tests only.

### Common wrong fixes
1. Filling the form as fast as possible with no realistic pacing just to "beat the clock" — hides whether real users (who type slower) would hit the same bug.
2. Catching the redirect-to-login and silently re-authenticating mid-test — masks a real UX bug where users could lose form progress.
3. Globally disabling session idle timeout for the whole test environment — removes coverage of the idle-timeout behavior entirely, including for tests that specifically need to verify it.

### Interview angle
"A form-submission test flakes with 'session expired' only when the form has many fields — what do you check?" — senior answer: whether the app's session heartbeat is still firing during the fill, and whether any test-side mocking/clock control accidentally suppressed it — not just add speed or retries.

### Related
stuck-waits-timing-clock-dependent-otp, stuck-network-api-route-not-intercepting

---

## Users get logged out randomly, only when tests run in parallel

id: stuck-login-auth-parallel-logout
category: login-auth
severity: tricky

### Symptom
Individually, every login test passes. Run the full suite with multiple workers, and some fraction of tests using the *same* test account suddenly see a logged-out state partway through, with no pattern tied to any specific test.

### Why it happens
If multiple parallel workers log in as the *same* shared test account, most auth systems treat a new login as invalidating the previous session (single-session-per-account enforcement) — worker B's login silently kills worker A's session mid-test. This is a data-isolation bug in the test suite, not a flake in the app.

### How to debug it
1. Check whether the failing tests share a hardcoded username across multiple spec files.
2. Search CI logs for two near-simultaneous login requests for the same account around the failure time.
3. Confirm with the backend team whether the app enforces single-session-per-user (many banking/security apps do, intentionally).

### Fix
```ts
// fixtures/personas.ts — one account per worker, not one shared account for everyone
export const PERSONAS = {
  apex_user: { password: process.env.APEX_USER_PASS! },
  apex_2fa: { password: process.env.APEX_2FA_PASS! },
  // ...one distinct persona per parallel test lane
};

// playwright.config.ts
export default defineConfig({ workers: Object.keys(PERSONAS).length });
```

### Best practice
Provision one test account per parallel worker (or generate ephemeral accounts via an API/seed script per test), and treat "shared login account across parallel tests" as a design smell to fix immediately, not something retries can paper over.

### Common wrong fixes
1. Reducing `workers` to 1 to "make it stable" — hides the real isolation bug and makes the whole suite far slower.
2. Adding retries so the "logged out" test passes on a second attempt (which may kill a *different* worker's session instead) — just moves the failure around.
3. Re-logging in inside the test whenever a logout is detected — treats a data-isolation bug as an expected, normal occurrence.

### Interview angle
"Login tests pass alone but fail intermittently under parallel execution — what's your first hypothesis?" — senior answer: check whether parallel workers share the same test account, since single-session-per-user enforcement means one worker's login can silently invalidate another's — fix with per-worker accounts, not retries.

### Related
stuck-parallel-ci-worker-race-shared-user, stuck-parallel-ci-sharding-uneven

---

## Login gets rate-limited only in CI

id: stuck-login-auth-rate-limited-ci
category: login-auth
severity: common

### Symptom
Local runs never hit it, but CI occasionally returns a 429 ("Too many attempts") on the login request, failing otherwise-correct tests — especially on days with more CI activity (more PRs, nightly + PR runs overlapping).

### Why it happens
Login endpoints are commonly rate-limited by IP to slow down credential-stuffing attacks. CI runners frequently share IP ranges (cloud provider egress pools), so many unrelated CI jobs — sometimes from many different repos on a shared CI provider — can collectively exceed a per-IP threshold that a single developer's home/office IP never approaches.

### How to debug it
1. Confirm the response is actually 429 with a rate-limit-specific body/header (`Retry-After`), not a generic 500 that looks similar.
2. Check whether failures cluster around times of high overall CI load (e.g., many PRs merging around the same hour).
3. Ask whether the auth provider supports allowlisting known CI egress IP ranges, or issuing a rate-limit-exempt test API key.

### Fix
```ts
test('login succeeds even under real (or simulated) rate-limit conditions', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('apex_user');
  await page.getByLabel('Password').fill(process.env.APP_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  // If truly rate-limited, this is an environment/provisioning issue — assert clearly
  // instead of silently retrying past a real 429.
  await expect(page.getByTestId('welcome-banner').or(page.getByText(/too many attempts/i)))
    .toBeVisible();
});
```

### Best practice
Get CI's egress IP range allowlisted with the auth provider, or use a dedicated test-tier API key/bypass header exempt from the production rate limiter — both are provisioning fixes, and both are far more durable than anything the test code itself can do.

### Common wrong fixes
1. Adding exponential-backoff retry loops around the login call inside the test — hides a real infrastructure constraint and slows every CI run down waiting out rate-limit windows.
2. Reducing the production rate limit specifically to stop CI from tripping it — weakens a real security control for everyone to solve a test-environment problem.
3. Randomly staggering test start times with `waitForTimeout` hoping to dodge the threshold — non-deterministic and doesn't fix the underlying shared-IP capacity problem.

### Interview angle
"CI intermittently gets 429 on login, but never locally — diagnose." — senior answer: shared CI egress IPs collectively tripping a per-IP rate limit meant for credential-stuffing protection; fix via IP allowlisting or a test-tier bypass key, not retries or weakening the production limiter.

### Related
stuck-login-auth-oauth-popup, stuck-parallel-ci-ci-provider-pipeline-failure
