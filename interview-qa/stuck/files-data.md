## Uploading a file when the `<input>` is visually hidden

id: stuck-files-data-upload-hidden-input
category: files-data
severity: common

### Symptom
A file-upload flow driven by a custom-styled "Choose file" button fails when the test tries to interact with the real `<input type="file">` — either it can't be found, or a `click()` on it times out.

### Why it happens
Most custom file-upload UI deliberately hides the native `<input type="file">` (it's visually unstylable) behind a styled button that triggers it via `label`/`click()` delegation or JS. A real user never directly clicks the hidden input — but Playwright's `setInputFiles()` is specifically designed to work around this: it doesn't require the input to be visible or clickable at all, because it operates directly on the file input's value, the same way a user's OS file-picker dialog would set it.

### How to debug it
1. Confirm the actual `<input type="file">` element exists in the DOM (even if hidden) — search the page source for `type="file"`.
2. Check whether the test is trying to `.click()` the hidden input directly (wrong) instead of using `setInputFiles()` on it (right).
3. If the input only mounts dynamically after clicking a trigger button, make sure the trigger is clicked (or the input located) at the right point in the flow.

### Fix
```ts
test('uploads a file via a custom-styled hidden input', async ({ page }) => {
  await page.goto('/documents/upload');
  // No need to click the hidden input or make it visible first.
  await page.getByLabel('Upload document').setInputFiles('tests/fixtures/sample.pdf');
  await expect(page.getByText('sample.pdf')).toBeVisible();
});

test('uploads multiple files at once', async ({ page }) => {
  await page.goto('/documents/upload');
  await page.locator('input[type="file"]').setInputFiles([
    'tests/fixtures/sample.pdf',
    'tests/fixtures/photo.png',
  ]);
});
```

### Best practice
Always use `locator.setInputFiles()` targeting the real `<input type="file">` (via `getByLabel`, a `data-testid`, or a stable selector) regardless of whether it's visually hidden — never try to force a click through a `display:none`/`visibility:hidden` input, since `setInputFiles()` doesn't need the element to be actionable at all.

### Common wrong fixes
1. Using `page.evaluate()` to remove the `hidden`/`display:none` styling before clicking — unnecessary DOM surgery when `setInputFiles()` already handles hidden inputs natively.
2. Using `{ force: true }` on a `.click()` against the hidden input — even if it "works," it doesn't actually set the file the way `setInputFiles()` does, and can behave inconsistently across browsers.
3. Trying to drive the OS-level native file picker dialog directly — Playwright intentionally doesn't (and can't reliably) automate OS-native dialogs; `setInputFiles()` exists precisely so you never need to.

### Interview angle
"How do you test a file upload when the actual `<input type="file">` is hidden behind custom styling?" — senior answer: `setInputFiles()` targets the real input directly and doesn't require it to be visible or clickable — never try to force-click a hidden native file input.

### Related
stuck-locators-hidden-vs-visible

---

## Verifying a downloaded file's name and size

id: stuck-files-data-download-capture
category: files-data
severity: common

### Symptom
A test clicks a "Download report" button and needs to verify the download actually happened with the right filename and a non-trivial size, but the browser's native download UI/dialog isn't something the test can see or interact with directly.

### Why it happens
Downloads triggered by the browser aren't part of the page's DOM — they're a browser-chrome-level event. Without explicitly listening for Playwright's `download` event, a test has no visibility into whether a download happened at all, let alone its filename or content.

### How to debug it
1. Confirm a `download` event listener is registered (via `page.waitForEvent('download')`) *before* the triggering click, following the same before-not-after ordering rule as popups and responses.
2. Check `download.suggestedFilename()` and save the file (`download.saveAs(...)` or read `download.path()`) to inspect its actual content/size if the failure is about content correctness, not just "did a download happen."
3. Verify the download isn't actually being blocked by browser download-permission settings in the test's launch configuration.

### Fix
```ts
import fs from 'node:fs';

test('downloads a report with the expected filename and content', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download report' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('annual-report.pdf');
  const savePath = 'test-results/annual-report.pdf';
  await download.saveAs(savePath);
  const { size } = fs.statSync(savePath);
  expect(size).toBeGreaterThan(1000); // sanity check it's not an empty/error file
});
```

### Best practice
Always assert on more than "a download happened" — check the filename matches what's expected and that the file's size (or, for structured formats, its parsed content) is sane; treat a 0-byte or suspiciously tiny download as a real failure, not a pass.

