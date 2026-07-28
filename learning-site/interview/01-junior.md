---
tier: A
tier_key: tierA
id: interview-tier-a
title: Tier A — Beginner / Fresher (0–2 years)
lead: Scenario-based screening questions for 0–2 years. Read each scenario out
  loud, then compare to the ideal approach — the "why they get stuck" line tells
  you which instinct to override.
difficulty: beginner
topic: scenarios
pw_version_introduced: "1.40"
---

---
tier: A
tier_key: tierA
id: interview-tier-a
title: Tier A â€” Beginner / Fresher (0â€“2 years)
lead: Scenario-based screening questions for 0â€“2 years. Read each scenario out
  loud, then compare to the ideal approach â€” the "why they get stuck" line tells
  you which instinct to override.
difficulty: beginner
topic: scenarios
pw_version_introduced: "1.40"
---

# Tier A â€” Beginner / Fresher (0â€“2 years)

Scenario-based screening questions for 0â€“2 years. Read each scenario out loud, then compare to the ideal approach â€” the "why they get stuck" line tells you which instinct to override.

*Quick index: A1 element not found Â· A2 waitForTimeout Â· A3 unstable locators Â· A4 confirm dialog Â· A5 strict-mode violation Â· A6 file upload Â· A7 file download Â· A8 new tab Â· A9 slow login Â· A10 webServer config Â· A11 cross-browser Â· A12 missing await Â· A13 CAPTCHA policy Â· A14 geolocation permission Â· A15 locale/currency Â· A16 mobile tap vs click Â· A17 custom dropdown Â· A18 notification permission Â· A19 offline simulation Â· A20 component testing Â· A21 multi-step form retention Â· A22 image-load verification Â· A23 fixture isolation surprise Â· A24 browser-upgrade breakage Â· A25 inconsistent API data*

### A1. A test passes locally but the element "isn't found" even though you can see it on the page. What do you check?
**Think first:** What's the difference between "in the DOM," "visible," and "actionable"? Could the element be inside something Playwright doesn't automatically search (iframe, closed shadow root)? Is the locator possibly matching more than one element?
**Ideal approach:** Confirm it isn't a timing issue first (Playwright auto-waits, but you may be reading state too early with a non-retrying check like `isVisible()` instead of `await expect(locator).toBeVisible()`). Then check: is the element inside an **iframe** (needs `frameLocator`) or a **shadow root** (open roots are pierced automatically; closed ones can't be reached)? Is the locator matching multiple elements (strict-mode violation)? Is it behind an overlay/modal (fails actionability "receives events")? Use the trace/Inspector "pick locator" to verify.
**Why they get stuck:** Freshers reach for `waitForTimeout` or `force:true` instead of diagnosing; they don't know iframes/shadow DOM change the lookup, and they confuse "in the DOM" with "actionable."
**Why the interviewer asks this:** It's the single fastest way to see whether a candidate diagnoses systematically or reaches for a sleep/force reflexively â€” the answer reveals their whole debugging process in one question.
**Common wrong answer:** "I'd add a `waitForTimeout` or increase the timeout" â€” treats every "not found" as a pure timing problem without considering iframes, shadow DOM, or strict-mode ambiguity.
**Real project example:** A payment page embedded a third-party card-entry iframe. A new hire's locator for "Card number" timed out for a day before anyone noticed the field lived inside `iframe[title="Secure card frame"]` â€” the fix was one line, `page.frameLocator(...)`, once actually diagnosed instead of guessed at.
**Follow-up questions:** How does `frameLocator` differ from `page.frame()`? What's the difference between an open and a closed shadow root for automation purposes? How would the trace viewer show you which of these it is?

### A2. Your test uses `page.waitForTimeout(3000)` and still fails on the CI machine. Why, and what do you do?
**Think first:** What does `waitForTimeout` actually wait for â€” a specific condition, or just elapsed time? What happens if CI is slower (or faster) than whatever 3000ms was tuned for?
**Ideal approach:** Hard sleeps are both too short on slow CI and wasted time on fast machines. Replace with a **web-first assertion** on the observable end-state (`await expect(page.getByRole('alert')).toHaveText('Saved')`) or wait for the specific network response. Auto-waiting handles most cases.
**Why they get stuck:** They treat `waitForTimeout` as the fix rather than the cause; they don't know assertions auto-retry until `expect.timeout`.
**Why the interviewer asks this:** Reliance on fixed sleeps is the most common anti-pattern in real codebases, and this question tests whether a candidate actually understands *why* it's wrong, not just that "it's bad practice."
**Common wrong answer:** "I'd just increase it to 5000ms" â€” fixes the symptom on this run while remaining exactly as fragile on the next slower or faster one.
**Real project example:** A suite full of `waitForTimeout(2000)` calls ran fine for months until a CI provider migration made runners ~40% slower; two dozen tests suddenly failed the same week, all traced to sleeps tuned for the old hardware. Replacing them with web-first assertions fixed all of them permanently.
**Follow-up questions:** How does `expect(locator).toHaveText()` differ from `await locator.textContent()` in terms of retrying? What's `expect.timeout` and where is it configured? When, if ever, is a fixed wait actually justified?

