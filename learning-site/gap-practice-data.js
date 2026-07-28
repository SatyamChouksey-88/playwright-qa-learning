window.GAP_ANTIPATTERNS = [
  {
    id: 'ap1',
    title: 'Hard sleep login',
    bad: `await page.getByRole('button', { name: 'Sign In' }).click();
await page.waitForTimeout(3000);
await expect(page.getByTestId('welcome-banner')).toBeVisible();`,
    issues: ['waitForTimeout', 'non-retrying race'],
    fix: `await page.getByRole('button', { name: 'Sign In' }).click();
await expect(page.getByTestId('welcome-banner')).toBeVisible();`,
    explain: 'Web-first expect retries; sleeps are both slow and flaky on CI.',
  },
  {
    id: 'ap2',
    title: 'Missing await',
    bad: `page.getByTestId('bank-login').click();
await expect(page.getByTestId('welcome-banner')).toBeVisible();`,
    issues: ['floating promise', 'missing await'],
    fix: `await page.getByTestId('bank-login').click();
await expect(page.getByTestId('welcome-banner')).toBeVisible();`,
    explain: 'Floating promises race the assertion — enable no-floating-promises lint.',
  },
  {
    id: 'ap3',
    title: 'Brittle CSS + shared user',
    bad: `await page.locator('div.bank-auth > button:nth-child(3)').click();
// every worker uses apex_user mutating the same savings row`,
    issues: ['brittle selector', 'shared mutable data'],
    fix: `await page.getByTestId('bank-login').click();
// unique account per worker via factory / API seed`,
    explain: 'Role/testid locators + unique data prevent CI collisions.',
  },
  {
    id: 'ap5',
    title: 'Reload loses frame locator',
    bad: `const frame = page.frameLocator('#pay-iframe');
await frame.getByLabel('Card').fill('4111');
await page.reload();
await frame.getByLabel('Card').fill('4111'); // often flakes`,
    issues: ['non-retrying race', 'brittle selector'],
    fix: `await page.reload();
const frame = page.frameLocator('#pay-iframe');
await frame.getByLabel('Card').fill('4111');`,
    explain: 'Re-acquire frame locators after navigation/reload — stale frame handles are a common flake source.',
  },
];

window.GAP_STAR_PROMPTS = [
  { id: 's1', q: 'A developer disagreed that your finding was a bug. What did you do?' },
  { id: 's2', q: 'Convince a team to invest in automation when a release deadline is tight.' },
  { id: 's3', q: 'Communicate quality risk to a non-technical stakeholder.' },
  { id: 's4', q: 'Advocate for testing time vs shipping this Friday.' },
  { id: 's5', q: 'Mentor a junior who keeps adding waitForTimeout.' },
  { id: 's6', q: 'A flaky suite destroyed trust in CI. How did you recover it?' },
];

