/**
 * Interviewer Mode question bank — 90 questions.
 * Generator expands each spec into full markdown with model answers.
 */

const scoreRow = (topic, level) => ({
  1: `No meaningful answer on ${topic}; guesses or silent.`,
  2: `Partial ${topic} answer with major gaps; needs heavy hints (${level}).`,
  3: `Solid ${topic} explanation with one missing trade-off or weak example.`,
  4: `Complete ${topic} answer: mechanism, TypeScript example, trade-offs, real context.`,
});

/** @param {object} s */
export function expandQuestion(s) {
  const scoring = s.scoring ?? scoreRow(s.topic, s.level);
  return {
    ...s,
    id: s.id,
    slug: s.slug ?? s.topic.replace(/\s+/g, '-').slice(0, 40),
    scoring,
    strongSignals: s.strongSignals ?? [
      `Names Playwright mechanism for ${s.topic}`,
      'Uses web-first locator vocabulary where relevant',
      'Mentions trade-off unprompted',
    ],
    weakSignals: s.weakSignals ?? [
      'Fixed sleeps or forced clicks as default',
      'Cannot explain why approach fails in parallel CI',
      'Buzzwords without TypeScript grounding',
    ],
    followUps: s.followUps ?? [
      `What breaks if you misuse ${s.topic} in a sharded CI run?`,
      'Show a minimal TypeScript snippet.',
      'How would you review this in a PR?',
    ],
    hints: s.hints ?? [
      `Think about what Playwright auto-waits on for ${s.topic}.`,
      'Consider test isolation and parallel workers.',
      'Name one anti-pattern you would reject in code review.',
    ],
  };
}

