## Triaging a generic "Timeout 30000ms exceeded" error

id: stuck-waits-timing-timeout-30000-triage
category: waits-timing
severity: common

### Symptom
`Error: Timeout 30000ms exceeded` with no further context beyond which call it happened on — the single most common Playwright error message, and the least specific on its own.

### Why it happens
This message means exactly one thing precisely: *the thing Playwright was polling for never became true within the timeout*. It says nothing yet about *why* — the element might never exist, might exist but stay hidden, might be covered by an overlay, or the whole app might have crashed. Treating this as one bug category instead of reading the specific action/assertion it decorates is the actual mistake.

### How to debug it
1. Read the *rest* of the error, not just the headline — Playwright appends the specific actionability check that kept failing (e.g., "waiting for element to be visible, enabled and stable") or the locator's current match count.
2. Open the trace and jump to the failing step — look at the DOM snapshot and screenshot at that exact moment.
3. Check the console and network panels for errors around the same timestamp — a JS exception or a failed API call upstream often explains why the expected element never appeared.

### Fix
```ts
// Turn a generic timeout into a diagnosable one: assert on the specific
// precondition first, so failures point at the right layer immediately.
await expect(page.getByRole('status')).toHaveText('Ready', { timeout: 10_000 });
await page.getByRole('button', { name: 'Continue' }).click();
```

### Best practice
Treat every 30-second timeout as an investigation, not a nuisance to silence — the trace almost always contains the real answer within the first 30 seconds of looking. Build tests with intermediate, specific assertions so a failure narrows down to the right step instead of one large multi-step action swallowing the signal.

### Common wrong fixes
1. Globally raising `timeout` to 60 or 90 seconds "to be safe" — masks real bugs and makes every genuinely-broken test take three times longer to fail.
2. Adding `waitForTimeout(5000)` before the failing line "to give it more time" — doesn't fix a condition that was never going to become true, and adds latency to every passing run too.
3. Wrapping the failing line in a retry loop — retries a symptom, not a cause; if the underlying condition is genuinely broken, retries just fail three more times instead of once.

### Interview angle
"You get a generic 30-second timeout — walk me through your triage." — senior answer: read the specific actionability detail Playwright appends, open the trace's DOM/screenshot/console/network at that moment, and diagnose from there — never treat the headline message alone as the diagnosis.

### Related
stuck-flaky-debug-trace-viewer-timeout, stuck-locators-hidden-vs-visible

---

## A page takes six minutes to load and the default timeout isn't enough

id: stuck-waits-timing-slow-page-load
category: waits-timing
severity: rare

### Symptom
A specific page (a heavy analytics dashboard, a large report) genuinely, legitimately takes minutes to become interactive — not a bug, just a slow page — and `page.goto()`'s default timeout fails the test before it ever gets a chance to load.

### Why it happens
Playwright's default navigation timeout (30s) assumes a normal page; a small number of legitimately heavy pages exceed that by design (large data payloads, expensive server-side rendering, big client-side computation). The fix is scoping a longer timeout specifically to that navigation, not changing global defaults for the whole suite.

### How to debug it
1. Confirm the slowness is real and expected (check with product/eng whether 6 minutes is "working as intended" or itself a bug worth filing) before writing a test that treats it as normal forever.
2. Measure the actual typical load time with a few manual/trace runs to pick a sane, generous-but-bounded timeout rather than an arbitrary huge number.
3. Check whether the page has an earlier "good enough" ready-state (e.g., the shell renders quickly, only one heavy chart is slow) that a more targeted wait could use instead of waiting on full load.

### Fix
```ts
test('heavy analytics dashboard eventually loads', async ({ page }) => {
  await page.goto('/reports/annual', { timeout: 120_000 }); // scoped, not global
  await expect(page.getByTestId('report-ready')).toBeVisible({ timeout: 120_000 });
});
```

### Best practice
Scope generous timeouts to the *specific* slow operation via a per-call `timeout` option, keep the global default tight so genuine hangs elsewhere still fail fast, and consider tagging genuinely-slow tests separately so they don't block a fast PR-gate suite.

### Common wrong fixes
1. Raising the global `timeout`/`actionTimeout`/`navigationTimeout` in `playwright.config.ts` for the whole suite — every other test's real hangs now take minutes to fail instead of seconds.
2. Polling in a manual loop with `waitForTimeout` checking `document.readyState` — reimplements what a scoped timeout + web-first assertion already does, worse.
3. Skipping the slow page from automated coverage entirely — silently drops real coverage of a page that (being slow) is exactly the kind of page worth regression-testing for performance.

