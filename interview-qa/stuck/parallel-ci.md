## "It passes locally but fails in CI" — the full triage tree

id: stuck-parallel-ci-passes-locally-fails-ci
category: parallel-ci
severity: common

### Symptom
A test is 100% reliable on a developer's machine and fails — consistently or intermittently — the moment it runs in the CI pipeline, with no code difference between the two runs.

### Why it happens
"CI" isn't one variable, it's a bundle of differences from local: headless vs. headed rendering, a different OS (often Linux containers vs. a developer's macOS/Windows), different fonts installed, more constrained CPU/memory causing everything to run slower, real parallelism across more workers than a developer typically runs locally, and a cold cache/cold start with no browser profile warm-up. Treating "fails in CI" as one bug category prevents diagnosing which of these several genuinely different causes is actually responsible.

### How to debug it
1. Reproduce with the *same* conditions CI uses: `--workers=N` matching CI's worker count, headless mode, and ideally inside the same Docker image CI uses.
2. Download the CI run's trace/video/screenshot artifacts first — don't start theorizing before looking at what CI actually saw.
3. Bisect the difference systematically: run locally with just headless mode changed, then just worker count changed, then inside the CI Docker image, to isolate which single factor reproduces the failure.

### Fix
```bash
# Reproduce CI's exact conditions locally before touching any test code.
npx playwright test --workers=4 --project=chromium # match CI's worker count
docker run --rm -v $PWD:/work -w /work mcr.microsoft.com/playwright:v1.55.0-jammy \
  npx playwright test --workers=4
```

### Best practice
Make "reproduce locally under CI's exact conditions" (Docker image, worker count, headless) the very first triage step for any CI-only failure, before writing a single line of speculative test-code changes — most CI-only failures map cleanly onto one of: rendering/font differences, resource-constrained timing, or real parallel-execution races.

### Common wrong fixes
1. Adding `retries: 3` to the CI config as a blanket first response — sometimes genuinely appropriate for known-flaky externalities, but as a *first* response it hides which of the several real CI-specific causes is at play.
2. Increasing all timeouts uniformly "since CI is slower" without confirming that's actually the specific cause here — masks other categories (parallelism races, font rendering) that a bigger timeout won't fix at all.
3. Disabling the failing test in CI only — the fastest way to quietly lose real coverage without ever finding out what CI was telling you.

### Interview angle
"A test is 100% green locally and consistently red in CI — how do you approach it?" — senior answer: reproduce CI's exact conditions locally first (Docker image, worker count, headless), then bisect one variable at a time — most "CI-only" failures are rendering differences, resource-constrained timing, or real parallelism races, not random flakiness.

### Related
stuck-parallel-ci-docker-font-rendering, stuck-parallel-ci-headless-vs-headed

---

## A test only fails on the Jenkins pipeline, not on GitHub Actions or locally

id: stuck-parallel-ci-jenkins-provider-specific
category: parallel-ci
severity: tricky

### Symptom
The exact same test suite, same commit, passes on GitHub Actions and locally but fails specifically when run through a Jenkins pipeline.

### Why it happens
Provider-specific failures usually trace back to how each CI system's agents are provisioned and how the pipeline script itself invokes the suite: different base Docker images (or none — a bare VM with whatever browser dependencies happen to be pre-installed), different default environment variables, different working-directory/checkout behavior, or a Jenkinsfile that runs steps in a different order or with different flags (e.g., missing `--ci`-equivalent flags, a different `NODE_ENV`) than the GitHub Actions workflow.

### How to debug it
1. Diff the Jenkinsfile's actual invocation of the test command against the GitHub Actions workflow's — flags, env vars, working directory, and setup steps line by line.
2. Check what base image/agent Jenkins uses and whether it matches the browser/OS dependency versions Playwright expects (or whether `npx playwright install --with-deps` even runs there).
3. Capture Jenkins' own console output and any Playwright HTML/trace artifacts — configure the pipeline to archive them if it doesn't already, since a Jenkins-only failure you can't see artifacts for is far harder to diagnose than one you can.

### Fix
```groovy
// Jenkinsfile — mirror the GitHub Actions workflow's exact setup steps
stage('Test') {
  steps {
    sh 'npx playwright install --with-deps'
    sh 'npx playwright test --workers=4'
  }
  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
    }
  }
}
```

### Best practice
Keep exactly one canonical Docker image (ideally Playwright's official image, pinned to a specific tag) used by *every* CI provider running the suite, and treat any pipeline-specific setup script as a thin wrapper around the same install/run commands — never let two providers' environments drift independently.

### Common wrong fixes
1. Adding Jenkins-specific `sleep`/retry hacks directly in the Jenkinsfile to "get it green" — papers over an environment mismatch instead of aligning it with the known-working GitHub Actions setup.
2. Skipping the failing tests specifically when `process.env.JENKINS_HOME` is set — actively hides a real environment gap rather than fixing it, and creates two different "true" states of the suite depending on which CI ran it.
3. Abandoning Jenkins for that suite without root-causing the actual environment mismatch — may just relocate the same fragility to whatever replaces it.

### Interview angle
"The same suite passes on GitHub Actions but fails on Jenkins — how do you find the difference?" — senior answer: diff the exact invocation (flags, env vars, base image) between the two pipelines line by line — provider-specific failures are almost always an environment/setup mismatch, not a genuinely different test result.

### Related
stuck-parallel-ci-passes-locally-fails-ci, stuck-parallel-ci-docker-font-rendering

---

## GitHub Actions browser cache causes version drift between runs

id: stuck-parallel-ci-github-actions-cache
category: parallel-ci
severity: tricky

### Symptom
A test suite suddenly starts failing (often visual-regression diffs, or a feature that depends on a specific browser version's behavior) after a Playwright version bump in `package.json` — but only in CI, and only sometimes, not on every run.

### Why it happens
If the workflow caches the Playwright browser binaries (a common performance optimization) keyed only on something too coarse (or not re-keyed on the Playwright version at all), a run can restore a *stale* cached browser binary that doesn't match the newly bumped `package.json` version — the npm package updated, but the actual browser executable being launched didn't.

### How to debug it
1. Check the workflow's cache key — does it include the exact Playwright version (e.g., `hashFiles('package-lock.json')` covering the Playwright entry, or an explicit version string) or something too generic like just the OS name?
2. Log the actual installed browser version at the start of the CI run (`npx playwright --version`, and the browser's own reported version) and compare it against what `package.json` expects.
3. Check whether the failure correlates specifically with runs that hit a cache restore versus a cold cache miss (which would always install fresh).

### Fix
```yaml
# .github/workflows/practice-suite.yml
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
- run: npx playwright install --with-deps
```

### Best practice
Key browser-binary caches on something that changes whenever the Playwright version changes (a lockfile hash is the simplest reliable choice), and always run `npx playwright install --with-deps` even on a cache hit — Playwright's own install step is a no-op if the cached version already matches, so this is cheap insurance against a stale cache.

### Common wrong fixes
1. Removing browser caching entirely "to be safe" — fixes the staleness bug but makes every CI run noticeably slower re-downloading browsers from scratch.
2. Manually bumping a cache-busting comment in the workflow file every time Playwright is updated — works but relies on someone remembering to do it every single version bump.
3. Pinning the workflow to never update the Playwright version — avoids the caching bug by avoiding updates entirely, at the cost of falling behind on real fixes and features.

### Interview angle
"CI started failing right after a Playwright version bump, but only intermittently — what's your hypothesis?" — senior answer: a browser-binary cache keyed too coarsely can restore a stale browser version that doesn't match the updated npm package; key the cache on a lockfile hash and always run the install step even on a cache hit.

### Related
stuck-parallel-ci-passes-locally-fails-ci, stuck-network-api-401-only-ci

---

## A Docker CI image renders fonts (and therefore visual diffs) differently

id: stuck-parallel-ci-docker-font-rendering
category: parallel-ci
severity: common

### Symptom
Visual-regression (`toHaveScreenshot()`) tests fail with small but consistent pixel differences purely from running inside a Docker-based CI runner, with no actual visual change in the app.

### Why it happens
Font rendering (anti-aliasing, hinting, even which font a generic family name like `sans-serif` resolves to) depends on which font packages are actually installed in the OS/container — a Linux Docker image almost never has the exact same font set as a developer's macOS or Windows machine, so text renders with different pixel-level anti-aliasing even when the "same" font family is requested.

### How to debug it
1. Diff the failing screenshot against the baseline visually — is the difference concentrated around text glyphs specifically (a font-rendering signature) versus a layout-level difference (a real bug)?
2. Check which fonts are actually installed in the CI Docker image versus what the app's CSS requests.
3. Confirm baselines were originally captured on the same OS/image the CI comparison now runs against — a baseline captured on a developer's Mac will never exactly match Linux CI font rendering.

### Fix
```ts
// playwright.config.ts — generate baselines inside the same environment they'll
// be compared against, and allow a small, deliberate pixel tolerance for
// anti-aliasing noise that isn't a real visual regression.
export default defineConfig({
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
});
```
```bash
# Always (re)generate baselines inside the CI image, never on a local machine.
docker run --rm -v $PWD:/work -w /work mcr.microsoft.com/playwright:v1.55.0-jammy \
  npx playwright test --update-snapshots
```

### Best practice
Generate and update visual baselines exclusively inside the same Docker image CI uses for comparison (never on a developer's local OS), and set a small, explicit `maxDiffPixelRatio`/`maxDiffPixels` tolerance to absorb genuine anti-aliasing noise without hiding real regressions — masking dynamic regions (timestamps, avatars) with `mask` where relevant.

### Common wrong fixes
1. Regenerating baselines on a developer's Mac/Windows machine and committing them — guarantees every CI run diffs against a baseline that was never rendered in the same environment.
2. Setting `maxDiffPixelRatio` extremely high (e.g., 0.3) to "make it stop failing" — hides real visual regressions along with the font noise.
3. Disabling visual tests in CI entirely and only running them locally — loses the actual point of automated visual regression coverage.

### Interview angle
"Visual regression tests fail only in CI with tiny pixel differences around text — what's the real cause?" — senior answer: font rendering differs between the developer's OS and the CI Docker image's installed fonts; always generate baselines inside the same image used for comparison, and set a small, explicit diff tolerance rather than a local-machine baseline.

### Related
stuck-parallel-ci-jenkins-provider-specific, stuck-files-data-date-locale-mismatch

---

## Parallel workers race on a shared test user account

id: stuck-parallel-ci-worker-race-shared-user
category: parallel-ci
severity: common

### Symptom
Multiple specs that each log in as the same hardcoded test account intermittently fail with unexpected state (wrong balance, unexpected logged-out state, data left over from a different test) only when the suite runs with more than one worker.

### Why it happens
Test workers run genuinely concurrently; a shared account's state (session, balance, whatever a previous test mutated) is a single, mutable resource with no built-in isolation between two workers both acting on it "at the same time" from the account's perspective — one worker's action can and will interleave with another's mid-test.

### How to debug it
1. Search the suite for a hardcoded username/account shared across more than one spec file.
2. Reproduce with `--workers=1` (should pass reliably) versus the CI worker count (should show the race) to confirm the hypothesis.
3. Check whether the failure's specific symptom (unexpected balance, unexpected logout) matches what a second worker's concurrent action on the same account would produce.

### Fix
```ts
// fixtures/personas.ts — provision one distinct account per worker
export const PERSONAS = {
  apex_user_w0: { password: process.env.APEX_W0_PASS! },
  apex_user_w1: { password: process.env.APEX_W1_PASS! },
  // ...
};

test('uses a per-worker persona, never a shared one', async ({ page }, testInfo) => {
  const persona = Object.values(PERSONAS)[testInfo.workerIndex % Object.keys(PERSONAS).length];
  // ...log in with `persona`, fully isolated from other workers...
});
```

### Best practice
Provision (or dynamically create via API) one account per parallel worker, keyed by `testInfo.workerIndex`, so no two workers ever touch the same underlying account state — this is the single highest-leverage fix for this entire class of parallel-execution flake.

### Common wrong fixes
1. Serializing the affected specs with `test.describe.serial()` — fixes the race by removing parallelism for those tests, which slows the suite and doesn't scale as more shared-account tests are added.
2. Adding a retry so the "losing" worker's test passes on a second attempt — non-deterministic, since the second attempt can race against a *different* worker instead.
3. Adding a manual lock file/semaphore the tests wait on before touching the shared account — reimplements per-worker isolation by hand, worse, when per-worker accounts avoid the problem entirely.

### Interview angle
"Tests using the same test account fail intermittently, only under parallel execution — what's the fix?" — senior answer: provision one account per worker so no two workers ever share mutable account state — this is a test-data-isolation problem, not something serialization or retries should paper over.

### Related
stuck-login-auth-parallel-logout, stuck-files-data-worker-data-collision

---

## Sharding leaves one shard taking far longer than the others

id: stuck-parallel-ci-sharding-uneven
category: parallel-ci
severity: tricky

### Symptom
A suite split across N shards for CI parallelism finishes N-1 shards quickly, while one shard consistently takes several times longer — turning "parallel" sharding into "wait for the slowest one" in practice.

### Why it happens
Playwright's default sharding distributes *tests*, not *time* — if it splits purely by file/test count without knowledge of actual historical duration, a shard that happens to receive several genuinely slow tests (heavy visual regression suites, long E2E flows) will take much longer than a shard full of fast unit-style checks, even though both shards have a similar test *count*.

### How to debug it
1. Compare the reported duration of each shard from recent CI runs — is it consistently the same shard index that's slow, or does it vary?
2. Check whether the slow shard happens to contain a cluster of known-heavy tests (visual regression, cross-browser, long wizards).
3. Check whether Playwright's blob-report-based shard merging is being used, which unlocks duration-aware shard planning in newer Playwright versions.

### Fix
```yaml
# .github/workflows/practice-suite.yml — shard by a stable total, and merge blob
# reports afterward so flake/duration data informs *future* shard balancing.
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4 --reporter=blob
  - uses: actions/upload-artifact@v4
    with: { name: blob-report-${{ matrix.shard }}, path: blob-report }
```
```bash
# Merge job: use the merged report's per-test durations to rebalance shard
# groupings by moving known-slow specs into their own dedicated shard.
npx playwright merge-reports --reporter=html ./all-blob-reports
```

### Best practice
Periodically review merged-report duration data and deliberately group consistently-slow tests (visual regression, long E2E flows) so they're spread evenly across shards rather than left to chance file-based splitting — treat shard balance as something to actively tune, not a "set once and forget" default.

### Common wrong fixes
1. Adding more shards indiscriminately without addressing the imbalance — the same slow tests still cluster on one shard, now among fewer other tests, potentially making the imbalance proportionally worse.
2. Manually moving individual test files between shard groups by trial and error with no duration data to guide it — a guess that can silently become wrong again as the suite evolves.
3. Reducing coverage by removing the slow tests specifically to make shards even — trades real coverage for a scheduling convenience.

### Interview angle
"One CI shard consistently takes three times longer than the others — why, and how do you fix it?" — senior answer: default sharding balances by test count, not duration; use merged-report duration data to deliberately redistribute known-slow tests (visual/E2E) evenly across shards instead of leaving it to chance.

### Related
stuck-parallel-ci-passes-locally-fails-ci, stuck-login-auth-storage-expired

---

## `retries: 2` is quietly hiding a real, reproducible bug

id: stuck-parallel-ci-retries-hiding-bugs
category: parallel-ci
severity: tricky

### Symptom
The CI dashboard shows all-green, but the Playwright HTML report (or `flake-report.mjs`-style summary) shows a specific test consistently needing its second or third retry attempt to pass — meaning it's genuinely failing on attempt one, every single run, and nobody's looking at why.

### Why it happens
`retries` exists to absorb genuine, rare environmental flakiness (a one-in-a-hundred network blip) — but a test that reliably fails on attempt one and reliably passes on attempt two isn't flaky in that sense, it has a *deterministic* race or ordering bug that retries happen to dodge (e.g., attempt one always hits a cold-cache timing edge that's warmed up by the time attempt two runs). A blanket-green CI status without looking at retry counts hides this completely.

### How to debug it
1. Check the HTML report's per-test retry count, or run a flake-summary tool like this repo's `tools/flake-report.mjs` across recent runs — look for any test with a consistent (not random) need for retry.
2. Compare the trace of the *failed* first attempt against the *passed* second attempt for the same test run — what's actually different between them (usually: something warmed up, like a cache or a lazily-initialized service)?
3. Treat "always needs exactly one retry" as more suspicious than "fails randomly 1 in 50 runs" — consistency is a signal of a deterministic bug, not luck.

### Fix
```ts
// tools/flake-report.mjs (already in this repo) — surface retry-needing tests
// as an explicit, reviewed signal instead of letting a green CI badge hide them.
```
```bash
node tools/flake-report.mjs playwright-report/results.json
# Treat any test appearing here with retries > 0 as a bug ticket, not a shrug.
```

### Best practice
Monitor retry counts as a first-class CI signal (fail the build, or at minimum flag it loudly, if a specific test needs a retry on every run) rather than only looking at final pass/fail — a consistently-retried test is telling you something reproducible is wrong on the first attempt.

### Common wrong fixes
1. Raising `retries` from 2 to 3 "to be extra safe" when a test still occasionally fails all attempts — treats a worsening deterministic bug as needing more chances instead of investigation.
2. Ignoring retry-count data because "the build is green anyway" — the single most common way real, fixable bugs sit unaddressed for months.
3. Removing retries entirely without first fixing the underlying causes they were masking — makes CI newly flaky/red for bugs that were always there, which is directionally right but disruptive if done without warning the team first.

### Interview angle
"CI is green, but you notice a test needs its second retry attempt on every single run — is that a problem?" — senior answer: yes — a test that deterministically fails on attempt one and passes on attempt two has a reproducible race/ordering bug, not random flakiness, and a green badge alone hides it; monitor retry counts explicitly, not just final status.

### Related
stuck-flaky-debug-green-nine-of-ten, stuck-parallel-ci-passes-locally-fails-ci

---

## Headless mode behaves differently from headed mode

id: stuck-parallel-ci-headless-vs-headed
category: parallel-ci
severity: tricky

### Symptom
A test passes reliably when run headed (`--headed`) locally for debugging, but fails in CI's headless mode — or, less commonly, the reverse.

### Why it happens
While Playwright's modern headless Chromium is much closer to headed than older "headless mode" implementations, real differences can still surface: GPU-accelerated rendering paths behaving differently without a real display, certain media/codec features, focus/window-activation behavior (a headless browser has no real OS window to receive focus events the same way), and timing differences since headed mode is often (slightly) slower due to actual rendering to a visible window.

### How to debug it
1. Reproduce exactly: run the same command locally with `--headed` removed to force headless, confirming the difference is genuinely headless-vs-headed and not something else entirely (worker count, OS).
2. Check whether the failing assertion relates to focus, media playback, or GPU-dependent rendering — the categories most likely to genuinely differ.
3. Check the Playwright changelog/docs for the specific browser version in use — headless-vs-headed parity has improved significantly across versions, and an older pinned version may have gaps a newer one has closed.

### Fix
```ts
// playwright.config.ts — if a specific feature genuinely needs headed-mode
// fidelity (e.g., certain GPU/media-dependent behavior), scope headed mode to
// just that project rather than assuming headless is simply "broken."
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'media-tests',
      testMatch: /media\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], headless: false },
    },
  ],
});
```

### Best practice
Default to headless everywhere for speed and CI-compatibility, and only carve out a specific, narrow project/test group that genuinely requires headed mode (documented with *why*) rather than assuming a headless failure means headless mode itself is untrustworthy.

### Common wrong fixes
1. Switching the entire CI suite to headed mode to "match local" — usually impossible or extremely awkward in a CI environment with no real display (requires a virtual framebuffer like Xvfb) and slower across the board for no benefit to most tests.
2. Adding broad try/catch swallowing around the specific assertion that differs — hides a real, possibly user-facing rendering/focus difference instead of understanding it.
3. Assuming "headless is just less reliable" as a blanket explanation without confirming the specific mechanism (focus, GPU, media) actually at play.

### Interview angle
"A test passes headed but fails headless in CI — what specific categories of difference would you check first?" — senior answer: focus/window-activation behavior, GPU-accelerated rendering paths, and media/codec support are the main categories where headless and headed still meaningfully differ — check those specifically rather than assuming headless mode is generally unreliable.

### Related
stuck-parallel-ci-passes-locally-fails-ci, stuck-parallel-ci-docker-font-rendering

---

## Viewport size differs between local and CI, breaking layout-dependent tests

id: stuck-parallel-ci-viewport-diff
category: parallel-ci
severity: common

### Symptom
A test asserting on a responsive layout behavior (a hamburger menu appearing, a sidebar collapsing) passes locally and fails in CI, or vice versa, with the DOM structure looking otherwise identical.

### Why it happens
If `viewport` isn't explicitly configured, Playwright's default viewport size may differ from whatever a developer's local headed browser window happens to be sized to, or from an assumption baked into the test — responsive breakpoints are viewport-driven, so an unpinned viewport means the test's "which layout am I even looking at" is left to chance/defaults rather than an explicit decision.

### How to debug it
1. Log the actual viewport size (`page.viewportSize()`) at the point of failure in both environments.
2. Check `playwright.config.ts` and any `test.use({ viewport: ... })` overrides for whether the size is explicitly pinned or left to Playwright's default.
3. Confirm which breakpoint the app's CSS switches layouts at, and whether the observed viewport sizes straddle that breakpoint differently.

### Fix
```ts
// playwright.config.ts — pin viewport explicitly per project rather than relying
// on framework defaults that could change or differ across environments.
export default defineConfig({
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
});
```

### Best practice
Always pin `viewport` explicitly per project rather than depending on Playwright's default, and write responsive-layout tests as dedicated `desktop`/`mobile`-tagged projects that each assert the layout appropriate to their pinned size — never assume "the current default" viewport for anything layout-sensitive.

### Common wrong fixes
1. Adding `page.setViewportSize()` mid-test as an ad hoc patch in just the one failing test — inconsistent with the rest of the suite and easy to forget for the next similar test.
2. Writing a layout assertion that tries to handle "either" viewport with an `.or()` fallback — masks which layout was actually intended to be tested at that point.
3. Assuming CI's default viewport "should just match" a developer's local browser window without ever pinning either — leaves both to chance.

### Interview angle
"A responsive-layout test passes locally but fails in CI with no code change — what's the first thing to check?" — senior answer: whether `viewport` is explicitly pinned or left to a framework default that may differ between environments — responsive tests should always run against an explicit, dedicated viewport per breakpoint, not an ambient default.

### Related
stuck-parallel-ci-docker-font-rendering, stuck-locators-hidden-vs-visible

---

## Failed CI runs don't leave behind anything useful to debug

id: stuck-parallel-ci-artifact-upload-failed-runs
category: parallel-ci
severity: common

### Symptom
A test fails in CI, and all that's available afterward is a one-line error in the console log — no trace, no screenshot, no video — making the failure effectively undebuggable without trying to reproduce it blind.

### Why it happens
Playwright's trace/video/screenshot capture is opt-in via config (`trace: 'on-first-retry'`/`'retain-on-failure'`, similarly for `video`/`screenshot`), and even when captured, those artifacts only persist if the CI workflow explicitly uploads them — a common gap is capturing artifacts correctly but never adding the `actions/upload-artifact` step (or only uploading on success, or to a path that doesn't match where Playwright actually wrote them).

### How to debug it
1. Check `playwright.config.ts` for whether `trace`, `screenshot`, and `video` are configured to capture on failure at all.
2. Check the CI workflow for an artifact-upload step, and confirm its `path` matches the actual `playwright-report`/`test-results` output directory.
3. Confirm the upload step doesn't have an `if: success()` condition (or equivalent) that skips it precisely when you need it most — on failure.

### Fix
```ts
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```
```yaml
# .github/workflows/practice-suite.yml
- run: npx playwright test
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }} # upload on both pass AND fail, not only on success
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 14
```

### Best practice
Always upload trace/screenshot/video/HTML-report artifacts unconditionally (or explicitly `if: failure() || !cancelled()`), never gated behind a success condition — the entire value of these artifacts is debugging the runs that failed, so an upload step that only fires on green runs is worse than useless.

### Common wrong fixes
1. Only uploading the plain text console log — far less useful than a trace, which lets you replay the exact DOM/network/console state step by step.
2. Setting `trace: 'off'` to save CI storage/time, planning to "turn it on later if needed" — by the time a real failure needs investigating, the evidence is already gone.
3. Re-running the failed job repeatedly hoping to catch it live in a monitored session instead of fixing artifact capture once — wastes far more time than a five-line config/workflow fix.

### Interview angle
"A CI failure has nothing useful to debug from — what CI configuration is missing?" — senior answer: trace/screenshot/video capture on failure needs to be configured in `playwright.config.ts` AND the CI workflow needs an unconditional (or failure-inclusive) artifact-upload step — both pieces are required, and either one missing leaves you with nothing to debug.

### Related
stuck-flaky-debug-trace-viewer-timeout, stuck-parallel-ci-retries-hiding-bugs
