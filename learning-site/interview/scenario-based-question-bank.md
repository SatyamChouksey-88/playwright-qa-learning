# Scenario-based Playwright interview bank

> Generated mirror — edit `interview-qa/01-junior.md` … `04-architect.md` then run `npm run build:content`.

117 scenario questions across four tiers (Beginner → Architect), plus the Interview essentials pack (HR, QA theory, BDD, Git, MCP). Read each question out loud, then check the ideal approach — the "why they get stuck" line is usually more useful than the answer.

## Tier A — Beginner / Fresher (0–2 years)

Scenario-based screening questions for 0–2 years. Read each scenario out loud, then compare to the ideal approach — the "why they get stuck" line tells you which instinct to override.

### A1. A test passes locally but the element "isn't found" even though you can see it on the page. What do you check?
**Ideal approach:** Confirm it isn't a timing issue first (Playwright auto-waits, but you may be reading state too early with a non-retrying check like isVisible() instead of await expect(locator).toBeVisible() ). Then check: is the element inside an iframe (needs frameLocator ) or a shadow root (open roots are pierced automatically; closed ones can't be reached)? Is the locator matching multiple elements (strict-mode violation)? Is it behind an overlay/modal (fails actionability "receives events")? Use the trace/Inspector "pick locator" to verify.
**Why they get stuck:** 

### A2. Your test uses `page.waitForTimeout(3000)` and still fails on the CI machine. Why, and what do you do?
**Ideal approach:** Hard sleeps are both too short on slow CI and wasted time on fast machines. Replace with a web-first assertion on the observable end-state ( await expect(page.getByRole('alert')).toHaveText('Saved') ) or wait for the specific network response. Auto-waiting handles most cases.
**Why they get stuck:** 

### A3. The login form has fields with no stable IDs and auto-generated class names. How do you locate them reliably?
**Ideal approach:** Prefer user-facing locators: getByLabel('Email') , getByRole('textbox', {name: 'Email'}) , getByPlaceholder(...) . If none exist, ask devs to add data-testid (or configure testIdAttribute ). Anchor CSS to a stable parent as a last resort; avoid brittle structural XPath like //div[2]/form/button[1] .
**Why they get stuck:** 

### A4. You need to test a "Delete account?" browser confirm dialog. How do you handle it?
**Ideal approach:** Register page.on('dialog', async d => { …; await d.accept(); }) before the click that triggers it; for prompts pass text to accept('...') . If no handler is registered, Playwright auto-dismisses. Distinguish native dialogs ( alert/confirm/prompt ) from in-page modals, which are just DOM elements clicked with normal locators.
**Why they get stuck:** 

### A5. A "Sign in" button appears twice on the page and your click throws a "strict mode violation." How do you fix it?
**Ideal approach:** Narrow the locator rather than disable strictness: scope to a parent ( page.getByRole('dialog').getByRole('button', {name:'Sign in'}) ), .filter({hasText}) , or explicitly .first()/.nth() only when position is truly what you want. Strict mode is a feature that catches ambiguous selectors early.
**Why they get stuck:** 

### A6. How do you upload a file when the visible "Upload" control is a styled button, not a real file input?
**Ideal approach:** Two options — call setInputFiles() directly on the hidden input[type=file] , or use the filechooser event: set up page.waitForEvent('filechooser') , click the styled button, then chooser.setFiles(path) . Buffers work for synthetic in-memory files.
**Why they get stuck:** 

### A7. Clicking "Export CSV" triggers a download. How do you capture and verify it?
**Ideal approach:** Set up const downloadPromise = page.waitForEvent('download') before clicking, then const download = await downloadPromise; await download.saveAs(...) . Verify suggestedFilename() or read the stream contents. It's a one-shot wait.
**Why they get stuck:** 

### A8. Clicking a link opens a new tab. How do you interact with the new tab?
**Ideal approach:** Capture it via the context/page event before the click: const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]) ; then await popup.waitForLoadState() and treat it as a normal Page. Note tabs in the same context share cookies.
**Why they get stuck:** 

### A9. Login takes 5+ seconds and every one of your tests logs in through the UI. What's the problem and the simplest first improvement?
**Ideal approach:** Repeated UI login is slow and fragile. Log in once and reuse storageState (cookies + localStorage) across tests, injected via config use.storageState or a setup project. This is the single biggest speed win in most suites.
**Why they get stuck:** 

### A10. Your test needs the app running at localhost:3000. How should the suite start it?
**Ideal approach:** Use the webServer config block (command + url + reuseExistingServer: !process.env.CI ) so the app boots before the suite and is reused locally but freshly started in CI. Removes "did you start the server?" as a human failure mode.
**Why they get stuck:** 