window.GAP_CODEREVIEW = [
  {
    id: 'cr1',
    title: 'Login test',
    bad: `test('user can log in', async ({ page }) => {
  await page.goto('https://staging.example.com/login');
  await page.locator('#email').fill('testuser@example.com');
  await page.locator('#password').fill('Password123!');
  await page.locator('.login-btn').click();
  await page.waitForTimeout(3000);
  const banner = await page.locator('.welcome-banner').isVisible();
  expect(banner).toBe(true);
});`,
    issues: [
      'Hardcoded absolute URL instead of baseURL from config',
      'CSS selectors instead of role/label/testid locators',
      'waitForTimeout(3000) instead of waiting on the real outcome',
      'One-shot isVisible() + toBe(true) instead of a web-first assertion',
      'Hardcoded plaintext credentials in the test file',
    ],
    fix: `test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByTestId('welcome-banner')).toBeVisible();
});`,
  },
  {
    id: 'cr2',
    title: 'Checkout/payment test',
    bad: `test('checkout succeeds', async ({ page }) => {
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.locator('iframe').contentFrame()!.locator('#card-number').fill('4242424242424242');
  await page.getByRole('button', { name: 'Pay' }).click();
  await page.waitForTimeout(5000);
  await expect(page.getByText('Success')).toBeVisible();
  expect(true).toBe(true);
});`,
    issues: [
      'contentFrame() grabs whichever iframe is first instead of frameLocator on the specific one',
      'Real-looking card number with no comment marking it as a documented test-mode number',
      'waitForTimeout(5000) instead of waiting on the payment network response',
      'getByText(\'Success\') is dangerously generic — strict-mode risk',
      'expect(true).toBe(true) — a meaningless assertion',
      'No server-side verification that an order record was actually created',
    ],
    fix: `test('checkout succeeds with a test card', async ({ page, request }) => {
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
  const order = await request.get(\`/api/orders/\${orderId}\`);
  expect((await order.json()).status).toBe('paid');
});`,
  },
  {
    id: 'cr3',
    title: 'Dynamic table test',
    bad: `test('can find a specific order', async ({ page }) => {
  await page.goto('/orders');
  const rows = page.locator('table tr');
  const targetRow = rows.nth(4);
  await expect(targetRow.locator('td').nth(2)).toHaveText('Shipped');
  await targetRow.locator('button').click();
});`,
    issues: [
      'nth(4) assumes a fixed row position in a sortable/paginated table',
      'td.nth(2) locates a cell by column index with no semantic meaning',
      'table tr includes the header row with no filtering',
      'locator(\'button\') grabs whichever button is first with no stated intent',
      'No assertion on which order this is before asserting its status',
    ],
    fix: `test('can find a specific order', async ({ page }) => {
  await page.goto('/orders');
  const row = page.getByRole('row').filter({ hasText: 'ORD-10042' });
  await expect(row.getByRole('cell', { name: 'Shipped' })).toBeVisible();
  await row.getByRole('button', { name: 'View details' }).click();
});`,
  },
  {
    id: 'cr4',
    title: 'File upload test',
    bad: `test('upload document', async ({ page }) => {
  await page.goto('/documents');
  await page.getByText('Upload').click();
  const input = page.locator('input[type=file]');
  await input.setInputFiles('C:\\\\Users\\\\dev1\\\\Desktop\\\\test-invoice.pdf');
  await page.waitForTimeout(2000);
  await expect(page.locator('.file-list')).toContainText('test-invoice.pdf');
});`,
    issues: [
      'Absolute, machine-specific file path — fails on every other machine and CI',
      'Inconsistent locator strategy (getByText trigger, raw CSS input)',
      'waitForTimeout(2000) instead of waiting for the real upload-complete signal',
      'No verification that uploaded content is correct, only that a filename string appears',
      '.file-list CSS class selector instead of role/testid',
    ],
    fix: `test('upload document', async ({ page }) => {
  await page.goto('/documents');
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.getByLabel('Choose file').setInputFiles(
    path.join(__dirname, 'fixtures', 'test-invoice.pdf'),
  );
  await expect(page.getByRole('listitem').filter({ hasText: 'test-invoice.pdf' })).toBeVisible();
  const meta = await page.request.get('/api/documents/latest');
  expect((await meta.json()).sizeBytes).toBeGreaterThan(0);
});`,
  },
  {
    id: 'cr5',
    title: 'Hybrid API+UI setup test',
    bad: `test('order appears in history', async ({ page }) => {
  await page.goto('/catalog');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByLabel('Card number').fill('4242424242424242');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByText('Order confirmed')).toBeVisible();
  await page.goto('/orders');
  await expect(page.getByText('Order confirmed').first()).toBeVisible();
});`,
    issues: [
      '.first() on "Add to cart" — invisible, unstable precondition',
      'Entire order-creation flow driven through the UI purely as setup',
      'Reuses checkout confirmation copy as a proxy for history-page correctness',
      'No captured order ID to assert the specific order appears in history',
    ],
    fix: `test('order appears in history', async ({ page, request }) => {
  const created = await request.post('/api/orders', { data: { productId: 'sku-123', quantity: 1 } });
  const { id: orderId } = await created.json();
  await page.goto('/orders');
  const row = page.getByRole('row').filter({ hasText: orderId });
  await expect(row).toBeVisible();
  await expect(row.getByRole('cell', { name: 'Confirmed' })).toBeVisible();
});`,
  },
  {
    id: 'cr6',
    title: 'Visual regression test',
    bad: `test('dashboard visual', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});`,
    issues: [
      'No masking of dynamic regions (clock, avatar, timestamp)',
      'Animations not disabled — mid-transition frames cause flaky diffs',
      'No maxDiffPixelRatio configured',
      'No documented baseline-generation environment (Mac vs Linux fonts)',
      'Whole complex page in one screenshot conflates many components',
    ],
    fix: `test('dashboard visual', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [page.getByTestId('live-clock'), page.getByTestId('user-avatar')],
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
// Baselines must be generated inside the same image CI uses:
// docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.4x.0-noble \\
//   npx playwright test --update-snapshots`,
  },
  {
    id: 'cr7',
    title: 'Page Object Model design review',
    bad: `export class OrdersPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/orders'); }
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
}`,
    issues: [
      'Business assertion baked directly into the page object method',
      'Raw isVisible() + toBeTruthy() instead of web-first expect().toBeVisible()',
      'Locators re-declared inline in every method instead of a shared helper',
      'Mixed concerns with no naming convention distinguishing actions from checks',
    ],
    fix: `export class OrdersPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/orders'); }
  row(orderId: string) { return this.page.getByRole('row').filter({ hasText: orderId }); }
  async cancelOrder(orderId: string) {
    await this.row(orderId).getByRole('button', { name: 'Cancel' }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}
// Test keeps the assertion:
// await expect(orders.row('ORD-10042').getByRole('cell', { name: 'Canceled' })).toBeVisible();`,
  },
  {
    id: 'cr8',
    title: 'Retry-abuse test',
    bad: `// playwright.config.ts
export default defineConfig({ retries: 5, timeout: 90_000 });

// new-feature.spec.ts
test('new feature works', async ({ page }) => {
  await page.goto('/new-feature');
  await page.getByRole('button', { name: 'Activate' }).click();
  await page.waitForTimeout(4000);
  await expect(page.getByText('Activated')).toBeVisible();
});`,
    issues: [
      'retries: 5 set globally to mask one flaky new test',
      'timeout: 90_000 raised globally, hiding future perf regressions everywhere',
      'waitForTimeout(4000) shows the author already suspects a race',
      'No flakiness gate — a test passing on retry 3/5 reports as plain green',
    ],
    fix: `// playwright.config.ts — leave global retries/timeout untouched
export default defineConfig({ retries: process.env.CI ? 2 : 0 });

test('new feature works', async ({ page }) => {
  await page.goto('/new-feature');
  const [activationResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/activate') && r.ok()),
    page.getByRole('button', { name: 'Activate' }).click(),
  ]);
  await expect(page.getByText('Activated')).toBeVisible();
});`,
  },
  {
    id: 'cr9',
    title: 'Accessibility test',
    bad: `test('modal is accessible', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Delete account' }).click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.length).toBe(0);
});`,
    issues: [
      'Zero axe violations treated as the entire definition of "accessible"',
      'No check that focus moves into the modal on open',
      'No check for Escape-to-close, focus trap, or focus return on close',
      'expect(...).toBe(0) gives no diagnostic output on failure',
    ],
    fix: `test('delete-account modal is accessible', async ({ page }) => {
  await page.goto('/settings');
  const trigger = page.getByRole('button', { name: 'Delete account' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Delete account' });
  await expect(dialog.locator(':focus')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});`,
  },
  {
    id: 'cr10',
    title: 'Multi-field form test',
    bad: `test('signup form validation', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Name').fill('');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Password').fill('123');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByText('Name is required')).toBeVisible();
});`,
    issues: [
      'Only the first validation error is asserted — email/password checks unverified',
      'No expect.soft — first failure would hide whether other validations work',
      'No positive-path counterpart nearby confirming the happy path still works',
    ],
    fix: `test('signup form shows all validation errors together', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Name').fill('');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Password').fill('123');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect.soft(page.getByText('Name is required')).toBeVisible();
  await expect.soft(page.getByText('Enter a valid email address')).toBeVisible();
  await expect.soft(page.getByText('Password must be at least 8 characters')).toBeVisible();
});`,
  },
];