### Interview angle
"One specific page in your app legitimately takes minutes to load — how do you test it without slowing down the whole suite?" — senior answer: scope a generous timeout to that specific navigation/assertion only, keep the suite-wide default tight, and consider separating genuinely-slow tests into their own tagged group.

### Related
stuck-waits-timing-timeout-30000-triage, stuck-network-api-slow-3g-simulation

---

## `networkidle` "waits forever" or resolves too early

id: stuck-waits-timing-networkidle-trap
category: waits-timing
severity: common

### Symptom
Using `page.waitForLoadState('networkidle')` either hangs well past when the page is visibly ready (a page with a persistent polling request, websocket, or analytics beacon never truly goes idle), or resolves before the actual content a test needs has rendered.

### Why it happens
`networkidle` waits for "no network connections for 500ms" — it says nothing about whether the *specific element or data* your test cares about has arrived. Modern apps routinely have long-lived connections (websockets, SSE, polling analytics) that mean the network is *never* truly idle, or conversely finish an initial burst of requests before the JS that renders your target has even run.

### How to debug it
1. Check the network panel for anything long-lived (websocket upgrade, SSE `EventSource`, repeating poll) — if present, `networkidle` is fundamentally the wrong tool here.
2. Time how long the hang actually is: does it match roughly "polling interval + 500ms," confirming the theory?
3. Identify the actual UI signal that means "ready" — a specific element appearing, a loading spinner disappearing — and wait on that instead.

### Fix
```ts
// Before: fights a page with a persistent poll/websocket
await page.goto('/dashboard');
await page.waitForLoadState('networkidle'); // may hang or resolve too early

// After: wait on the actual signal the test cares about
await page.goto('/dashboard');
await expect(page.getByTestId('dashboard-ready')).toBeVisible();
```

### Best practice
Avoid `networkidle` entirely for anything other than very simple static pages — prefer a web-first assertion on the specific element/state the test needs, which is both faster (doesn't wait for an arbitrary idle window) and more accurate (doesn't get fooled by unrelated background traffic).

### Common wrong fixes
1. Combining `networkidle` with a follow-up `waitForTimeout` "just in case" — stacks two unreliable waits instead of replacing them with one accurate one.
2. Increasing the idle window's implicit timeout repeatedly — doesn't fix a page that will never go idle by design.
3. Disabling the app's polling/websocket specifically in the test environment — tests a materially different runtime behavior than production.

### Interview angle
"Why is `networkidle` considered an anti-pattern in modern Playwright tests?" — senior answer: it measures absence of network activity, not readiness of the specific content under test, and long-lived connections (websockets, polling) can make it hang indefinitely or resolve early — a targeted web-first assertion on the actual ready-state is both faster and more accurate.

### Related
stuck-waits-timing-spinner-never-detaches, stuck-network-api-graphql-assertion

---

## `waitForResponse` registered after the click misses the request

id: stuck-waits-timing-response-race
category: waits-timing
severity: common

### Symptom
`page.waitForResponse(...)` times out even though the network panel in a manual run clearly shows the expected request firing and succeeding — it just doesn't seem to be "seen" by the test.

### Why it happens
This is a classic ordering race: if you `click()` first and *then* call `waitForResponse()`, the response may already have arrived (the request can be very fast) before the listener was registered, so the wait genuinely misses an event that already happened. `waitForResponse` doesn't retroactively see already-completed network activity.

### How to debug it
1. Read the code order literally: is `waitForResponse` called before or after the action that triggers the request?
2. Check the trace's network panel timestamp for the request versus the timestamp the waitForResponse call started — if the request completed first, that confirms the race.
3. Confirm this reproduces more often on faster environments/mocked responses (which complete request+response almost instantly), consistent with a race rather than a genuine absence of the request.

### Fix
```ts
// Before: click first, wait second — a race the click can win
await page.getByRole('button', { name: 'Save' }).click();
const response = await page.waitForResponse('**/api/save'); // may already be too late

// After: start waiting before triggering the action
const [response] = await Promise.all([
  page.waitForResponse((r) => r.url().includes('/api/save') && r.ok()),
  page.getByRole('button', { name: 'Save' }).click(),
]);
```

### Best practice
Always pair `waitForResponse`/`waitForRequest`/`waitForEvent` with the triggering action inside `Promise.all`, registering the wait first — never call the wait after the action that might complete before the listener exists.

