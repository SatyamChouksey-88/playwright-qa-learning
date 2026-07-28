---
tier: DBG
tier_key: debuggingArtifactsLab
id: debugging-artifacts-lab
title: Debugging artifacts lab — HAR, console, video/screenshot triage
lead: The site's Trace diagnosis lab (`#trace-lab`, `GAP_TRACE_CHECKLIST`)
  covers the five-question checklist for a trace.zip. This extends past the
  trace into the other artifacts a real incident actually hands you — a HAR
  file, a raw console log, a screenshot, a short video clip — often *without*
  a trace at all, because the failure happened last week in someone else's
  CI run and nobody turned tracing on.
difficulty: intermediate
topic: debugging
pw_version_introduced: "1.40"
---

# Debugging artifacts lab

The trace.zip is the best-case artifact — it has everything. Real incidents are messier: a support ticket with one screenshot, a Jenkins job that only kept `console.log` output, a HAR someone exported from DevTools by hand. This lab drills the artifacts you'll actually get handed, one at a time, plus a few "here's a folder, find the bug" drills that combine them the way a real investigation does.

*Quick index: DBG1 read a HAR for a slow request · DBG2 HAR shows a request that never fired · DBG3 console error crashes a React tree · DBG4 console noise vs. the real error · DBG5 screenshot-only triage (no trace) · DBG6 video frame-by-frame triage · DBG7 combined-artifact drill: silent data bug · DBG8 combined-artifact drill: works-then-breaks mid-run*

---

### DBG1. Given a HAR file, find why a page "loads slowly" — without opening the app

**Artifact:** A `.har` file exported from `page.routeFromHAR()` recording, or from DevTools → Network → "Save all as HAR," covering one page load.