### A11. How do you run the same test across Chromium, Firefox, and WebKit, and why would you bother?
**Ideal approach:** Define projects[] in the config, one per browser/device; run all with npx playwright test or one with --project=webkit . Rationale: engines differ (WebKit = Safari's engine; catches Safari-only layout/focus/date bugs). Note bindings: same concept in Java ( projects in config or parameterized runners).
**Why they get stuck:** 

### A12. A colleague wrote `page.click('#save')` without `await`. What happens?
**Ideal approach:** A floating promise — the action fires but the test may move on before it resolves, causing intermittent failures. This is one of the most common flakiness sources. Enable the ESLint rule @typescript-eslint/no-floating-promises to catch it. (Node/TS-specific; in Java every call is synchronous so this class of bug doesn't exist — a good contrast point.)
**Why they get stuck:** 

### A13. A login test suddenly shows a CAPTCHA/verification challenge that wasn't there before. What's your first move?
**Ideal approach:** Treat it as an environment/configuration signal, not something to defeat programmatically — CAPTCHA and bot-challenge systems exist specifically to tell automation apart from humans, so "solving" them inside a legitimate test suite is the wrong instinct. Get the challenge disabled or issued a test-only bypass key in non-production environments, coordinated with dev/security teams. If a challenge does appear in CI, the test should detect it and fail fast so the environment issue gets investigated — not route around it with solver services or stealth plugins.
**Why they get stuck:** 

### A14. A delivery app should show "no restaurants near you" when location access is denied, and real results when it's granted for a specific city. How do you test both paths?
**Ideal approach:** Grant or deny the geolocation permission at the context level, and separately set coordinates with context.setGeolocation(...) (or the geolocation config option). Test the denied-permission fallback UI and at least one granted-with-coordinates happy path. Permission and coordinates are two independent settings, and they apply to the whole context, not a single page.
**Why they get stuck:** 

### A15. The same confirmation page must show "$10.00" in the US and "10,00 €" in Germany, with the German date shown day-first. How do you cover this?
**Ideal approach:** Set locale (and usually timezoneId ) per test — via test.use({locale: 'de-DE', timezoneId: 'Europe/Berlin'}) or globally in config — then assert on the rendered currency/date strings for each locale. Keep it to a smoke check on formatting logic; testing every translated string belongs to localization/linguistic QA, not E2E.
**Why they get stuck:** 

### A16. The suite passes on desktop Chromium, but tapping a menu button does nothing when you emulate a Pixel device. Why?
**Ideal approach:** Mobile emulation profiles set hasTouch: true , and touch-only controls may listen for touchstart / touchend rather than a mouse click . Use locator.tap() — which dispatches real touch events — instead of .click() , and confirm the emulated context truly has hasTouch enabled ( tap() throws if it doesn't).
**Why they get stuck:** 

### A17. A "country" field isn't a native `<select>` — it's a text input that opens a custom div-based list when focused. How do you pick "Germany"?
**Ideal approach:** Treat it like ordinary UI, not selectOption() (which only targets real <select> elements): focus/click the input to open the list, then locate and click the "Germany" option by role/text within the listbox, and assert the list closed with the input now showing "Germany."
**Why they get stuck:** 

### A18. Clicking "Enable notifications" triggers the real browser permission prompt. How do you test both accept and block?
**Ideal approach:** Native permission prompts (notifications, camera, mic) are controlled the same way as geolocation: grant or deny at the context level before the triggering action, rather than trying to click a native OS-level dialog — which isn't part of the page DOM and can't be located.
**Why they get stuck:** 

### A19. A "You're offline" banner should appear when connectivity drops and disappear when it's restored. How do you simulate that?
**Ideal approach:** context.setOffline(true) flips the emulated network to offline — triggering the app's own online/offline listeners — and setOffline(false) restores it. Assert the banner's visibility transitions in both directions, not just the offline state alone.
**Why they get stuck:** 

### A20. Before the full page exists, design wants a test verifying a new `<Button>` component renders its label and fires `onClick` — without the whole app running. Possible?
**Ideal approach:** Yes — Playwright's component-testing mode mounts the component in isolation via a mount() fixture, letting you assert on rendered output and simulate interaction without booting the full application. It's a distinct test type from E2E: faster feedback on component-level logic, not a replacement for user-journey tests.
**Why they get stuck:** 

### A21. In a multi-step signup form, data entered on step 1 should still be there if the user clicks back after step 2. How do you verify this?
**Ideal approach:** Fill and submit step 1, advance to step 2, then navigate back and assert the step-1 field still shows the value you entered — using a web-first assertion rather than reading the value once. This tests the form's actual state-persistence behavior (in memory, local storage, or a resubmitted draft), not just that step 1's fields exist.
**Why they get stuck:** 

### A22. A teammate says "the logo loads correctly," but an `<img>` tag existing in the DOM doesn't prove the image file itself loaded. How do you actually verify this?
**Ideal approach:** An <img> element can exist — and even report as visible — while its src 404s or the file is corrupt. Check that the image actually rendered: assert naturalWidth is greater than zero via a page evaluation, or capture the network response for that specific asset request and assert its status is 200, rather than only asserting the element is present.
**Why they get stuck:** 

### A23. Test 1 logs in and lands on the dashboard. Test 2 assumes the user is still logged in and clicks a dashboard button — but test 2 fails, saying the button doesn't exist. Why?
**Ideal approach:** By default, each test gets its own isolated page and browser context — nothing from test 1 carries over, including login state. Tests should never assume implicit continuation from whatever ran before them; a shared starting state has to be created explicitly (a beforeEach that logs in, or shared storageState), not assumed from file order.
**Why they get stuck:** 

### A24. A browser engine upgrade lands and 2,000 tests fail overnight, with no application code changes. What do you do?
**Ideal approach:** First confirm it's really the browser update and not a coincident deploy — Playwright ships specific browser builds per version, so pinning the previous Playwright version temporarily rolls back the browser too, isolating the variable. Then triage by pattern, not one test at a time: a mass failure from a single root cause (a changed default, a stricter security policy, a rendering change) usually clusters around one code path — fix that path or add a compatibility shim, rather than touching 2,000 tests individually. Going forward, run new browser versions against the suite in a non-blocking job before adopting them, so this kind of jump gets caught before it's forced on everyone at once.
**Why they get stuck:** 

### A25. Two different API calls that should return the same customer record return slightly different data — a test using each endpoint gives inconsistent results. How do you approach this?
**Ideal approach:** This is a product data-consistency question wearing a test-flakiness costume — don't just pick whichever endpoint "usually passes." Confirm which endpoint is the actual source of truth for the field in question, and if both are meant to agree, treat the discrepancy as a bug to report (with both raw responses attached as evidence), not a test to adjust. Only change the test's expectations if product confirms the two endpoints are intentionally allowed to diverge (e.g., one is cached or eventually consistent).
**Why they get stuck:** 

## Tier B — Intermediate / Mid-level (2–5 years)

Fixtures, auth, mocking, CI, and reliability scenarios for 2–5 years. Panels push past syntax here — diagnosis order matters more than memorised snippets.

### B1. A test is green 9 runs out of 10 in CI but you can't reproduce it locally. Walk me through your process.
**Ideal approach:** Reproduce under stress: npx playwright test file:line --repeat-each=100 (and throttle CPU / raise --workers to mimic contended CI). Disable retries while investigating so flakiness isn't hidden. Open the trace ( trace: 'on-first-retry' ): inspect the DOM snapshot at the failing action, the network panel (did an API never resolve?), the console, and the longest bar on the timeline. Categorize: async/wait, resource contention, selector, order-dependency, environment drift, or test bug. Fix root cause, then re-run --repeat-each to confirm.
**Why they get stuck:** 

### B2. Under heavy parallel load, a test times out waiting for a backend response that's fine locally. What's happening and how do you stabilize it?
**Ideal approach:** The backend is slower because many workers hammer it simultaneously; it's a resource/timing issue, not a code bug. Options: start the wait before the trigger ( waitForResponse set up before the click), route-intercept known-slow non-critical endpoints, seed state via API instead of clicking through prerequisites, reduce worker count against a capacity-limited staging env, or add capacity. Assert on the user-visible end-state.
**Why they get stuck:** 

### B3. You need an authenticated session for admin, editor, and viewer roles across many tests. Design it.
**Ideal approach:** A setup project (or worker-scoped fixture) logs in once per role and saves auth/<role>.json via storageState() . Dependent projects load the right file with use.storageState ; per-test override with test.use({storageState:'auth/admin.json'}) . For token-based apps, hit the auth API and inject the token ( addInitScript to localStorage or extraHTTPHeaders ) — faster than UI login. Address MFA, expiry, and per-role variation.
**Why they get stuck:** 

### B4. A test must set up a specific order, then verify it in the UI. How do you make it fast and reliable?
**Ideal approach:** Hybrid API+UI: create the order via request.post('/api/orders', …) (the fast, stable door), capture the returned id, then page.goto and assert the order appears in the UI. Two wins: much faster than clicking prerequisites, and it isolates the order-history UI regression from the order-placement UI.
**Why they get stuck:** 

### B5. You want deterministic tests of a loading spinner, an error banner, and an empty state. How?
**Ideal approach:** Use page.route to control the boundary: fulfill a fake 200 with a fixed body for the happy path, route.fulfill({status:500}) for errors, an empty array for empty state, and add an artificial delay ( await new Promise(r=>setTimeout(r,2000)); route.continue() ) to exercise the spinner. Keep at least one happy-path test against the real backend so you don't mock away the integration.
**Why they get stuck:** 

### B6. Third-party analytics/tag-manager calls are slowing and destabilizing your runs. What do you do?
**Ideal approach:** Abort noisy hosts with page.route(/(analytics|googletagmanager|hotjar)\./, r=>r.abort()) . Legitimate speed/determinism tactic since those aren't under test. Be careful not to abort anything the flow depends on.
**Why they get stuck:** 

### B7. Payment fields live inside a Stripe iframe, and a custom web component uses shadow DOM. How do you automate both?
**Ideal approach:** iframe → page.frameLocator('iframe[name="stripe-card"]').getByLabel('Card number').fill(...) (chain for nested frames). Shadow DOM → role/text/label locators pierce open shadow roots automatically, so usually no special syntax; closed shadow roots can't be reached by Playwright or Selenium. Java binding uses page.frameLocator(...) identically.
**Why they get stuck:** 

### B8. Implement the Page Object Model, then explain how fixtures relate to it.
**Ideal approach:** POM = a class per page/component holding readonly Locators initialized from the injected Page , plus intent methods ( login() , addToCart() ). Fixtures provide *state* (logged-in user, seeded data, API client) and inject the page objects so specs stay short. They compose: fixture builds the POM + preconditions, POM exposes actions, test reads like a user story. Keep business assertions visible in tests (or in explicit expectX() methods), not buried everywhere in POMs.
**Why they get stuck:** 

### B9. Your suite takes 45 minutes in CI. How do you cut wall-clock time?
**Ideal approach:** First enable fullyParallel: true and tune workers to saturate one machine. Then shard across machines ( --shard=i/n ) via a CI matrix, emit blob reports per shard, and merge-reports into one HTML report. Also: seed via API + storageState to cut per-test time, mock unreliable third parties, and tier smoke vs regression. Sharding only helps after parallelism saturates a machine — and not if a shared staging app is the bottleneck.
**Why they get stuck:** 

### B10. Set up visual regression for a dashboard that includes a live clock and user avatars.
**Ideal approach:** await expect(page).toHaveScreenshot('dashboard.png', {mask:[…dynamic regions…], animations:'disabled', maxDiffPixelRatio:…}) . Mask timestamps/avatars/ads, disable animations, hide caret. Generate baselines in the same Docker image CI uses because fonts/OS rendering differ, else you'll chase phantom diffs. Visual tests complement — don't replace — functional E2E.
**Why they get stuck:** 

### B11. Integrate the suite into CI (GitHub Actions / Jenkins / Azure DevOps). What are the must-haves?
**Ideal approach:** Node setup → npm ci → npx playwright install --with-deps (or the official mcr.microsoft.com/playwright image with a version-matched tag) → run with sharding → upload trace/HTML reports as artifacts ( if: always() ). CI-only: retries: 2 , forbidOnly: true , trace: 'on-first-retry' . Cache browser binaries or use the Docker image. Secrets in the CI secret store. Jenkins: a Jenkinsfile stage running the same commands; Azure DevOps: a YAML pipeline with NodeTool + scripts (browsers install headless without Docker on hosted agents).
**Why they get stuck:** 

### B12. A test relies on data another test created and fails when run alone or out of order. How do you fix the class of problem?
**Ideal approach:** Make each test self-seeding and independent: no shared mutable globals, unique data per test (faker/UUID) or per-worker pools, storageState instead of a UI-login chain, cleanup in fixture teardown. Verify with --workers=4 --repeat-each=3 and randomized order. Use test.describe.serial only for genuinely sequential journeys.
**Why they get stuck:** 

### B13. When would you choose to mock a network call versus hit the real backend?
**Ideal approach:** Mock to isolate the UI (rendering/error/empty states) and to remove flaky third parties; hit the real service when the journey *is* the integration (e.g., "checkout talks to payments"). Hybrid is usually right: mock at the boundary, keep one happy-path test against the real backend. HAR replay for hermetic CI, refreshed when APIs change.
**Why they get stuck:** 

### B14. Drag-and-drop and a hover-only menu both fail intermittently. How do you handle each?
**Ideal approach:** Try source.dragTo(target) first; for custom HTML5 DnD do it manually: hover() → mouse.down() → hover(target) → mouse.up() , sometimes with intermediate moves. Hover menus: hover() then assert the submenu is visible before clicking. Avoid force:true (it can silently "succeed" while nothing happens).
**Why they get stuck:** 

### B15. A chat "Send" button should show "Delivered" only after the server acknowledges receipt over the WebSocket — not just after the click. How do you assert that reliably?
**Ideal approach:** Don't assert right after the click or use a fixed sleep. Listen for the specific WebSocket frame the server sends back, resolve a promise when an ack frame of the right type arrives, await it, then assert the UI shows "Delivered." This ties the assertion to the actual event the UI reacts to, not a guessed elapsed time.
**Why they get stuck:** 

### B16. A pricing feature is live behind a flag for 20% of users. How do you test both the on and off states without needing five separate real accounts?
**Ideal approach:** Toggle the flag programmatically for the test — via the flag provider's API/SDK for a dedicated test user, or by intercepting the flag-evaluation network call — then parameterize one test body over both states so both run predictably in every CI run, independent of the live rollout percentage. Reset the flag afterward so state doesn't leak into other tests.
**Why they get stuck:** 

### B17. Login goes through Google OAuth via a popup with its own consent screen. Do you automate the real Google login in CI?
**Ideal approach:** Mock the identity-provider response for the bulk of tests — intercept the OAuth callback and return a pre-crafted token/assertion, exercising your app's auth handling without depending on Google's UI, rate limits, or bot detection. Reserve a small separate suite that exercises a real IdP login, since some regressions only show up in the actual redirect/popup/consent flow — don't make every test pay that cost.
**Why they get stuck:** 

### B18. QA needs to test "a session that expired 2 minutes ago" without waiting 2 real minutes. How?
**Ideal approach:** Since the app trusts whatever token is present, craft a token with an already-past expiry (or a malformed claim) and inject it directly via storageState/cookies rather than logging in and waiting — the same token-injection technique used for role-based auth, applied to an edge case that would otherwise be slow or flaky to reproduce naturally.
**Why they get stuck:** 

### B19. Marketing wants the confirmation page screenshot-tested in English (LTR) and Arabic (RTL). What's different about the RTL screenshot test?
**Ideal approach:** Set locale as with any localization test, but pay specific attention to layout mirroring — element order, icon direction, and alignment flip in RTL, so the Arabic baseline is a genuinely different image, not translated text in the same layout. Keep masks for dynamic content consistent across both baselines.
**Why they get stuck:** 

### B20. Product wants proof a "saving…" spinner behaves correctly on a slow 3G connection, not just on your dev machine's fast one. How, without a slow network in the room?
**Ideal approach:** Throttle the network at the DevTools Protocol (CDP session) level — set download/upload throughput and latency to slow-3G-like values for the test — so requests genuinely take longer and the spinner's real behavior gets exercised, then assert loading and success states in sequence.
**Why they get stuck:** 

### B21. The exact same hCaptcha challenge appears only when tests run against staging, never locally. What's different?
**Ideal approach:** Same environment-drift triage muscle as any CI-only flake: bot-detection scores requests on signals like IP reputation, ASN, and traffic patterns that differ between a developer's home network and shared CI infrastructure, so staging can trigger a challenge local never sees. The fix lives at the environment level — a test-key bypass or allowlisted CI IP range coordinated with security — not in test code.
**Why they get stuck:** 

### B22. A live-updating dashboard must reconnect and catch up if the WebSocket drops mid-session. How do you test that?
**Ideal approach:** Combine offline emulation with the WebSocket-aware wait pattern: drop the connection mid-test with context.setOffline(true) , assert a "reconnecting" state appears, restore with setOffline(false) , then assert the dashboard catches up to the latest data — not merely that the socket reopened.
**Why they get stuck:** 

### B23. Signup requires a one-time code sent by SMS/email, and you don't control that provider in CI. How do you test the flow?
**Ideal approach:** Intercept and mock the OTP verification endpoint the app calls, returning success/failure bodies for the cases you need (correct code, wrong code, expired code) rather than trying to receive a real SMS or email in CI. This exercises the app's handling of the verification response without a slow, non-deterministic delivery channel in the loop; reserve any real-provider test for a small, separate, non-blocking suite.
**Why they get stuck:** 

### B24. A form has five independent validation rules. QA wants one test run to report all five failures on empty submit, not stop at the first. How?
**Ideal approach:** Use a soft assertion for each field-level check instead of a normal one. Soft assertions don't halt the test on failure — they're collected, and the test is marked failed at the end with every failure reported, which is far more useful than a hard assertion that stops at field one and leaves fields two through five unverified.
**Why they get stuck:** 

### B25. A route mock makes a "create user" test pass, but in production the same form sends malformed request bodies the real API rejects. How does a mock hide a bug like this?
**Ideal approach:** A route handler that unconditionally returns success proves the frontend can handle a success response — it proves nothing about whether the frontend sent a valid request. Guard against this by asserting on the intercepted request's method, path, and body shape inside the handler before fulfilling, so the mock only returns success when the outgoing request actually looks right; an unexpected shape fails the test instead of silently passing.
**Why they get stuck:** 

### B26. Two people edit the same record; the second save should be rejected with a conflict, not silently overwrite the first. How do you test that, and what should the UI preserve?
**Ideal approach:** Mock the save endpoint to return a version-conflict response after submission, and assert two things: the conflict message appears, and the user's own unsaved edits are still visible in the form rather than wiped out by the failed save. Losing someone's typed input on a conflict is usually the more damaging bug than the conflict itself.
**Why they get stuck:** 

### B27. A teammate commits `playwright/.auth/admin.json` to the repo so CI can reuse it. What's wrong, and what should happen instead?
**Ideal approach:** A storageState file contains live cookies and tokens — it's a credential, not a fixture. Committing it leaks real session access to anyone with repo read access, and it will silently go stale. Generate it fresh in a protected CI-only setup step, write it to a gitignored output directory, and handle it exactly like any other secret in the pipeline.
**Why they get stuck:** 

### B28. A developer refactors a form and, not realizing tests depend on it, removes the `data-testid` attributes "because they're not used by the app." What's the fix — for this instance, and going forward?
**Ideal approach:** The immediate fix is mechanical — restore the attributes, or migrate those locators to role/label-based selectors if that's actually more robust long-term. The real fix is process: a test-only attribute is a contract between test code and product code, and needs to be visible to whoever could break it — a lint or code-owners rule flagging data-testid removal in PRs touching tested components, or, better, migrating to role/label locators wherever a real accessible name exists, so the "contract" is the same accessibility attributes the app needs anyway rather than a test-only add-on nobody outside QA has a reason to preserve.
**Why they get stuck:** 

### B29. Your product exposes a GraphQL API instead of REST. How does testing change?
**Ideal approach:** The mechanics are similar to REST via the request fixture (POST a query/variables body, assert on the JSON shape), but interception differs: nearly all GraphQL traffic hits a single endpoint, so page.route() matching by URL alone can't distinguish operations — match the URL, then inspect the parsed request body's operation name to route only the specific operation you want to mock, letting everything else through. Errors look different too: a GraphQL response can return HTTP 200 with an errors array in the body instead of a non-2xx status, so status-code-based error assertions silently miss GraphQL-level failures — assert on the response body's errors field explicitly.
**Why they get stuck:** 

### B30. The product is mid-redesign: some users see the legacy UI, others the new one, based on account creation date — not a flag you control in a test. How do you keep one suite covering both?
**Ideal approach:** Treat "which UI version" as just another piece of context the test needs, the same way role or locale is: parameterize page objects or locators by UI version, and drive version selection from a test account whose creation date is deliberately set to fall on the side you want, rather than hoping a random real account lands on the right variant. Run the core journeys against both versions; retire the legacy-version tests on the same day the legacy UI is retired, not before.
**Why they get stuck:** 

## Tier C — Senior (5–9 years)

Architecture, flake governance, hybrid design, and trade-off reasoning for 5–9 years. Senior signal = restraint and naming what you deliberately will not build.

### C1. Design a Playwright test architecture for a team of ~30 engineers. What's in it, and what do you deliberately NOT build?
**Ideal approach:** Cover POM or component-object hybrid, shared/custom fixtures, a stable locator policy, a parallel-safe test-data strategy, environment-specific config via projects /env files, CI sharding, and reporting. Feature-grouped tests/ , page objects with locators+actions (no assertions), fixtures for preconditions. Crucially name restraint: avoid premature abstractions, do not write a custom framework on top of Playwright, do not hand-roll parallelism.
**Why they get stuck:** 

### C2. Your flaky-test list keeps growing. Turn "we have flaky tests" into "we manage flaky tests."
**Ideal approach:** Diagnose-first via traces, then categorize and fix by class (locator→role-based; timing→web-first assertions/remove sleeps; state→isolation; environment→infra). Retries as a *diagnostic*: retries:2 + trace:'on-first-retry' + --fail-on-flaky-tests on PRs so retries surface rather than hide. Track flakiness across history (stability score), fix worst offenders first. Quarantine known-flaky tests behind a tag with a ticket + owner + review date; never let the list grow silently.
**Why they get stuck:** 

### C3. Handle test data across a highly parallel, sharded suite.
**Ideal approach:** Know the three patterns — per-test data via API setup; per-worker isolation via user pools; DB snapshots restored per shard. Playwright isolates cookies/localStorage/session via fresh BrowserContext per test, but DB records, server state, and filesystem artifacts are your responsibility. Create shared datasets once per worker where safe; use factories/builders and namespacing; clean up in teardown. Senior insight: "shared seed data" causes most parallel-run flake.
**Why they get stuck:** 

### C4. Multi-user real-time scenario: a customer places an order while an admin approves it in the same test. How do you structure it?
**Ideal approach:** Two isolated contexts in one test ( browser.newContext({storageState:'customer.json'}) and …'admin.json' ), a page in each. Drive both; assert the customer page reflects the admin's action in real time. Contexts can't see each other's cookies but can observe the app changing. Close contexts in teardown.
**Why they get stuck:** 

### C5. A test passes on Chromium and Firefox but fails only on WebKit. How do you approach it?
**Ideal approach:** First determine if it's a product bug (real Safari/WebKit divergence — layout, sub-pixel rounding, sticky positioning, focus/date handling, event timing, unsupported web API) or a test issue (assertions on exact bounding boxes, hit-testing near edges, headless-vs-headed differences). Use the WebKit trace. If it's a real Safari behavior, it's a valuable catch; if it's brittle assertions, make them less pixel-exact. Remember WebKit ≈ Safari's engine but not byte-identical to the shipping Safari app.
**Why they get stuck:** 

### C6. Make accessibility a first-class outcome of the framework rather than a separate effort.
**Ideal approach:** Role-based locators ( getByRole , getByLabel ) force tests to depend on accessible names/roles, so passing tests tend to run against an accessible app; when a control is hard to locate by role, that's often a real a11y bug to raise. Layer explicit @axe-core/playwright audits gating serious/critical violations. Frame a11y as a byproduct of locator policy, not a bolt-on suite.
**Why they get stuck:** 

### C7. Design a "self-healing" locator strategy. What does real self-healing require — and what are its limits?
**Ideal approach:** The lightweight built-in version: chain fallbacks with locator.or(...) so an alternative resolves if the primary breaks. True self-healing = tries genuinely different strategies (role/text/attribute/position), completes the run, and reports which locator failed and what worked so the root cause gets fixed. Advanced setups use an LLM to propose a locator from the DOM, gated by a confidence threshold, cached, and — critically — the heal is only accepted if downstream assertions still pass (a repair, not a cover-up). Treat healing as a backup; refactor fragile locators with stable data-testid /role selectors; audit every heal event as tech debt.
**Why they get stuck:** 

### C8. What should NOT be automated in Playwright E2E, and where should those checks live instead?
**Ideal approach:** Keep E2E a thin layer over business-critical journeys (login, search, checkout, payment). Push field-level validation, edge cases, and error branches down to unit/component/API tests (faster, more stable). Also name Playwright's scope limits: no native mobile apps (use Appium/Maestro/Detox), not for pure unit tests, not IE11. Apply the test pyramid.
**Why they get stuck:** 

### C9. Your CI report answers "what failed in this run" but not "which test has been flaky all month." How do you get observability?
**Ideal approach:** The built-in HTML report is per-run and local; for trends aggregate across runs/branches/PRs. Options: blob + merge-reports , junit for CI test tabs, allure-playwright dashboards, or a test-intelligence platform that indexes runs and links traces to PRs. Track flake rate, duration, and stability score over time; attach traces/screenshots to failures.
**Why they get stuck:** 

### C10. How do you keep tests reliable when the app is a constantly re-rendering SPA (React/Vue/Svelte)?
**Ideal approach:** Lean on Locators (lazy, re-queried each use, immune to stale references) and web-first assertions that retry; avoid ElementHandle . Locate by role/label/text so re-renders and class changes don't break tests. Wait on observable outcomes/network responses, never fixed sleeps. Understand actionability checks (attached/visible/stable/enabled/receives-events) to reason about "why did this time out."
**Why they get stuck:** 

### C11. Your automated axe-core scan reports zero violations on a modal, but a screen-reader user says it's unusable. What's the scan missing, and how do you test for it?
**Ideal approach:** Automated scanners like axe-core check static/structural rules (missing labels, contrast, ARIA attributes) but generally can't verify dynamic keyboard behavior: that focus actually moves into the modal on open, that Tab doesn't escape its boundary, that Escape closes it, and that focus returns to the triggering control on close. These map to real WCAG criteria but need scripted keyboard-interaction tests alongside the axe scan, not instead of it.
**Why they get stuck:** 

### C12. Leadership wants a CI gate that fails a PR if Core Web Vitals regress — but your suite runs Chromium, Firefox, and WebKit. Design it.
**Ideal approach:** Lighthouse (and CDP-based tracing generally) only works against Chromium, so a dedicated Chromium-only project carries the performance gate while cross-browser E2E projects run unrelated to it. For metrics captured directly in-browser (LCP, CLS, INP), a PerformanceObserver -based approach gives more control over test conditions than a Lighthouse audit. Gate on regressions against a budget, and remember Lighthouse measures initial load well but is blind to post-load interactions (search, filtering) that a Playwright journey can trigger it against.
**Why they get stuck:** 

### C13. Design the test strategy for a live trading dashboard where price updates must appear within strict latency bounds across concurrent users.
**Ideal approach:** Separate the concerns. Playwright is well suited to verify *correctness* — the right price update reaches the right element after a matching WebSocket frame arrives, exercised across two-plus contexts simulating concurrent users, using frame-event-driven waits rather than fixed sleeps. It is the wrong tool for proving strict latency/throughput SLAs under real load — that's dedicated WebSocket or load-testing tooling.
**Why they get stuck:** 

### C14. A checkout page has three independent feature flags live at once. A naive matrix is eight combinations, and QA can't realistically own 8× the checkout suite. What do you actually test?
**Ideal approach:** Don't test the full combinatorial matrix by default — test each flag's effect in isolation against a fixed baseline of the others (catches most real regressions at a fraction of the cost), and reserve a small number of deliberately-chosen "known risky" combinations, flagged by product/eng as likely to interact, for explicit combination tests.
**Why they get stuck:** 

### C15. Auth tests pass individually but fail intermittently only when the full suite runs in parallel against shared staging. Investigation steps?
**Ideal approach:** Playwright's context isolation covers client-side state (cookies, localStorage) but not server-side session state — if parallel tests authenticate as the same shared account, one test's token rotation or logout can invalidate another's session mid-run. Fix by giving each worker its own dedicated account/tenant, and keep auth-flow tests (login, logout, expiry) in a separate suite from feature tests that merely assume auth already works.
**Why they get stuck:** 

### C16. A product ships in 15 languages. Do you E2E-test all 15 fully?
**Ideal approach:** No — full E2E coverage per locale mostly re-tests the translation vendor's copy, not your code. Run the full functional suite against one or two representative locales (including one RTL and one with longer strings, like German), and run a much thinner smoke test — page loads, key strings render, date/currency formatting is correct, no layout overflow — across the rest. This targets what actually breaks per locale rather than re-verifying business logic 15 times.
**Why they get stuck:** 

### C17. Playwright ships a new major version with breaking changes. You own a 500-test suite. How do you plan the upgrade?
**Ideal approach:** Trial the upcoming version via Playwright's canary release channel against a subset of the suite (or a shadow CI job) before it's generally available, so breaking changes surface early. Read the migration notes, get the full suite green in a branch before merging, and treat "our suite can't upgrade easily" as itself a signal of overly-coupled, version-fragile test code worth fixing regardless.
**Why they get stuck:** 

### C18. Fifteen product teams each maintain their own copy of the same design-system `<Button>`/`<Modal>` test logic, and it's drifted out of sync. Fix it with component testing.
**Ideal approach:** Centralize component tests for the shared design-system library itself, using component-testing mode to mount and assert on each shared component in isolation, and publish it as the source of truth for "how do you test our Button." Product teams import/extend those fixtures instead of re-authoring locator/assertion logic per team, turning a design-system regression into one failing suite instead of fifteen silently-drifting ones.
**Why they get stuck:** 

### C19. Walk through `route.fulfill()`, `route.continue()`, `route.fetch()` + `fulfill()`, and `route.abort()` — and when multiple handlers match one request, what decides which runs?
**Ideal approach:** fulfill() returns a fully controlled fake response without hitting the network. continue() lets the real request through, optionally with overridden headers/method/body. fetch() followed by fulfill() makes the real request and lets you patch the real response before returning it — useful for injecting one bad field into an otherwise-real payload. abort() simulates a transport-level failure (offline, DNS failure, connection reset), not an HTTP error status. When multiple handlers match, they run in reverse registration order, and a handler can call fallback() to pass the request to the next matching handler instead of finishing it itself — the basis for layered, composable routing (a global logging handler plus a test-specific override, for instance).
**Why they get stuck:** 

### C20. Your locator matches two "Save" buttons with the identical accessible name. Beyond scoping your locator to fix the test, what should this make you ask about the product?
**Ideal approach:** Fix the immediate test problem by scoping to the correct region or filtering — but flag it further: two controls sharing one accessible name is frequently a real accessibility defect, not just a locator inconvenience, since a screen-reader user hears "Save, Save" with no way to tell them apart either. Treat a strict-mode collision as a possible signal worth raising with product or design, not only an obstacle to script around.
**Why they get stuck:** 

### C21. A user is halfway through a long form when their session expires in the background. What should the product do, and how do you test it — distinct from testing a session that's already expired before the test starts?
**Ideal approach:** This differs from starting a test with an already-expired token, which only tests "reject an old token." Here, expire the session while the user is actively interacting — via a test API, or by making the next request return the real 401 the backend would send — then assert on what happens to their in-progress input: ideally it's preserved (saved to a draft, or resubmitted after re-authentication) rather than silently lost, and the user is routed to re-authenticate rather than shown a confusing generic error.
**Why they get stuck:** 

### C22. Design the test coverage for a checkout flow that hands off to a third-party payment provider.
**Ideal approach:** Define the boundary explicitly with the team first. The bulk of functional tests mock the application's own server-facing payment result (success, decline, specific error codes) to exercise every branch deterministically without touching real money; a small number of tests run against the provider's official sandbox/test-card environment to validate the actual redirect/iframe/webhook integration; and no test — mocked or sandboxed — should ever be able to create a real charge. Provider test credentials live in the CI secret store like any other credential, never in test code.
**Why they get stuck:** 

### C23. A page registers a Service Worker that intercepts and answers requests itself — and your `page.route()` mocks stop taking effect for those requests. What's happening?
**Ideal approach:** A Service Worker can intercept fetches at the browser network layer before Playwright's routing gets a chance to act on them, since the Service Worker effectively becomes its own network layer for requests it claims. Options: unregister or bypass the Service Worker for the test context (Playwright can disable Service Workers via a context option), or, if the Service Worker's caching/offline behavior is itself under test, mock at a layer the Service Worker can't shadow — the actual backend response it would fetch, via route.fetch() , or a dedicated test-only backend endpoint.
**Why they get stuck:** 

### C24. Your payment provider's sandbox is unreliable, and their terms of service prohibit automated interaction with it entirely — you can't drive it and aren't permitted to script against it. How do you get any coverage of the integration at all?
**Ideal approach:** When you can't touch the third party at all — not even a sandbox — the integration boundary has to move entirely to your own backend: build and maintain a stub of the provider's webhook/callback contract that your own team owns and controls (validated periodically, manually or via a low-frequency scheduled check, against the provider's actual current contract so it doesn't quietly drift), and test against that stub for everything automated. This goes a step further than "mock the app's own server-facing result" — here, zero automated coverage ever touches the provider, by requirement, so contract-drift risk is managed by manual periodic verification instead.
**Why they get stuck:** 

### C25. Your Playwright trace shows a completely clean run — every action succeeded, every assertion passed — but the CI job is still reported as failed. How is that possible, and where do you look?
**Ideal approach:** A trace only captures what happened inside the browser; it can't see the CI runner itself. A clean trace with a failed job points outside the test: disk full while writing artifacts, the process running out of memory and getting killed after the test itself finished, a container crash during artifact upload, or the test runner's own timeout firing on a step after the last recorded action. Check the raw CI job logs and resource metrics (memory/disk) for the run, not just the Playwright report, whenever the trace and the job status disagree.
**Why they get stuck:** 

### C26. Your application publishes an event to a message queue (Kafka, SQS, etc.) after a user action, and a consumer processes it asynchronously before the UI reflects the result. How do you test the whole path, not just the UI trigger?
**Ideal approach:** Don't assert on the UI alone and call it covered — the UI update is the last of several hops (publish → consume → process → persist → UI refresh), and a UI-only test can pass even if the consumer silently fails, because the UI might poll or the test might get lucky on timing. Where you own the infrastructure, verify intermediate state directly: that the event was actually published (via a test consumer or the queue's own inspection API) and that the downstream side effect landed (a database row, a follow-up API becoming available) — then assert the UI reflects it, waiting on the real end condition rather than a fixed delay. Where you don't own the queue in the test environment, at minimum assert on the API/database state the consumer is supposed to produce, not only the UI.
**Why they get stuck:** 

### C27. "Place order" fails somewhere behind the UI — could be the API gateway, payment, inventory, notifications, or shipping. Where do you start, and what should you never do first?
**Ideal approach:** Never start by re-running the UI test and staring at the browser — in a microservices system the UI is the last hop, not the first place to look. Start from what the request actually did behind the scenes: pull the correlation/trace ID for that request, follow it through the API gateway and each service's logs, check response times and error rates per service, and confirm which service actually returned the failure before touching the frontend at all. Only once the failing service is identified does it make sense to reproduce and debug at the UI layer, if the UI layer is even where the fix belongs.
**Why they get stuck:** 

## Tier D — Lead / Solutions Architect (9+ years)

Platform economics, migration, governance, and org-scale decisions for 9+ years. Prefer scenarios with a forcing function — a number, deadline, or cross-team constraint.

### D1. You join a company with zero automation. Design a Playwright framework (TS) to scale to thousands of tests across a growing team. Folder structure, fixtures, POM vs component-object, config/env layering — and what you deliberately won't build.
**Ideal approach:** Clear conventions ( tests/ by feature, pages/ or components/ , fixtures/ , utils/ , config/ ) so it's obvious where new tests go. Fixtures over manual instantiation ( base.extend ) to inject POMs + shared auth. Critique POM: for large SPAs a component-object/hybrid (objects per reusable component, not per whole page) scales better. Config/env layering: projects[] for browsers/environments, env vars per stage, centralized retries/timeouts/trace policy, storageState auth. Restraint: no premature abstractions, no custom framework atop Playwright, no hand-rolled parallelism.
**Why they get stuck:** 

### D2. Cross-browser at scale: build-vs-buy. Self-hosted grid vs managed cloud (BrowserStack / LambdaTest / Microsoft Playwright Testing). Decide and justify to leadership.
**Ideal approach:** Frame as total cost of ownership , not license price — "build" carries engineer-time + infra + perpetual maintenance. (Autonoma AI's June 2026 cost model estimates an in-house framework for a 5-engineer team at roughly $340,000 over three years vs. a managed platform at $60,000–$90,000 at a $160k fully-loaded engineer cost; its companion in-house-grid model puts annual grid TCO at $70,000 to $147,000 — treat these as vendor estimates, but the *structure* of the argument is the point.) Playwright-specific insight: context isolation + on-machine parallelism make a classic self-hosted Selenium Grid largely unnecessary. Buy/rent when you need real-device/wide OS-browser matrices, compliance, or speed-to-coverage. Build/self-host when data-control/cost dominate and the matrix is mostly Chromium+Firefox with someone owning container infra. Name trade-offs; "always build/always buy" is a red flag.
**Why they get stuck:** 

### D3. The org regression run is a 45-minute nightly blocking releases across teams. Scale execution — and say when native sharding stops being enough.
**Ideal approach:** Distinguish workers (vertical, one machine) from shards (horizontal, many machines); tune workers first, add sharding when a machine is maxed. Native sharding limits: static pre-assignment, blocking (slowest shard gates the job), and splitting by file-path lexical order → unbalanced load. Next tier: an orchestrator that load-balances by historical timing. Add execution-time budgets, smoke/regression tiering, cross-machine report aggregation, and trace:'on-first-retry' . Hard prerequisite: test isolation — "a discipline problem, not a config problem."
**Why they get stuck:** 

### D4. 50+ engineers write Playwright. Enforce a locator policy, review standards, and lint rules so the suite doesn't rot.
**Ideal approach:** Locator policy: role/user-facing first, getByTestId sparingly, CSS fallback, avoid XPath . Enforce via ESLint ( @typescript-eslint/no-floating-promises / await-thenable to catch missing awaits; eslint-plugin-playwright rules on test globs) run in CI, plus PR quality gates and review standards. Ownership: shared fixtures with named owners; feature teams review their Playwright PRs (break the QA silo). It's "a discipline question, not a tooling question — pick a stable strategy on day one."
**Why they get stuck:** 

### D5. A few flaky tests break the build for every team. Design a quarantine policy that doesn't just paper over the problem.
**Ideal approach:** Diagnose-before-quarantine via traces; categorize (locator/wait/data/environment/product). Set a named threshold (e.g., "flaky if it fails N of M runs"). Mechanics: tag @flaky , exclude from the release gate but keep running it in a nightly quarantine job with retries. Every quarantined test needs a ticket ID, an owner, and a review/expiry date, and the quarantine count must be visible in CI. Retries: 0 local, 1–2 CI; >2 usually hides a deeper problem. If the list only grows, you're "archiving pain," not managing quality.
**Why they get stuck:** 

### D6. Design the org-wide CI/CD test strategy: smoke vs regression tiers, nightly runs, quality gates, reporting/observability — across GitHub Actions / Azure DevOps / Jenkins.
**Ideal approach:** Tier by feedback speed: fast smoke on every PR (blocks merge); full sharded regression nightly. Mechanics: official Docker image, matrix sharding, retries, trace+HTML artifacts. Deterministic quality gate : typecheck + lint + Playwright + traces gate the merge; a green build with 12 flaky tests must not look like a clean green build. Observability: aggregate across shards/machines. Watch the binary-caching gotcha (large downloads balloon startup).
**Why they get stuck:** 

### D7. You own a 3,000-test Java Selenium suite on Selenium Grid. Leadership wants Playwright. Big-bang or incremental? Give the strategy and the traps.
**Ideal approach:** Reject big-bang (silent coverage gap indefensible at a prod incident), naive parallel-maintenance (burnout, no ROI), and lift-and-shift. Use incremental strangler-fig : all *new* tests in Playwright from day one; run both in CI during transition; migrate highest-value/flakiest Selenium tests opportunistically. Analyze→Optimize→Migrate: don't port garbage — delete dead tests, push UI checks that belong at API layer down. Governance during coexistence: "No New Selenium" rule. Grid retirement is an explicit phase once projects cover the browser matrix. Prove ROI with KPIs. It's "an operating model change, not a rewrite."
**Why they get stuck:** 

### D8. Handle the WebDriver→Playwright API mapping mechanically. What must be rewritten rather than wrapped?
**Ideal approach:** Core mapping: driver.get() → page.goto() ; findElement(By.id) → page.locator("#id") or better getByRole/getByLabel ; sendKeys → fill() ; WebDriverWait + ExpectedConditions →deleted (auto-waiting); Assert.assertEquals → expect(locator).toHaveText() ; @BeforeMethod/@AfterMethod →removed; Thread.sleep() →removed. Infra: Grid/Hub→built-in --shard ; TestNG XML→ projects[] ; ThreadLocal<WebDriver> →browser contexts. Rewrite (not wrap): the locator+assertion+wait layer is the heart of a Selenium test and doesn't port — "you're adopting a different execution model." A first refactor pass removes every waitForTimeout left over from Selenium habits.
**Why they get stuck:** 

### D9. How do you handle authentication architecture across a very large suite (roles, MFA, expiry, rate limits)?
**Ideal approach:** Capture storageState once per role (setup project or worker-scoped fixture) and reuse; never log in per test. Prefer API/token login where possible. Handle MFA (test-only bypass/seeded TOTP in non-prod), session expiry (refresh strategy), and per-test variations of the logged-in state. Keep .auth/ gitignored; credentials in a secret manager.
**Why they get stuck:** 

### D10. Governance of AI-assisted test authoring (codegen, MCP, LLM self-healing) at org scale — how do you adopt it without losing control or leaking data?
**Ideal approach:** Freeze the target architecture first via a rules file so AI migrates *into* your architecture. Separate autonomous low-risk read-only tasks from approval-required state-mutating/generative tasks with a human checkpoint. Data privacy: enterprise LLM endpoints with zero retention, DOM redaction of PII/tokens before sending to an MCP server, agents sandboxed to isolated contexts with synthetic data — never production. Treat AI output like any code: review, locator discipline, same flaky-test management.
**Why they get stuck:** 

### D11. Six months in, someone notices your shared CI artifact bucket — browsable by most of engineering — holds Playwright traces and HTML reports containing plaintext passwords typed via `fill()` and auth tokens visible in the network panel. What's the fix, and what are today's real limits?
**Ideal approach:** Be direct that this is a known, currently-open gap rather than a config flag you're missing — there is no built-in way yet to redact arbitrary sensitive values from traces, reports, or console logs. Mitigate at the layers that do exist: element-level screenshot masking for visual captures, environment variables plus your CI's secret store instead of literal credentials in test code, and — the real fix today — restricting who can access the artifact bucket, plus treating test-environment credentials as disposable and rotatable. Name artifact access control, not the browser layer, as the actual mitigation until native redaction ships.
**Why they get stuck:** 

### D12. It's 2026 and your org wants AI agents for test authoring/maintenance. MCP server, Playwright-as-CLI-skill, or Playwright's built-in Test Agents — and why?
**Ideal approach:** These solve different problems, not competing options for the same job. MCP gives an agent a live, structured connection to a real browser grounded in the accessibility tree — valuable when the agent must iteratively explore and reason about page state — but reported benchmarks put it at roughly four times the token cost of a CLI-skill approach for comparable coverage, and long MCP sessions carry a context-staleness risk: a stale accessibility tree can make the agent confidently act on the wrong element, producing consistent-not-flaky failures easy to misdiagnose as ordinary flakiness. CLI-skill invocation is cheaper when the agent just needs to execute a known test. Built-in Test Agents are a role-specialized plan/generate/heal pipeline for authoring and maintaining suites at scale, layered on a mature framework rather than replacing one.
**Why they get stuck:** 

### D13. A SaaS product must show different pricing, currency, and legally-required disclaimers per country, and EU user data must never leave the EU. Design the test coverage.
**Ideal approach:** Separate three concerns that get conflated. Presentation: geolocation/locale emulation verifies the right pricing/currency/disclaimer renders per region — a client-side, easily-parallelized E2E concern. Data residency: verifying EU data is actually served from and stored in EU infrastructure is a backend/infrastructure assertion Playwright can help trigger but shouldn't be the system of record for proving. Compliance sign-off: legally-mandated disclaimer text needs legal review of the copy itself, not just automated presence-checking. Keep these three explicitly separate and owned.
**Why they get stuck:** 

### D14. Product plans a 4-week canary rollout (1% → 100%) for a risky rewrite and asks whether the Playwright regression suite can be thinner for this release as a result. How do you respond?
**Ideal approach:** Push back on the framing: canaries and automated regression tests catch different failure classes and aren't substitutes. A canary catches what shows up in aggregate metrics once real traffic hits it, and doesn't catch a broken user journey unless that journey is instrumented and someone is watching; "traffic looked normal at 10%" isn't a statistically rigorous check. Keep the regression suite at full strength as the pre-release gate, and treat the canary as an additional post-release net for unknown-unknowns.
**Why they get stuck:** 

### D15. Design the testing/observability boundary for a real-time collaborative editor — what does Playwright own, and what doesn't it?
**Ideal approach:** Playwright owns correctness of merge/sync behavior as observed in the UI: two-plus contexts representing concurrent editors, driving conflicting edits, asserting the eventual UI state converges correctly, using waits tied to the actual sync messages. It does not own proving the underlying conflict-resolution algorithm holds at scale, or that the system survives hundreds of concurrent real editors. Stating this boundary explicitly stops the suite from being asked to prove things it structurally can't.
**Why they get stuck:** 

### D16. An audit finds 340 feature flags, many unowned and years old, with CI time creeping up as flag-conditional paths multiplied. What's the governance fix?
**Ideal approach:** This is a flag lifecycle problem, not a testing problem to solve one test at a time: require an owner and an explicit removal date on every new flag at creation, run periodic audits flagging any toggle stuck at 0% or 100% for months as a removal candidate, and default new coverage to the flag's current default state only. Tie cleanup to the same PR process as any other tech debt, with a visible count leadership can see.
**Why they get stuck:** 

### D17. Your platform integrates with 20+ enterprise customers' own SSO/SAML identity providers, each its own sandbox with its own rate limits. Release velocity keeps getting blocked by a flaky third-party IdP sandbox. Redesign the architecture.
**Ideal approach:** Decouple release velocity from any single IdP's availability: the release-gating suite authenticates via a mocked/stubbed SAML assertion or OAuth response your app trusts identically to a real one, while real-IdP integration tests run separately, on a schedule rather than per-PR, against a curated subset of representative sandboxes.
**Why they get stuck:** 

### D18. Legal mandates an accessibility compliance program, and your axe-core gate already runs on every PR. Is that gate enough to tell legal "we're compliant"?
**Ideal approach:** No, and say so directly: automated tools are estimated to catch only a fraction of WCAG success criteria — meaningful reading order, whether alt text is actually descriptive, real screen-reader usability, and cognitive-load criteria all need human and assistive-technology testing no scanner performs. A defensible program pairs the automated PR gate with a periodic manual/AT audit, and reports the automated gate to legal as a floor, not the ceiling.
**Why they get stuck:** 

### D19. A fixture creates a test record via API and deletes it in teardown. What happens when teardown itself fails, and how do you stop orphaned data from accumulating for months?
**Ideal approach:** Don't let the happy-path teardown be the only cleanup mechanism — a crashed test, a killed CI job, or a teardown call that itself 404s all skip client-side cleanup. Two layers: make the fixture's teardown tolerant of "already deleted" as a success case, and back it with an environment-level sweep — a scheduled job that deletes anything matching the test-data naming convention past an age threshold — as the real backstop. Tag all test-created data with a consistent, greppable prefix specifically so that backstop can find it.
**Why they get stuck:** 

### D20. Your team is leaving Selenium+TestNG+Cucumber for Playwright. Some stakeholders — including non-technical ones who review Gherkin scenarios — want to keep the BDD layer; others want plain TypeScript tests. How do you decide, and what does the architecture look like either way?
**Ideal approach:** Treat this as a stakeholder-value question before a technical one. Gherkin's value is a shared, readable specification non-engineers can review — if that readership genuinely exists and uses it, keep Cucumber-over-Playwright (step definitions calling Playwright page objects, sharing browser/context through Cucumber's World object). If only engineers ever actually open the feature files, the BDD layer is pure translation overhead, and plain TypeScript tests with well-named describe/test blocks give most of the readability without it. Either way, name the ongoing cost: Cucumber adds a step-definition-matching layer that becomes its own maintenance burden.
**Why they get stuck:** 

### D21. Engineers routinely see red Playwright runs, shrug, and merge anyway — automation has stopped being trusted. You're asked to fix that. Where do you actually start?
**Ideal approach:** Don't start by writing more tests — start by making the existing signal trustworthy again, since trust was lost to false failures, not insufficient coverage. Audit and eliminate concrete sources of false-positive red builds (static waits, shared mutable test data, brittle structural locators, retry-masked root causes), then make the *evidence* for real failures cheap to access (trace, video, screenshots attached automatically, not something someone reproduces locally to understand). Trust is rebuilt incrementally by a visible run of genuinely-actionable red builds, not an announcement that things are fixed now.
**Why they get stuck:** 

### D22. One codebase serves 100 different customers, each with their own logo, language, permission set, and enabled features — but it's genuinely one application, not 100 forks. Design the test coverage.
**Ideal approach:** Never write or generate a test per tenant — an N-times maintenance multiplier for zero added confidence, since the application code is shared. Make tenant identity a configuration input the same way environment or locale already are: a small config per tenant (or a handful of representative tenant archetypes covering the meaningfully different combinations, not all 100 literally) that the suite reads to know what to expect, with test logic identical across tenants. Run the full suite against a couple of real configurations and a lighter smoke pass across the rest, weighted toward the riskiest combinations.
**Why they get stuck:** 

### D23. Security mandates that no authentication cookies or tokens may be persisted to disk anywhere in the pipeline — ruling out the standard storageState-on-disk pattern. Redesign authentication for the suite.
**Ideal approach:** Keep the goal (skip repeated UI logins) while dropping the specific mechanism security objected to. Options: authenticate via API at the start of each worker and hold the token/cookies only in memory for that worker's lifetime, regenerating rather than persisting between runs; or use short-lived, test-scoped credentials issued fresh per run and never written to disk. The requirement forces an explicit conversation with security about what "acceptable" looks like rather than assuming the standard pattern is the only option.
**Why they get stuck:** 

### D24. One framework needs to drive web (Playwright), native mobile (a different tool entirely), and API tests, and leadership wants "one framework" so business logic isn't duplicated three times. Design it.
**Ideal approach:** "One framework" should mean one shared core — test data builders, environment config, reporting, business-level assertions/domain language — with platform-specific *drivers* underneath (Playwright for web, a mobile automation tool for native, an HTTP client for API), not literally one tool doing all three, since Playwright doesn't drive native mobile apps. A shared abstraction (e.g., a login-flow concept implemented once per platform driver, exposing the same interface to test authors) lets a test author write "log in as admin" once conceptually while the mechanics differ per platform.
**Why they get stuck:** 

### D25. A hundred teams depend on your shared framework. You need to ship a breaking change (e.g., a fixture signature change) without freezing every team's work until they all migrate simultaneously. How?
**Ideal approach:** Publish and version the framework like the internal product it is — semantic versioning, with the breaking change landing behind a major-version bump teams opt into on their own schedule. Ship a deprecation period where old and new signatures both work (with a warning on the old path), give a concrete removal date, and provide a migration guide or codemod for the mechanical part of the change.
**Why they get stuck:** 

### D26. Fifteen product teams use your shared framework, and each has organically adopted a different design pattern — Page Object Model, Component Objects, and Screenplay all coexist. New engineers can't move between team codebases without relearning the architecture each time. Fix it without a rewrite.
**Ideal approach:** A shared framework's job is to define standards, not remain neutral among however many patterns teams happen to gravitate to — competing architectural styles under one framework name destroys the portability a shared framework was supposed to provide. Pick one sanctioned pattern, publish it with a reference implementation and lint rules that flag deviation, and migrate incrementally as teams touch existing code rather than mandating a stop-the-world rewrite. Leave clearly-scoped extension points for legitimate team-specific needs, but not architectural pattern choice itself.
**Why they get stuck:** 

### D27. A shared utility function three hundred tests depend on gets modified by one team for their own needs, and five hundred unrelated tests across other teams break the next morning. How do you prevent this class of incident?
**Ideal approach:** Treat the framework's own code as a product with its own quality bar: unit and integration tests for shared utilities and fixtures themselves, semantic versioning with a real deprecation policy instead of silent breaking changes, mandatory review from framework owners on any PR touching shared code, and a compatibility test run against a representative sample of consuming teams' suites before a shared-code change merges.
**Why they get stuck:** 

### D28. Test execution itself is fast, but the cloud bill for running it has tripled, and leadership wants costs down without losing coverage. Where do you look?
**Ideal approach:** Separate "fast" from "cheap" — they're not the same axis. Audit what's driving spend: expensive tiers (full cross-browser, visual regression) running on every commit when they only need to run nightly; worker/machine sizing over-provisioned by default; browser binaries re-downloaded every run instead of cached; sharding used even where a single machine's parallelism was never saturated. Tier execution by risk and frequency, and measure cost per pipeline run as an explicit, tracked metric — not just wall-clock time.
**Why they get stuck:** 

### D29. Fifteen different backend systems (Salesforce, SAP, Oracle, ServiceNow, and others) each need their own test integration, and every new system currently means bolting more special-case code onto the core framework. Redesign it.
**Ideal approach:** Invert the dependency: define a plugin interface the core framework exposes — how a system-specific plugin registers itself, provides its own fixtures/setup, and reports results back — and implement each backend integration as a plugin behind that interface, rather than the core accumulating direct knowledge of each system. The core should get simpler over time as integrations grow, not more complex.
**Why they get stuck:** 

### D30. Production runs blue-green: half of live traffic is on the previous version, half on the new one, during every deployment window — and your suite becomes unreliable specifically during those windows. Fix the architecture.
**Ideal approach:** Make version-awareness explicit test setup: have the suite detect (via a response header, a version endpoint, or an explicit parameter) which version it's actually exercising before asserting on version-specific behavior, and load the matching expected-behavior configuration for that run. This is the same "read the actual variable, don't assume a constant" fix that resolves feature-flag and canary testing.
**Why they get stuck:** 

### D31. Your team merges roughly fifty pull requests an hour, and running the full regression suite on every one is no longer physically possible within a reasonable feedback window. Redesign the CI strategy.
**Ideal approach:** Move from "run everything, every time" to test impact analysis: map which tests exercise which parts of the codebase (via coverage data or a dependency graph), and on each PR run only the tests whose mapped area overlaps the diff, with the full regression suite still running on a schedule as a backstop against mapping gaps. This trades a small, bounded risk (a regression outside the mapped area, caught later by the nightly run) for a PR feedback loop people actually watch.
**Why they get stuck:** 

### D32. Your primary CI provider has an extended outage, and testing needs to continue regardless. What does "designed for this" look like, and is it worth building before an outage actually happens?
**Ideal approach:** Keep the actual test invocation (install, run, report) in a plain script any CI system calls the same way, so switching providers — or running locally, or in a fallback environment — is pointing a different orchestrator at the same script, not rewriting pipeline logic. Whether to build this proactively is a real cost/benefit call: weigh the usually-low probability and usually-short duration of a total outage against the ongoing cost of maintaining vendor-agnostic abstraction. For most teams, documenting a manual fallback is proportionate; full multi-provider redundancy is only worth it if release cadence genuinely can't tolerate any pause.
**Why they get stuck:** 

### D33. The company has four separate products, each in its own repository, and each has independently reinvented its own reporting, fixtures, and utilities. Leadership wants shared infrastructure without forcing everything into one monolithic repo. Design it.
**Ideal approach:** Extract the genuinely shared pieces — reporting, common fixtures, shared utilities, core configuration patterns — into a versioned internal package that each product repository depends on and upgrades independently, rather than merging repositories or copy-pasting the same code four times. Product-specific tests and page objects stay in their own repositories, owned by that product's team; only genuinely cross-cutting infrastructure centralizes.
**Why they get stuck:** 

### D34. Leadership keeps hearing "5,000 tests, 98% pass rate" and visibly doesn't care — they want to know if automation is actually working. Redesign what gets reported upward, and make the case for continued investment.
**Ideal approach:** Report outcomes leadership can act on, not volume: defect leakage, mean time to detect and repair a real regression, flaky-test percentage (a proxy for how much the pass rate can be trusted), pipeline duration against release cadence, and — the metric that actually justifies budget — production incidents the suite would have caught versus ones it structurally couldn't, framed as risk avoided in terms leadership already tracks (incident cost, downtime). Pair any coverage number with which business-critical journeys are and aren't covered. The ROI case is this reporting shift itself.
**Why they get stuck:** 

### D35. Your company acquires two other companies with completely different tech stacks (one has no automation at all, one has a mature but different framework), and separately the product is moving toward independently-deployed micro-frontends owned by different teams. Design the automation strategy across both kinds of heterogeneity.
**Ideal approach:** Don't force convergence on day one in either case — converge on outcomes and interfaces, not implementation. For the acquisitions: define what "adequately tested" means as an outcome (critical-journey coverage, a flakiness ceiling, a CI gate) and let each acquired team evolve their existing tooling toward that bar on a realistic timeline, rather than mandating an immediate rewrite that stalls their product work. For micro-frontends: since each is independently deployed, each should own its own test suite scoped to itself, with a thin, centrally-owned integration/contract layer verifying the seams (shared navigation, cross-fragment data contracts), so no team's release is gated on every other team's suite.
**Why they get stuck:** 

### D36. Leadership wants “AI writes all our Playwright tests.” What governance do you put around Playwright Test Agents (planner / generator / healer) before enabling them in CI?
**Ideal approach:** Treat agents as scaffolding with review gates, not ownership. Require human approval of locators, assertions, and especially skips — the healer may skip when it believes the product is broken, which *changes suite signal*. Ban discouraged APIs ( networkidle , hard sleeps) in agent prompts to match healer guidance. Track generation cost and re-run new tests several times before merge. Interview line: “AI scaffolds; humans own architecture.”
**Why they get stuck:** 

### D37. Your product is an LLM chat app: streaming tokens, tool calls, and non-deterministic answers. How do you design Playwright coverage without asserting exact prose?
**Ideal approach:** Assert contracts and UX states , not golden strings: stream started/finished indicators, tool-call side effects in the UI, citation chips present, error/retry banners, stop-generation cancel, and schema-validated API fixtures via route . Use seeded prompts + stubbed model responses for determinism in CI; reserve a small “live model” canary nightly. Prefer ARIA snapshots for layout of the transcript chrome over pixel screenshots of token text.
**Why they get stuck:** 

### D38. An MCP client drives your app in a demo. What do you test in Playwright vs leave to the MCP evaluation harness?
**Ideal approach:** Playwright owns the product UI and auth boundaries : login, permissions, destructive action confirms, and that MCP-driven mutations still leave the UI consistent. The MCP harness owns tool-schema correctness and agent planning quality. Share one browser via browser.bind() when documenting the dual path, but keep CI suites independent so an LLM flake cannot red the product gate.
**Why they get stuck:** 

### D39. A vendor demo shows “self-healing selectors” fixing CI overnight. How do you evaluate it for a regulated product?
**Ideal approach:** Demand evidence on false heal rate , audit trail (what changed, who approved), reproducibility, and failure mode when the product is actually broken (must not silently skip). Run a bake-off on your flakiest 20 tests with heal disabled vs enabled, measuring escaped defects. Prefer Playwright’s first-party agents with review gates over opaque vendor magic if auditability is required.
**Why they get stuck:** 

### D40. You must cut the interview bank to a “QA 75” curated core for a two-week prep sprint. How do you choose what stays?
**Ideal approach:** Keep forcing-function scenarios: flake triage, locator priority, storageState, hybrid API+UI, sharding economics, and agent governance (D10/D36). Drop duplicate mechanism questions and trivia. Pair each kept card with a runnable drill (Bank Demo, lab, or mini-app) — Dunlosky: retrieval + spacing beat rereading. Publish the cut list so candidates know the contract.
**Why they get stuck:** 
