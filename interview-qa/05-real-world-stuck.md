# Real-world stuck scenarios

These are the moments interviewers push past syntax — when something fails in production-like conditions. Each item: scenario → why people get stuck → solid answer.

---

## Q1. S1 — Button is visible but click() times out (auto-wait “failed”)

**Stuck:** “Playwright has auto-wait, so this should work.”

**Why:** Visibility is only one actionability check. Overlay, disabled state, or unstable animation can block pointer events.

**Answer:** Do not add `waitForTimeout`. Assert the blocker is gone / button enabled, then click. Read the timeout error — it usually names the failed check.
```ts
await expect(page.getByRole('dialog')).toBeHidden();
await expect(button).toBeEnabled();
await button.click();
```

---

## Q2. S2 — strict mode violation with two Save buttons

**Stuck:** “The button exists — Playwright is wrong.”

**Why:** Multiple matches (visible + hidden, or duplicate toolbar buttons).

**Answer:** Narrow the locator — role+name inside a region, `.filter()`, or test id. Strict mode is a feature, not a bug.

---

## Q3. S3 — API returns 200 but UI is blank

**Stuck:** Stopping after Network tab shows 200.

**Answer:** Check body/schema, console/JS errors, secondary requests, hydration, and whether UI waits on a different endpoint. Use Trace Viewer + Console + Network together.

---

## Q4. S4 — Spinner never disappears

**Wrong:** `waitForTimeout(10000)`.

**Answer:** Wait for the specific response or assert spinner hidden + content visible.
```ts
await page.waitForResponse(r => r.url().includes('/api/orders') && r.ok());
await expect(page.getByTestId('spinner')).toBeHidden();
```

---

## Q5. S5 — Dynamic table row index changes every run

**Wrong:** `nth(5)`.

**Answer:** Filter by text then chain:
```ts
await page.getByRole('row').filter({ hasText: 'John' })
  .getByRole('button', { name: 'Edit' }).click();
```

---

## Q6. S6 — React re-render: Element is detached from the DOM

**Stuck:** Holding an ElementHandle across a re-render.

**Answer:** Locators re-query automatically. Prefer Locators; avoid ElementHandle. If click races with remount, assert stable UI state first.

---

## Q7. S7 — Dashboard fires 4 APIs — when should the test proceed?

**Wrong:** `waitForLoadState('networkidle')` (analytics/websockets may never idle).

**Answer:** Wait only for the response your assertion depends on, then assert UI.

---

## Q8. S8 — waitForResponse race: listener attached too late

**Stuck:** Click then wait — response already finished.

**Answer:** Start waiting before the action:
```ts
const [res] = await Promise.all([
  page.waitForResponse(r => r.url().includes('/api/save') && r.ok()),
  page.getByRole('button', { name: 'Save' }).click(),
]);
```

---

## Q9. S9 — OTP login in production-like flow

**Stuck:** Trying to scrape SMS/email OTP in E2E.

**Answer:** Prefer test-env fixed OTP, API login, storageState, or mock OTP service. Keep one controlled UI test if product requires it.

---

## Q10. S10 — CAPTCHA on login

**Answer:** Never automate real CAPTCHA as a core strategy. Disable in test env, use API auth, or vendor test keys. CAPTCHA E2E is brittle and often against policy.

---

## Q11. S11 — Passes locally, fails only in CI

**Checklist:** Trace/video/screenshot → Node/Playwright/OS/Docker parity → CPU/RAM starvation & worker count → secrets/baseURL → timing races on slower runners → reproduce with `--repeat-each` and official Playwright image locally.

---

## Q12. S12 — Visual tests pass on Mac, fail on Linux CI

**Why:** Font/anti-aliasing/GPU differences.

**Answer:** Generate and compare baselines inside the official Playwright Docker image; mask dynamic regions; set sensible `maxDiffPixelRatio`.

---

## Q13. S13 — 50 tests pass serially, fail in parallel

**Why:** Shared username/order/file or mutated shared storageState.

**Answer:** Unique faker data per test, isolated contexts, don’t share writable accounts across workers.

---

## Q14. S14 — Chromium crashes after hundreds of tests

