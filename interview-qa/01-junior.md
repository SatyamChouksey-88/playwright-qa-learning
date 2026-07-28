# Tier A — Beginner / Fresher (0–2 years)

Scenario-based screening questions for 0–2 years. Read each scenario out loud, then compare to the ideal approach — the "why they get stuck" line tells you which instinct to override.

*Quick index: A1 element not found · A2 waitForTimeout · A3 unstable locators · A4 confirm dialog · A5 strict-mode violation · A6 file upload · A7 file download · A8 new tab · A9 slow login · A10 webServer config · A11 cross-browser · A12 missing await · A13 CAPTCHA policy · A14 geolocation permission · A15 locale/currency · A16 mobile tap vs click · A17 custom dropdown · A18 notification permission · A19 offline simulation · A20 component testing · A21 multi-step form retention · A22 image-load verification · A23 fixture isolation surprise · A24 browser-upgrade breakage · A25 inconsistent API data*

### A1. A test passes locally but the element "isn't found" even though you can see it on the page. What do you check?
**Ideal approach:** Confirm it isn't a timing issue first (Playwright auto-waits, but you may be reading state too early with a non-retrying check like `isVisible()` instead of `await expect(locator).toBeVisible()`). Then check: is the element inside an **iframe** (needs `frameLocator`) or a **shadow root** (open roots are pierced automatically; closed ones can't be reached)? Is the locator matching multiple elements (strict-mode violation)? Is it behind an overlay/modal (fails actionability "receives events")? Use the trace/Inspector "pick locator" to verify.
**Why they get stuck:** Freshers reach for `waitForTimeout` or `force:true` instead of diagnosing; they don't know iframes/shadow DOM change the lookup, and they confuse "in the DOM" with "actionable."

### A2. Your test uses `page.waitForTimeout(3000)` and still fails on the CI machine. Why, and what do you do?
**Ideal approach:** Hard sleeps are both too short on slow CI and wasted time on fast machines. Replace with a **web-first assertion** on the observable end-state (`await expect(page.getByRole('alert')).toHaveText('Saved')`) or wait for the specific network response. Auto-waiting handles most cases.
**Why they get stuck:** They treat `waitForTimeout` as the fix rather than the cause; they don't know assertions auto-retry until `expect.timeout`.

### A3. The login form has fields with no stable IDs and auto-generated class names. How do you locate them reliably?
**Ideal approach:** Prefer user-facing locators: `getByLabel('Email')`, `getByRole('textbox', {name: 'Email'})`, `getByPlaceholder(...)`. If none exist, ask devs to add `data-testid` (or configure `testIdAttribute`). Anchor CSS to a stable parent as a last resort; avoid brittle structural XPath like `//div[2]/form/button[1]`.
**Why they get stuck:** They default to copied CSS/XPath from DevTools and don't know the recommended locator priority order.

### A4. You need to test a "Delete account?" browser confirm dialog. How do you handle it?
**Ideal approach:** Register `page.on('dialog', async d => { …; await d.accept(); })` **before** the click that triggers it; for prompts pass text to `accept('...')`. If no handler is registered, Playwright auto-dismisses. Distinguish native dialogs (`alert/confirm/prompt`) from in-page modals, which are just DOM elements clicked with normal locators.
**Why they get stuck:** They register the handler after the click (race), or try to locate a native alert with a selector.

### A5. A "Sign in" button appears twice on the page and your click throws a "strict mode violation." How do you fix it?
**Ideal approach:** Narrow the locator rather than disable strictness: scope to a parent (`page.getByRole('dialog').getByRole('button', {name:'Sign in'})`), `.filter({hasText})`, or explicitly `.first()/.nth()` only when position is truly what you want. Strict mode is a feature that catches ambiguous selectors early.
**Why they get stuck:** They reach for `.first()` reflexively (hiding a real ambiguity) or think strict mode is a bug.

### A6. How do you upload a file when the visible "Upload" control is a styled button, not a real file input?
**Ideal approach:** Two options — call `setInputFiles()` directly on the hidden `input[type=file]`, or use the `filechooser` event: set up `page.waitForEvent('filechooser')`, click the styled button, then `chooser.setFiles(path)`. Buffers work for synthetic in-memory files.
**Why they get stuck:** They try to click the styled button and "type" a path; they don't know about the filechooser event or targeting the hidden input.

### A7. Clicking "Export CSV" triggers a download. How do you capture and verify it?
**Ideal approach:** Set up `const downloadPromise = page.waitForEvent('download')` **before** clicking, then `const download = await downloadPromise; await download.saveAs(...)`. Verify `suggestedFilename()` or read the stream contents. It's a one-shot wait.
**Why they get stuck:** They click first then wait (missing the event), or expect a popup/dialog instead of a download event.

### A8. Clicking a link opens a new tab. How do you interact with the new tab?
**Ideal approach:** Capture it via the context/page event before the click: `const [popup] = await Promise.all([context.waitForEvent('page'), link.click()])`; then `await popup.waitForLoadState()` and treat it as a normal Page. Note tabs in the same context share cookies.
**Why they get stuck:** They don't set up the event listener before the action; they confuse a native dialog with a new page.