### Common wrong fixes
1. Adding a `waitForTimeout` before calling `click()` "to slow things down" so the wait has time to register — doesn't fix an ordering bug, and adds latency to every run regardless of the race actually occurring.
2. Wrapping the whole sequence in a retry loop — sometimes "passes" by luck (slow environment happens to lose the race less often) while leaving the actual ordering bug in place.
3. Switching to a generic `waitForLoadState('networkidle')` instead — trades a specific, correct wait for an imprecise one with its own problems (see the networkidle entry).

### Interview angle
"`waitForResponse` sometimes times out even though the network tab shows the request succeeded — why?" — senior answer: the wait was likely registered after triggering the action, so a fast request/response cycle already completed before the listener existed; always wrap the wait and the trigger together in `Promise.all`, wait first.

### Related
stuck-network-api-route-not-intercepting, stuck-waits-timing-timeout-30000-triage

---

## A loading spinner never detaches, so the wait never resolves

id: stuck-waits-timing-spinner-never-detaches
category: waits-timing
severity: tricky

### Symptom
`await expect(page.getByTestId('spinner')).toBeHidden()` (or `.toHaveCount(0)`) times out — the spinner element is still technically present in the DOM (just visually transitioned to `opacity: 0` and hidden via animation) rather than actually removed or `display:none`.

### Why it happens
Some spinner implementations animate out (CSS transition/opacity fade) but leave the element attached with computed styles that don't cross Playwright's actual "hidden" threshold at the moment you check, or only reach `display:none` after an animation-end event that fires later than expected; others use a `visibility: hidden` on a wrapping element that your locator doesn't target.