### A3. The login form has fields with no stable IDs and auto-generated class names. How do you locate them reliably?
**Think first:** What does Playwright's own documentation recommend as the locator priority order, and why does it favor accessibility-tree-based queries?
**Ideal approach:** Prefer user-facing locators: `getByLabel('Email')`, `getByRole('textbox', {name: 'Email'})`, `getByPlaceholder(...)`. If none exist, ask devs to add `data-testid` (or configure `testIdAttribute`). Anchor CSS to a stable parent as a last resort; avoid brittle structural XPath like `//div[2]/form/button[1]`.
**Why they get stuck:** They default to copied CSS/XPath from DevTools and don't know the recommended locator priority order.
**Why the interviewer asks this:** Locator strategy is the highest-leverage skill for suite maintainability â€” a candidate who defaults to role/label locators will produce a far less brittle suite than one who defaults to DevTools-copied selectors.
**Common wrong answer:** "I'd right-click and copy the CSS selector from DevTools" â€” works once, breaks on the next unrelated styling change.
**Real project example:** A design-system migration regenerated every CSS-in-JS class name overnight. The one team that had used `getByLabel`/`getByRole` everywhere had zero test breakage; a sibling team using copied CSS selectors had to fix over 40 tests.
**Follow-up questions:** What's Playwright's documented locator priority order, top to bottom? When is `data-testid` the right choice versus a smell that accessibility is missing? How do you configure a custom `testIdAttribute`?

### A4. You need to test a "Delete account?" browser confirm dialog. How do you handle it?
**Think first:** Is a native `confirm()` dialog part of the page's DOM? What does Playwright do with a dialog if you never register a handler for it?
**Ideal approach:** Register `page.on('dialog', async d => { â€¦; await d.accept(); })` **before** the click that triggers it; for prompts pass text to `accept('...')`. If no handler is registered, Playwright auto-dismisses. Distinguish native dialogs (`alert/confirm/prompt`) from in-page modals, which are just DOM elements clicked with normal locators.
**Why they get stuck:** They register the handler after the click (race), or try to locate a native alert with a selector.
**Why the interviewer asks this:** It tests whether a candidate understands the event-driven, "register-before-trigger" pattern that recurs across popups, downloads, and responses â€” not just this one dialog API.
**Common wrong answer:** "I'd use `page.getByRole('alertdialog')` to find and click it" â€” native dialogs are OS-level chrome, not DOM elements a locator can ever find.
**Real project example:** A delete-account flow's confirm test silently "passed" for months because no dialog handler existed â€” Playwright's default auto-dismiss meant the delete never actually happened, exactly like a real user hitting Cancel, and nobody had verified the accept path at all.
**Follow-up questions:** What does Playwright do by default if no `dialog` handler is registered? How would you test both the accept and dismiss paths for the same destructive action? Why must the handler be registered before, not after, the triggering click?

### A5. A "Sign in" button appears twice on the page and your click throws a "strict mode violation." How do you fix it?
**Think first:** Is strict mode a bug to work around, or a real signal about something ambiguous in the page? What would `.first()` silently assume?
**Ideal approach:** Narrow the locator rather than disable strictness: scope to a parent (`page.getByRole('dialog').getByRole('button', {name:'Sign in'})`), `.filter({hasText})`, or explicitly `.first()/.nth()` only when position is truly what you want. Strict mode is a feature that catches ambiguous selectors early.
**Why they get stuck:** They reach for `.first()` reflexively (hiding a real ambiguity) or think strict mode is a bug.
**Why the interviewer asks this:** It probes whether a candidate treats an error message as useful diagnostic information or as an obstacle to silence as fast as possible.
**Common wrong answer:** "I'd add `.first()` to make the error go away" â€” locks the test to DOM order, which can silently flip with an unrelated markup change and start clicking the wrong button.
**Real project example:** A responsive redesign added a duplicate mobile-nav "Sign in" button hidden on desktop. `.first()` happened to pick the right one â€” until a later refactor changed DOM order and every login test started clicking the hidden mobile button instead, failing mysteriously.
**Follow-up questions:** How would you scope a locator to only the currently-visible copy of a duplicated element? When, if ever, is `.first()` actually the correct choice? What does strict mode protect against that non-strict tools don't?