### A9. Login takes 5+ seconds and every one of your tests logs in through the UI. What's the problem and the simplest first improvement?
**Ideal approach:** Repeated UI login is slow and fragile. Log in once and reuse **storageState** (cookies + localStorage) across tests, injected via config `use.storageState` or a setup project. This is the single biggest speed win in most suites.
**Why they get stuck:** They know storageState exists but can't explain the setup-project/dependency wiring, or don't connect it to speed/stability.

### A10. Your test needs the app running at localhost:3000. How should the suite start it?
**Ideal approach:** Use the `webServer` config block (command + url + `reuseExistingServer: !process.env.CI`) so the app boots before the suite and is reused locally but freshly started in CI. Removes "did you start the server?" as a human failure mode.
**Why they get stuck:** They start it manually or shell out in package.json; they don't know `webServer` exists.

### A11. How do you run the same test across Chromium, Firefox, and WebKit, and why would you bother?
**Ideal approach:** Define `projects[]` in the config, one per browser/device; run all with `npx playwright test` or one with `--project=webkit`. Rationale: engines differ (WebKit = Safari's engine; catches Safari-only layout/focus/date bugs). Note bindings: same concept in Java (`projects` in config or parameterized runners).
**Why they get stuck:** They've only ever run Chromium and don't know projects are also how you split roles/environments.

### A12. A colleague wrote `page.click('#save')` without `await`. What happens?
**Ideal approach:** A floating promise — the action fires but the test may move on before it resolves, causing intermittent failures. This is one of the most common flakiness sources. Enable the ESLint rule `@typescript-eslint/no-floating-promises` to catch it. (Node/TS-specific; in Java every call is synchronous so this class of bug doesn't exist — a good contrast point.)
**Why they get stuck:** Freshers don't grasp that every Playwright JS/TS call is async, and don't know lint can catch it.

### A13. A login test suddenly shows a CAPTCHA/verification challenge that wasn't there before. What's your first move?
**Ideal approach:** Treat it as an environment/configuration signal, not something to defeat programmatically — CAPTCHA and bot-challenge systems exist specifically to tell automation apart from humans, so "solving" them inside a legitimate test suite is the wrong instinct. Get the challenge disabled or issued a test-only bypass key in non-production environments, coordinated with dev/security teams. If a challenge does appear in CI, the test should detect it and fail fast so the environment issue gets investigated — not route around it with solver services or stealth plugins.
**Why they get stuck:** Under pressure, candidates often jump to "I'd use a CAPTCHA-solving service or a stealth plugin," which is both fragile (constant upkeep as detection evolves) and, in a real org, a security/legal red flag. The strong answer redirects to environment ownership instead.

### A14. A delivery app should show "no restaurants near you" when location access is denied, and real results when it's granted for a specific city. How do you test both paths?
**Ideal approach:** Grant or deny the `geolocation` permission at the context level, and separately set coordinates with `context.setGeolocation(...)` (or the `geolocation` config option). Test the denied-permission fallback UI and at least one granted-with-coordinates happy path. Permission and coordinates are two independent settings, and they apply to the whole context, not a single page.
**Why they get stuck:** They know geolocation can be mocked but forget it's two separate switches — granting permission without setting coordinates (or the reverse) silently produces the wrong test.

### A15. The same confirmation page must show "$10.00" in the US and "10,00 €" in Germany, with the German date shown day-first. How do you cover this?
**Ideal approach:** Set `locale` (and usually `timezoneId`) per test — via `test.use({locale: 'de-DE', timezoneId: 'Europe/Berlin'})` or globally in config — then assert on the rendered currency/date strings for each locale. Keep it to a smoke check on formatting logic; testing every translated string belongs to localization/linguistic QA, not E2E.
**Why they get stuck:** Either they don't know `locale`/`timezoneId` are first-class context options, or they overcorrect and try to E2E-test every translated string, bloating the suite for no reliability gain.

### A16. The suite passes on desktop Chromium, but tapping a menu button does nothing when you emulate a Pixel device. Why?
**Ideal approach:** Mobile emulation profiles set `hasTouch: true`, and touch-only controls may listen for `touchstart`/`touchend` rather than a mouse `click`. Use `locator.tap()` — which dispatches real touch events — instead of `.click()`, and confirm the emulated context truly has `hasTouch` enabled (`tap()` throws if it doesn't).
**Why they get stuck:** They treat `click()` as a universal stand-in for "user interaction" and don't consider that some UI code paths are genuinely touch-event-only.

### A17. A "country" field isn't a native `<select>` — it's a text input that opens a custom div-based list when focused. How do you pick "Germany"?
**Ideal approach:** Treat it like ordinary UI, not `selectOption()` (which only targets real `<select>` elements): focus/click the input to open the list, then locate and click the "Germany" option by role/text within the listbox, and assert the list closed with the input now showing "Germany."
**Why they get stuck:** They reach for `selectOption()` out of habit and hit a confusing error, or type the value directly without confirming a real selection event actually fired.

### A18. Clicking "Enable notifications" triggers the real browser permission prompt. How do you test both accept and block?
**Ideal approach:** Native permission prompts (notifications, camera, mic) are controlled the same way as geolocation: grant or deny at the context level before the triggering action, rather than trying to click a native OS-level dialog — which isn't part of the page DOM and can't be located.
**Why they get stuck:** They confuse this with the in-page `dialog` event used for `alert/confirm/prompt`, and try (and fail) to locate a native permission prompt as if it were a web element.

### A19. A "You're offline" banner should appear when connectivity drops and disappear when it's restored. How do you simulate that?
**Ideal approach:** `context.setOffline(true)` flips the emulated network to offline — triggering the app's own online/offline listeners — and `setOffline(false)` restores it. Assert the banner's visibility transitions in both directions, not just the offline state alone.
**Why they get stuck:** They think about killing the dev server or physically disconnecting, instead of realizing the test itself can flip this state.

### A20. Before the full page exists, design wants a test verifying a new `<Button>` component renders its label and fires `onClick` — without the whole app running. Possible?
**Ideal approach:** Yes — Playwright's component-testing mode mounts the component in isolation via a `mount()` fixture, letting you assert on rendered output and simulate interaction without booting the full application. It's a distinct test type from E2E: faster feedback on component-level logic, not a replacement for user-journey tests.
**Why they get stuck:** Candidates who've only done E2E don't know Playwright has a component-testing mode at all, or assume "component test" must mean a Jest/Vitest unit test.

### A21. In a multi-step signup form, data entered on step 1 should still be there if the user clicks back after step 2. How do you verify this?
**Ideal approach:** Fill and submit step 1, advance to step 2, then navigate back and assert the step-1 field still shows the value you entered — using a web-first assertion rather than reading the value once. This tests the form's actual state-persistence behavior (in memory, local storage, or a resubmitted draft), not just that step 1's fields exist.
**Why they get stuck:** They test that each step's fields exist and can be filled, but don't think to test the round trip — forward, then back — which is where multi-step forms actually lose data.

### A22. A teammate says "the logo loads correctly," but an `<img>` tag existing in the DOM doesn't prove the image file itself loaded. How do you actually verify this?
**Ideal approach:** An `<img>` element can exist — and even report as visible — while its `src` 404s or the file is corrupt. Check that the image actually rendered: assert `naturalWidth` is greater than zero via a page evaluation, or capture the network response for that specific asset request and assert its status is 200, rather than only asserting the element is present.
**Why they get stuck:** They equate "the element is in the DOM" or "visible" with "the resource behind it loaded successfully," missing that a broken image can still occupy layout space and pass a naive visibility check.

### A23. Test 1 logs in and lands on the dashboard. Test 2 assumes the user is still logged in and clicks a dashboard button — but test 2 fails, saying the button doesn't exist. Why?
**Ideal approach:** By default, each test gets its own isolated page and browser context — nothing from test 1 carries over, including login state. Tests should never assume implicit continuation from whatever ran before them; a shared starting state has to be created explicitly (a `beforeEach` that logs in, or shared storageState), not assumed from file order.
**Why they get stuck:** Coming from tools where the same browser session persists across an entire script, candidates assume "one test after another" means "continuing the same session" — and are confused when Playwright's default isolation contradicts that.

### A24. A browser engine upgrade lands and 2,000 tests fail overnight, with no application code changes. What do you do?
**Ideal approach:** First confirm it's really the browser update and not a coincident deploy — Playwright ships specific browser builds per version, so pinning the previous Playwright version temporarily rolls back the browser too, isolating the variable. Then triage by pattern, not one test at a time: a mass failure from a single root cause (a changed default, a stricter security policy, a rendering change) usually clusters around one code path — fix that path or add a compatibility shim, rather than touching 2,000 tests individually. Going forward, run new browser versions against the suite in a non-blocking job before adopting them, so this kind of jump gets caught before it's forced on everyone at once.
**Why they get stuck:** They start "fixing" tests one by one before confirming a single shared root cause, turning an hours-long investigation into a days-long slog.

### A25. Two different API calls that should return the same customer record return slightly different data — a test using each endpoint gives inconsistent results. How do you approach this?
**Ideal approach:** This is a product data-consistency question wearing a test-flakiness costume — don't just pick whichever endpoint "usually passes." Confirm which endpoint is the actual source of truth for the field in question, and if both are meant to agree, treat the discrepancy as a bug to report (with both raw responses attached as evidence), not a test to adjust. Only change the test's expectations if product confirms the two endpoints are intentionally allowed to diverge (e.g., one is cached or eventually consistent).
**Why they get stuck:** They treat it as "the test is flaky" and adjust the assertion to whichever value shows up, silently hiding a genuine backend consistency bug.

---