**Task:** Open the HAR (a plain JSON structure — readable in DevTools' Network tab import, or any HAR viewer) and answer: which single request contributes the most to time-to-interactive, and is it render-blocking?

**How to read it:** Each entry under `log.entries` has a `timings` object (`blocked`, `dns`, `connect`, `ssl`, `send`, `wait`, `receive`) and a `startedDateTime`. Sort by `time` (total) descending — the top entry is rarely the largest *payload*; it's usually the one with the largest `wait` (server think time) or the one that starts latest because it was queued behind something else. Cross-reference `entries[].request.url` against the page's actual render order — a slow request to an analytics endpoint that fires after `DOMContentLoaded` is irrelevant to load time; a slow request the main bundle `await`s before rendering anything is the real culprit.

**Expected finding:** In most real cases, it's either (a) one synchronous, render-blocking API call with a `wait` time of several seconds — a backend problem to file, not a frontend one — or (b) a third-party script (tag manager, chat widget) loaded synchronously in `<head>` with no `async`/`defer`, blocking everything behind it.

**Why this matters:** "The page feels slow" is not a Playwright problem to fix with a longer timeout — a HAR turns a vague complaint into a specific request with a specific number attached, which is what gets a performance bug actually prioritized. See PF6 for the deploy-correlated version of this same instinct.

---

### DBG2. Given a HAR, find a request that should exist and doesn't

**Artifact:** A HAR from a failing run, plus the corresponding HAR from a known-good run of the same journey.

**Task:** A "Save" button click should trigger a `POST /api/orders`. In the failing HAR, it's missing entirely — not present with an error status, just absent. Find out why without touching the app.

**How to read it:** Absence in a HAR means the request never left the browser — this rules out a backend problem immediately and points at the frontend JavaScript. Check the console log captured alongside the HAR (most exports bundle both) for a JS exception thrown in the click handler *before* the fetch call executes — a thrown error upstream of the network call silently prevents it from ever firing, and unless something is asserting on the network call itself, a UI test might not even notice (the button visually "did something," like a ripple animation, without the actual save happening).

**Expected finding:** A JS error a few lines before the fetch call in a click handler — often a null-reference on a field the form validation didn't fully guard, thrown before the code path reaches the network call.

**Why this matters:** This is the discipline behind S8/B25-style "assert the request actually happened," not just that the button click resolved — a HAR comparison is how you prove a request never fired at all, rather than fired-and-failed, which changes where you look for the bug entirely.

---

### DBG3. Given only a browser console log, find why a whole page went blank

**Artifact:** A raw console log (`page.on('console', ...)` output captured to a text file, no trace, no screenshot) from a CI run where the entire dashboard rendered blank.

**Task:** Console shows:
```
[error] TypeError: Cannot read properties of undefined (reading 'balance')
    at AccountSummary.tsx:42
[warning] React will try to recreate this component tree from scratch...
```
Diagnose the failure class without the app running in front of you.

**How to read it:** A single uncaught exception thrown during render in a component (`AccountSummary.tsx:42`) that isn't caught by an error boundary takes down everything React was rendering below (and often around) that component — which is why "the whole page is blank" doesn't mean the whole page's code is broken; it usually means **one** component threw during render and nothing caught it. The React warning about "recreate from scratch" confirms it unmounted the tree rather than a targeted fallback. The actual bug is almost always one level up from the stack trace's line number: something upstream returned `undefined` instead of the expected object (a race between data loading and rendering, or an API response shape that didn't match what the component expected) and the component read a property off it without a guard.

**Expected finding:** The `balance` field's parent object was `undefined` momentarily during a loading state the component didn't account for — a defensive check (`account?.balance`) or a proper loading-state guard fixes the render; the API/data-timing issue underneath it is the thing actually worth a ticket.

**Why this matters:** Console-only triage is common in Jenkins-only environments (PF4-style, no video/trace configured) — being able to reason from a stack trace and a React lifecycle warning alone, with zero visual evidence, is a real skill, not a fallback.

---

### DBG4. Given a noisy console log, separate the real error from twenty lines of harmless noise

**Artifact:** A console capture with 20+ lines: deprecation warnings, a third-party analytics SDK logging its own internal state, a React DevTools suggestion, and one genuine error buried in the middle.

**Task:** Identify which lines are safe to ignore and which one line explains the test failure.

**How to read it:** Triage by **level and origin**, not position in the log: `[warning]`/`[log]` entries from known third-party origins (`googletagmanager.com`, `hotjar.com`, React's own dev-mode suggestions) are near-always noise in a test-failure investigation — they fire on every run, passing or failing, so they can't be what's differentiating this run. The signal is almost always the one `[error]`-level entry (or `pageerror` event, which specifically means an *uncaught* exception, as opposed to a `console.error()` call a developer added deliberately for a handled, non-fatal case) that correlates in time with the actual failing assertion.

**Expected finding:** Filter to `type === 'error'` and cross-reference timestamps against the failing action's timestamp (from the trace or test log) — the noise disappears immediately once you stop reading top-to-bottom and start filtering by level plus timing.

**Why this matters:** New engineers often paste the entire console dump into a bug report or a Slack thread without filtering, which trains everyone around them to ignore console output entirely — filtered, correlated evidence is what actually gets a bug fixed quickly.

---

### DBG5. Given a single failure screenshot and nothing else, decide what you can and can't conclude

**Artifact:** One PNG — the failure screenshot Playwright auto-attaches (`screenshot: 'only-on-failure'`) — showing a form with a red "Something went wrong" banner, no trace, no video, no console log retained.

**Task:** State exactly what this screenshot proves, what it doesn't, and what you'd change in config so this doesn't happen again.

**How to read it:** A screenshot is a single frozen instant — it proves the *end state* the page was in at the moment of failure (an error banner was showing) but proves nothing about the *sequence* that led there: was the banner a real backend error, a client-side validation message being over-matched by a generic locator, or a stale error from a previous action that never cleared? Resist inventing a root cause from one image — the honest answer to "what caused this" from a screenshot alone is usually "I can narrow it to these two or three possibilities, and I need more evidence to pick one."

**Expected finding:** The screenshot narrows the search (it's definitely an error-state failure, not a timeout or a crash) but can't localize the cause — the actual fix here is configuration: turn on `trace: 'on-first-retry'` and `video: 'retain-on-failure'` so the *next* occurrence comes with enough evidence to actually diagnose, rather than re-debugging blind a second time.

**Why this matters:** Interviewers use this drill to check whether a candidate overclaims from thin evidence — confidently inventing a root cause from one screenshot is a worse answer than correctly saying "this isn't enough evidence, here's what I'd turn on."

---

### DBG6. Given a short failure video, find the exact frame where things went wrong

**Artifact:** A `.webm` video (`video: 'retain-on-failure'`) of a failing test — a checkout flow that ends with the wrong total displayed.

**Task:** Scrub the video to find the moment the total became wrong, not just the moment the assertion failed.

**How to read it:** The assertion failure timestamp is the *last* frame, not the *useful* one — scrub backward from the end to find the frame where the displayed total last changed, and specifically watch for a flash of a correct value immediately followed by an incorrect one (a classic sign of a race: the UI briefly shows the right total from one calculation, then a second, stale async update overwrites it with an old cached value). A video makes this kind of double-render race visible in a way a single screenshot or a trace's periodic snapshots can miss if the flash happens between two trace snapshot points.

**Expected finding:** A discount or tax recalculation resolves asynchronously and, on a slow run, its stale initial value renders *after* the correct total already displayed — a genuine race condition in the app's rendering, not a test problem, and one that a fixed-delay `waitForTimeout` would have "fixed" for the test while leaving the real user-facing bug in place.

**Why this matters:** This is the artifact type most likely to reveal a real intermittent product bug (not a test flake) — a race that resolves differently depending on network timing is exactly the kind of thing that "only fails sometimes" in production too, and video is often the only artifact detailed enough in time-resolution to catch it.

---

### DBG7. Combined-artifact drill — a support ticket says "my balance is wrong," you get a HAR, a console log, and one screenshot

**Given:**
- Screenshot: dashboard showing balance `$0.00` with no error banner.
- Console: no errors, no warnings — completely clean.
- HAR: `GET /api/accounts/42/balance` returns `200` with body `{"balance": null}`.

**Task:** Diagnose without a trace or video — decide whether this is a frontend bug, a backend bug, or a test-design gap, and justify it from the three artifacts alone.

**Reasoning:** A clean console rules out a JS exception — the page rendered `$0.00` (or blank-coerced-to-zero) *successfully*, with no error, because `null` rendered through a naive formatter silently becomes `0` or an empty string rather than throwing. The HAR proves the backend responded `200` with a `null` balance — that's not a network failure and not a frontend bug in isolation; the frontend correctly displayed exactly what it was given. The real defect is the backend returning `null` where it should return a real balance (or an explicit error status) for this account. This is precisely the failure shape from S24/S3 — "the element exists and shows a value, but the value itself is wrong because of stale/absent async data" — except here the artifacts prove it's the *API's* fault, not a frontend timing issue, because the response body itself is bad, not just late.

**Why this matters:** Combining artifacts is how you assign a bug to the *right* team on the first try — a candidate who says "frontend bug, the balance shows wrong" without checking the HAR is guessing; reading the actual response body is what turns a guess into a filed, correctly-routed defect.

---

### DBG8. Combined-artifact drill — a 90-minute suite is green for 40 minutes, then every subsequent test times out on the same locator

**Given:**
- Trace of a *passing* test at the 10-minute mark: normal, fast.
- Trace of a *failing* test at the 55-minute mark: the same `getByRole('button', { name: 'Continue' })` never appears; the DOM snapshot shows the app stuck on a full-page loading spinner.
- Console log from the failing test: `[error] WebSocket connection to 'wss://api.example.com/live' failed: WebSocket is closed before the connection is established.`
- HAR from the same window: repeated `101 Switching Protocols` attempts, each followed immediately by a connection close, roughly once every 30 seconds.

**Task:** Explain the failure pattern (why 40 minutes in, specifically) using all four artifacts together.

**Reasoning:** The spinner-stuck DOM snapshot says the app is waiting on something that never arrives before rendering the "Continue" button — cross-referencing the console shows that "something" is a WebSocket connection that keeps failing to establish. The HAR's repeated `101`-then-close pattern at a steady ~30-second interval suggests a reconnect-with-backoff loop that never actually succeeds, which points at either a server-side connection limit being hit (a backend accepting only so many concurrent WebSocket connections from one IP — plausible if this is 55 minutes into a long parallel CI run that's opened dozens of connections from the same runner IP) or an idle/keepalive timeout mismatch between client and server. The "why 40 minutes in specifically" detail is the tell that this is a resource-exhaustion pattern (PF14's memory-leak shape, but for connections instead of memory) rather than a one-off flake — early tests in the run haven't yet accumulated enough concurrent/leaked connections to hit whatever limit the backend enforces.

**Why this matters:** This drill specifically rewards reading artifacts *together* and *in time order* rather than any one in isolation — the trace alone says "spinner never resolved," the console alone says "WebSocket failed," and the HAR alone says "repeated reconnects" — none of the three individually explains the 40-minute-in timing, but the combination does.

---

## Practice setup

No new tooling required — everything above works from artifacts you already produce:

```bash
# Generate a HAR for a specific test
npx playwright test checkout.spec.ts --trace on
# or explicitly during a run:
# context = await browser.newContext({ recordHar: { path: 'trace.har' } });

# Capture console + video + trace together for a genuinely hard repro
npx playwright test flaky.spec.ts --trace on --video on --repeat-each=20
```

Pair this with the site's [Trace diagnosis lab](#trace-lab) for the interactive `trace.zip` walkthrough — that lab drills the five-question checklist on a live trace; this file drills the artifacts that show up when a trace isn't available at all.

**Related:** S11 (passes locally, fails only in CI), C9 (flake observability beyond one run), PF9 (API 500s only in staging — same "read the actual response body" discipline as DBG7).

---
