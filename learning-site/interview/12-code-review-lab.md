---
tier: CR
tier_key: codeReviewLab
id: code-review-lab
title: Code review lab — review this test
lead: Ten full test specs, each with the kind of combined, realistic problems
  a real PR review turns up — not one isolated antipattern each (see the
  site's Spot-the-antipattern lab for that), but the several-issues-at-once
  shape an actual reviewer has to untangle and prioritize.
difficulty: intermediate
topic: code-review
pw_version_introduced: "1.40"
---

# Code review lab — review this test

Ten "review this PR" exercises. Each is a complete, plausible test a real engineer might actually submit — not a one-line antipattern snippet. Read the bad version first and write down every issue you spot *before* reading the issues list; the gap between what you found and what's listed is the useful signal. Structured as `title` / `bad` / `issues[]` / `fix` so each one maps directly onto a code-review-style widget.

*Quick index: CR1 login test · CR2 checkout/payment test · CR3 dynamic table test · CR4 file upload test · CR5 hybrid API+UI setup test · CR6 visual regression test · CR7 POM design review · CR8 retry-abuse test · CR9 accessibility test · CR10 multi-assertion form test*

---

### CR1. Login test

**Scenario:** A PR adds this as the first test in a new suite.

**Bad:**
```ts
test('user can log in', async ({ page }) => {
  await page.goto('https://staging.example.com/login');
  await page.locator('#email').fill('testuser@example.com');
  await page.locator('#password').fill('Password123!');
  await page.locator('.login-btn').click();
  await page.waitForTimeout(3000);
  const banner = await page.locator('.welcome-banner').isVisible();
  expect(banner).toBe(true);
});
```

**Issues:**
1. Hardcoded absolute URL instead of `baseURL` from config — breaks the moment this runs against a different environment.
2. CSS selectors (`#email`, `.login-btn`, `.welcome-banner`) instead of role/label-based locators — brittle against markup/class changes and invisible to accessibility issues.
3. `waitForTimeout(3000)` — arbitrary sleep instead of waiting on the actual outcome.
4. `isVisible()` read once into a variable, then a plain `expect(...).toBe(true)` — a one-shot, non-retrying check instead of a web-first assertion.
5. Hardcoded plaintext credentials in the test file instead of environment/config-sourced test credentials.

**Fix:**
```ts
test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByTestId('welcome-banner')).toBeVisible();
});
```

**Why it matters:** This exact combination — sleep plus one-shot boolean assertion plus CSS selectors — is the most common shape of a "looks fine, fails randomly in three weeks" PR. None of the five issues would show up in a quick visual read of a passing CI run.

---

### CR2. Checkout/payment test

**Scenario:** A PR for a new "Buy Now" flow.

**Bad:**
```ts
test('checkout succeeds', async ({ page }) => {
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.locator('iframe').contentFrame()!.locator('#card-number').fill('4242424242424242');
  await page.getByRole('button', { name: 'Pay' }).click();
  await page.waitForTimeout(5000);
  await expect(page.getByText('Success')).toBeVisible();
  expect(true).toBe(true);
});
```

**Issues:**
1. `page.locator('iframe').contentFrame()` instead of `page.frameLocator('iframe')` — grabs whatever iframe happens to be first on the page rather than the specific payment frame, and doesn't get Playwright's auto-retrying frame resolution.
2. Real-looking card number hardcoded with no comment indicating it's a documented test-mode number (a reviewer or future maintainer can't tell if this is a live card by looking at it).
3. `waitForTimeout(5000)` instead of waiting for the actual payment-processing network response or a specific UI state change.
4. `getByText('Success')` is dangerously generic — matches any element containing that substring anywhere on the page, a strict-mode risk waiting to happen the moment another "Success" appears elsewhere.
5. `expect(true).toBe(true)` — a meaningless assertion that inflates the visible assertion count without checking anything; a classic sign the author added it to "make the test look more thorough" or padded coverage metrics.
6. No verification beyond the UI — a payment test with no check that an order record was actually created (see B4/S18's hybrid-verification principle) trusts the UI toast alone for a money-moving action.

**Fix:**
```ts
test('checkout succeeds with a test card', async ({ page, request }) => {
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Checkout' }).click();

  const cardFrame = page.frameLocator('iframe[title="Secure card payment frame"]');
  await cardFrame.getByLabel('Card number').fill('4242 4242 4242 4242'); // Stripe test-mode card

  const [paymentResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/payments') && r.ok()),
    page.getByRole('button', { name: 'Pay' }).click(),
  ]);
  const orderId = (await paymentResponse.json()).orderId;

  await expect(page.getByRole('status').filter({ hasText: 'Payment successful' })).toBeVisible();
  const order = await request.get(`/api/orders/${orderId}`);
  expect((await order.json()).status).toBe('paid');
});
```

**Why it matters:** A payment test is exactly where "the UI said success" is not enough evidence — combine it with the C22 boundary discipline (mock the app's own payment result for most tests, sandbox for the redirect/iframe integration) and the S18 hybrid-verification principle.

---

### CR3. Dynamic table test

**Scenario:** A PR testing an orders table that supports sorting and pagination.

**Bad:**
```ts
test('can find a specific order', async ({ page }) => {
  await page.goto('/orders');
  const rows = page.locator('table tr');
  const targetRow = rows.nth(4);
  await expect(targetRow.locator('td').nth(2)).toHaveText('Shipped');
  await targetRow.locator('button').click();
});
```

**Issues:**
1. `rows.nth(4)` assumes a fixed row position in a table whose whole premise (sortable, paginated) means row order is not stable across runs or environments.
2. `td.nth(2)` locates a cell by column *index* with no semantic meaning visible in the test — if a column gets reordered, this silently checks the wrong data instead of failing loudly.
3. `table tr` includes the header row in the match set with no filtering, an off-by-one risk depending on table markup.
4. `targetRow.locator('button')` — if a row has multiple buttons (edit, delete, view), this grabs whichever happens to be first with no stated intent.
5. No assertion on *which* order this is before asserting its status — the test could be silently checking the wrong row's status if the table re-sorts between page load and assertion.

**Fix:**
```ts
test('can find a specific order', async ({ page }) => {
  await page.goto('/orders');
  const row = page.getByRole('row').filter({ hasText: 'ORD-10042' });
  await expect(row.getByRole('cell', { name: 'Shipped' })).toBeVisible();
  await row.getByRole('button', { name: 'View details' }).click();
});
```

**Why it matters:** This is A5/S5's "don't use nth() on data that reorders" lesson, but the bad version compounds it three ways at once (row index, column index, and ambiguous button) — real PRs rarely ship just one isolated antipattern.

---

### CR4. File upload test

**Scenario:** A PR for a document-upload feature.

**Bad:**
```ts
test('upload document', async ({ page }) => {
  await page.goto('/documents');
  await page.getByText('Upload').click();
  const input = page.locator('input[type=file]');
  await input.setInputFiles('C:\\Users\\dev1\\Desktop\\test-invoice.pdf');
  await page.waitForTimeout(2000);
  await expect(page.locator('.file-list')).toContainText('test-invoice.pdf');
});
```

**Issues:**
1. Absolute, machine-specific file path (`C:\Users\dev1\Desktop\...`) — will fail on every other machine and every CI runner.
2. `getByText('Upload')` clicked to reveal the input, but then the input is targeted directly anyway — inconsistent strategy, and `getByText` on a generic word like "Upload" risks matching more than the intended trigger.
3. `waitForTimeout(2000)` for an upload to complete instead of waiting for the actual upload-complete signal (a network response, a progress indicator disappearing, or the file appearing via a retrying assertion).
4. No verification that the *content* uploaded is correct — only that a filename string appears in a list, which would pass even if the upload silently truncated or corrupted the file.
5. `.file-list` CSS class selector instead of a role/testid-based one.

**Fix:**
```ts
test('upload document', async ({ page }) => {
  await page.goto('/documents');
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.getByLabel('Choose file').setInputFiles(
    path.join(__dirname, 'fixtures', 'test-invoice.pdf'),
  );
  await expect(page.getByRole('listitem').filter({ hasText: 'test-invoice.pdf' })).toBeVisible();
  // Verify the server actually stored a valid file, not just that the UI shows a filename:
  const meta = await page.request.get('/api/documents/latest');
  expect((await meta.json()).sizeBytes).toBeGreaterThan(0);
});
```

**Why it matters:** Machine-specific paths are the single most common reason "it works on my machine" is literally true and useless — a repo-relative fixture path is a one-line fix that unblocks every other contributor and CI immediately.

---

### CR5. Hybrid API+UI setup test

**Scenario:** A PR seeding an order through the UI before testing an "order history" page.

**Bad:**
```ts
test('order appears in history', async ({ page }) => {
  await page.goto('/catalog');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByLabel('Card number').fill('4242424242424242');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByText('Order confirmed')).toBeVisible();
  await page.goto('/orders');
  await expect(page.getByText('Order confirmed').first()).toBeVisible();
});
```

**Issues:**
1. `.first()` on "Add to cart" with no stated product — the test's actual precondition (which product got ordered) is invisible and could silently change if the catalog's first item changes.
2. The entire order-creation flow is driven through the UI purely as setup for a test whose actual subject is the order-history *page* — slow, and it makes an order-history-page regression fail alongside a completely unrelated checkout-flow regression, muddying triage.
3. `getByText('Order confirmed').first()` on the history page reuses the checkout page's exact confirmation copy as a proxy for "the order is visible in history" — a fragile assumption that both pages happen to render identical text, and `.first()` silently accepts ambiguity instead of asserting on the specific order.
4. No captured order ID to assert *the specific order* appears in history — passing today doesn't rule out it matching a coincidentally similar unrelated row.

**Fix:**
```ts
test('order appears in history', async ({ page, request }) => {
  const created = await request.post('/api/orders', {
    data: { productId: 'sku-123', quantity: 1 },
  });
  const { id: orderId } = await created.json();

  await page.goto('/orders');
  const row = page.getByRole('row').filter({ hasText: orderId });
  await expect(row).toBeVisible();
  await expect(row.getByRole('cell', { name: 'Confirmed' })).toBeVisible();
});
```

**Why it matters:** This is B4's hybrid-setup principle directly — seed fast and stable via API, and isolate the page actually under test from the correctness of an unrelated flow. The bad version also shows why `.first()` used as setup shorthand quietly erodes what a test is actually proving.

---

### CR6. Visual regression test

**Scenario:** A PR adding a screenshot test for a dashboard.

**Bad:**
```ts
test('dashboard visual', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

**Issues:**
1. No masking of dynamic regions — a live clock, user avatar, or "last updated" timestamp visible on this dashboard will produce a pixel diff on every single run regardless of any real regression.
2. Animations not disabled — a mid-transition frame captured non-deterministically produces flaky diffs unrelated to any actual visual bug.
3. No `maxDiffPixelRatio`/threshold configured — defaults may be too strict for a dashboard with any natural anti-aliasing variance across machines.
4. No mention of where the baseline was generated — if it was captured on a developer's laptop (macOS) and CI runs Linux, font rendering differences alone will fail this test permanently in CI.
5. Testing a whole complex page in one screenshot conflates many independent components — a single unrelated banner change fails this test even when the actual layout under review is fine, and the diff image alone doesn't say which component regressed.

**Fix:**
```ts
test('dashboard visual', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [page.getByTestId('live-clock'), page.getByTestId('user-avatar')],
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
```
```yaml
# Baselines must be generated inside the same image CI uses, e.g.:
# docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.4x.0-noble \
#   npx playwright test --update-snapshots
```

**Why it matters:** B10/S12/S20 all point at the same root cause — visual tests generated outside the CI image's exact rendering environment are a permanent flake source, not an occasional one, and masking dynamic regions is not optional polish, it's the difference between a signal and noise generator.

---

### CR7. Page Object Model design review

**Scenario:** A PR introduces the first Page Object for a new feature area.

**Bad:**
```ts
export class OrdersPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/orders');
  }

  async findOrderAndAssertShipped(orderId: string) {
    const row = this.page.getByRole('row').filter({ hasText: orderId });
    await expect(row.getByRole('cell', { name: 'Shipped' })).toBeVisible();
  }

  async cancelOrder(orderId: string) {
    const row = this.page.getByRole('row').filter({ hasText: orderId });
    await row.getByRole('button', { name: 'Cancel' }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
    expect(await this.page.getByText('Order canceled').isVisible()).toBeTruthy();
  }
}
```

**Issues:**
1. `findOrderAndAssertShipped` bakes a business assertion (that the order is "Shipped") directly into the page object rather than exposing a locator/query method and letting the test assert — this hides what's actually being verified from anyone reading the test file, and makes the same page object unreusable for a test that expects a *different* status.
2. `cancelOrder` uses a raw `isVisible()` + `toBeTruthy()` instead of a web-first `await expect(...).toBeVisible()` — non-retrying, inconsistent with the rest of the codebase's assertion style, and easy to miss in review because it "looks like" an assertion.
3. No separation between locators and actions — locators are re-declared inline in every method instead of being defined once as class properties, so three methods each independently duplicate the same row-lookup logic.
4. The class mixes multiple concerns (navigation, querying a row, canceling, asserting status) with no consistent naming convention distinguishing "does something" methods from "checks something" methods.

**Fix:**
```ts
export class OrdersPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/orders');
  }

  row(orderId: string) {
    return this.page.getByRole('row').filter({ hasText: orderId });
  }

  async cancelOrder(orderId: string) {
    await this.row(orderId).getByRole('button', { name: 'Cancel' }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}

// In the test — assertions stay visible, page object stays reusable:
test('canceling an order updates its status', async ({ page }) => {
  const orders = new OrdersPage(page);
  await orders.goto();
  await orders.cancelOrder('ORD-10042');
  await expect(orders.row('ORD-10042').getByRole('cell', { name: 'Canceled' })).toBeVisible();
});
```

**Why it matters:** B8's core distinction — POMs expose locators and intent methods, tests keep the assertions — is easy to state and easy to violate under deadline pressure; this is what the violation actually looks like in a real diff, not just in the abstract.

---

### CR8. Retry-abuse test

**Scenario:** A PR includes this config change alongside a new, occasionally-failing test.

**Bad:**
```ts
// playwright.config.ts
export default defineConfig({
  retries: 5,
  timeout: 90_000,
});

// new-feature.spec.ts
test('new feature works', async ({ page }) => {
  await page.goto('/new-feature');
  await page.getByRole('button', { name: 'Activate' }).click();
  await page.waitForTimeout(4000);
  await expect(page.getByText('Activated')).toBeVisible();
});
```

**Issues:**
1. `retries: 5` set globally in config (not just while investigating) — masks a genuinely flaky new test behind five silent re-attempts instead of surfacing it as a signal to fix.
2. `timeout: 90_000` raised globally to make one slow test pass, which also hides genuine future performance regressions everywhere else in the suite by giving them 90 seconds of cover.
3. The new test itself still has a `waitForTimeout(4000)` — the retries are compensating for a race the author already knows about (why else pick exactly 4 seconds) rather than fixing it.
4. No `--fail-on-flaky-tests`-style gate — a test that only passes on retry 3 of 5 reports as a plain green pass in CI, with zero visibility that it's unstable, unless someone happens to open the retry history.

**Fix:**
```ts
// playwright.config.ts — leave global retries/timeout as they were
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});

