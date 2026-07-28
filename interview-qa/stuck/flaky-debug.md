## A test is green 9 times out of 10 — is that "acceptable flake"?

id: stuck-flaky-debug-green-nine-of-ten
category: flaky-debug
severity: common

### Symptom
A specific test fails roughly 1 in 10 runs with no obvious pattern, and the team is debating whether to just add a retry and move on.

### Why it happens
A test that fails 10% of the time essentially never has "no cause" — it has a real, deterministic trigger condition (a race, an unhandled edge case, a resource limit) that simply isn't hit on every run because the timing/ordering that exposes it doesn't align every time. "Flaky" is a description of the symptom's *frequency*, not evidence that the cause is unknowable or unfixable.

### How to debug it
1. Collect artifacts from several *failed* runs (not just one) — look for what's common across the failures specifically, not just what's true in general.
2. Check whether failure rate correlates with any factor: time of day (shared CI load), specific worker index, specific browser, or specific preceding test in execution order.
3. Run the suspect test in a tight local loop (`--repeat-each=50`) to reproduce faster than waiting for CI's natural 1-in-10 cadence.

### Fix
```bash
# Reproduce faster than waiting for CI's natural flake cadence.
npx playwright test tests/checkout.spec.ts --repeat-each=50 --workers=4
```
```ts
// Once reproduced, add the missing precondition wait instead of a retry —
// e.g., a race between an optimistic UI update and a real API confirmation.
await expect(page.getByTestId('cart-count')).toHaveText('2'); // wait for the real state
await page.getByRole('button', { name: 'Checkout' }).click();
```

### Best practice
Treat any failure rate above zero as a real bug with an unknown-but-discoverable trigger, and invest in reproducing it locally with `--repeat-each` before deciding retries are the answer — retries are a legitimate mitigation for truly rare, understood externalities (a third-party outage), not a substitute for root-causing a 10% failure rate.

### Common wrong fixes
1. Adding `retries: 1` specifically to this test and calling it resolved — the underlying race is still there, now just less visible, and can worsen as the app changes.
2. Deprioritizing investigation because "it's only 10%, not that bad" — a 10% single-test flake rate compounds badly across a suite with many similarly-flaky tests, eroding trust in CI overall.
3. Quarantining the test out of the required check without a tracked follow-up — a common way flaky tests are "handled" by never actually being fixed.

### Interview angle
"A test fails 1 in 10 times — do you just add a retry?" — senior answer: no — a 10% failure rate has a real, reproducible trigger; use `--repeat-each` to reproduce it locally faster than CI's natural cadence, root-cause it, and reserve retries for truly rare, understood external flakiness.

### Related
stuck-parallel-ci-retries-hiding-bugs, stuck-flaky-debug-race-assertion-rerender

---

## Walking a timeout failure through the trace viewer

id: stuck-flaky-debug-trace-viewer-timeout
category: flaky-debug
severity: common

### Symptom
A test fails with a timeout and a trace file exists, but it's not obvious which part of the trace actually explains the failure.

### Why it happens
The trace viewer contains several independent signal sources (a DOM snapshot per action, screenshots, console logs, network requests, and a timeline) — the skill isn't knowing that a trace exists, it's knowing which panel to check first and in what order to get from "it timed out" to "here's why" efficiently.

### How to debug it
1. Open the Actions panel and find the last action that started but never completed — its "before"/"after" DOM snapshot tab shows exactly what the page looked like right before Playwright gave up.
2. Switch to the Console tab filtered around that timestamp — a JS exception here often explains why an expected element never rendered.
3. Switch to the Network tab — a failed, slow, or never-completing request around the same timestamp often explains a missing precondition the UI was waiting on.
4. Use the timeline scrubber at the very top to visually confirm what was happening across all panels simultaneously, not just one in isolation.

### Fix
```bash
npx playwright show-trace test-results/checkout-should-complete/trace.zip
```
```ts
// Once the trace reveals the real cause (e.g., a network call that never
// resolved because a route mock never called route.continue()):
await page.route('**/api/shipping-options', (route) => route.continue()); // was missing
```