### A6. How do you upload a file when the visible "Upload" control is a styled button, not a real file input?
**Think first:** Does `setInputFiles()` require the target element to be visible or clickable? What's actually happening in the DOM when a "styled" upload button is clicked?
**Ideal approach:** Two options â€” call `setInputFiles()` directly on the hidden `input[type=file]`, or use the `filechooser` event: set up `page.waitForEvent('filechooser')`, click the styled button, then `chooser.setFiles(path)`. Buffers work for synthetic in-memory files.
**Why they get stuck:** They try to click the styled button and "type" a path; they don't know about the filechooser event or targeting the hidden input.
**Why the interviewer asks this:** File upload is one of the most commonly-hit "how do I even do this" moments for engineers new to Playwright, so it's a quick signal of hands-on tool familiarity.
**Common wrong answer:** "I'd click the button and then try to interact with the OS file picker dialog" â€” Playwright deliberately doesn't automate native OS dialogs; this approach can't work.
**Real project example:** A document-management app hid its file input behind a drag-and-drop-styled dropzone. The team initially tried simulating drag events with `page.mouse` before realizing `setInputFiles()` on the underlying (still-present, just hidden) input worked immediately with far less code.
**Follow-up questions:** Does `setInputFiles()` need the input to be visible? How would you upload multiple files at once? How would you test a genuine drag-and-drop-only upload zone with no underlying file input at all?

### A7. Clicking "Export CSV" triggers a download. How do you capture and verify it?
**Think first:** Is a download visible in the page's DOM? What ordering problem could occur if you click first and set up the wait second?
**Ideal approach:** Set up `const downloadPromise = page.waitForEvent('download')` **before** clicking, then `const download = await downloadPromise; await download.saveAs(...)`. Verify `suggestedFilename()` or read the stream contents. It's a one-shot wait.
**Why they get stuck:** They click first then wait (missing the event), or expect a popup/dialog instead of a download event.
**Why the interviewer asks this:** It's another instance of the register-before-trigger pattern, testing whether the candidate generalizes the concept rather than having memorized one specific API.
**Common wrong answer:** "I'd click the button, then call `page.waitForEvent('download')` afterward" â€” a fast download can complete before the listener even exists, causing an intermittent timeout.
**Real project example:** A reporting feature's download test flaked about 1 in 20 runs in CI specifically (faster network, faster response) until the team noticed the wait was registered after the click â€” reordering into a `Promise.all` fixed it completely.
**Follow-up questions:** Why must the event listener be registered before the triggering action? How would you verify the downloaded file's actual content, not just that a download occurred? What's the equivalent pattern for verifying a `fetch`/API response instead of a download?

### A8. Clicking a link opens a new tab. How do you interact with the new tab?
**Think first:** Is a new tab the same `Page` object as the one that opened it? What race exists if you don't register the listener before the click?
**Ideal approach:** Capture it via the context/page event before the click: `const [popup] = await Promise.all([context.waitForEvent('page'), link.click()])`; then `await popup.waitForLoadState()` and treat it as a normal Page. Note tabs in the same context share cookies.
**Why they get stuck:** They don't set up the event listener before the action; they confuse a native dialog with a new page.
**Why the interviewer asks this:** Multi-page/multi-tab flows are common in real apps (OAuth, sharing, "open in new tab" links), and this checks whether the candidate has hit and solved this exact pattern before.
**Common wrong answer:** "I'd just keep using `page` since it's the same browser" â€” a new tab is a distinct `Page` object; actions against the original page won't reach it.
**Real project example:** A "View invoice PDF" link opened a new tab. The original test kept asserting against the main page and always "passed" trivially (asserting nothing meaningful) until someone added a `context.waitForEvent('page')` capture and discovered the PDF viewer tab had actually been broken for weeks.
**Follow-up questions:** Do tabs opened in the same context share cookies/session? How would you handle a tab that's expected to close itself automatically? What changes if the new tab is cross-origin?

### A9. Login takes 5+ seconds and every one of your tests logs in through the UI. What's the problem and the simplest first improvement?
**Think first:** Does every test actually need to exercise the login *UI* itself, or just need to *be* logged in? What does Playwright provide specifically for reusing authenticated state?
**Ideal approach:** Repeated UI login is slow and fragile. Log in once and reuse **storageState** (cookies + localStorage) across tests, injected via config `use.storageState` or a setup project. This is the single biggest speed win in most suites.
**Why they get stuck:** They know storageState exists but can't explain the setup-project/dependency wiring, or don't connect it to speed/stability.
**Why the interviewer asks this:** It's the highest-leverage performance/reliability fix in most real suites, and distinguishes candidates who've actually operated a suite at scale from those who've only ever written a handful of tests.
**Common wrong answer:** "I'd run tests in parallel to make up for the slow login" â€” parallelism helps overall wall-clock time but multiplies, rather than removes, the repeated slow/fragile login cost.
**Real project example:** A 300-test suite spent roughly 40% of its total CI time on repeated UI logins. Introducing a `setup` project that logs in once and shares `storageState` across all dependent projects cut total suite time by over a third with no loss of coverage.
**Follow-up questions:** How do you keep `storageState` fresh if the session token has a short TTL? Should `storageState.json` ever be committed to git? How would you handle per-persona (multiple different test accounts) storageState?