// new-feature.spec.ts
test('new feature works', async ({ page }) => {
  await page.goto('/new-feature');
  const [activationResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/activate') && r.ok()),
    page.getByRole('button', { name: 'Activate' }).click(),
  ]);
  await expect(page.getByText('Activated')).toBeVisible();
});
```

**Why it matters:** C2's core point — retries are a diagnostic tool (`trace: 'on-first-retry'` plus a flakiness gate), not a permanent config workaround for one test's real race condition. A PR that quietly widens global retries/timeout to make its own new test pass is one of the more damaging review misses because its blast radius is the entire suite, not just the new test.

---

### CR9. Accessibility test

**Scenario:** A PR adds an axe-core scan and calls the modal "accessible."

**Bad:**
```ts
test('modal is accessible', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Delete account' }).click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.length).toBe(0);
});
```

**Issues:**
1. Zero axe violations is treated as the entire definition of "accessible" — axe-core checks static/structural rules (labels, contrast, ARIA attributes) and cannot verify dynamic keyboard behavior at all (see C11).
2. No check that focus actually moves into the modal when it opens — a screen-reader/keyboard user could be stuck interacting with the page behind the modal with zero axe violations reported.
3. No check that `Escape` closes the modal, that `Tab` doesn't escape the modal's boundary (focus trap), or that focus returns to the triggering "Delete account" button on close — all real WCAG-relevant behaviors an automated scan doesn't exercise.
4. `expect(results.violations.length).toBe(0)` gives no diagnostic output on failure — when this does fail, the error message says "0 was not 3," with no indication of what the three violations actually were.

**Fix:**
```ts
test('delete-account modal is accessible', async ({ page }) => {
  await page.goto('/settings');
  const trigger = page.getByRole('button', { name: 'Delete account' });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Delete account' });
  await expect(dialog).toBeFocused({ timeout: 1000 }).catch(async () => {
    await expect(dialog.locator(':focus')).toBeVisible(); // focus landed inside the dialog
  });

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
```

**Why it matters:** This is C11's lesson turned into an actual diff — the fix doesn't remove the axe scan, it adds the keyboard-interaction checks axe structurally can't perform, and it makes failures debuggable by printing the violation details instead of just a count.

---

### CR10. Multi-field form test

**Scenario:** A PR for a multi-field signup form's validation.

**Bad:**
```ts
test('signup form validation', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Name').fill('');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Password').fill('123');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByText('Name is required')).toBeVisible();
});
```

**Issues:**
1. Only the first validation error is asserted — the test stops after confirming "Name is required" appears, silently leaving the email-format and password-strength validations completely unverified despite the setup clearly intending to test all three.
2. No use of `expect.soft` — even if more assertions were added naively, the first failure would abort the test and hide whether the other two validations also work, rather than reporting all three results.
3. No positive-path counterpart in this test or referenced nearby — a validation-only test suite that never confirms the happy path still works is an easy gap to miss (see A21's forward-then-back lesson for a related "only tested part of the flow" shape).

**Fix:**
```ts
test('signup form shows all validation errors together', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Name').fill('');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Password').fill('123');
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect.soft(page.getByText('Name is required')).toBeVisible();
  await expect.soft(page.getByText('Enter a valid email address')).toBeVisible();
  await expect.soft(page.getByText('Password must be at least 8 characters')).toBeVisible();
});
```

**Why it matters:** B24's soft-assertion lesson directly — a multi-field validation test that stops at the first hard failure gives a false sense of coverage; `expect.soft` reports every broken field in one run instead of one bug report per re-run.

---