### Best practice
Build a personal habit/checklist for trace investigation (Actions → DOM snapshot at failure → Console → Network → timeline) so every timeout investigation follows the same efficient path instead of ad hoc clicking around; configure `trace: 'on-first-retry'` (or `'retain-on-failure'`) so a trace always exists to look at in the first place.

### Common wrong fixes
1. Only looking at the final screenshot and guessing from a static image — misses console/network context that usually explains *why*, not just *what*.
2. Re-running the test repeatedly hoping to "see it happen live" instead of reading the trace that already captured it once — much slower than reading the artifact you already have.
3. Assuming a timeout with a trace present is unexplainable and reaching straight for a longer timeout or a retry — the trace almost always contains the actual answer.

### Interview angle
"Walk me through how you'd use the trace viewer to debug a timeout." — senior answer: find the last action that started but didn't complete, check its DOM snapshot, then cross-reference the Console and Network panels at that exact timestamp — the combination almost always reveals the real precondition that never became true.

### Related
stuck-waits-timing-timeout-30000-triage, stuck-parallel-ci-artifact-upload-failed-runs

---

## Console errors appear right before a failure, but nobody's looking at them

id: stuck-flaky-debug-console-errors-before-failure
category: flaky-debug
severity: common

### Symptom
A test fails on a UI assertion, and separately (unnoticed until someone specifically checks) the browser console logged a JavaScript error a moment earlier — but the test's own failure message never mentioned it.

### Why it happens
Playwright doesn't fail a test automatically just because the page logged a console error — by design, since some apps intentionally log warnings/errors that aren't fatal to the flow under test. But that means a genuinely fatal client-side exception (a broken render, an unhandled promise rejection that stopped a component from mounting) can be the *real* root cause of a UI assertion failure while looking, from the test's failure message alone, like "the element just wasn't there."

### How to debug it
1. Open the trace's Console tab and scan for any error-level log in the moments before the failing assertion.
2. Cross-reference the error's stack trace against the component/feature the failing assertion was targeting.
3. Consider adding a standing `page.on('console', ...)` / `page.on('pageerror', ...)` listener that surfaces (or fails the test on) unexpected errors, so future occurrences are loud instead of buried.

### Fix
```ts
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  // Attach for inspection in an afterEach, or assert none occurred for
  // sensitive flows where any client-side error is inherently a bug.
  (page as unknown as { __errors: string[] }).__errors = errors;
});

test.afterEach(async ({ page }) => {
  const errors = (page as unknown as { __errors: string[] }).__errors;
  expect(errors, `Unexpected console errors: ${errors.join('; ')}`).toEqual([]);
});
```

### Best practice
Wire a standing console/page-error listener into shared fixtures so every test surfaces unexpected client-side errors as part of its own failure output, rather than requiring someone to manually think to check the console tab after the fact.

### Common wrong fixes
1. Ignoring console output entirely as "just noise" without ever checking whether it correlates with failures — misses a frequently-available root-cause signal for free.
2. Failing every test on *any* console error without an allowlist for expected/benign ones — creates noisy false failures for apps that intentionally log non-fatal warnings.
3. Suppressing console error logging in the browser via launch flags to "clean up" test output — removes a diagnostic signal instead of using it.

### Interview angle
"How do console logs help debug a UI assertion failure that seems unrelated to logging?" — senior answer: a fatal client-side JS error can silently prevent the exact element the assertion checks for from ever rendering; wire a standing console/pageerror listener into shared fixtures so this signal is always available, not just checked when someone remembers to look.

### Related
stuck-network-api-mock-json-correctly, stuck-flaky-debug-trace-viewer-timeout

---

## The trace video shows a click landing on the wrong element

id: stuck-flaky-debug-video-wrong-element-click
category: flaky-debug
severity: tricky

### Symptom
Watching the recorded video of a failing run, a click visibly lands on the wrong element — slightly off from the intended target, or on an entirely different control nearby — even though the locator used looks correct in the code.

### Why it happens
This usually means the page's layout shifted between when Playwright computed the click coordinates and when the actual click event fired — a late-loading image without reserved dimensions, a banner that appeared, or web fonts swapping in (FOUT/FOIT) can all shift layout by just enough to move the target out from under the computed click point. This is functionally a specific case of Cumulative Layout Shift causing a real interaction bug, not just a Lighthouse metric.