**Causes:** Leaked pages/contexts, always-on huge videos/traces, too many workers, large in-memory downloads.

**Answer:** Ensure teardown, retain artefacts on failure only, right-size workers, monitor RSS.

---

## Q15. S15 — Random marketing popup

**Best:** Disable via test cookie/localStorage seed.

**Fallback:** Conditionally dismiss without failing the journey. Don’t hard-fail every run on promo UI.

---

## Q16. S16 — Session expires mid long suite

Refresh token / re-save storageState periodically, or create a fresh authenticated context. Don’t re-login via UI inside every test as the default.

---

## Q17. S17 — Slow network; developer says “it works”

Throttle network (CDP) and assert loading UX: skeleton, retry, timeout message — not only the happy path on fast Wi-Fi.

---

## Q18. S18 — UI says Order created — prove it

Hybrid: UI toast **plus** API/DB/event verification. Never trust UI alone for money/inventory paths.

---

## Q19. S19 — Microservices: order fans out to 5 services

Hybrid pyramid: contract/API tests per service + thin UI journey. Don’t validate the entire fan-out only through the browser.

---

## Q20. S20 — Screenshot fails daily (clock, avatar, ads)

Mask dynamic regions, disable animations, stable Docker baselines. Otherwise visual suites become noise generators.

---

## Q21. S21 — Service Workers swallow page.route()

PWAs may intercept before Playwright. Set `serviceWorkers: 'block'` when mocking, or unroute/unregister SW in test setup.

---

## Q22. S22 — WebSocket disconnects mid test

Assert reconnect UX; optionally use `routeWebSocket` to simulate drop/corrupt frames. Don’t only assert the happy connected state.

---

## Q23. S23 — Third-party payment gateway can’t be mocked ethically/technically

Use sandbox credentials + narrow UI checks, or stub at your BFF boundary. Keep one monitored sandbox journey; don’t hit real money rails in CI.

---

## Q24. S24 — UI element shows stale text (exists, wrong value)

Auto-wait ensures presence, not correct async data. Use web-first text asserts or `expect.poll` against API source of truth.

---

## Q25. S25 — Animation / toast intercepts click

Wait for toast/overlay to hide; prefer asserting end state. Avoid `force: true` as the default fix.

---

## Q26. S26 — Timezone/locale differs local vs CI

Pin `locale` and `timezoneId` in config (`en-IN`, `Asia/Kolkata`, etc.). Date pickers and “today” labels flake otherwise.

---

## Q27. S27 — Developers remove data-testid from a critical module

Treat test ids as a contract in definition of done; fall back to roles/labels; escalate as a quality gate, not a silent locator rewrite war.

---

## Q28. S28 — Feature flags: half users see new UI

Flag-aware fixtures load the correct POM. Seed flag state via API/cookie. Don’t maintain two full suites blindly.

---

## Q29. S29 — Missing await (floating promise)

Classic flake. Enable `@typescript-eslint/no-floating-promises`. Every Playwright call that returns a Promise must be awaited.

---

## Q30. S30 — Infinite scroll / virtualised list

Don’t assume all rows are in DOM. Scroll until target row attaches, or use search/filter API + UI assert on visible window.

---

## Q31. S31 — Flaky test: quarantine or delete?

Quarantine with `@flaky` + owner + deadline; keep signal in a non-blocking job. Deleting without RCA loses coverage. Fix or replace intentionally.

---

## Q32. S32 — Browser upgrade breaks 2000 tests overnight

Pin Playwright/browser versions; upgrade in a spike PR; run smoke matrix first; read release notes for selector/engine changes; canary one project before fleet upgrade.

---

## Q33. S33 — Clipboard / geolocation / notification permissions

Grant via context options (`permissions`, geolocation). Don’t rely on OS permission dialogs in CI.

---

## Q34. S34 — File download content validation

Capture download event, `saveAs`/`path`, then assert filename, size, and parse CSV/PDF as needed. Don’t only assert that a click happened.

---

## Q35. S35 — Leadership: cut cloud cost 40% without cutting coverage

Tiered suites, fewer browsers on PR, cache deps/browsers, artefacts on failure only, right-size shards, API setup, kill always-on traces/videos, measure cost per suite owner.

---