### Common wrong fixes
1. Only checking that `page.waitForEvent('download')` resolved without checking the filename or size — a download of a corrupted/empty file still "resolves" the event and would incorrectly pass.
2. Registering the download listener after the click — same ordering race as any other `waitForEvent` usage; the event may already have fired.
3. Trying to interact with the OS's native "Save As" dialog — Playwright deliberately auto-accepts downloads to a managed location instead of surfacing an OS dialog to automate.

### Interview angle
"How do you verify a file download in Playwright, given there's no visible download dialog?" — senior answer: register `page.waitForEvent('download')` before the triggering click, then assert on `suggestedFilename()` and the saved file's actual size/content — not just that the event fired.

### Related
stuck-frames-windows-popup-handling, stuck-waits-timing-response-race

---

## A data table's row order keeps changing between runs

id: stuck-files-data-dynamic-table-order
category: files-data
severity: common

### Symptom
An assertion like "the first row should be Order #1042" passes sometimes and fails other times, even though the underlying data hasn't actually changed in a way the test cares about.

### Why it happens
Tables backed by data with no strong, stable default sort order (e.g., sorted by a timestamp with sub-second collisions, or unsorted and reliant on database-returned order which isn't guaranteed stable across queries) can legitimately return rows in a different order on different runs without any bug at all — this is often correct backend behavior, not something to "fix" on the API side, just something the test needs to account for.

### How to debug it
1. Check whether the API/backend documents any *guaranteed* sort order at all — if not, position-based assertions were never valid to begin with.
2. Compare two consecutive real API responses for the same query to confirm the order genuinely varies.
3. Identify a stable, unique identifier per row (an order ID, not a display position) that the test could key off of instead.

### Fix
```ts
// Before: assumes a specific row position that isn't actually guaranteed
await expect(page.getByRole('row').nth(1)).toContainText('Order #1042');

// After: locate by stable content, not position
await expect(page.getByRole('row', { name: /Order #1042/ })).toBeVisible();

// If order truly matters for the feature under test (e.g., "sorted by date desc"),
// assert the ordering property itself, not a fixed absolute position:
const dates = await page.getByTestId('order-date').allTextContents();
const sorted = [...dates].sort().reverse();
expect(dates).toEqual(sorted);
```

### Best practice
Assert on content by stable identity (an ID, a unique label) rather than row position whenever the underlying order isn't a documented guarantee; when order *is* a feature (e.g., a sortable column), test the ordering property itself rather than one specific expected sequence.

### Common wrong fixes
1. Adding a fixed "sort by ID" query param to the test's own requests, papering over the fact that the *feature under test* (default table order) was never actually verified as intended.
2. Retrying until the row happens to land in the expected position — non-deterministic and doesn't actually validate anything about correct behavior.
3. Hardcoding a `.nth(n)` with a comment "this is usually first" — documents the flakiness instead of fixing it.

### Interview angle
"A table-order assertion is flaky even though nothing about the data changed — what's the likely issue?" — senior answer: the underlying order was probably never a guaranteed contract; locate by stable content/ID instead of position, and if order genuinely matters, assert the ordering property rather than one fixed sequence.

### Related
stuck-locators-virtual-scroll, stuck-flaky-debug-green-nine-of-ten

---

## A date renders differently in US vs EU locale and breaks the assertion

id: stuck-files-data-date-locale-mismatch
category: files-data
severity: common

### Symptom
A test asserting `toContainText('03/04/2026')` passes in one environment and fails in another where the exact same underlying date renders as `04/03/2026` — because one means March 4th and the other April 3rd, depending on locale.

### Why it happens
Date formatting (`MM/DD/YYYY` in the US vs `DD/MM/YYYY` in most of the rest of the world) depends on the browser's or app's configured locale, which can differ between a developer's local machine, a CI runner's default OS locale, and whatever locale a real user's browser reports — a hardcoded ambiguous-format date string bakes in an assumption that isn't actually guaranteed anywhere in the stack.

### How to debug it
1. Check what locale the CI runner/browser context is actually using (`Intl.DateTimeFormat().resolvedOptions().locale` via `page.evaluate()`) versus what the developer's local machine defaults to.
2. Confirm the app itself is locale-aware (renders dates via `Intl.DateTimeFormat` respecting a `locale`) rather than always hardcoding one format regardless of context.
3. Reproduce locally by explicitly launching a browser context with a different `locale` option to match CI's.

### Fix
```ts
// Pin the locale explicitly so the test's expectations are unambiguous
// regardless of the runner's OS default.
test.use({ locale: 'en-US' });

test('order date renders in US format', async ({ page }) => {
  await page.goto('/orders/1042');
  await expect(page.getByTestId('order-date')).toHaveText('3/4/2026');
});

// Or, avoid ambiguous strings entirely — assert on an unambiguous, parsed value:
test('order date is the 4th of March', async ({ page }) => {
  const text = await page.getByTestId('order-date').textContent();
  const parsed = new Date(await page.evaluate((t) => Date.parse(t!), text));
  expect(parsed.getUTCMonth()).toBe(2); // March, 0-indexed
  expect(parsed.getUTCDate()).toBe(4);
});
```

### Best practice
Always pin `locale` (and, where relevant, `timezoneId`) explicitly via `test.use()` rather than depending on the runner's ambient OS/browser default, and prefer asserting on parsed date components or ISO-formatted values over locale-ambiguous display strings wherever the exact rendered format isn't itself the thing under test.

### Common wrong fixes
1. Hardcoding the CI runner's current default locale into the assertion without pinning it in the test config — the runner's default can silently change with an OS/image update.
2. Writing separate assertions per suspected locale and skipping the ones that fail — masks the real fix (pin the locale) with a maintenance burden.
3. Using string `.includes()` checks for just the year to "avoid the ambiguity" — passes trivially without verifying the date is actually correct.

### Interview angle
"A date-based assertion passes locally but fails in CI with what looks like the same date — what's really going on?" — senior answer: very likely a locale-driven month/day ordering difference (MM/DD vs DD/MM); pin `locale` explicitly via `test.use()` and prefer unambiguous, parsed-value assertions over raw locale-formatted strings.

### Related
stuck-parallel-ci-docker-font-rendering, stuck-waits-timing-clock-dependent-otp

---

## Parallel workers collide on shared test data

id: stuck-files-data-worker-data-collision
category: files-data
severity: tricky

### Symptom
Two tests that each create, rename, or delete "the same" resource (an account named "Test User," an order with a fixed ID) pass individually but fail unpredictably when run in parallel — one worker's cleanup deletes data another worker is mid-way through using.

### Why it happens
Playwright workers run genuinely in parallel by default; any test data keyed by a fixed, shared identifier (a literal string like `"test-user"` or a fixed numeric ID) is not actually isolated between workers, even though each worker believes it "owns" that data for the duration of its own test. This is a test-data-design bug, not a Playwright or app bug.

### How to debug it
1. Check whether failing tests reference a literal, non-unique identifier for data they create or mutate.
2. Confirm failures correlate with the number of workers (fewer workers = fewer/no collisions, consistent with a real race for shared data) rather than a specific test change.
3. Look for setup/teardown (`beforeEach`/`afterEach`) that deletes or resets data by a fixed name shared across spec files.

### Fix
```ts
import { test as base } from '@playwright/test';
import { randomUUID } from 'node:crypto';

const test = base.extend<{ uniqueAccountName: string }>({
  uniqueAccountName: async ({}, use, testInfo) => {
    // Unique per test AND per worker/retry — safe under full parallelism.
    await use(`qa-${testInfo.workerIndex}-${randomUUID().slice(0, 8)}`);
  },
});

test('creates and deletes its own isolated account', async ({ page, uniqueAccountName }) => {
  await page.goto('/accounts/new');
  await page.getByLabel('Account name').fill(uniqueAccountName);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText(uniqueAccountName)).toBeVisible();
});
```

### Best practice
Generate unique, per-test/per-worker identifiers for any data a test creates or mutates (via `testInfo.workerIndex`, a UUID, or a timestamp), and scope cleanup to exactly the data that specific test created — never delete/reset by a fixed shared name that other parallel tests might also be using.

### Common wrong fixes
1. Reducing `workers` to 1 to eliminate the race — hides the underlying test-data-isolation bug and makes the whole suite far slower.
2. Adding a global mutex/lock file tests wait on before touching "the" shared resource — reintroduces serialization by hand instead of just making the data unique per test.
3. Adding retries so the test passes if it happens to win the race on a later attempt — non-deterministic, and can still fail unpredictably at higher parallelism.

### Interview angle
"Tests that each manage 'the same' named resource fail intermittently only under parallel execution — diagnose." — senior answer: shared, non-unique test data identifiers racing across workers; generate a unique identifier per test (worker index + UUID) and scope cleanup to exactly what that test created, rather than reducing parallelism or adding retries.

### Related
stuck-login-auth-parallel-logout, stuck-parallel-ci-worker-race-shared-user