window.GAP_MOCK_QUESTIONS = [
  {
    q: 'A test passes locally but fails in CI on “element not found.” Walk your diagnosis.',
    followUps: ['Why not add a 5s sleep?', 'What does the trace show you first?'],
    rubric: {
      technical: 'iframe/shadow/strict mode/actionability; trace first',
      coverage: 'mentions env diffs (data, parallel, banners)',
      clarity: 'ordered steps',
      practices: 'rejects waitForTimeout as fix',
    },
  },
  {
    q: 'How do you structure auth for 200 UI tests?',
    followUps: ['Setup project vs beforeEach UI login?', 'How do roles stay isolated?'],
    rubric: {
      technical: 'storageState + setup project dependencies',
      coverage: 'admin/viewer/anon states',
      clarity: 'speed vs journey coverage trade-off',
      practices: '.auth gitignored',
    },
  },
  {
    q: 'Design automation for a microservices checkout.',
    followUps: ['Where do contracts fit?', 'What stays in Playwright E2E?'],
    rubric: {
      technical: 'Pact/API + thin E2E journeys',
      coverage: 'critical path only in UI',
      clarity: 'pyramid language',
      practices: 'avoid ice-cream cone',
    },
  },
  {
    q: 'OTP expires in 60s — how do you test it without sleeping?',
    followUps: ['What if expiry is server-side?'],
    rubric: {
      technical: 'page.clock / API stub',
      coverage: 'valid + expired paths',
      clarity: 'Bank Demo TTL example',
      practices: 'no waitForTimeout(60000)',
    },
  },
  {
    q: 'Healer agent skipped 12 tests overnight. Green build — ship?',
    followUps: ['How does skip change signal?'],
    rubric: {
      technical: 'healer skip governance',
      coverage: 'review skips as failures until proven',
      clarity: 'AI scaffolds humans own',
      practices: 'no silent coverage loss',
    },
  },
];