export const QUESTION_SPECS = [
  // ── FRESHER (12) ──
  {
    id: 'IV-Q-FR-001', level: 'fresher', round: 'screening', kind: 'theory', timebox: 5, difficulty: 1,
    topic: 'playwright-intro', crosslinks: [],
    question: 'What is the difference between `@playwright/test` and the `playwright` library?',
    tests: 'Whether the candidate understands the test runner vs browser automation library split.',
    modelAnswer: `\`@playwright/test\` is the **test runner** — it provides \`test\`, \`expect\`, fixtures, config, reporters, and parallel orchestration. The \`playwright\` package (often via \`chromium.launch\`) is the **library** for scripts and tools. In QA interviews we expect specs to import from \`@playwright/test\`:

\`\`\`ts
import { test, expect } from '@playwright/test';

test('login', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/dashboard/);
});
\`\`\`

Use the library for one-off automation; use the test runner for maintainable suites with isolation and reporting.`,
  },
  {
    id: 'IV-Q-FR-002', level: 'fresher', round: 'theory', kind: 'theory', timebox: 8, difficulty: 1,
    topic: 'locators', crosslinks: ['a3'],
    question: 'Describe Playwright locator priority. Why is `getByRole` preferred over CSS selectors?',
    tests: 'Web-first locator strategy — core hiring signal for any level.',
    modelAnswer: `Priority (most resilient first): **role + accessible name**, **label**, **placeholder**, **text**, **test id**, then CSS/XPath as last resort. \`getByRole\` mirrors how assistive tech finds elements — when the app is accessible, role locators survive CSS refactors.

\`\`\`ts
// Preferred
await page.getByRole('button', { name: 'Transfer' }).click();
// Acceptable when stable contract exists
await page.getByTestId('transfer-submit').click();
// Avoid — breaks on styling changes
await page.locator('.btn-primary.transfer').click();
\`\`\`

Role locators also enable strict mode violations to catch ambiguous matches early.`,
  },
  {
    id: 'IV-Q-FR-003', level: 'fresher', round: 'theory', kind: 'theory', timebox: 8, difficulty: 1,
    topic: 'auto-wait', crosslinks: ['a1'],
    question: 'What is auto-waiting in Playwright? What happens when you call `click()` on a locator?',
    tests: 'Foundational mechanism — separates Playwright-native thinking from Selenium-style sleeps.',
    modelAnswer: `Playwright **auto-waits** for actionability before each action. For \`click()\`, the locator retries until the element is attached, visible, stable, enabled, and receives events — up to the action timeout. No manual sleep required.

\`\`\`ts
await page.getByRole('button', { name: 'Save' }).click();
// Internally waits for actionable state, then clicks
\`\`\`

Assertions via \`expect(locator)\` auto-wait with their own timeout. If action fails, the error names the unmet condition (hidden, disabled, etc.) — use that in triage instead of adding delays.`,
  },
  {
    id: 'IV-Q-FR-004', level: 'fresher', round: 'theory', kind: 'theory', timebox: 6, difficulty: 1,
    topic: 'assertions', crosslinks: [],
    question: 'Why use `expect` from `@playwright/test` instead of `assert` from Node?',
    tests: 'Understanding of web-first assertions with auto-retry.',
    modelAnswer: `Playwright \`expect\` is **web-first**: it retries until timeout for locators and page state. Node \`assert\` checks once immediately — flaky for async UI.

\`\`\`ts
await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
await expect(page).toHaveURL(/accounts/);
await expect(page.getByTestId('balance')).toHaveText(/\\$[\\d,]+/);
\`\`\`

Use soft assertions (\`expect.soft\`) when collecting multiple UI checks in one test, but default to hard assertions for critical path gates.`,
  },
  {
    id: 'IV-Q-FR-005', level: 'fresher', round: 'theory', kind: 'theory', timebox: 6, difficulty: 1,
    topic: 'organization', crosslinks: [],
    question: 'How do `test.describe` blocks help organize a spec file?',
    tests: 'Basic suite structure and readability.',
    modelAnswer: `\`test.describe\` groups related tests with shared context in titles and optional hooks. It improves report readability and allows scoped \`beforeEach\`.

\`\`\`ts
test.describe('Bank transfer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transfer');
  });

  test('valid transfer shows success', async ({ page }) => { /* ... */ });
  test('insufficient funds shows error', async ({ page }) => { /* ... */ });
});
\`\`\`

Avoid deep nesting (>2 levels) — flatten into separate files when groups grow large.`,
  },
  {
    id: 'IV-Q-FR-006', level: 'fresher', round: 'theory', kind: 'theory', timebox: 6, difficulty: 1,
    topic: 'config', crosslinks: [],
    question: 'What is `baseURL` in `playwright.config.ts` and how does it affect `page.goto`?',
    tests: 'Config literacy for real projects.',
    modelAnswer: `\`baseURL\` prefixes relative navigation paths so specs stay environment-portable.

\`\`\`ts
// playwright.config.ts
export default defineConfig({ use: { baseURL: 'http://localhost:3000' } });

// spec
await page.goto('/login'); // navigates to http://localhost:3000/login
\`\`\`

Override per environment via env vars in CI. Absolute URLs bypass baseURL — use relative paths in specs when possible.`,
  },
  {
    id: 'IV-Q-FR-007', level: 'fresher', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'getByRole', crosslinks: ['a3'],
    question: 'Write locators for a sign-in button and a username textbox using `getByRole`.',
    tests: 'Practical locator API usage.',
    modelAnswer: `\`\`\`ts
await page.getByRole('textbox', { name: 'Username' }).fill('demo');
await page.getByRole('button', { name: 'Sign in' }).click();
\`\`\`

The accessible name comes from associated \`<label>\`, \`aria-label\`, or visible text. If role is wrong in DOM, fix accessibility or fall back to \`getByLabel\` — do not jump to CSS.`,
  },
  {
    id: 'IV-Q-FR-008', level: 'fresher', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'testid', crosslinks: [],
    question: 'When is `getByTestId` appropriate? What are the trade-offs?',
    tests: 'Judgment on stable selectors vs accessibility-first.',
    modelAnswer: `Use \`getByTestId\` when no stable role/label exists (canvas widgets, icon-only controls without aria) and your team maintains \`data-testid\` as a **testing contract** (not changed for styling).

\`\`\`ts
await page.getByTestId('otp-input').fill('123456');
\`\`\`

Trade-offs: bypasses accessibility tree — prefer role first; test ids do not validate a11y; require dev cooperation. Configure \`testIdAttribute\` if not using default \`data-testid\`.`,
  },
  {
    id: 'IV-Q-FR-009', level: 'fresher', round: 'theory', kind: 'theory', timebox: 7, difficulty: 2,
    topic: 'config', crosslinks: [],
    question: 'Name three important fields in `playwright.config.ts` and what each controls.',
    tests: 'Breadth of config knowledge.',
    modelAnswer: `1. **\`projects\`** — browser/device matrix and per-project \`use\` options.
2. **\`use.trace\` / \`screenshot\` / \`video\`** — artifact capture policy for debugging.
3. **\`retries\` / \`workers\`** — CI flake policy and parallelism (use retries only in CI with trace on first retry).

\`\`\`ts
export default defineConfig({
  retries: process.env.CI ? 1 : 0,
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
\`\`\``,
  },
  {
    id: 'IV-Q-FR-010', level: 'fresher', round: 'theory', kind: 'theory', timebox: 5, difficulty: 1,
    topic: 'debugging', crosslinks: [],
    question: 'What is the difference between headed and headless mode? When do you run headed locally?',
    tests: 'Debugging workflow basics.',
    modelAnswer: `**Headless** runs browsers without UI — faster, default in CI. **Headed** shows the browser window — useful when writing new tests or reproducing visual timing issues.

\`\`\`bash
npx playwright test --headed
npx playwright test --debug  # opens inspector with step-through
\`\`\`

Use headed sparingly in CI (costly); prefer trace viewer for post-mortems.`,
  },
  {
    id: 'IV-Q-FR-011', level: 'fresher', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'trace', crosslinks: [],
    question: 'What artifacts does Playwright capture on failure and how do you open a trace?',
    tests: 'Debugging literacy.',
    modelAnswer: `Common artifacts: **screenshot** (\`only-on-failure\`), **video** (optional), **trace** (timeline of actions, network, snapshots). Open trace:

\`\`\`bash
npx playwright show-trace path/to/trace.zip
\`\`\`

Config example:

\`\`\`ts
use: { trace: 'on-first-retry', screenshot: 'only-on-failure' }
\`\`\`

Traces are the first tool in flake triage — inspect action before/after, network, and console.`,
  },
  {
    id: 'IV-Q-FR-012', level: 'fresher', round: 'theory', kind: 'theory', timebox: 5, difficulty: 1,
    topic: 'install', crosslinks: [],
    question: 'What does `npx playwright install` do? Why is it separate from npm install?',
    tests: 'Onboarding and CI setup knowledge.',
    modelAnswer: `\`npm install @playwright/test\` installs the npm package; \`npx playwright install\` downloads **browser binaries** (Chromium, Firefox, WebKit) matched to the installed version. CI caches these separately. Use \`playwright install --with-deps\` on Linux CI for OS dependencies.`,
  },

  // ── JUNIOR (13) ──
  {
    id: 'IV-Q-JR-001', level: 'junior', round: 'theory', kind: 'theory', timebox: 7, difficulty: 2,
    topic: 'dialogs', crosslinks: ['b4'],
    question: 'How do you handle a native `alert` dialog in Playwright?',
    tests: 'Register-before-trigger pattern.',
    modelAnswer: `Register the dialog handler **before** the action that opens it:

\`\`\`ts
page.once('dialog', (dialog) => {
  expect(dialog.type()).toBe('alert');
  expect(dialog.message()).toContain('Saved');
  dialog.accept();
});
await page.getByRole('button', { name: 'Delete' }).click();
\`\`\`

Use \`page.once\` when a single dialog is expected; \`page.on\` for multiples. Never use sleeps to "wait for alert".`,
  },
  {
    id: 'IV-Q-JR-002', level: 'junior', round: 'theory', kind: 'theory', timebox: 7, difficulty: 2,
    topic: 'upload', crosslinks: [],
    question: 'How do you upload a file without opening the OS file picker?',
    tests: 'Input setInputFiles pattern.',
    modelAnswer: `Set files directly on the \`<input type="file">\`:

\`\`\`ts
await page.getByLabel('Upload statement').setInputFiles('fixtures/statement.pdf');
// Multiple files
await page.getByLabel('Attachments').setInputFiles(['a.pdf', 'b.pdf']);
\`\`\`

Playwright bypasses the native picker — no robot needed. Clear with \`setInputFiles([])\`.`,
  },
  {
    id: 'IV-Q-JR-003', level: 'junior', round: 'theory', kind: 'theory', timebox: 7, difficulty: 2,
    topic: 'download', crosslinks: [],
    question: 'How do you assert a file download in Playwright?',
    tests: 'waitForEvent pattern.',
    modelAnswer: `\`\`\`ts
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Export CSV' }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toMatch(/export\\.csv$/);
await download.saveAs('test-results/export.csv');
\`\`\`

Register \`waitForEvent\` before click — same pattern as dialogs and popups.`,
  },
  {
    id: 'IV-Q-JR-004', level: 'junior', round: 'theory', kind: 'theory', timebox: 7, difficulty: 2,
    topic: 'popup', crosslinks: ['b6'],
    question: 'How do you interact with a page opened via `target=_blank`?',
    tests: 'Multi-page context handling.',
    modelAnswer: `\`\`\`ts
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Open statement' }).click();
const popup = await popupPromise;
await expect(popup.getByRole('heading')).toHaveText('Statement');
await popup.close();
\`\`\`

Each tab/window is a \`Page\` object — always switch context instead of assuming single page.`,
  },
  {
    id: 'IV-Q-JR-005', level: 'junior', round: 'theory', kind: 'theory', timebox: 7, difficulty: 2,
    topic: 'frames', crosslinks: ['b7'],
    question: 'How do you locate an element inside an iframe?',
    tests: 'FrameLocator API.',
    modelAnswer: `\`\`\`ts
const frame = page.frameLocator('iframe[title="Payment"]');
await frame.getByRole('button', { name: 'Pay' }).click();
\`\`\`

Prefer \`frameLocator\` over raw \`page.frames()\` indexing — resilient when frame order changes. Chain locators inside the frame scope.`,
  },
  {
    id: 'IV-Q-JR-006', level: 'junior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 2,
    topic: 'async', crosslinks: ['a2'],
    question: 'A test passes locally but the assertion never runs in CI. What is the most common cause?',
    tests: 'Missing await detection.',
    modelAnswer: `**Missing \`await\`** on Playwright async calls — the test exits before the assertion runs, sometimes passing vacuously.

\`\`\`ts
// Bug
page.getByRole('button').click();
expect(page).toHaveURL(/done/);

// Fix
await page.getByRole('button').click();
await expect(page).toHaveURL(/done/);
\`\`\`

Enable ESLint rules for floating promises; use \`@typescript-eslint/no-floating-promises\` in test repos.`,
  },
  {
    id: 'IV-Q-JR-007', level: 'junior', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'hooks', crosslinks: [],
    question: 'When should you use `test.beforeEach` vs a custom fixture?',
    tests: 'Setup pattern judgment (junior level).',
    modelAnswer: `\`beforeEach\` for simple shared navigation. **Fixtures** when setup has teardown, multiple exports, or scope control (worker vs test).

\`\`\`ts
// beforeEach — fine for goto
test.beforeEach(async ({ page }) => { await page.goto('/app'); });

// fixture — when returning composed helpers
const test = base.extend<{ shop: Shop }>({
  shop: async ({ page }, use) => { const s = new Shop(page); await use(s); },
});
\`\`\`

Migrate to fixtures when \`beforeEach\` chains grow or need cleanup.`,
  },
  {
    id: 'IV-Q-JR-008', level: 'junior', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'artifacts', crosslinks: [],
    question: 'How do you configure screenshots only on failure?',
    tests: 'Config for CI cost control.',
    modelAnswer: `\`\`\`ts
export default defineConfig({
  use: { screenshot: 'only-on-failure' },
});
\`\`\`

Per-test override: \`test.use({ screenshot: 'on' })\` for debugging a single spec. Attach manual screenshots with \`await page.screenshot({ path: 'debug.png' })\` when investigating.`,
  },
  {
    id: 'IV-Q-JR-009', level: 'junior', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'trace', crosslinks: [],
    question: 'Explain `trace: on-first-retry` and why teams use it in CI.',
    tests: 'Artifact policy trade-off.',
    modelAnswer: `Records trace only when a failed test retries — balances **debuggability** vs **storage cost**.

\`\`\`ts
retries: process.env.CI ? 1 : 0,
use: { trace: 'on-first-retry' },
\`\`\`

First failure may be flake; trace on retry captures evidence without tracing every passing run. Pair with merge-reports for sharded CI.`,
  },
  {
    id: 'IV-Q-JR-010', level: 'junior', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'projects', crosslinks: [],
    question: 'How do you run tests only in Chromium from the CLI?',
    tests: 'Project selection.',
    modelAnswer: `\`\`\`bash
npx playwright test --project=chromium
\`\`\`

Projects are defined in config — each can set browser, viewport, storageState. Smoke jobs run subset of projects; full regression runs all.`,
  },
  {
    id: 'IV-Q-JR-011', level: 'junior', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'soft-assertions', crosslinks: [],
    question: 'When are soft assertions appropriate?',
    tests: 'Assertion strategy.',
    modelAnswer: `\`\`\`ts
await expect.soft(page.getByText('Header')).toBeVisible();
await expect.soft(page.getByText('Footer')).toBeVisible();
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
\`\`\`

Soft asserts collect failures until test end — good for **non-blocking UI surveys** (many labels on a dashboard). Critical path gates stay hard asserts.`,
  },
  {
    id: 'IV-Q-JR-012', level: 'junior', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'test-step', crosslinks: [],
    question: 'What does `test.step` improve in reports?',
    tests: 'Report readability.',
    modelAnswer: `\`\`\`ts
await test.step('Login', async () => {
  await page.getByLabel('User').fill('demo');
  await page.getByRole('button', { name: 'Sign in' }).click();
});
\`\`\`

Steps appear nested in HTML report and traces — speeds triage when a long test fails mid-flow.`,
  },
  {
    id: 'IV-Q-JR-013', level: 'junior', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2,
    topic: 'env', crosslinks: [],
    question: 'How should environment-specific URLs enter Playwright config safely?',
    tests: 'Env var patterns without hardcoding secrets.',
    modelAnswer: `\`\`\`ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
  },
});
\`\`\`

CI sets \`BASE_URL\` per stage. Never commit credentials — use secret manager + setup project. Document required env vars in README.`,
  },

  // ── MID (25) ──
  { id: 'IV-Q-MID-001', level: 'mid', round: 'theory', kind: 'theory', timebox: 10, difficulty: 3, topic: 'fixtures', crosslinks: ['b8'],
    question: 'Explain custom fixtures with `test.extend`. Why prefer fixtures over global variables?',
    tests: 'Fixture composition and isolation.',
    modelAnswer: `Fixtures declare setup/teardown with typed injection. Playwright manages lifecycle and parallel safety.

\`\`\`ts
type ShopFixtures = { shop: ShopPage };
export const test = base.extend<ShopFixtures>({
  shop: async ({ page }, use) => {
    const shop = new ShopPage(page);
    await shop.open();
    await use(shop);
  },
});
\`\`\`

Globals leak across parallel workers; fixtures scope resources per test and compose via \`mergeTests\`.` },
  { id: 'IV-Q-MID-002', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'fixture-scope', crosslinks: [],
    question: 'What is the difference between test scope and worker scope fixtures?',
    tests: 'Parallel safety and performance trade-offs.',
    modelAnswer: `**Test scope** (default): new instance per test — \`page\`, per-test data. **Worker scope**: one instance per parallel worker — expensive clients (\`APIRequestContext\`, DB pool).

\`\`\`ts
export const test = base.extend<{ api: ApiClient }, { workerApi: ApiClient }>({
  workerApi: [async ({}, use) => { const c = new ApiClient(); await use(c); await c.dispose(); }, { scope: 'worker' }],
  api: async ({ workerApi }, use) => { await use(workerApi); },
});
\`\`\`

Wrong scope causes pollution (test scope too wide) or slowness (worker scope for page).` },
  { id: 'IV-Q-MID-003', level: 'mid', round: 'theory', kind: 'theory', timebox: 10, difficulty: 3, topic: 'storageState', crosslinks: ['b9'],
    question: 'Walk through the auth setup project pattern with `storageState`.',
    tests: 'Auth efficiency — mid-level bar.',
    modelAnswer: `Setup project logs in once, saves cookies/localStorage, consumers reuse state:

\`\`\`ts
// auth.setup.ts
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('bank-username').fill(process.env.USER!);
  await page.getByTestId('bank-password').fill(process.env.PASS!);
  await page.getByTestId('bank-login').click();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});

// config
projects: [
  { name: 'setup', testMatch: /auth\\.setup\\.ts/ },
  { name: 'chromium', dependencies: ['setup'], use: { storageState: 'playwright/.auth/user.json' } },
]
\`\`\`

Add \`.auth/\` to \`.gitignore\`; refresh state when auth changes.` },
  { id: 'IV-Q-MID-004', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'mergeTests', crosslinks: [],
    question: 'When do you use `mergeTests` and what problem does it solve?',
    tests: 'Fixture module composition.',
    modelAnswer: `\`mergeTests\` combines fixture definitions from modules without inheritance trees:

\`\`\`ts
import { mergeTests } from '@playwright/test';
import { test as authTest } from './auth-fixtures';
import { test as apiTest } from './api-fixtures';
export const test = mergeTests(authTest, apiTest);
\`\`\`

Use when teams own separate fixture files. Avoid name collisions — two modules exporting same fixture key fails at merge.` },
  { id: 'IV-Q-MID-005', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'network-mock', crosslinks: ['b11'],
    question: 'How do you mock an API response with `page.route`? What cleanup is required?',
    tests: 'Network interception hygiene.',
    modelAnswer: `\`\`\`ts
await page.route('**/api/balances', async (route) => {
  await route.fulfill({ status: 200, body: JSON.stringify({ checking: 1000 }) });
});
await page.getByTestId('refresh-balances').click();
await expect(page.getByTestId('checking-balance')).toContainText('1000');

await page.unroute('**/api/balances');
\`\`\`

Always \`unroute\` in fixture teardown or \`afterEach\` — leaked routes cause cross-test pollution in parallel runs.` },
  { id: 'IV-Q-MID-006', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'waitForResponse', crosslinks: [],
    question: 'Compare `waitForResponse` vs mocking for validating API calls.',
    tests: 'Integration vs isolation judgment.',
    modelAnswer: `\`waitForResponse\` observes real network — good for integration confidence:

\`\`\`ts
const respPromise = page.waitForResponse((r) => r.url().includes('/transfer') && r.ok());
await page.getByRole('button', { name: 'Submit' }).click();
const resp = await respPromise;
expect(await resp.json()).toMatchObject({ status: 'posted' });
\`\`\`

Mock when external deps are flaky/ costly. Hybrid: seed via API, assert UI via real responses.` },
  { id: 'IV-Q-MID-007', level: 'mid', round: 'scenario', kind: 'scenario', timebox: 9, difficulty: 3, topic: 'flaky-triage', crosslinks: ['a1', 'b12'],
    question: 'A test fails 2/10 runs in CI. Describe your triage process.',
    tests: 'Systematic flake diagnosis — key mid signal.',
    modelAnswer: `Order: **Reproduce** (CI shard + seed if available) → **Trace** (on-first-retry) → **Categorize** (timing/data/env/assertion) → **Fix root** (locator, race, data collision) → **Guard** (quarantine if needed, never merge with sleep-only fix).

Reject: blanket retries, \`force: true\`, arbitrary timeouts. Document category in ticket.` },
  { id: 'IV-Q-MID-008', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'trace', crosslinks: [],
    question: 'What do you inspect first in Trace Viewer for a timeout failure?',
    tests: 'Practical debugging workflow.',
    modelAnswer: `Open failing action → check **before/after DOM snapshot**, **network panel** (pending requests?), **console** errors, **prior action** duration. Identify whether locator never matched, element hidden, or prior navigation incomplete. Timeout on \`toHaveURL\` often means redirect never happened — inspect network 401/500.` },
  { id: 'IV-Q-MID-009', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'isolation', crosslinks: ['a5'],
    question: 'What is test isolation in Playwright and how do shared accounts break it?',
    tests: 'Parallel data independence.',
    modelAnswer: `Each test must run independently — any order, any worker. Shared mutable accounts cause collisions (two tests transfer from same balance). Fix: unique data per test via factories, API seed, worker-scoped ids. Never depend on execution order or leftover state.` },
  { id: 'IV-Q-MID-010', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'api-request', crosslinks: [],
    question: 'When do you use `request` fixture vs `page` for setup?',
    tests: 'Hybrid API+UI pattern.',
    modelAnswer: `\`request\` (\`APIRequestContext\`) seeds data fast without UI:

\`\`\`ts
test('shows new account', async ({ page, request }) => {
  await request.post('/api/accounts', { data: { type: 'savings' } });
  await page.goto('/accounts');
  await expect(page.getByText('Savings')).toBeVisible();
});
\`\`\`

Use UI only for flows under test; use API for arrange steps when endpoint exists.` },
  { id: 'IV-Q-MID-011', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'data-factory', crosslinks: [],
    question: 'Design a test data factory for parallel-safe emails.',
    tests: 'Data collision prevention.',
    modelAnswer: `\`\`\`ts
let seq = 0;
export function createUser(overrides: Partial<User> = {}): User {
  seq += 1;
  return {
    email: \`e2e-\${Date.now()}-\${seq}@example.test\`,
    role: 'member',
    ...overrides,
  };
}
\`\`\`

Prefix \`e2e-\` for sweeper jobs; never hardcode \`test@example.com\` across specs.` },
  { id: 'IV-Q-MID-012', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'tagging', crosslinks: [],
    question: 'How do tags and grep speed up CI feedback loops?',
    tests: 'Selective test execution.',
    modelAnswer: `\`\`\`ts
test('checkout @smoke', async ({ page }) => { /* ... */ });
\`\`\`

\`\`\`bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @slow
\`\`\`

Smoke on every PR; full regression nightly. Document tag contract in CONTRIBUTING.` },
  { id: 'IV-Q-MID-013', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'quarantine', crosslinks: [],
    question: 'What is a quarantine policy for flaky tests?',
    tests: 'Operational flake management.',
    modelAnswer: `Tag flaky tests \`@quarantine\`, exclude from merge gates, track owner + expiry. Fix within SLA or delete. Metrics: quarantine count trending down. Never silently retry forever — quarantine makes debt visible.` },
  { id: 'IV-Q-MID-014', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'route-cleanup', crosslinks: [],
    question: 'Why must `page.unroute` run in fixture teardown?',
    tests: 'Parallel pollution understanding.',
    modelAnswer: `Routes persist on the browser context until removed. Worker B may inherit mocked response from Worker A's test without unroute — false pass/fail. Fixture pattern:

\`\`\`ts
mockBalances: async ({ page }, use) => {
  await page.route('**/api/**', handler);
  await use();
  await page.unroute('**/api/**');
},
\`\`\`` },
  { id: 'IV-Q-MID-015', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'component-e2e', crosslinks: [],
    question: 'Where do you draw the line between component tests and E2E?',
    tests: 'Test pyramid judgment.',
    modelAnswer: `Component (\`@playwright/experimental-ct-react\`): single widget states, fast feedback. E2E: cross-page journeys, real auth, network integration. Run CT in dev loop; E2E for release gates on critical paths only.` },
  { id: 'IV-Q-MID-016', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'visual', crosslinks: [],
    question: 'What makes visual regression tests flaky and how do you stabilize them?',
    tests: 'Visual testing maturity.',
    modelAnswer: `Flake sources: animations, fonts, dynamic timestamps, OS rendering. Stabilize: disable animations via CSS injection, mask dynamic regions, use consistent viewport, run in Docker image. Review diffs in PR — do not auto-approve.` },
  { id: 'IV-Q-MID-017', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'a11y', crosslinks: [],
    question: 'How do you integrate axe with Playwright?',
    tests: 'Accessibility testing practice.',
    modelAnswer: `\`\`\`ts
import AxeBuilder from '@axe-core/playwright';

test('accounts a11y', async ({ page }) => {
  await page.goto('/accounts');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
\`\`\`

Run on key templates; fix critical violations — role locators complement but do not replace axe.` },
  { id: 'IV-Q-MID-018', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'ci-retries', crosslinks: [],
    question: 'Should retries be enabled locally? What is a healthy CI retry policy?',
    tests: 'Retry discipline.',
    modelAnswer: `Local: **retries off** — fix flakes immediately. CI: \`retries: 1\` max with trace on first retry for evidence. Retries mask product bugs if unbounded. Track retry rate metric; alert when >2%.` },
  { id: 'IV-Q-MID-019', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'blob-reporter', crosslinks: [],
    question: 'Why use blob reporter with sharded CI?',
    tests: 'Report merging knowledge.',
    modelAnswer: `Each shard writes blob report; merge step produces unified HTML:

\`\`\`bash
npx playwright test --shard=1/4 --reporter=blob
npx playwright merge-reports ./blob-report
\`\`\`

Devs get one artifact link with all failures — essential for large suites.` },
  { id: 'IV-Q-MID-020', level: 'mid', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'hybrid-setup', crosslinks: [],
    question: 'Describe hybrid API seed + UI assert for a transfer test.',
    tests: 'Practical arrange-act-assert split.',
    modelAnswer: `Arrange via API (fund accounts), Act via UI (submit transfer form), Assert UI success + optional API verify. Keeps test fast and focused on UI validation while avoiding lengthy setup clicks.` },
  { id: 'IV-Q-MID-021', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'strict-mode', crosslinks: [],
    question: 'What is a strict mode locator violation and how do you fix it?',
    tests: 'Locator ambiguity handling.',
    modelAnswer: `Playwright throws when a locator resolves to **multiple elements**. Fix: narrow with \`filter\`, \`nth\`, parent scope, or more specific role name — never \`force: true\`.

\`\`\`ts
await page.getByRole('listitem').filter({ hasText: 'Checking' }).click();
\`\`\`` },
  { id: 'IV-Q-MID-022', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'expect-poll', crosslinks: [],
    question: 'When is `expect.poll` better than a raw expect?',
    tests: 'Async state polling.',
    modelAnswer: `\`expect.poll\` retries a custom function until pass — useful for non-DOM state:

\`\`\`ts
await expect.poll(async () => getJobStatus(id)).toBe('complete');
\`\`\`

Prefer locator assertions when possible; poll for backend job status or file system checks.` },
  { id: 'IV-Q-MID-023', level: 'mid', round: 'theory', kind: 'theory', timebox: 6, difficulty: 2, topic: 'skip-fixme', crosslinks: [],
    question: 'Difference between `test.skip`, `test.fixme`, and quarantine tags?',
    tests: 'Test status hygiene.',
    modelAnswer: `\`skip\`: conditional or permanent omit with reason. \`fixme\`: known broken — fails if unexpectedly passes. Quarantine: operational tag excluding from gates with owner tracking. All require ticket link.` },
  { id: 'IV-Q-MID-024', level: 'mid', round: 'theory', kind: 'theory', timebox: 7, difficulty: 3, topic: 'global-setup', crosslinks: [],
    question: 'When is `globalSetup` appropriate vs setup projects?',
    tests: 'Setup scope judgment.',
    modelAnswer: `\`globalSetup\`: once per entire run (seed DB, warm cache). Setup **projects**: per-worker auth files, parallel-friendly. Prefer setup projects for auth — globalSetup serializes and complicates sharding.` },
  { id: 'IV-Q-MID-025', level: 'mid', round: 'scenario', kind: 'scenario', timebox: 9, difficulty: 4, topic: 'order-dependent', crosslinks: [],
    question: 'Tests pass individually but fail when run together. How do you debug?',
    tests: 'Shared state debugging.',
    modelAnswer: `Suspect shared data, leaked routes, global mutable, file collisions. Bisect with \`--grep\`, run pair combinations, enable \`fullyParallel: true\` locally. Inspect \`beforeAll\` mutations and static accounts. Fix isolation — never depend on run order.` },

  // ── SENIOR (25) ──
  { id: 'IV-Q-SR-001', level: 'senior', round: 'design', kind: 'design', timebox: 15, difficulty: 4, topic: 'architecture', crosslinks: ['c1'],
    question: 'Draw the four-layer Playwright framework architecture for a 50-person org.',
    tests: 'Scale architecture communication.',
    modelAnswer: `Layers: **Config** (env, projects, reporters) → **Fixtures** (auth, API, data) → **Pages/Components** (thin locators) → **Tests** (assertions, tags). Reporting wraps CI. Enforce via lint + templates + CODEOWNERS on fixtures/` },
  { id: 'IV-Q-SR-002', level: 'senior', round: 'theory', kind: 'theory', timebox: 10, difficulty: 4, topic: 'thin-pom', crosslinks: [],
    question: 'What is a thin Page Object and why keep assertions in specs?',
    tests: 'POM discipline.',
    modelAnswer: `Page objects expose **locators and actions only** — no \`expect\` inside class. Specs read as behavior stories:

\`\`\`ts
class TransferPage {
  constructor(private page: Page) {}
  amount = this.page.getByLabel('Amount');
  submit = () => this.page.getByRole('button', { name: 'Transfer' }).click();
}
// spec
await transfer.amount.fill('100');
await transfer.submit();
await expect(page.getByTestId('transfer-success')).toBeVisible();
\`\`\`` },
  { id: 'IV-Q-SR-003', level: 'senior', round: 'design', kind: 'design', timebox: 10, difficulty: 4, topic: 'multi-role-auth', crosslinks: [],
    question: 'Design multi-role auth for admin vs member test projects.',
    tests: 'RBAC test architecture.',
    modelAnswer: `Separate setup specs write \`admin.json\` / \`member.json\`. Projects:

\`\`\`ts
{ name: 'admin-tests', use: { storageState: '.auth/admin.json' }, grep: /@admin/ },
{ name: 'member-tests', use: { storageState: '.auth/member.json' } },
\`\`\`

Never test forbidden actions with admin cookie — negative RBAC needs member project.` },
  { id: 'IV-Q-SR-004', level: 'senior', round: 'design', kind: 'design', timebox: 12, difficulty: 4, topic: 'sharding', crosslinks: ['c4'],
    question: 'How do you shard a 45-minute suite to fit a 12-minute CI budget?',
    tests: 'CI throughput design.',
    modelAnswer: `Increase workers + shard count until p95 < budget:

\`\`\`bash
npx playwright test --shard=\${INDEX}/\${TOTAL} --reporter=blob
\`\`\`

Balance by runtime not file count long-term (use report history). Merge blobs; cap shards when infra cost dominates.` },
  { id: 'IV-Q-SR-005', level: 'senior', round: 'theory', kind: 'theory', timebox: 10, difficulty: 4, topic: 'flake-budget', crosslinks: [],
    question: 'Define a flake budget metric and escalation path.',
    tests: 'Operational quality leadership.',
    modelAnswer: `Metric: **flake rate** = retried passes / total runs. Budget: <1% on main gate. Escalation: >2% blocks feature work → quarantine sprint. Weekly dashboard; root-cause categories tracked. Retries are measurement noise reduction, not fix.` },
  { id: 'IV-Q-SR-006', level: 'senior', round: 'theory', kind: 'theory', timebox: 10, difficulty: 4, topic: 'api-client-fixture', crosslinks: [],
    question: 'Design a worker-scoped API client fixture with disposal.',
    tests: 'Resource lifecycle at scale.',
    modelAnswer: `\`\`\`ts
export const test = base.extend<{}, { api: ApiClient }>({
  api: [async ({}, use) => {
    const client = await ApiClient.create();
    await use(client);
    await client.dispose();
  }, { scope: 'worker' }],
});
\`\`\`

Dispose closes connections — critical in long CI workers.` },
  { id: 'IV-Q-SR-007', level: 'senior', round: 'design', kind: 'design', timebox: 10, difficulty: 4, topic: 'config-layering', crosslinks: [],
    question: 'How do you layer playwright configs for local, staging, and prod-like runs?',
    tests: 'Environment matrix design.',
    modelAnswer: `Base config + env overlays via \`defineConfig\` merge or separate files imported. Secrets via CI vars only. Prod-like: read-only accounts, no destructive tests, separate project grep.` },
  { id: 'IV-Q-SR-008', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'reporting', crosslinks: [],
    question: 'How do developers access CI artifacts without SSH?',
    tests: 'Developer experience for failures.',
    modelAnswer: `Upload HTML report + trace zip as CI artifacts; PR comment with link. Use merge-reports for shards. Integrate with Slack/JUnit for trends. Target: <2 min from red build to trace open.` },
  { id: 'IV-Q-SR-009', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'ownership', crosslinks: [],
    question: 'How do you assign test ownership in a monorepo?',
    tests: 'Governance model.',
    modelAnswer: `CODEOWNERS on \`tests/e2e/<team>\`, tags map to Slack channels, quarantine owner field. Feature teams own specs for their surface; platform team owns fixtures/CI.` },
  { id: 'IV-Q-SR-010', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'code-review', crosslinks: [],
    question: 'What do you check in a Playwright PR review checklist?',
    tests: 'Quality gate design.',
    modelAnswer: `Locators web-first, no banned patterns, isolated data, routes cleaned, assertions in spec, tags appropriate, no sleep, trace useful on failure, runtime impact noted.` },
  { id: 'IV-Q-SR-011', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'deterministic-data', crosslinks: [],
    question: 'Strategies for deterministic test data at scale.',
    tests: 'Data strategy depth.',
    modelAnswer: `Factories with unique ids, API seed, sweeper cron for e2e- prefix, avoid shared "golden" accounts, snapshot DB for integration envs where legal.` },
  { id: 'IV-Q-SR-012', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 4, topic: 'contract-testing', crosslinks: [],
    question: 'Where does Pact/contract testing fit alongside Playwright?',
    tests: 'Integration boundary judgment.',
    modelAnswer: `Contracts validate API shapes between services — fast, pre-E2E. Playwright validates user journeys with real integrated stack. Do not duplicate contract assertions in every E2E test.` },
  { id: 'IV-Q-SR-013', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 4, topic: 'performance-budget', crosslinks: [],
    question: 'How do you set performance budgets for the E2E suite?',
    tests: 'Suite economics.',
    modelAnswer: `Track p95 per spec in CI, fail PR when smoke >N minutes, cap file count per shard, nightly full run separate from PR gate. Optimize slowest 10 tests monthly.` },
  { id: 'IV-Q-SR-014', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'selenium-migration', crosslinks: [],
    question: 'Key differences when migrating from Selenium to Playwright.',
    tests: 'Migration leadership.',
    modelAnswer: `Auto-wait eliminates explicit waits; locators lazy-evaluate; built-in trace/video; no separate grid required; parallel by default. Rewrite selectors to web-first — do not transliterate CSS 1:1.` },
  { id: 'IV-Q-SR-015', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'mobile-emulation', crosslinks: [],
    question: 'What does mobile emulation test and what does it miss?',
    tests: 'Coverage honesty.',
    modelAnswer: `Emulation tests responsive layout + touch events in Chromium — not real Safari WebKit or device GPU. Use for layout breakpoints; reserve device farm for release-critical mobile.` },
  { id: 'IV-Q-SR-016', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 4, topic: 'service-worker', crosslinks: [],
    question: 'How can service workers break `page.route` mocks?',
    tests: 'Advanced network debugging.',
    modelAnswer: `SW may cache responses bypassing route. Bypass: \`serviceWorkers: 'block'\` in config for tests requiring mocks, or mock at SW registration level. Document when prod uses SW.` },
  { id: 'IV-Q-SR-017', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 4, topic: 'websocket', crosslinks: [],
    question: 'Approaches for testing WebSocket-driven UI updates.',
    tests: 'Realtime testing breadth.',
    modelAnswer: `Wait for UI state via \`expect(locator)\`, intercept WS at CDP level for diagnostics, or inject test double server. Prefer asserting user-visible outcome over message sniffing.` },
  { id: 'IV-Q-SR-018', level: 'senior', round: 'design', kind: 'design', timebox: 10, difficulty: 4, topic: 'multi-tenant', crosslinks: [],
    question: 'Isolate tenants in parallel E2E for SaaS.',
    tests: 'Enterprise isolation design.',
    modelAnswer: `Unique tenant per test via API, subdomain routing, or header — never shared tenant admin. Teardown deletes tenant. Worker-scoped tenant pool for speed with lease pattern.` },
  { id: 'IV-Q-SR-019', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'secrets-ci', crosslinks: [],
    question: 'How do test credentials flow in CI securely?',
    tests: 'Secrets hygiene.',
    modelAnswer: `CI secret vars → setup project only → storageState artifacts ephemeral — never commit .auth or .env. Rotate on leak. Read-only creds for staging.` },
  { id: 'IV-Q-SR-020', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'docker', crosslinks: [],
    question: 'Why run Playwright in official Docker images on CI?',
    tests: 'Environment parity.',
    modelAnswer: `Pinned browsers + OS deps match local \`playwright install --with-deps\`. Reduces "passes on one runner only" visual flakes. Tag image version to @playwright/test version.` },
  { id: 'IV-Q-SR-021', level: 'senior', round: 'scenario', kind: 'scenario', timebox: 10, difficulty: 4, topic: 'mass-failure', crosslinks: ['c3'],
    question: '50 tests fail after a merge. Your first 15 minutes?',
    tests: 'Incident triage leadership.',
    modelAnswer: `Check deploy correlation → sample one failure trace → classify (env vs app vs test) → if shared root (auth endpoint down), fix once not 50 tests → communicate status. Do not mass-skip without owner.` },
  { id: 'IV-Q-SR-022', level: 'senior', round: 'design', kind: 'design', timebox: 10, difficulty: 4, topic: 'test-pyramid', crosslinks: [],
    question: 'Right-size E2E for a team owning 20 microservices.',
    tests: 'Strategy not maximal automation.',
    modelAnswer: `E2E on critical journeys only (~40–80 specs); service tests via API; CT for UI states. Contract tests between services. Measure cost per defect found — expand where ROI positive.` },
  { id: 'IV-Q-SR-023', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'feature-flags', crosslinks: [],
    question: 'Test both sides of a feature flag without doubling suite size.',
    tests: 'Pragmatic coverage.',
    modelAnswer: `Default path = flag on in staging; single spec with matrix override via fixture/env for off path. Avoid combinatorial explosion — test flag logic at unit level.` },
  { id: 'IV-Q-SR-024', level: 'senior', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'lint-governance', crosslinks: [],
    question: 'What ESLint/custom rules would you enforce for Playwright repos?',
    tests: 'Preventive quality.',
    modelAnswer: `Ban waitForTimeout/force/networkidle via custom rule or grep CI; require test.describe tags; no page.$; floating promise lint; optional role-locator preference rule.` },
  { id: 'IV-Q-SR-025', level: 'senior', round: 'design', kind: 'design', timebox: 10, difficulty: 4, topic: 'restraint', crosslinks: [],
    question: 'Name three things you would NOT build in v1 of a test framework.',
    tests: 'Judgment / anti-over-engineering.',
    modelAnswer: `Custom test runner, deep BaseTest inheritance tree, plugin marketplace, proprietary visual diff SaaS. Ship: fixtures, auth setup, tagging, CI sharding, lint.` },

  // ── ARCHITECT (15) ──
  { id: 'IV-Q-ARCH-001', level: 'architect', round: 'theory', kind: 'theory', timebox: 10, difficulty: 4, topic: 'dora', crosslinks: ['d2'],
    question: 'Which DORA metrics relate to test automation and how would you move them?',
    tests: 'Executive-level quality metrics.',
    modelAnswer: `**Deployment frequency** and **lead time** improve with fast reliable gates; **change fail rate** drops with good E2E signal; **MTTR** improves with traces + ownership. Move metrics by shrinking flake rate, parallel CI, and quarantine discipline — not by disabling tests.` },
  { id: 'IV-Q-ARCH-002', level: 'architect', round: 'theory', kind: 'theory', timebox: 10, difficulty: 4, topic: 'flake-budget-org', crosslinks: [],
    question: 'Design org-wide flake budget and accountability model.',
    tests: 'Organizational quality strategy.',
    modelAnswer: `Central dashboard: flake rate per team, quarantine age, retry rate. Budget thresholds tie to release authority. Staff test platform sets policy; feature teams own remediation SLAs. Escalate repeat offenders to eng leadership with data.` },
  { id: 'IV-Q-ARCH-003', level: 'architect', round: 'design', kind: 'design', timebox: 15, difficulty: 5, topic: 'platform-charter', crosslinks: [],
    question: 'Write a charter for a Test Platform team supporting 200 engineers.',
    tests: 'Org design for quality at scale.',
    modelAnswer: `Mission: reliable fast feedback loops. Services: CI runners, fixture libraries, seed envs, metrics, training. Non-goals: writing every feature test. SLAs: CI p95, flake budget, onboarding time. Interface: RFC process for breaking fixture changes.` },
  { id: 'IV-Q-ARCH-004', level: 'architect', round: 'theory', kind: 'theory', timebox: 10, difficulty: 4, topic: 'build-vs-buy', crosslinks: [],
    question: 'Build vs buy for test infrastructure (runners, reporting, data).',
    tests: 'Strategic vendor judgment.',
    modelAnswer: `Buy/hosted runners when infra ops costly; build fixtures/domain seeds in-house (competitive advantage). Avoid proprietary lock-in for test code — Playwright stays portable. Evaluate TCO: engineer hours vs vendor spend.` },
  { id: 'IV-Q-ARCH-005', level: 'architect', round: 'theory', kind: 'theory', timebox: 10, difficulty: 4, topic: 'coe-model', crosslinks: [],
    question: 'Center of Excellence vs embedded QA in squads — trade-offs?',
    tests: 'Operating model design.',
    modelAnswer: `CoE sets standards/tools; embedded owns domain tests. Pure CoE bottlenecks; pure embedded drifts. Hybrid: platform CoE + squad champions. Measure consistency via lint compliance + flake metrics.` },
  { id: 'IV-Q-ARCH-006', level: 'architect', round: 'theory', kind: 'theory', timebox: 8, difficulty: 4, topic: 'hiring-bar', crosslinks: [],
    question: 'How do you calibrate hiring bar across sites and levels?',
    tests: 'Interview system design.',
    modelAnswer: `Written rubric (IV-RUBRIC), recorded calibration sessions, kits per level, shadow loops, quarterly bar review. Local sites use same kits; adjust pass threshold not questions.` },
  { id: 'IV-Q-ARCH-007', level: 'architect', round: 'design', kind: 'design', timebox: 10, difficulty: 4, topic: 'release-gates', crosslinks: [],
    question: 'Design release gate policy for monorepo with 30 deploys/day.',
    tests: 'Risk-based delivery control.',
    modelAnswer: `Tiered gates: smoke on PR (blocking), full regression on main (blocking), nightly soak (inform). Risk-based selection maps code paths to tests via ownership graph. Manual waiver with VP for budget override.` },
  { id: 'IV-Q-ARCH-008', level: 'architect', round: 'design', kind: 'design', timebox: 12, difficulty: 4, topic: 'multi-repo', crosslinks: [],
    question: 'E2E strategy when UI and API live in separate repos.',
    tests: 'Cross-repo coordination.',
    modelAnswer: `Contract tests in API repo; smoke E2E in UI repo against deployed staging; shared test-id registry; versioned staging environment. Platform coordinates release train — tests pin environment version.` },
  { id: 'IV-Q-ARCH-009', level: 'architect', round: 'design', kind: 'design', timebox: 10, difficulty: 4, topic: 'risk-selection', crosslinks: [],
    question: 'How do you implement risk-based test selection safely?',
    tests: 'Change impact analysis maturity.',
    modelAnswer: `Map code ownership → test tags via static analysis or path rules. Run affected smoke on PR; full suite on main. Fallback: nightly full run catches selection gaps. Monitor escaped defects metric.` },
  { id: 'IV-Q-ARCH-010', level: 'architect', round: 'theory', kind: 'theory', timebox: 8, difficulty: 4, topic: 'compliance', crosslinks: [],
    question: 'Audit trail requirements for regulated industries running E2E.',
    tests: 'Compliance architecture.',
    modelAnswer: `Immutable CI logs, test case versioning, who-waived-gate records, data masking in artifacts, retention policy aligned with SOX/HIPAA. No PII in traces — use synthetic accounts.` },
  { id: 'IV-Q-ARCH-011', level: 'architect', round: 'design', kind: 'design', timebox: 10, difficulty: 4, topic: 'ci-cost', crosslinks: [],
    question: 'Cut CI cost 40% without raising escaped defects.',
    tests: 'Economic optimization.',
    modelAnswer: `Shard optimization, smoke vs full split, cache browsers, disable video on green, schedule full runs off-peak, quarantine expensive flaky tests, right-size workers. Measure escaped defects weekly during cutover.` },
  { id: 'IV-Q-ARCH-012', level: 'architect', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'consolidation', crosslinks: [],
    question: 'Consolidating Cypress + Selenium + Playwright — approach?',
    tests: 'Tool consolidation strategy.',
    modelAnswer: `Pick Playwright for new work; migrate critical paths first; freeze old suites; shared tagging for coverage map; sunset date with executive sponsor. Train via academy + pair migration sprints.` },
  { id: 'IV-Q-ARCH-013', level: 'architect', round: 'theory', kind: 'theory', timebox: 8, difficulty: 4, topic: 'roi', crosslinks: [],
    question: 'How do you measure ROI of test automation to executives?',
    tests: 'Business case articulation.',
    modelAnswer: `Escaped defect reduction, MTTR, deployment frequency, manual regression hours saved, cost per CI run vs incident cost. Avoid vanity metrics (total test count). Show trend lines quarter over quarter.` },
  { id: 'IV-Q-ARCH-014', level: 'architect', round: 'theory', kind: 'theory', timebox: 8, difficulty: 3, topic: 'executive-reporting', crosslinks: [],
    question: 'One-page quality dashboard for CTO — what tiles?',
    tests: 'Communication upward.',
    modelAnswer: `Flake rate, gate pass rate, p95 CI duration, quarantine count, escaped defects P1/P2, coverage of critical journeys (not line %). Red/yellow/green with owner per tile.` },
  { id: 'IV-Q-ARCH-015', level: 'architect', round: 'design', kind: 'design', timebox: 10, difficulty: 5, topic: 'strategy', crosslinks: ['d1'],
    question: 'Three-year test automation strategy for cloud-native product.',
    tests: 'Long-horizon planning.',
    modelAnswer: `Y1: stable gates + platform team + flake budget. Y2: risk-based selection + contract tests + perf budgets. Y3: predictive quality metrics tied to DORA; global calibration; self-service fixtures. Explicit non-goals each year documented.` },
];

export const QUESTIONS = QUESTION_SPECS.map(expandQuestion);