### How to debug it
1. Watch the video frame by frame around the click moment — is there a visible layout jump immediately before or during the click?
2. Check for images or ads without explicit `width`/`height` attributes, or a web font loading without `font-display` reserving space, near the clicked area.
3. Check the DOM snapshot immediately before the click for the target's actual bounding box versus where the video shows the click landing.

### Fix
```ts
// Playwright's own actionability checks already guard against this in most
// cases by re-verifying stability — but if the app has a genuine CLS bug,
// fix layout stability at the source (reserve space for async content):
// <img src="promo.png" width="320" height="180" />  <!-- reserves space -->

// If you can't fix the app immediately, wait for the specific late-loading
// element to settle before interacting with anything near it:
await expect(page.getByTestId('promo-banner')).toBeVisible();
await page.getByRole('button', { name: 'Continue' }).click();
```

### Best practice
Treat a "click landed on the wrong element" trace as a real Cumulative-Layout-Shift bug in the app worth reporting (it affects real users identically, just less visibly than a failed test makes it), not merely a test-timing nuisance to route around.

### Common wrong fixes
1. Adding a `waitForTimeout` before every click near dynamic content, hoping layout has "settled" by then — a fragile guess at a duration, and doesn't fix the underlying CLS bug for real users.
2. Switching to coordinate-based `page.mouse.click(x, y)` calls with hardcoded coordinates — even more fragile to any layout change, and abandons Playwright's actionability/re-resolution guarantees entirely.
3. Wrapping the click in a retry loop — may eventually "work" by luck once layout happens to have settled, without ever fixing or even reporting the real CLS bug.

### Interview angle
"A test's recorded video shows a click landing on the wrong element — what's your hypothesis?" — senior answer: very likely a Cumulative Layout Shift — content shifted between when Playwright computed the click point and when it fired; this is a real bug affecting actual users too, worth fixing/reporting at the source, not just waiting out in the test.

### Related
stuck-waits-timing-animation-covered-click, stuck-locators-element-detached

---

## Visual baselines captured on a Mac don't match Linux CI

id: stuck-flaky-debug-baseline-mac-vs-linux
category: flaky-debug
severity: common

### Symptom
`toHaveScreenshot()` fails in CI immediately after a developer captures/updates a baseline locally, even though nothing about the app's actual appearance changed.