### How to debug it
1. Take a screenshot and dump computed styles (`opacity`, `display`, `visibility`) of the spinner element at the moment of the timeout to see its actual state.
2. Check whether the spinner is removed from the DOM entirely on completion (in which case wait for it to detach) versus staying present but styled hidden (in which case `toBeHidden()` should already work, and something else is off — check you're targeting the right element, not a wrapper).
3. Check for a CSS transition duration much longer than expected as a possible root cause on its own (a genuine, separate front-end bug worth reporting).

### Fix
```ts
// If the spinner element is removed from the DOM on completion:
await expect(page.getByTestId('spinner')).toHaveCount(0);

// If it stays in the DOM but should become hidden:
await expect(page.getByTestId('spinner')).toBeHidden();

// If completion is really signaled by content appearing, prefer waiting on that instead:
await expect(page.getByTestId('results-list')).toBeVisible();
```

### Best practice
Prefer asserting on the *positive* signal (the real content appearing) over the *negative* signal (a loading indicator disappearing) wherever both exist — a spinner's exact hide mechanics are an implementation detail that can change, while "the data the user wanted is now visible" is the thing that actually matters.

### Common wrong fixes
1. Adding a fixed sleep timed to "roughly how long the fade takes" — brittle to any future animation-duration change, and slower than necessary on faster runs.
2. Asserting `opacity: 0` via `page.evaluate()` computed-style reads in a manual poll loop — reimplements what a web-first assertion already does, with more code and less reliability.
3. Removing/disabling the spinner's fade animation "for tests only" via a test-mode CSS override — tests a different visual behavior than what real users see.

### Interview angle
"A loading-spinner wait never resolves even though the page is visibly ready — what do you check?" — senior answer: whether the spinner actually leaves the DOM/becomes truly hidden by Playwright's definition versus just visually fading via CSS transition with the element still present in an ambiguous state — and consider asserting on the positive 'content appeared' signal instead.

### Related
stuck-waits-timing-networkidle-trap, stuck-locators-hidden-vs-visible

---

## An in-progress animation blocks a click that should just work

id: stuck-waits-timing-animation-covered-click
category: waits-timing
severity: common

### Symptom
`click()` on an element mid-transition (a sliding panel, an expanding accordion, a modal fade-in) intermittently times out or clicks the wrong coordinates — but only occasionally, and never in a slow, manual walkthrough.

### Why it happens
Playwright's actionability checks require an element's bounding box to be *stable* across consecutive animation frames before clicking — this correctly refuses to click a target that's still moving, since a real click at the "wrong" moment could land on the wrong pixel. If a test happens to run its click call right as an unrelated animation is mid-flight, it can hit this stability check and either wait it out (usually fine) or, on tighter timeouts, time out.

### How to debug it
1. Confirm from the trace whether the target (or something overlapping it) was mid-CSS-transition at the click moment — screenshots a few frames apart around the failure will show visible movement.
2. Check the animation's duration against the action timeout — a slow/janky CI runner can make an animation that's "fast enough" locally take noticeably longer under load.
3. Distinguish this from a permanently-stuck overlay (see the hidden-vs-visible entry) — here the element *does* eventually stabilize, it just takes longer than expected sometimes.

### Fix
```ts
// Let Playwright's own actionability/stability check do its job — usually no
// change is needed beyond a slightly more generous action timeout for CI:
await page.getByRole('button', { name: 'Confirm' }).click({ timeout: 10_000 });

// If the animation is purely decorative, respecting reduced-motion in the test
// environment removes the whole class of flake at the source:
await page.emulateMedia({ reducedMotion: 'reduce' });
```

### Best practice
Where the animation is purely cosmetic, run the test environment with `prefers-reduced-motion: reduce` emulated — this removes an entire category of animation-timing flakiness without weakening any real assertion, since the test still verifies the same end state.

### Common wrong fixes
1. Reaching for `{ force: true }` to click through the instability check — clicks at possibly-wrong coordinates mid-animation, which can silently interact with the wrong element or miss entirely on a still-moving target.
2. Adding a `waitForTimeout` tuned to "roughly the animation duration" — brittle to any future duration change and adds latency to every run.
3. Disabling all CSS animations globally via a stylesheet override injected only in tests — can be a reasonable choice for pure performance, but doing it silently without deciding to (rather than as a deliberate `prefers-reduced-motion` policy) hides a signal you might want for other tests.

### Interview angle
"A click on an animating element flakes only under CI load, never locally — what's happening and what's the right fix?" — senior answer: Playwright's actionability check requires bounding-box stability across frames; a slower runner extends how long an animation takes to settle. The right fix is emulating `prefers-reduced-motion: reduce` for cosmetic animations, not `force: true`.

### Related
stuck-locators-hidden-vs-visible, stuck-flaky-debug-visual-flaky-animation

---

## An OTP code expires before the test can submit it

id: stuck-waits-timing-clock-dependent-otp
category: waits-timing
severity: tricky

### Symptom
A 2FA/OTP test that reads a short-lived code (e.g., a 60-second expiry) and submits it fails intermittently specifically on a slower CI run or a slower worker, with an "OTP expired" error the test never intended to trigger.

### Why it happens
Real wall-clock time keeps advancing while the test does its normal (variable-speed) work between reading the code and submitting it — a code with a short TTL leaves very little margin, and CI environments are exactly where execution speed varies most run to run. Relying on real time for something this time-sensitive makes the test's pass/fail depend on incidental execution speed rather than actual application behavior.

### How to debug it
1. Confirm the OTP's actual TTL and measure how long the test typically takes between reading and submitting the code — is the margin genuinely thin?
2. Check whether failures correlate with CI load/slowness rather than a specific test change.
3. Check whether the app exposes (or could expose, for its own testability) a controllable clock via `page.clock` instead of relying on real elapsed time.

### Fix
```ts
// Control time explicitly instead of racing the real clock — see the Bank Demo's
// own Clock-API-driven OTP tests for a working example of this pattern.
test('OTP submitted well within its TTL using a controlled clock', async ({ page }) => {
  await page.clock.install();
  await page.goto('/index.html#bank-demo');
  // ...trigger OTP...
  await page.clock.fastForward('00:00:10'); // advance a known, small amount
  // ...submit the still-valid code...
});

test('OTP correctly rejected once its TTL has passed', async ({ page }) => {
  await page.clock.install();
  await page.goto('/index.html#bank-demo');
  // ...trigger OTP...
  await page.clock.fastForward('00:01:05'); // deliberately past a 60s TTL
  // ...assert the app now rejects it...
});
```

### Best practice
Use `page.clock` to make time-dependent behavior deterministic in both directions — test the valid-code path with a small, controlled advance, and explicitly test the expiry path by advancing past the TTL — rather than letting either path depend on how fast the test happens to execute.

### Common wrong fixes
1. Raising the OTP's TTL specifically for test environments — tests a materially different (more forgiving) timing behavior than production actually has.
2. Adding retries so an occasional "OTP expired" failure passes on a faster second attempt — non-deterministic, and never actually tests the expiry path on purpose.
3. Speeding up the test's own code (fewer awaits, tighter polling) to "beat the clock" — an arms race against CI variability instead of removing the dependency on real time.

### Interview angle
"A 60-second OTP expiry test flakes only on slow CI runs — what's the fix?" — senior answer: control time explicitly with `page.clock` rather than racing real wall-clock time — advance a small, known amount for the valid-code path, and deliberately advance past the TTL to test expiry, so neither path depends on incidental execution speed.

### Related
stuck-login-auth-mfa-otp, stuck-login-auth-session-expired-midform