window.GAP_POSTMORTEMS = [
  {
    id: 'knight',
    title: 'Knight Capital (Aug 1, 2012)',
    blurb: 'Untested deployment of dormant “Power Peg” code on 1 of 8 servers. SEC Order 34-70694: millions of child orders in ~45 minutes; ~$3.5B long / ~$3.15B short; ~$460M loss + $12M penalty.',
    prompt: 'What test/process controls would you require before a trading deploy script can touch production?',
  },
  {
    id: 'crowdstrike',
    title: 'CrowdStrike (July 19, 2024)',
    blurb: 'IPC template expected 21 inputs; integration supplied 20 — wildcard matching hid the mismatch. Microsoft estimate ~8.5M Windows devices. No canary/staged rollout.',
    prompt: 'How would you test config/content updates that bypass normal app binaries?',
  },
  {
    id: 'ariane',
    title: 'Ariane 5 Flight 501 (1996)',
    blurb: '64-bit float → 16-bit signed integer overflow in reused inertial code never tested under Ariane-5 trajectories. Failure ~37s after ignition; >$370M.',
    prompt: 'How do you test reused components under new operational envelopes?',
  },
  {
    id: 'therac',
    title: 'Therac-25 (1985–87)',
    blurb: 'Race conditions; software replaced hardware interlocks without adequate V&V (Leveson & Turner).',
    prompt: 'When is “we have unit tests” insufficient for safety-critical control software?',
  },
  {
    id: 'max',
    title: 'Boeing 737 MAX / MCAS',
    blurb: 'Single AoA sensor design + certification downplay limited scrutiny (DOT OIG). 346 deaths across accidents.',
    prompt: 'How should test strategy change when a feature is safety-related but marketed as minor?',
  },
];

window.GAP_TRACE_CHECKLIST = [
  { id: 't1', text: 'Which action timed out — and what does the DOM snapshot show at that step?' },
  { id: 't2', text: 'Did a network call 4xx/5xx or never fire?' },
  { id: 't3', text: 'Console errors before the failure?' },
  { id: 't4', text: 'Is the locator strict-mode ambiguous in the snapshot?' },
  { id: 't5', text: 'Would a web-first assertion replace a sleep/race?' },
];