### Why it happens
Screenshot rendering is OS- and font-dependent at the pixel level — the exact same HTML/CSS renders with different anti-aliasing, subpixel positioning, and (if the exact fonts aren't installed identically) potentially different fallback fonts entirely between macOS/Windows and a Linux CI container. Playwright's visual comparisons are pixel-based, so baselines are inherently tied to the environment they were captured in.

### How to debug it
1. Confirm the baseline file's naming convention includes a platform suffix (Playwright does this automatically per-OS/browser unless overridden) and check whether CI is comparing against the right platform-specific file.
2. Compare a screenshot taken locally against one taken inside the same Docker image CI uses — do they match each other, confirming the CI-vs-local gap is the actual issue?
3. Check whether `maxDiffPixelRatio`/`maxDiffPixels` is configured at all, or left at a zero-tolerance default that fails on any anti-aliasing noise.

### Fix
```bash
# Always generate/update baselines from inside the same image CI uses to compare.
docker run --rm -v $PWD:/work -w /work mcr.microsoft.com/playwright:v1.55.0-jammy \
  npx playwright test --update-snapshots
```
```ts
// playwright.config.ts
export default defineConfig({
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02 } },
});
```

### Best practice
Standardize on "baselines are only ever generated inside the CI Docker image" as a team rule (document it in the README, as this repo does), never accepting a locally-generated baseline into the repo — pair this with a small, explicit diff tolerance for legitimate anti-aliasing noise.

### Common wrong fixes
1. Committing a locally-captured baseline "just this once" to unblock a PR — guarantees the very next unrelated CI run fails on the same platform mismatch.
2. Disabling visual tests for the affected component permanently — a much larger loss of coverage than the actual problem (a baseline-generation process gap) warrants.
3. Setting pixel tolerance extremely high to force it green — hides real visual regressions along with the platform noise.

### Interview angle
"A visual test fails in CI right after a baseline update — what's the most likely explanation?" — senior answer: the baseline was almost certainly generated on a different OS (developer's machine) than the one CI compares against (Linux Docker) — baselines must always be generated inside the same image used for comparison.

### Related
stuck-parallel-ci-docker-font-rendering, stuck-flaky-debug-visual-flaky-animation

---

## A visual regression test is flaky specifically around an animation

id: stuck-flaky-debug-visual-flaky-animation
category: flaky-debug
severity: tricky

### Symptom
`toHaveScreenshot()` on a page containing a CSS/JS animation (a loading spinner, a subtle pulse, a carousel) fails intermittently with diffs concentrated on the animated element, even when the "real" content is identical every time.

### Why it happens
A screenshot is captured at one exact instant — if an element is mid-animation at that instant, the captured frame depends on precise timing that will legitimately differ run to run (a spinner rotated to a slightly different angle, a carousel transitioned by a different amount), producing a real pixel difference that has nothing to do with an actual regression.

### How to debug it
1. Confirm the diff region in the failure report is specifically the animated element, not the surrounding static content.
2. Check whether Playwright's built-in CSS-animation-disabling for screenshots (`animations: 'disabled'`, the modern default in most setups) is actually enabled for this test/config.
3. Check for JS-driven (not CSS) animations, which Playwright's `animations: 'disabled'` option does not automatically pause — these need masking or a different strategy.

### Fix
```ts
// Freeze CSS animations/transitions at their final frame before capturing.
await expect(page).toHaveScreenshot('dashboard.png', { animations: 'disabled' });

// For JS-driven animation that CSS-freezing can't reach, mask the region instead.
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [page.getByTestId('live-ticker')],
});
```

### Best practice
Default every visual-regression test to `animations: 'disabled'`, and explicitly `mask()` any JS-driven or inherently non-deterministic region (live tickers, carousels, video thumbnails) that freezing CSS animations can't stabilize — never leave an animated region uncontrolled in a pixel-diff test.

### Common wrong fixes
1. Adding a `waitForTimeout` timed to land "between" animation frames — fragile to any future duration/easing change, and never fully eliminates the timing dependency.
2. Retrying the visual comparison until it happens to land on a matching frame by luck — non-deterministic, and can still fail unpredictably.
3. Excluding the whole page/component from visual testing because "it has an animation" — loses coverage of everything else on the page that isn't actually animated.

### Interview angle
"A visual regression test is flaky, and the diffs are always around one animated element — what's the fix?" — senior answer: use `animations: 'disabled'` to freeze CSS animations at their final frame for the screenshot, and `mask()` any JS-driven or inherently nondeterministic region that freezing can't stabilize — don't rely on timing to avoid mid-animation captures.

### Related
stuck-flaky-debug-baseline-mac-vs-linux, stuck-waits-timing-animation-covered-click

---

## The browser crashes or the runner runs out of memory on a long suite

id: stuck-flaky-debug-memory-crash-long-suite
category: flaky-debug
severity: rare

### Symptom
A large suite reliably makes it most of the way through before a browser process crashes (or the whole CI job is OOM-killed), and the failure point drifts around rather than being tied to one specific test.

### Why it happens
Long-running suites that reuse a single browser/context across many tests (rather than Playwright's default of isolating contexts) can accumulate memory over hundreds of tests — leaked event listeners, uncollected DOM references, growing trace/video buffers — until the process exceeds available memory, especially on CI runners with tighter memory limits than a developer's local machine.

### How to debug it
1. Check whether the config uses a persistent/reused browser context across many tests (an anti-pattern for isolation *and* memory) versus Playwright's default per-test context isolation.
2. Monitor memory usage across the run (`docker stats`, or a CI resource-monitoring step) to confirm a genuine upward trend rather than a single-test spike.
3. Check whether the failure point moves around between runs (consistent with gradual memory accumulation) versus always happening at the same test (which would point to something specific to that test instead).

### Fix
```ts
// playwright.config.ts — let Playwright manage per-test isolation and browser
// lifecycle rather than manually sharing one long-lived context across the
// entire suite, and constrain worker memory footprint via sharding.
export default defineConfig({
  workers: process.env.CI ? 4 : undefined, // don't over-parallelize on constrained runners
  use: { trace: 'on-first-retry' }, // avoid 'on' for every test, which grows storage/memory
});
```

### Best practice
Default to Playwright's per-test isolated contexts (don't hand-roll a shared browser/context "for speed" — the isolation is there for exactly this reason among others), size CI worker counts to the runner's actual available memory rather than maximizing parallelism blindly, and avoid `trace: 'on'` for the whole suite (prefer `'on-first-retry'`) to bound memory/storage growth.

### Common wrong fixes
1. Restarting the CI job and hoping it completes before crashing again — doesn't fix an accumulating resource leak, just gambles on timing.
2. Splitting the suite into more shards purely to make each individual run shorter, without ever finding the actual leak — reduces symptom visibility without fixing the cause, and increases total CI resource usage.
3. Reusing a single browser instance across the entire suite specifically to "improve performance," inadvertently causing the very accumulation this entry describes — a well-intentioned optimization that trades away isolation and stability.

### Interview angle
"A long CI suite crashes with an OOM error partway through, at no consistent test — what's your hypothesis?" — senior answer: likely a shared/reused browser context accumulating memory across many tests rather than Playwright's default per-test isolation, or overly broad `trace: 'on'` capture — check context-reuse patterns and trace config, not just add more shards.

### Related
stuck-parallel-ci-sharding-uneven, stuck-parallel-ci-artifact-upload-failed-runs

---

## A race between an assertion and a re-render makes the test nondeterministic

id: stuck-flaky-debug-race-assertion-rerender
category: flaky-debug
severity: common

### Symptom
An assertion immediately following a state-changing action sometimes sees the *old* value and sometimes the *new* one — the test isn't wrong about what the end state should be, it's just sometimes checking before the UI has actually re-rendered to reflect it.

### Why it happens
Playwright's web-first assertions (`expect(locator).toHaveText(...)`) already auto-retry until the condition is true or a timeout elapses — but a bug in test code that instead reads a value once (`await locator.textContent()`) and compares it with a plain `expect(value).toBe(...)` performs exactly one snapshot read with zero retrying, so it's purely a coin flip whether the re-render has completed by that exact microtask.

### How to debug it
1. Find the specific assertion and check whether it's a web-first assertion (auto-retrying, e.g. `toHaveText`) or a manual read-then-compare pattern (`const t = await locator.textContent(); expect(t).toBe(...)`) — the latter is the classic signature of this bug.
2. Confirm in the trace that the failing run's DOM snapshot at the assertion's timestamp still shows the old value, and a snapshot a moment later shows the new one — proving it's purely a timing race, not a real bug in app behavior.
3. Grep the codebase for this manual-read pattern broadly — it's rarely just one occurrence once it's identified as a pattern.

### Fix
```ts
// Before: single read, zero retrying — a coin flip against the re-render
const text = await page.getByTestId('cart-count').textContent();
expect(text).toBe('2');

// After: web-first assertion retries automatically until true or timeout
await expect(page.getByTestId('cart-count')).toHaveText('2');
```

### Best practice
Default to web-first assertions (`toHaveText`, `toBeVisible`, `toHaveValue`, etc.) for anything that reflects async/re-rendered state, and treat any `const x = await locator.textContent()` followed by a plain `expect(x).toBe(...)` as a code-review red flag worth converting on sight.

### Common wrong fixes
1. Adding a `waitForTimeout` before the manual read instead of switching to a retrying assertion — sometimes "works" by luck, and adds fixed latency to every run regardless of whether a race would have occurred that time.
2. Wrapping the whole check in a manual polling loop reimplementing retry logic Playwright's assertions already provide — more code, same or worse reliability.
3. Adding `retries` at the test level to paper over the race — the exact same race can still lose on a retry attempt too, just less often.

### Interview angle
"An assertion right after a UI-updating action is nondeterministic — what pattern usually causes this, and what's the fix?" — senior answer: a manual single read (`textContent()` + plain `expect`) racing against React/Vue's re-render, with zero retrying; replace it with a web-first assertion (`toHaveText`), which retries automatically until the condition is true or times out.

### Related
stuck-locators-element-detached, stuck-flaky-debug-green-nine-of-ten