### A10. Your test needs the app running at localhost:3000. How should the suite start it?
**Think first:** What's fragile about relying on a human to remember to start the dev server before running tests? What should differ between a local run and a CI run here?
**Ideal approach:** Use the `webServer` config block (command + url + `reuseExistingServer: !process.env.CI`) so the app boots before the suite and is reused locally but freshly started in CI. Removes "did you start the server?" as a human failure mode.
**Why they get stuck:** They start it manually or shell out in package.json; they don't know `webServer` exists.
**Why the interviewer asks this:** It's a quick check of whether the candidate has actually configured a real project (not just written test files against an already-running app someone else set up).
**Common wrong answer:** "I'd document that you need to run `npm run dev` in a separate terminal first" â€” works for one person, breaks CI and onboarding immediately.
**Real project example:** A new contributor's first PR failed CI mysteriously for a day because their local `npm test` script assumed a server someone else always had running. Adding a `webServer` block fixed onboarding for everyone at once, not just that one contributor.
**Follow-up questions:** What does `reuseExistingServer: !process.env.CI` actually accomplish, and why differ local from CI? How would you configure `webServer` for a suite that needs two services running (frontend and a mock backend)? What happens if the server fails to start in time?

### A11. How do you run the same test across Chromium, Firefox, and WebKit, and why would you bother?
**Think first:** Do all three browser engines render and behave identically for every feature? What real-world browsers does WebKit stand in for?
**Ideal approach:** Define `projects[]` in the config, one per browser/device; run all with `npx playwright test` or one with `--project=webkit`. Rationale: engines differ (WebKit = Safari's engine; catches Safari-only layout/focus/date bugs). Note bindings: same concept in Java (`projects` in config or parameterized runners).
**Why they get stuck:** They've only ever run Chromium and don't know projects are also how you split roles/environments.
**Why the interviewer asks this:** Many teams silently only test Chromium in practice; this checks whether the candidate understands *why* that's a real coverage gap, not just how to flip a config flag.
**Common wrong answer:** "Browsers are basically all the same now, so it doesn't matter much" â€” WebKit and Firefox have real, user-impacting differences in focus handling, date inputs, and rendering that Chromium-only testing never catches.
**Real project example:** A date picker worked perfectly in Chromium and Firefox but silently failed to open on Safari due to a WebKit-specific event-handling quirk â€” caught only because the team ran the `webkit` project in CI, weeks before it would have reached real Safari users.
**Follow-up questions:** What real-world browsers does each Playwright engine (Chromium, Firefox, WebKit) approximate? How would you run only a subset of tests against a specific browser? How are `projects[]` also used for things unrelated to browsers, like mobile emulation or authenticated vs. unauthenticated roles?

### A12. A colleague wrote `page.click('#save')` without `await`. What happens?
**Think first:** Is every Playwright API call synchronous or asynchronous? What does a "floating promise" mean for execution order?
**Ideal approach:** A floating promise â€” the action fires but the test may move on before it resolves, causing intermittent failures. This is one of the most common flakiness sources. Enable the ESLint rule `@typescript-eslint/no-floating-promises` to catch it. (Node/TS-specific; in Java every call is synchronous so this class of bug doesn't exist â€” a good contrast point.)
**Why they get stuck:** Freshers don't grasp that every Playwright JS/TS call is async, and don't know lint can catch it.
**Why the interviewer asks this:** Missing `await` is one of the most common real-world sources of intermittent flakiness, and this question separates candidates who understand JS's async model from those who've only pattern-matched syntax.
**Common wrong answer:** "It would just work the same, `await` is more of a style preference" â€” a missing `await` can let the test proceed before the click's effects have happened, causing real, hard-to-explain intermittent failures.
**Real project example:** A checkout suite had one missing `await` on a `fill()` call buried in a helper function; it passed about 95% of the time (fast enough machines usually "got lucky") until a slower CI runner made the race visible as a genuinely confusing, seemingly-random flake that took a day to trace back to the one missing keyword.
**Follow-up questions:** What ESLint rule catches floating promises, and would you enable it project-wide? Why doesn't this class of bug exist in Playwright's Java bindings? What's the difference between a floating promise causing a silent failure versus an unhandled rejection crashing the process?

### A13. A login test suddenly shows a CAPTCHA/verification challenge that wasn't there before. What's your first move?
**Think first:** Is a CAPTCHA something a legitimate automated test should try to defeat? What does its appearance actually signal about the environment?
**Ideal approach:** Treat it as an environment/configuration signal, not something to defeat programmatically â€” CAPTCHA and bot-challenge systems exist specifically to tell automation apart from humans, so "solving" them inside a legitimate test suite is the wrong instinct. Get the challenge disabled or issued a test-only bypass key in non-production environments, coordinated with dev/security teams. If a challenge does appear in CI, the test should detect it and fail fast so the environment issue gets investigated â€” not route around it with solver services or stealth plugins.
**Why they get stuck:** Under pressure, candidates often jump to "I'd use a CAPTCHA-solving service or a stealth plugin," which is both fragile (constant upkeep as detection evolves) and, in a real org, a security/legal red flag. The strong answer redirects to environment ownership instead.
**Why the interviewer asks this:** It's a values/judgment check as much as a technical one â€” does the candidate understand the line between legitimate test automation and actively defeating anti-bot security controls?
**Common wrong answer:** "I'd integrate a third-party CAPTCHA-solving API into the test" â€” fragile, an ongoing arms race, and a serious security/policy red flag in most real organizations.
**Real project example:** A staging environment accidentally inherited production's bot-protection rules after an infrastructure migration. Rather than trying to solve the CAPTCHA programmatically, the team flagged it to the security team, who added an IP allowlist for CI runners â€” a one-time fix instead of an ongoing maintenance burden.
**Follow-up questions:** How would you design a test-only bypass so it can never accidentally reach production? What should the test do if a CAPTCHA appears unexpectedly rather than trying to solve it? Who should own the decision to disable bot-protection in a given environment?

### A14. A delivery app should show "no restaurants near you" when location access is denied, and real results when it's granted for a specific city. How do you test both paths?
**Think first:** Are "permission granted" and "coordinates set" the same setting, or two independent ones? What happens if you set one without the other?
**Ideal approach:** Grant or deny the `geolocation` permission at the context level, and separately set coordinates with `context.setGeolocation(...)` (or the `geolocation` config option). Test the denied-permission fallback UI and at least one granted-with-coordinates happy path. Permission and coordinates are two independent settings, and they apply to the whole context, not a single page.
**Why they get stuck:** They know geolocation can be mocked but forget it's two separate switches â€” granting permission without setting coordinates (or the reverse) silently produces the wrong test.
**Why the interviewer asks this:** It's a good check for whether a candidate reads API surfaces carefully or assumes a single toggle controls a two-part feature.
**Common wrong answer:** "I'd just deny geolocation permission for the denied case and grant it for the happy path" â€” forgetting to also set coordinates for the granted case means the happy-path test may run with no location at all.
**Real project example:** A "restaurants near you" happy-path test granted permission but never set coordinates; it accidentally passed against an empty-state UI for months because "no restaurants found" and "location not available" looked visually identical, until someone noticed the test never actually exercised real search results.
**Follow-up questions:** Are geolocation permission and coordinates set at the page level or the context level? How would you test a "permission denied, then user changes their mind and grants it" flow? What other browser permissions follow this same grant/deny pattern?

### A15. The same confirmation page must show "$10.00" in the US and "10,00 â‚¬" in Germany, with the German date shown day-first. How do you cover this?
**Think first:** Is locale formatting something the app computes at runtime based on the browser's reported locale? What's the risk of trying to test every translated string in E2E?
**Ideal approach:** Set `locale` (and usually `timezoneId`) per test â€” via `test.use({locale: 'de-DE', timezoneId: 'Europe/Berlin'})` or globally in config â€” then assert on the rendered currency/date strings for each locale. Keep it to a smoke check on formatting logic; testing every translated string belongs to localization/linguistic QA, not E2E.
**Why they get stuck:** Either they don't know `locale`/`timezoneId` are first-class context options, or they overcorrect and try to E2E-test every translated string, bloating the suite for no reliability gain.
**Why the interviewer asks this:** It tests scope judgment as much as API knowledge â€” knowing where E2E value ends and dedicated i18n/linguistic QA begins.
**Common wrong answer:** "I'd write a full E2E test for every supported locale and language string" â€” explodes suite size and runtime for coverage that's better owned by dedicated translation/linguistic QA tooling.
**Real project example:** A checkout page's currency formatting broke silently for exactly one locale (a missing thousands separator in `de-DE`) after a refactor. A single `test.use({ locale: 'de-DE' })` smoke test caught it in minutes; the team deliberately didn't try to E2E-test all 12 supported locales beyond that.
**Follow-up questions:** What's the difference between `locale` and `timezoneId` context options, and when would date-only tests need the latter? Where should full translation-string coverage live if not in the E2E suite? How would you assert on a date string without hardcoding an ambiguous MM/DD vs DD/MM format?

### A16. The suite passes on desktop Chromium, but tapping a menu button does nothing when you emulate a Pixel device. Why?
**Think first:** Do all click-like interactions dispatch the same underlying browser events? What does `hasTouch` change about how a page behaves?
**Ideal approach:** Mobile emulation profiles set `hasTouch: true`, and touch-only controls may listen for `touchstart`/`touchend` rather than a mouse `click`. Use `locator.tap()` â€” which dispatches real touch events â€” instead of `.click()`, and confirm the emulated context truly has `hasTouch` enabled (`tap()` throws if it doesn't).
**Why they get stuck:** They treat `click()` as a universal stand-in for "user interaction" and don't consider that some UI code paths are genuinely touch-event-only.
**Why the interviewer asks this:** Mobile-emulated testing is common but often shallow; this checks whether the candidate understands the event-level difference, not just "use a phone-shaped viewport."
**Common wrong answer:** "I'd just click harder, or add `force: true`" â€” doesn't address that the underlying JS listener is for a touch event `click()` never dispatches, force or not.
**Real project example:** A mobile navigation menu built with touch-gesture handling worked perfectly for real phone users but its Playwright mobile-emulation test always failed the menu-open step â€” switching from `.click()` to `.tap()` fixed it immediately once someone actually read what event the component listened for.
**Follow-up questions:** What does `hasTouch: true` actually change at the browser level? What happens if you call `.tap()` on a context without `hasTouch` enabled? Should every "mobile" test use `.tap()`, or only where the app's code specifically depends on touch events?

### A17. A "country" field isn't a native `<select>` â€” it's a text input that opens a custom div-based list when focused. How do you pick "Germany"?
**Think first:** Does `selectOption()` work on any dropdown-looking UI, or specifically on native `<select>` elements? What would a real user actually do here?
**Ideal approach:** Treat it like ordinary UI, not `selectOption()` (which only targets real `<select>` elements): focus/click the input to open the list, then locate and click the "Germany" option by role/text within the listbox, and assert the list closed with the input now showing "Germany."
**Why they get stuck:** They reach for `selectOption()` out of habit and hit a confusing error, or type the value directly without confirming a real selection event actually fired.
**Why the interviewer asks this:** Custom dropdown components are extremely common in modern design systems, and this checks whether the candidate can adapt their approach to match actual DOM structure rather than assuming a familiar API always applies.
**Common wrong answer:** "I'd just type 'Germany' directly into the input field" â€” may visually show the right text without ever actually triggering the app's real selection logic/state update.
**Real project example:** A checkout form's custom country dropdown looked identical to a native select but was actually a div-based combobox. A test that typed the country name directly into the input "passed" for months while never actually selecting a real option â€” a later bug where the underlying selection state was `null` shipped to production undetected.
**Follow-up questions:** How would you confirm the click on "Germany" actually updated the form's real state, not just the visible text? What ARIA role would a well-built custom dropdown expose, and how would that simplify the locator? How does this differ for a native `<select multiple>`?

### A18. Clicking "Enable notifications" triggers the real browser permission prompt. How do you test both accept and block?
**Think first:** Is a native permission prompt part of the page's DOM? Which context-level API controls permissions generally, and have you seen it used for something else already?
**Ideal approach:** Native permission prompts (notifications, camera, mic) are controlled the same way as geolocation: grant or deny at the context level before the triggering action, rather than trying to click a native OS-level dialog â€” which isn't part of the page DOM and can't be located.
**Why they get stuck:** They confuse this with the in-page `dialog` event used for `alert/confirm/prompt`, and try (and fail) to locate a native permission prompt as if it were a web element.
**Why the interviewer asks this:** It checks whether the candidate generalizes the "permissions are context-level, not page-level" concept across geolocation, notifications, camera, and microphone rather than treating each as an unrelated special case.
**Common wrong answer:** "I'd use `page.on('dialog', ...)` like a confirm box" â€” native permission prompts aren't `dialog` events; that API is specifically for `alert`/`confirm`/`prompt`.
**Real project example:** A notifications-opt-in test spent half a day trying various `page.locator()` strategies to find and click a permission prompt before someone pointed out `context.grantPermissions(['notifications'])` handles it in one line, with no DOM interaction needed at all.
**Follow-up questions:** What's the full list of permissions Playwright's `grantPermissions` supports? How is this different from the `dialog` event API? How would you test a "permission previously denied, user must re-enable via browser settings" edge case?

### A19. A "You're offline" banner should appear when connectivity drops and disappear when it's restored. How do you simulate that?
**Think first:** Do you need to actually disconnect a network cable or stop a server to simulate "offline," or does Playwright expose this directly? What should you test besides just "the banner appears once"?
**Ideal approach:** `context.setOffline(true)` flips the emulated network to offline â€” triggering the app's own online/offline listeners â€” and `setOffline(false)` restores it. Assert the banner's visibility transitions in both directions, not just the offline state alone.
**Why they get stuck:** They think about killing the dev server or physically disconnecting, instead of realizing the test itself can flip this state.
**Why the interviewer asks this:** It's a quick check of API breadth knowledge, and whether the candidate thinks to test the *recovery* path, not just the failure path.
**Common wrong answer:** "I'd stop the dev server to simulate offline" â€” that simulates the server being down, not the client's network connectivity, and doesn't trigger the browser's own online/offline events the app may depend on.
**Real project example:** An offline-banner feature's test only checked that the banner appeared when going offline; a real regression where the banner never disappeared again after reconnecting shipped to production because the recovery direction was never actually tested.
**Follow-up questions:** What browser-level events does `setOffline(true)` trigger that a killed dev server wouldn't? How would you test a banner that should also affect service-worker cache behavior? Is `setOffline` scoped to the page or the whole context?

### A20. Before the full page exists, design wants a test verifying a new `<Button>` component renders its label and fires `onClick` â€” without the whole app running. Possible?
**Think first:** Does Playwright only support full end-to-end testing against a running application, or does it have a mode for something narrower? What would the tradeoff be versus a full E2E test?
**Ideal approach:** Yes â€” Playwright's component-testing mode mounts the component in isolation via a `mount()` fixture, letting you assert on rendered output and simulate interaction without booting the full application. It's a distinct test type from E2E: faster feedback on component-level logic, not a replacement for user-journey tests.
**Why they get stuck:** Candidates who've only done E2E don't know Playwright has a component-testing mode at all, or assume "component test" must mean a Jest/Vitest unit test.
**Why the interviewer asks this:** It checks breadth of Playwright knowledge beyond E2E, and whether the candidate understands the different test types serve different purposes rather than treating "testing" as one undifferentiated activity.
**Common wrong answer:** "I'd write a Jest/Vitest unit test instead since Playwright is only for E2E" â€” misses that Playwright has its own component-testing mode with real browser rendering, which catches real-DOM/CSS issues a JSDOM-based unit test can't.
**Real project example:** A design system team adopted Playwright component testing specifically because their previous JSDOM-based unit tests couldn't catch a real CSS layout bug in a new component â€” the component test caught it in seconds, well before the component was ever wired into a full page.
**Follow-up questions:** How does Playwright component testing differ from a JSDOM-based unit test in what it can catch? What are the tradeoffs of component tests versus full E2E coverage for the same component? Which frameworks does Playwright's component-testing mode currently support?

### A21. In a multi-step signup form, data entered on step 1 should still be there if the user clicks back after step 2. How do you verify this?
**Think first:** Does testing that each step's fields individually exist and accept input actually prove the form persists data across navigation? What's the actual user journey that could lose data?
**Ideal approach:** Fill and submit step 1, advance to step 2, then navigate back and assert the step-1 field still shows the value you entered â€” using a web-first assertion rather than reading the value once. This tests the form's actual state-persistence behavior (in memory, local storage, or a resubmitted draft), not just that step 1's fields exist.
**Why they get stuck:** They test that each step's fields exist and can be filled, but don't think to test the round trip â€” forward, then back â€” which is where multi-step forms actually lose data.
**Why the interviewer asks this:** It's a good test of whether the candidate thinks about the actual user journey and its edge cases, versus testing each screen in isolation as if they were independent.
**Common wrong answer:** "I'd test that each step's fields can be filled and submitted" â€” never actually exercises the back-navigation path where real data loss bugs live.
**Real project example:** A signup flow's step-1 email field silently reset to empty every time a user clicked back from step 2 due to a component key that changed on re-render â€” invisible to per-step tests, caught immediately by a forward-then-back round-trip test.
**Follow-up questions:** Where might a multi-step form actually persist its data (in-memory state, localStorage, a server-side draft)? How would this test differ for a form that persists to the server versus purely client-side? What would you test for a browser refresh mid-form, not just back-navigation?

### A22. A teammate says "the logo loads correctly," but an `<img>` tag existing in the DOM doesn't prove the image file itself loaded. How do you actually verify this?
**Think first:** Can an `<img>` element be present and even report as "visible" while the actual image file behind it failed to load? What would actually prove the file loaded successfully?
**Ideal approach:** An `<img>` element can exist â€” and even report as visible â€” while its `src` 404s or the file is corrupt. Check that the image actually rendered: assert `naturalWidth` is greater than zero via a page evaluation, or capture the network response for that specific asset request and assert its status is 200, rather than only asserting the element is present.
**Why they get stuck:** They equate "the element is in the DOM" or "visible" with "the resource behind it loaded successfully," missing that a broken image can still occupy layout space and pass a naive visibility check.
**Why the interviewer asks this:** It's a sharp test of whether a candidate distinguishes "the markup exists" from "the actual behavior/resource is correct" â€” a distinction that recurs across many test-design decisions.
**Common wrong answer:** "I'd assert `toBeVisible()` on the `<img>` element" â€” a broken image with a fixed width/height can still report as visible while showing a broken-image icon or nothing at all.
**Real project example:** A CDN misconfiguration 404'd a product-thumbnail image across an entire category page; the existing test suite (checking only element visibility) stayed green throughout an outage that real users experienced as a page full of broken image icons.
**Follow-up questions:** How would you assert on `naturalWidth` via `page.evaluate()`? How would you instead verify via the network response for that specific image request? Would you apply this level of scrutiny to every image on a page, or selectively?

### A23. Test 1 logs in and lands on the dashboard. Test 2 assumes the user is still logged in and clicks a dashboard button â€” but test 2 fails, saying the button doesn't exist. Why?
**Think first:** Does Playwright share browser state between separate test functions by default? What tool/language backgrounds might lead someone to assume otherwise?
**Ideal approach:** By default, each test gets its own isolated page and browser context â€” nothing from test 1 carries over, including login state. Tests should never assume implicit continuation from whatever ran before them; a shared starting state has to be created explicitly (a `beforeEach` that logs in, or shared storageState), not assumed from file order.
**Why they get stuck:** Coming from tools where the same browser session persists across an entire script, candidates assume "one test after another" means "continuing the same session" â€” and are confused when Playwright's default isolation contradicts that.
**Why the interviewer asks this:** Test isolation is a foundational Playwright concept, and misunderstanding it leads to an entire class of order-dependent, non-parallelizable test suites.
**Common wrong answer:** "Maybe the login session expired between tests" â€” misses the actual, much simpler explanation that isolation is the *default* behavior, not a rare edge case.
**Real project example:** A candidate's own previous project had a suite that could only run tests in a specific file order because each test implicitly relied on state left by the one before it â€” moving to Playwright's default isolation model exposed the hidden ordering dependency immediately, which was actually a healthy forcing function to fix real test-design debt.
**Follow-up questions:** How would you deliberately share authenticated state across many tests without re-running the UI login each time? What Playwright feature exists specifically for "run this once before all tests in a project"? Why is test-order independence valuable even beyond just enabling parallelism?

### A24. A browser engine upgrade lands and 2,000 tests fail overnight, with no application code changes. What do you do?
**Think first:** Is it more efficient to start fixing failing tests one at a time, or to first look for a pattern? What's the fastest way to confirm the browser update is really the cause?
**Ideal approach:** First confirm it's really the browser update and not a coincident deploy â€” Playwright ships specific browser builds per version, so pinning the previous Playwright version temporarily rolls back the browser too, isolating the variable. Then triage by pattern, not one test at a time: a mass failure from a single root cause (a changed default, a stricter security policy, a rendering change) usually clusters around one code path â€” fix that path or add a compatibility shim, rather than touching 2,000 tests individually. Going forward, run new browser versions against the suite in a non-blocking job before adopting them, so this kind of jump gets caught before it's forced on everyone at once.
**Why they get stuck:** They start "fixing" tests one by one before confirming a single shared root cause, turning an hours-long investigation into a days-long slog.
**Why the interviewer asks this:** Mass-failure incident response is a real, high-stakes scenario, and this tests whether a candidate's instinct under pressure is systematic triage or panic-driven, one-at-a-time patching.
**Common wrong answer:** "I'd start going through the failures and fixing them one by one" â€” with 2,000 failures from one shared root cause, this could take days when the actual fix might be a single line.
**Real project example:** A WebKit update changed default focus behavior on a form field, breaking a shared `PageObject` helper used by roughly 1,800 of the 2,000 failing tests â€” grouping failures by their actual stack trace revealed the single shared helper method within the first hour, versus what could have been a multi-day one-by-one slog.
**Follow-up questions:** How would you use Playwright's own versioning to isolate whether it's the browser build or something else? What would a non-blocking "canary" job for new browser versions look like in CI? How do you decide whether to fix the app, add a compatibility shim in the test helper, or wait for an upstream fix?

### A25. Two different API calls that should return the same customer record return slightly different data â€” a test using each endpoint gives inconsistent results. How do you approach this?
**Think first:** Is "the test is flaky" the same thing as "the data itself is inconsistent"? What would it mean for the test to just pick whichever value happens to show up?
**Ideal approach:** This is a product data-consistency question wearing a test-flakiness costume â€” don't just pick whichever endpoint "usually passes." Confirm which endpoint is the actual source of truth for the field in question, and if both are meant to agree, treat the discrepancy as a bug to report (with both raw responses attached as evidence), not a test to adjust. Only change the test's expectations if product confirms the two endpoints are intentionally allowed to diverge (e.g., one is cached or eventually consistent).
**Why they get stuck:** They treat it as "the test is flaky" and adjust the assertion to whichever value shows up, silently hiding a genuine backend consistency bug.
**Why the interviewer asks this:** It's an integrity check â€” does the candidate treat every failure as a test problem to route around, or investigate whether the test just found a real bug?
**Common wrong answer:** "I'd loosen the assertion to accept either value" â€” silently launders a genuine backend data-consistency bug into a permanently passing test.
**Real project example:** A "current balance" field returned different values from a legacy REST endpoint and a newer GraphQL endpoint due to a caching-layer bug on the newer one; the QA engineer who reported it (rather than loosening the assertion) caught a real customer-facing balance-display inconsistency before it reached production broadly.
**Follow-up questions:** How would you present evidence of a data-consistency bug convincingly to a backend team? What would change your answer if product confirmed the divergence was intentional (e.g., eventual consistency)? How do you distinguish "flaky test" from "test that found a real intermittent bug" in general?

---
