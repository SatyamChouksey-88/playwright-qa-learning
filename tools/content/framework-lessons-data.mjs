/** Lesson metadata + section bodies for Framework Academy generator. */
export const LESSONS = [
  {
    id: 'FW-L-101', slug: 'project-init', stage: 1,
    title: 'Project initialization', objective: 'Scaffold a TypeScript-strict Playwright project with the right defaults from day one.',
    subtopics: ['init', 'package.json', 'playwright-install'],
    diagram: 'DIAG-FW-TREE', mcqs: ['FW-Q-001', 'FW-Q-002', 'FW-Q-003'], exercise: 'FW-X-01',
    related: ['FW-L-102', 'FW-L-103'],
    concept: 'A Playwright framework starts with `@playwright/test`, strict TypeScript, and a single `playwright.config.ts` at the repo root (or practice-suite root). Run `npm init playwright@latest` or add dependencies manually, then commit a minimal config with explicit `testDir`, reporter, and trace policy.',
    why: 'Interviewers probe whether you understand that the framework is Playwright itself — your job is conventions and glue, not a custom runner. Starting strict avoids retrofitting types and lint rules after 200 tests exist.',
    arch: 'Keep one config entry point. Split environment-specific overrides later via `projects[]` and env vars — not separate runner scripts. The init scaffold should include ESLint + TypeScript strict from commit one.',
    impl: `\`\`\`ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
});
\`\`\``,
    tradeoffs: 'Official init template is opinionated (single browser). That is fine for day one — add `projects[]` when you need matrix coverage. Pin `@playwright/test` in package.json; avoid floating "latest" in CI.',
    notToDo: 'Do not wrap Playwright in a custom CLI on day one. Do not copy a Selenium folder layout (drivers/, pageFactories/). Do not disable strict TypeScript "temporarily".',
    interview: '"Walk me through bootstrapping Playwright for a new repo." — Name strict TS, single config, trace-on-first-retry, and that you will add fixtures before the tenth test.',
  },
  {
    id: 'FW-L-102', slug: 'tsconfig-strict', stage: 1,
    title: 'TypeScript strict mode', objective: 'Configure tsconfig so tests and page objects catch null/any bugs at compile time.',
    subtopics: ['tsconfig', 'strict', 'types'],
    diagram: null, mcqs: ['FW-Q-004', 'FW-Q-005'], exercise: null,
    related: ['FW-L-101', 'FW-L-106'],
    concept: '`strict: true` plus `noUncheckedIndexedAccess` makes Playwright fixtures and API responses safer. Include test files in `include` and add `"types": ["node"]` for process.env.',
    why: 'Senior reviewers treat `any` in page objects as a smell — it hides wrong locator types and async mistakes that become flaky tests.',
    arch: 'One tsconfig for the suite; extend from a base if monorepo later. Run `tsc --noEmit` in CI before Playwright — cheap gate, high value.',
    impl: `\`\`\`ts
// tsconfig.json excerpt — compilerOptions
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["tests/**/*.ts", "pages/**/*.ts", "fixtures/**/*.ts", "playwright.config.ts"]
}
\`\`\``,
    tradeoffs: 'Strict mode slows onboarding slightly; loosening it later never happens. `skipLibCheck: true` is acceptable — do not use it to silence errors in your own code.',
    notToDo: 'Do not `@ts-ignore` missing awaits on locators. Do not type locators as `any`. Do not maintain parallel JS and TS test folders.',
    interview: '"Why strict TypeScript for tests?" — Tests are production code with the same maintenance cost; strict catches async/locator mistakes before CI.',
  },
  {
    id: 'FW-L-103', slug: 'config-anatomy', stage: 1,
    title: 'Config anatomy', objective: 'Know every meaningful key in playwright.config.ts and what belongs there vs in tests.',
    subtopics: ['defineConfig', 'use', 'projects', 'reporter'],
    diagram: 'DIAG-FW-CONFIG', mcqs: ['FW-Q-006', 'FW-Q-007', 'FW-Q-008'], exercise: null,
    related: ['FW-L-101', 'FW-L-209'],
    concept: '`defineConfig` merges defaults: global `use`, per-project overrides, timeouts, grep, snapshot paths, and dependencies between projects. Config sets policy; tests express behavior.',
    why: 'Misplaced config (per-test retries in code, global baseURL duplicated in every spec) is the #1 source of "works locally, fails in CI" framework debates.',
    arch: 'Centralize timeout, trace, screenshot, and retry policy in config. Use `projects[]` for browser/env matrix — not copy-pasted config files with drift.',
    impl: `\`\`\`ts
export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: { baseURL: process.env.BASE_URL, trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
\`\`\``,
    tradeoffs: 'Heavy config indirection (five imported partial configs) helps at 50k tests, hurts at 50. Start flat; extract when duplication hurts.',
    notToDo: 'Do not set `navigationTimeout: 999999`. Do not put test data in config. Do not use deprecated `globalSetup` for things fixtures handle cleanly.',
    interview: '"What goes in playwright.config vs a fixture?" — Config: environment-wide policy. Fixtures: per-test or per-worker setup/teardown with typed dependencies.',
  },
  {
    id: 'FW-L-104', slug: 'folder-structure-v1', stage: 1,
    title: 'Folder structure v1', objective: 'Lay out tests/, pages/, fixtures/, and config/ so new engineers know where files go.',
    subtopics: ['folders', 'conventions', 'feature-grouping'],
    diagram: 'DIAG-FW-ARCH', mcqs: ['FW-Q-009', 'FW-Q-010'], exercise: 'FW-X-02',
    related: ['FW-L-105', 'FW-L-201'],
    concept: 'Group tests by feature under `tests/<feature>/`. Page objects live in `pages/` or colocated `pages/` per feature. Shared fixtures in `fixtures/`. One config at root.',
    why: 'Flat `tests/test47.spec.ts` does not scale past three engineers. Interviewers ask you to draw the tree — hesitation signals you have not run a growing suite.',
    arch: 'Feature-first tests, shared pages when reused across features, fixtures for cross-cutting setup. Avoid `helpers/` junk drawer — name by domain (auth, api).',
    impl: `\`\`\`ts
// tests/checkout/guest-checkout.spec.ts
import { test, expect } from '../../fixtures/base';
import { CheckoutPage } from '../../pages/checkout-page';

test('guest can complete checkout', async ({ checkoutPage }) => {
  await checkoutPage.open();
  await expect(checkoutPage.summary).toBeVisible();
});
\`\`\``,
    tradeoffs: 'Deep nesting (`tests/e2e/regression/payments/us/`) adds navigation cost. Two levels (domain + spec) is the sweet spot for most teams.',
    notToDo: 'Do not mirror the entire app src tree in tests. Do not put assertions inside page objects at this stage. Do not create `utils/` without ownership.',
    interview: '"Where does a new login test go?" — `tests/auth/login.spec.ts`, reusing `pages/login-page.ts` and auth fixtures — not a new top-level pattern.',
  },
  {
    id: 'FW-L-105', slug: 'naming-conventions', stage: 1,
    title: 'Naming conventions', objective: 'Apply consistent file, test, and locator naming so reviews and grep stay fast.',
    subtopics: ['naming', 'test-titles', 'file-names'],
    diagram: null, mcqs: ['FW-Q-011'], exercise: null,
    related: ['FW-L-104', 'FW-L-107'],
    concept: 'Files: `kebab-case.spec.ts`. Tests: behavior-focused sentences. Page objects: `<Feature>Page` or component name. Tags: `@smoke`, `@regression` in title or grep config.',
    why: 'Naming is cheap enforcement. "test1" and `PageObjectLogin` mixed with `login_page` tell interviewers your team has no standards.',
    arch: 'Document in CONTRIBUTING.md: file pattern, tag policy, and that test names must read as specifications for failure messages.',
    impl: `\`\`\`ts
test.describe('Account settings', () => {
  test('@smoke user can update display name', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('textbox', { name: 'Display name' }).fill('Ada Lovelace');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Profile updated')).toBeVisible();
  });
});
\`\`\``,
    tradeoffs: 'Over-long test names clutter reports — put data variations in `test.describe` or parameterized tests, not 200-char titles.',
    notToDo: 'Do not encode environment in file names (`login-staging.spec.ts`). Use projects. Do not abbreviate domain terms (`chkout.spec.ts`).',
    interview: '"How do you name tests for CI grep?" — Tags for tier (`@smoke`), describe blocks for feature, test title states role + outcome.',
  },
  {
    id: 'FW-L-106', slug: 'eslint-playwright', stage: 1,
    title: 'ESLint for Playwright', objective: 'Enforce await-on-locators and ban anti-patterns via eslint-plugin-playwright.',
    subtopics: ['eslint', 'lint', 'ci-gate'],
    diagram: null, mcqs: ['FW-Q-012', 'FW-Q-013'], exercise: null,
    related: ['FW-L-102', 'FW-L-107'],
    concept: 'Use `@typescript-eslint` for promises and `eslint-plugin-playwright` rules on test globs: no focused tests in CI, valid expect, no page.pause in commits.',
    why: 'Missing `await` on locators is the most common source of race failures — lint catches it; code review does not reliably.',
    arch: 'Run `eslint` + `tsc --noEmit` in the same CI job as Playwright. Scope plugin to `**/*.spec.ts` and `tests/**`.',
    impl: `\`\`\`ts
// eslint.config.mjs excerpt
import playwright from 'eslint-plugin-playwright';
export default [
  { ...playwright.configs['flat/recommended'], files: ['**/*.spec.ts', 'tests/**'] },
];
\`\`\``,
    tradeoffs: 'Too many custom rules early creates friction. Start with recommended + no-floating-promises; add team rules when patterns repeat.',
    notToDo: 'Do not disable `playwright/no-wait-for-timeout` globally. Do not lint generated artifacts. Do not skip lint on "quick fix" PRs.',
    interview: '"How enforce locator discipline?" — ESLint + PR checklist + shared fixtures that encode the locator strategy.',
  },
  {
    id: 'FW-L-107', slug: 'web-first-locators', stage: 1,
    title: 'Web-first locators', objective: 'Standardize on getByRole, getByLabel, and getByTestId as the team locator policy.',
    subtopics: ['locators', 'getByRole', 'resilience'],
    diagram: null, mcqs: ['FW-Q-014', 'FW-Q-015'], exercise: 'FW-X-03',
    related: ['FW-L-106', 'FW-L-201'],
    concept: 'Playwright locators re-query on action. Prefer user-facing attributes (role, name, label) over CSS/XPath. Store locators as readonly fields on page objects, not strings scattered in tests.',
    why: 'Locator policy is the framework\'s longest-lived decision — it affects every test and every code review.',
    arch: 'Document priority: role → label → test id → CSS. Ban XPath in new tests via lint or CODEOWNERS policy.',
    impl: `\`\`\`ts
export class LoginPage {
  constructor(private readonly page: Page) {}
  readonly email = this.page.getByRole('textbox', { name: 'Email' });
  readonly submit = this.page.getByRole('button', { name: 'Sign in' });

  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.submit.click();
  }
}
\`\`\``,
    tradeoffs: 'getByRole fails on poorly accessible UIs — push back on product for labels, do not permanently downgrade to CSS.',
    notToDo: 'Do not use deprecated element handle APIs. Do not use `.nth(3)` without scoping to a container. Do not share locators across unrelated pages without context.',
    interview: '"Locator strategy for 50 engineers?" — Written priority list, ESLint, examples in page objects, reject XPath in review.',
  },
  {
    id: 'FW-L-201', slug: 'thin-pom', stage: 2,
    title: 'Thin Page Object Model', objective: 'Keep page objects as locators + actions; leave assertions in tests.',
    subtopics: ['pom', 'separation', 'maintainability'],
    diagram: 'DIAG-FW-DECIDE', mcqs: ['FW-Q-016', 'FW-Q-017', 'FW-Q-018'], exercise: 'FW-X-04',
    related: ['FW-L-202', 'FW-L-104'],
    concept: 'A page object exposes navigation helpers and locators; tests own `expect`. Thick POMs with `verifySuccessMessage()` hide intent and duplicate assertions across tests.',
    why: 'Interviewers show a 400-line Page class — you must spot assertion leakage and suggest thin objects + readable specs.',
    arch: 'One page class per route or major view. Methods return void or locators for test assertions — not boolean "isVisible" wrappers unless reused heavily.',
    impl: `\`\`\`ts
export class OrdersPage {
  constructor(private readonly page: Page) {}
  readonly heading = this.page.getByRole('heading', { name: 'Orders' });
  readonly rows = this.page.getByRole('row');

  async open() {
    await this.page.goto('/orders');
    await expect(this.heading).toBeVisible();
  }
}

// test owns business assertion
test('lists open orders', async ({ ordersPage }) => {
  await ordersPage.open();
  await expect(ordersPage.rows).toHaveCount(3);
});
\`\`\``,
    tradeoffs: 'Some teams allow soft assertions in page objects for "wait until ready" — acceptable if named `waitForLoaded()`, not `assertLoaded()`.',
    notToDo: 'Do not put `expect` for business outcomes inside every page method. Do not inherit from a mega BasePage with 80 methods. Do not use Screenplay unless the whole org commits.',
    interview: '"POM vs no POM?" — Playwright fixtures + thin page objects: locators/actions centralized, assertions visible in spec.',
  },
  {
    id: 'FW-L-202', slug: 'component-objects', stage: 2,
    title: 'Component objects', objective: 'Model reusable UI widgets (nav, modal, datagrid) as component objects instead of mega page classes.',
    subtopics: ['component-objects', 'spa', 'composition'],
    diagram: null, mcqs: ['FW-Q-019', 'FW-Q-020'], exercise: null,
    related: ['FW-L-201', 'FW-L-104'],
    concept: 'Component objects wrap a root locator (e.g. page.getByRole("dialog")) and expose actions for that subtree. Pages compose components: `this.nav = new NavBar(page)`.',
    why: 'SPAs reuse headers, modals, and tables across routes — duplicating locators in every page object rots quickly.',
    arch: 'Extract a component when a third page copies the same locators. Keep components stateless aside from the root locator reference.',
    impl: `\`\`\`ts
export class ConfirmModal {
  constructor(private readonly root: Locator) {}
  readonly confirm = this.root.getByRole('button', { name: 'Confirm' });
  async accept() {
    await this.confirm.click();
  }
}

export class CheckoutPage {
  readonly modal: ConfirmModal;
  constructor(page: Page) {
    this.modal = new ConfirmModal(page.getByRole('dialog', { name: 'Confirm order' }));
  }
}
\`\`\``,
    tradeoffs: 'Too many tiny components add indirection — start inline, extract on third duplication.',
    notToDo: 'Do not create a component per CSS div. Do not pass entire Page into every component method — pass Locator root.',
    interview: '"When component object vs page object?" — Page = route/screen; component = reusable widget appearing on multiple screens.',
  },
  {
    id: 'FW-L-203', slug: 'fixtures-replace-beforeeach', stage: 2,
    title: 'Fixtures replace beforeEach', objective: 'Use test.extend for typed setup instead of shared mutable beforeEach hooks.',
    subtopics: ['fixtures', 'test.extend', 'setup'],
    diagram: 'DIAG-FW-FIXTURES', mcqs: ['FW-Q-021', 'FW-Q-022', 'FW-Q-023'], exercise: 'FW-X-05',
    related: ['FW-L-204', 'FW-L-205'],
    concept: '`test.extend` declares dependencies (page objects, API clients) with setup/teardown scopes. Playwright injects them per test — no manual construction in beforeEach.',
    why: 'Shared `beforeEach` with module-level state breaks parallel runs. Fixtures encode scope explicitly (test vs worker).',
    arch: 'Export `test` and `expect` from `fixtures/base.ts`. App-specific fixtures extend once; specs import from fixtures, never from `@playwright/test` directly.',
    impl: `\`\`\`ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

type Fixtures = { loginPage: LoginPage };

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
export { expect } from '@playwright/test';
\`\`\``,
    tradeoffs: 'Fixture chains can become hard to trace — keep depth ≤2 and name fixtures after domain concepts.',
    notToDo: 'Do not mutate global variables in beforeEach. Do not mix `@playwright/test` import in specs when using custom fixtures.',
    interview: '"Why fixtures over beforeEach?" — Parallel-safe, typed, composable, and visible in test signature as dependencies.',
  },
  {
    id: 'FW-L-204', slug: 'worker-vs-test-scope', stage: 2,
    title: 'Worker vs test scope', objective: 'Choose fixture scope so expensive setup runs once per worker, not per test.',
    subtopics: ['scope', 'worker', 'parallel'],
    diagram: null, mcqs: ['FW-Q-024', 'FW-Q-025', 'FW-Q-026'], exercise: null,
    related: ['FW-L-203', 'FW-L-304'],
    concept: 'Default fixture scope is `test` — fresh for each test. `{ scope: \'worker\' }` runs once per parallel worker process. Use worker scope for read-only clients, not for mutable browser state.',
    why: 'Wrong scope causes cross-test pollution or redundant slow setup — classic senior interview scenario.',
    arch: 'Test scope: page objects, per-test data. Worker scope: API client with connection pool, read-only config parse. Never share mutable DB rows at worker scope without isolation.',
    impl: `\`\`\`ts
export const test = base.extend<{ api: ApiClient }>({
  api: [
    async ({}, use) => {
      const client = new ApiClient(process.env.API_URL!);
      await use(client);
      await client.dispose();
    },
    { scope: 'worker' },
  ],
});
\`\`\``,
    tradeoffs: 'Worker fixtures survive multiple tests — ensure they are stateless or self-clean. Document scope in fixture file header.',
    notToDo: 'Do not store per-test user ids in worker-scoped fixtures. Do not assume worker count equals 1 locally.',
    interview: '"When worker-scoped fixture?" — Expensive, read-only, parallel-safe resources — API client, parsed config — not browser page state.',
  },
  {
    id: 'FW-L-205', slug: 'auto-and-option-fixtures', stage: 2,
    title: 'Auto and option fixtures', objective: 'Use auto fixtures for mandatory setup and option fixtures for opt-in behavior.',
    subtopics: ['auto', 'option', 'fixtures'],
    diagram: null, mcqs: ['FW-Q-027', 'FW-Q-028'], exercise: null,
    related: ['FW-L-203', 'FW-L-305'],
    concept: '`{ auto: true }` fixtures run even when not listed in the test args — useful for trace labels or coverage hooks. Option fixtures (default undefined) let tests opt into slow paths.',
    why: 'Teams misuse auto fixtures and wonder why tests are slow — you must explain the cost and when to opt in.',
    arch: 'Reserve auto for cheap, universal setup. Expensive mocks use option fixtures: `test(\'...\', async ({ page, mockPayments }) => ...)`.',
    impl: `\`\`\`ts
type Options = { mockPayments?: boolean };

export const test = base.extend<Options>({
  mockPayments: [async ({ page }, use, testInfo) => {
    if (!testInfo.project.use.mockPayments) {
      await use(undefined);
      return;
    }
    await page.route('**/api/pay', (route) => route.fulfill({ json: { ok: true } }));
    await use(true);
  }, { option: true }],
});
\`\`\``,
    tradeoffs: 'Auto fixtures hide dependencies — prefer explicit args for anything that changes test meaning.',
    notToDo: 'Do not make database seeding auto for every test. Do not use auto fixtures for login — use project storageState instead.',
    interview: '"Difference auto vs option fixture?" — Auto runs always; option activates when test or config requests it.',
  },
  {
    id: 'FW-L-206', slug: 'mergetests', stage: 2,
    title: 'mergeTests composition', objective: 'Combine fixture modules with mergeTests without inheritance trees.',
    subtopics: ['mergeTests', 'composition', 'modularity'],
    diagram: 'DIAG-FW-FIXTURES', mcqs: ['FW-Q-029', 'FW-Q-030'], exercise: null,
    related: ['FW-L-203', 'FW-L-406'],
    concept: '`mergeTests(authFixtures, apiFixtures, uiFixtures)` unions fixture types. Each module exports its own extended test — composition replaces monolithic fixture files.',
    why: 'At scale, one 800-line fixtures.ts becomes merge conflicts daily. mergeTests is the Playwright-endorsed split.',
    arch: 'One fixture file per domain (auth, api, pages). Root `fixtures/index.ts` merges and re-exports. Teams add modules without editing core.',
    impl: `\`\`\`ts
import { mergeTests } from '@playwright/test';
import { test as authTest } from './auth-fixtures';
import { test as apiTest } from './api-fixtures';

export const test = mergeTests(authTest, apiTest);
export { expect } from '@playwright/test';
\`\`\``,
    tradeoffs: 'Name collisions across merged modules fail at import — prefix fixture names (`adminPage`, `guestPage`).',
    notToDo: 'Do not deep-chain extend more than one level before merge. Do not duplicate fixture names across modules.',
    interview: '"How split fixtures across teams?" — Domain fixture modules + mergeTests + semver on shared package.',
  },
  {
    id: 'FW-L-207', slug: 'auth-setup-project', stage: 2,
    title: 'Auth setup project', objective: 'Authenticate once via a setup project and reuse storageState across dependent projects.',
    subtopics: ['storageState', 'setup', 'projects'],
    diagram: 'DIAG-FW-AUTH', mcqs: ['FW-Q-031', 'FW-Q-032', 'FW-Q-033'], exercise: 'FW-X-06',
    related: ['FW-L-208', 'FW-L-203'],
    concept: 'A `setup` project runs auth.setup.ts, saves `storageState` to disk, and `dependencies: [\'setup\']` on consumer projects loads cookies/localStorage before tests.',
    why: 'Logging in via UI in every test wastes minutes and hits rate limits — interviewers expect storageState pattern.',
    arch: 'Gitignore `.auth/*.json`. Setup project uses dedicated specMatch. Consumer projects set `use.storageState` path.',
    impl: `\`\`\`ts
// setup/auth.setup.ts
import { test as setup } from '@playwright/test';
const authFile = 'playwright/.auth/user.json';
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.USER!);
  await page.getByLabel('Password').fill(process.env.PASS!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: authFile });
});
\`\`\``,
    tradeoffs: 'Disk persistence is fast but security-sensitive — restrict artifact access; rotate test credentials.',
    notToDo: 'Do not commit storageState files. Do not run setup in every test file beforeEach. Prefer API login in setup when available.',
    interview: '"Speed up auth across 2k tests?" — Setup project + storageState + API token login in setup spec.',
  },
  {
    id: 'FW-L-208', slug: 'multi-role-auth', stage: 2,
    title: 'Multi-role auth', objective: 'Support admin, member, and guest roles with separate storageState files and projects.',
    subtopics: ['roles', 'storageState', 'matrix'],
    diagram: 'DIAG-FW-AUTH', mcqs: ['FW-Q-034', 'FW-Q-035'], exercise: 'FW-X-07',
    related: ['FW-L-207', 'FW-L-210'],
    concept: 'Run one setup test per role (or one setup file with multiple tests), each writing `playwright/.auth/<role>.json`. Map roles to projects via `use.storageState`.',
    why: 'RBAC suites fail when every test uses the same admin cookie — interviewers ask how you test forbidden actions.',
    arch: 'Fixtures expose asRole("member") only when dynamic; static matrix prefers separate projects for clarity in CI reports.',
    impl: `\`\`\`ts
projects: [
  { name: 'setup', testMatch: /auth\\.setup\\.ts/ },
  {
    name: 'admin',
    dependencies: ['setup'],
    use: { storageState: 'playwright/.auth/admin.json' },
  },
  {
    name: 'member',
    dependencies: ['setup'],
    use: { storageState: 'playwright/.auth/member.json' },
  },
],
\`\`\``,
    tradeoffs: 'Many roles × browsers explode project count — use grep/tags for rare roles, full matrix nightly.',
    notToDo: 'Do not hardcode one user for all RBAC tests. Do not switch roles mid-test via logout/login unless testing logout.',
    interview: '"Test member cannot access admin route?" — Member project storageState + test expects redirect/forbidden.',
  },
  {
    id: 'FW-L-209', slug: 'config-layering-envs', stage: 2,
    title: 'Config layering for environments', objective: 'Layer base config with env-specific overrides using env vars and project metadata.',
    subtopics: ['env', 'baseURL', 'layering'],
    diagram: 'DIAG-FW-CONFIG', mcqs: ['FW-Q-036', 'FW-Q-037'], exercise: 'FW-X-08',
    related: ['FW-L-103', 'FW-L-210'],
    concept: 'Single config reads `process.env.BASE_URL`, `API_URL`, etc. Optional `playwright.config.staging.ts` imports base and overrides — or use CI env injection without multiple files.',
    why: 'Hardcoded URLs in tests break when promoting staging → prod-like envs. Layering is a framework architect question.',
    arch: '`.env.example` documents vars; CI secret store holds values. Never branch test logic on env name strings — branch on config objects.',
    impl: `\`\`\`ts
const baseURL = process.env.BASE_URL ?? 'http://localhost:4173';
export default defineConfig({
  use: { baseURL },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
\`\`\``,
    tradeoffs: 'Multiple config files drift — prefer one config + env vars until teams truly need incompatible project shapes.',
    notToDo: 'Do not duplicate entire config per env. Do not store secrets in repo env files.',
    interview: '"How run same tests against staging and prod-like?" — BASE_URL + project grep/smoke tier, not copy-pasted specs.',
  },
  {
    id: 'FW-L-210', slug: 'projects-matrix', stage: 2,
    title: 'Projects matrix', objective: 'Design projects[] for browser × environment × role without combinatorial explosion.',
    subtopics: ['projects', 'matrix', 'ci'],
    diagram: null, mcqs: ['FW-Q-038', 'FW-Q-039'], exercise: null,
    related: ['FW-L-208', 'FW-L-402'],
    concept: 'Each project is a named slice: browser device, storageState, grep tag, or dependency chain. CI selects subsets via `--project` and `--grep`.',
    why: 'Uncontrolled matrix is CI cost death — interviewers want smoke vs full regression split.',
    arch: 'PR: chromium + smoke tag. Nightly: all browsers + regression. Document matrix in README table.',
    impl: `\`\`\`ts
projects: [
  { name: 'smoke-chromium', grep: /@smoke/, use: { ...devices['Desktop Chrome'] } },
  { name: 'regression-firefox', grep: /@regression/, use: { ...devices['Desktop Firefox'] } },
],
\`\`\``,
    tradeoffs: 'Cartesian product (3 browsers × 4 roles × 3 envs) = 36 projects — collapse rare combos to scheduled jobs.',
    notToDo: 'Do not run full matrix on every PR. Do not create one project per test file.',
    interview: '"Design CI matrix for 3 browsers and 2 envs?" — Named projects, PR runs chromium staging smoke, nightly full matrix.',
  },
  {
    id: 'FW-L-301', slug: 'data-factories', stage: 3,
    title: 'Data factories', objective: 'Build parallel-safe test data with factories that default sensible values and accept overrides.',
    subtopics: ['factories', 'faker', 'isolation'],
    diagram: 'DIAG-FW-DATA', mcqs: ['FW-Q-040', 'FW-Q-041', 'FW-Q-042'], exercise: 'FW-X-09',
    related: ['FW-L-303', 'FW-L-306'],
    concept: 'Factories are functions `createUser(overrides?)` returning typed objects with unique emails/ids per call. Tests pass only fields they assert on.',
    why: 'Hardcoded "test@example.com" causes parallel collisions — interviewers listen for uniqueness strategy.',
    arch: 'Factories live in `data/factories/`. Use timestamp/uuid suffixes. Pair with API create when UI setup is slow.',
    impl: `\`\`\`ts
export type User = { email: string; name: string; role: 'member' | 'admin' };

export function createUser(overrides: Partial<User> = {}): User {
  const id = crypto.randomUUID().slice(0, 8);
  return {
    email: \`user-\${id}@example.test\`,
    name: 'Test User',
    role: 'member',
    ...overrides,
  };
}
\`\`\``,
    tradeoffs: 'Faker adds dependency — UUID suffix is enough for emails. Keep factories dumb; no DB calls inside factory.',
    notToDo: 'Do not share one global user object across tests. Do not use production-like real emails.',
    interview: '"Parallel-safe test data?" — Factory with unique keys + API seed + teardown or sweeper job.',
  },
  {
    id: 'FW-L-302', slug: 'api-client-layer', stage: 3,
    title: 'API client layer', objective: 'Wrap fetch/request in a typed ApiClient used by fixtures for seed and assert.',
    subtopics: ['api', 'request', 'fixtures'],
    diagram: 'DIAG-FW-ARCH', mcqs: ['FW-Q-043', 'FW-Q-044'], exercise: null,
    related: ['FW-L-303', 'FW-L-304'],
    concept: 'Centralize base URL, auth headers, and error handling in `ApiClient`. Expose domain methods: `createOrder()`, not raw fetch in every test.',
    why: 'Duplicated fetch in specs hides auth bugs and makes API setup inconsistent.',
    arch: 'Client in `api/` or `clients/`. Worker-scoped fixture when connection reuse helps. Use Playwright `request` fixture for in-test API when simpler.',
    impl: `\`\`\`ts
export class ApiClient {
  constructor(private readonly baseURL: string, private readonly token: string) {}
  async createUser(body: User) {
    const res = await fetch(\`\${this.baseURL}/users\`, {
      method: 'POST',
      headers: { Authorization: \`Bearer \${this.token}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(\`createUser failed: \${res.status}\`);
    return res.json() as Promise<User>;
  }
}
\`\`\``,
    tradeoffs: 'Thin wrapper vs full SDK — start with methods you seed twice; generate from OpenAPI only when API is huge.',
    notToDo: 'Do not bypass client with copy-pasted curl in tests. Do not store prod API keys in repo.',
    interview: '"API setup in UI tests?" — ApiClient in worker fixture + seed via API + UI asserts user-visible outcome.',
  },
  {
    id: 'FW-L-303', slug: 'api-seed-vs-ui-setup', stage: 3,
    title: 'API seed vs UI setup', objective: 'Choose API seeding for speed and UI setup when the journey under test requires it.',
    subtopics: ['seed', 'api', 'ui'],
    diagram: 'DIAG-FW-DATA', mcqs: ['FW-Q-045', 'FW-Q-046'], exercise: null,
    related: ['FW-L-301', 'FW-L-304'],
    concept: 'If the test asserts checkout, seed cart via API and start on checkout page. If the test is "user adds item to cart", drive UI from empty state.',
    why: 'Everything-through-UI suites are slow and flaky — interviewers ask where you draw the line.',
    arch: 'Document decision tree in framework README. Tag slow full-journey tests `@regression`.',
    impl: `\`\`\`ts
test('checkout shows order total', async ({ page, api, user }) => {
  const order = await api.createOrder({ userId: user.id, items: [{ sku: 'ABC', qty: 1 }] });
  await page.goto(\`/checkout/\${order.id}\`);
  await expect(page.getByTestId('order-total')).toHaveText('$19.99');
});
\`\`\``,
    tradeoffs: 'Over-API-ing skips bugs in UI creation flows — maintain a balanced pyramid within E2E.',
    notToDo: 'Do not API-seed when testing the wizard you skip. Do not UI-login when testing unrelated admin settings.',
    interview: '"When UI vs API setup?" — Test the path you need to prove; shortcut everything else via API.',
  },
  {
    id: 'FW-L-304', slug: 'hybrid-api-ui', stage: 3,
    title: 'Hybrid API + UI tests', objective: 'Combine API arrange, UI act/assert, and API teardown in one typed flow.',
    subtopics: ['hybrid', 'arrange-act-assert', 'fixtures'],
    diagram: null, mcqs: ['FW-Q-047', 'FW-Q-048'], exercise: 'FW-X-10',
    related: ['FW-L-302', 'FW-L-303'],
    concept: 'Fixtures inject both `page` and `api`. Arrange creates entities, UI validates what customers see, teardown deletes via API in fixture auto cleanup.',
    why: 'Senior tests read like stories but run in seconds — hybrid pattern is the hallmark of mature suites.',
    arch: 'Use test-scoped fixture teardown for delete. Worker-scoped API client with test-scoped entity ids.',
    impl: `\`\`\`ts
export const test = base.extend<{ user: User }>({
  user: async ({ api }, use) => {
    const user = await api.createUser(createUser());
    await use(user);
    await api.deleteUser(user.id);
  },
});
\`\`\``,
    tradeoffs: 'Teardown failures orphan data — tolerate 404 on delete and run periodic sweeper (see data cleanup lesson).',
    notToDo: 'Do not leave teardown only in afterEach without fixture — skipped tests skip afterEach patterns inconsistently.',
    interview: '"Fast stable E2E for order flow?" — API arrange + UI assert on confirmation + API verify side effect optional.',
  },
  {
    id: 'FW-L-305', slug: 'network-mocking', stage: 3,
    title: 'Network mocking', objective: 'Use page.route and HAR responsibly for third-party and edge-case coverage.',
    subtopics: ['route', 'mock', 'har'],
    diagram: null, mcqs: ['FW-Q-049', 'FW-Q-050'], exercise: null,
    related: ['FW-L-205', 'FW-L-303'],
    concept: 'Mock unstable third parties (payments, maps) at the network layer. Prefer fulfilling JSON over recording HAR for dynamic APIs.',
    why: 'Teams mock too much (false confidence) or too little (flaky externals) — interviewers test your boundary.',
    arch: 'Option fixture `mockStripe` registers routes. Document what must never be mocked (your own API contract tests separate).',
    impl: `\`\`\`ts
await page.route('**/api/weather', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ tempC: 21, condition: 'Clear' }),
  });
});
\`\`\``,
    tradeoffs: 'HAR replay brittle on query params — use handlers for logic, HAR for static assets only.',
    notToDo: 'Do not mock your own core API in regression — that belongs in contract tests. Do not leave routes registered globally without unroute.',
    interview: '"When mock network?" — Third-party/unstable; never for your primary user journey in smoke.',
  },
  {
    id: 'FW-L-306', slug: 'data-cleanup', stage: 3,
    title: 'Data cleanup', objective: 'Design teardown, sweeper jobs, and naming conventions so orphaned data does not accumulate.',
    subtopics: ['teardown', 'cleanup', 'isolation'],
    diagram: 'DIAG-FW-DATA', mcqs: ['FW-Q-051'], exercise: null,
    related: ['FW-L-301', 'FW-L-304'],
    concept: 'Fixture teardown deletes created entities; tolerate already-deleted. Nightly job removes records matching `e2e-%` prefix older than 24h.',
    why: 'CI kills mid-test leave orphans; interviewers ask what happens when teardown fails.',
    arch: 'Prefix all test data `e2e-<uuid>`. Log created ids on failure. Sweeper is backstop, not primary cleanup.',
    impl: `\`\`\`ts
user: async ({ api }, use) => {
  const user = await api.createUser(createUser({ email: \`e2e-\${crypto.randomUUID()}@test.local\` }));
  await use(user);
  try {
    await api.deleteUser(user.id);
  } catch {
    // already deleted — sweeper will catch stragglers
  }
},
\`\`\``,
    tradeoffs: 'Sweeper delayed deletion — ensure prefix never collides with real users in shared envs.',
    notToDo: 'Do not rely only on happy-path afterEach. Do not use production DB without isolation strategy.',
    interview: '"Teardown failed — now what?" — Idempotent delete + tagged data + scheduled sweeper + alert on growth.',
  },
  {
    id: 'FW-L-401', slug: 'tagging-tiering', stage: 4,
    title: 'Tagging and tiering', objective: 'Split smoke, regression, and quarantine tiers with grep and CI policy.',
    subtopics: ['tags', 'grep', 'smoke'],
    diagram: null, mcqs: ['FW-Q-052', 'FW-Q-053'], exercise: null,
    related: ['FW-L-402', 'FW-L-403'],
    concept: 'Tags in titles or `@tag` annotations map to projects or `--grep`. Smoke runs on PR; regression nightly; `@quarantine` excluded from merge gate.',
    why: 'Without tiers, teams either run everything on PR (slow) or nothing (risk). Tagging is org-scale framework design.',
    arch: 'Document tag meanings. Enforce quarantine ticket + owner in CONTRIBUTING. Visible quarantine count in CI summary.',
    impl: `\`\`\`ts
// PR job
// npx playwright test --grep @smoke
// Nightly
// npx playwright test --grep-invert @quarantine
\`\`\``,
    tradeoffs: 'Tag sprawl (@flaky @slow @staging-only) — periodic tag audit.',
    notToDo: 'Do not use quarantine as permanent parking lot. Do not tag without CI job that uses the tag.',
    interview: '"PR vs nightly suite?" — Smoke grep on PR blocks merge; full regression + cross-browser nightly.',
  },
  {
    id: 'FW-L-402', slug: 'sharding-merge', stage: 4,
    title: 'Sharding and merge reports', objective: 'Shard horizontally in CI and merge blob reports into one HTML artifact.',
    subtopics: ['shard', 'blob', 'merge-reports'],
    diagram: 'DIAG-FW-CI', mcqs: ['FW-Q-054', 'FW-Q-055', 'FW-Q-056'], exercise: null,
    related: ['FW-L-401', 'FW-L-210'],
    concept: '`--shard=1/4` splits by file hash across machines. Each shard emits `blob` reporter; `playwright merge-reports` combines for one dashboard.',
    why: '45-minute suites block releases — sharding is architect-level CI knowledge.',
    arch: 'Tune workers per shard before adding shards. Merge step is separate CI job after matrix completes.',
    impl: `\`\`\`ts
reporter: process.env.CI
  ? [['blob'], ['list']]
  : [['html', { open: 'never' }], ['list']],
\`\`\``,
    tradeoffs: 'Static sharding imbalanced if one file is 10× slower — track timing, consider orchestrator at 10k+ tests.',
    notToDo: 'Do not shard before fixing parallel-unsafe tests. Do not lose blob artifacts before merge.',
    interview: '"Nightly still too slow after workers maxed?" — Horizontal sharding + blob merge + smoke tier on PR.',
  },
  {
    id: 'FW-L-403', slug: 'retry-flake-policy', stage: 4,
    title: 'Retry and flake policy', objective: 'Set retries, trace-on-retry, and quarantine rules that diagnose instead of masking.',
    subtopics: ['retries', 'flaky', 'quarantine'],
    diagram: null, mcqs: ['FW-Q-057', 'FW-Q-058', 'FW-Q-059'], exercise: null,
    related: ['FW-L-401', 'FW-L-404'],
    concept: 'CI retries 1–2 with trace on first retry. Local retries 0. Flaky tests get ticket, owner, expiry — not silent retry increase.',
    why: 'Retry inflation hides product and test bugs — leadership interviews focus on governance.',
    arch: 'Central retry in config only. Quarantine job runs `@quarantine` with higher retries for signal, not gating.',
    impl: `\`\`\`ts
export default defineConfig({
  retries: process.env.CI ? 1 : 0,
  use: { trace: 'on-first-retry' },
});
\`\`\``,
    tradeoffs: 'Retries multiply CI time — balance with shard count and smoke scope.',
    notToDo: 'Do not set retries to 5. Do not disable forbidOnly in CI.',
    interview: '"Flaky test policy?" — Diagnose with trace, quarantine with owner+expiry, never raise retries without root cause.',
  },
  {
    id: 'FW-L-404', slug: 'reporting-choices', stage: 4,
    title: 'Reporting choices', objective: 'Pick reporters (list, html, blob, json) for local dev vs CI aggregation.',
    subtopics: ['reporter', 'html', 'json'],
    diagram: null, mcqs: ['FW-Q-060', 'FW-Q-061'], exercise: null,
    related: ['FW-L-402', 'FW-L-405'],
    concept: 'Local: list + html. CI matrix: blob per shard + merge html. JSON for dashboards. Attach traces to failed steps automatically.',
    why: 'Bad reporting → ignored failures. Interviewers ask how devs access artifacts without SSH into CI.',
    arch: 'Upload merged html + trace zip as CI artifacts. Link from PR comment via script.',
    impl: `\`\`\`ts
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results/report.json' }],
],
\`\`\``,
    tradeoffs: 'Custom reporters maintenance cost — use built-ins until Jira integration truly needs custom.',
    notToDo: 'Do not commit html-report folders. Do not publish reports with secrets in traces.',
    interview: '"Aggregate reports from 8 shards?" — blob reporter + merge-reports CLI + artifact upload.',
  },
  {
    id: 'FW-L-405', slug: 'utils-logging-layer', stage: 4,
    title: 'Utils and logging layer', objective: 'Add small typed utils and structured logging without a junk-drawer helpers folder.',
    subtopics: ['utils', 'logging', 'debug'],
    diagram: null, mcqs: ['FW-Q-062'], exercise: null,
    related: ['FW-L-404', 'FW-L-406'],
    concept: 'Utils are pure functions with tests: date formatting, id generators. Logging wraps `test.info().attach` and step labels — not console.log spam.',
    why: 'Mega helpers.ts becomes unmaintainable — interviewers ask how you prevent shared utility breaks.',
    arch: 'Unit-test utils separately. Framework owners review changes to `utils/` and `fixtures/`.',
    impl: `\`\`\`ts
export function logStep(testInfo: TestInfo, message: string) {
  testInfo.annotations.push({ type: 'step', description: message });
}

export function uniqueEmail(prefix = 'e2e') {
  return \`\${prefix}-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}@test.local\`;
}
\`\`\``,
    tradeoffs: 'Too granular utils files — group by domain when file exceeds ~150 lines.',
    notToDo: 'Do not log PII/passwords. Do not add utils that wrap one line of Playwright API without value.',
    interview: '"Shared util broke 500 tests — prevention?" — Unit tests on utils + codeowners + semver on framework package.',
  },
  {
    id: 'FW-L-406', slug: 'monorepo-multiteam', stage: 4,
    title: 'Monorepo and multi-team', objective: 'Structure packages/test-framework for many teams without pattern anarchy.',
    subtopics: ['monorepo', 'packages', 'ownership'],
    diagram: 'DIAG-FW-ARCH', mcqs: ['FW-Q-063', 'FW-Q-064'], exercise: null,
    related: ['FW-L-206', 'FW-L-407'],
    concept: 'Publish internal `@corp/playwright-fixtures` package; teams keep tests in their app repo or `teams/<name>/tests`. CODEOWNERS on shared package.',
    why: 'D26 scenario — 15 teams, three patterns — convergence via shared package, not neutrality.',
    arch: 'Semver + changelog on framework package. Teams pin version; platform team ships migration guides.',
    impl: `\`\`\`ts
// consumer repo
import { test, expect } from '@corp/playwright-fixtures';
import { CheckoutPage } from './pages/checkout-page';

test('checkout', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.open();
});
\`\`\``,
    tradeoffs: 'Monorepo vs multi-repo package — package avoids forcing one git tree while sharing code.',
    notToDo: 'Do not let each team fork fixtures differently. Do not break fixture API without major version bump.',
    interview: '"100 teams on one framework?" — Versioned package, RFC for breaking changes, one sanctioned pattern.',
  },
  {
    id: 'FW-L-407', slug: 'what-not-to-build', stage: 4,
    title: 'What not to build', objective: 'Name abstractions you deliberately skip until scale forces them.',
    subtopics: ['restraint', 'yagni', 'anti-patterns'],
    diagram: 'DIAG-FW-DECIDE', mcqs: ['FW-Q-065', 'FW-Q-066'], exercise: null,
    related: ['FW-L-201', 'FW-L-406'],
    concept: 'Do not build: custom test runner, Selenium-style BaseTest inheritance, hand-rolled parallelism, plugin architecture day one, Screenplay without org buy-in, visual DSL on top of Playwright.',
    why: 'Architect interviews reward restraint — "what would you NOT build?" separates experience from resume buzzwords.',
    arch: 'Revisit decisions at checkpoints (~500, ~5k, ~50k tests). Document deferred items in ADR.',
    impl: `\`\`\`ts
// Good: thin wrapper exporting test + expect from merged fixtures
export { test, expect } from './fixtures';

// Avoid: abstract TestExecutor with strategy factories before you have 2 teams
\`\`\``,
    tradeoffs: 'Under-building delays pain at 5k tests; over-building delays shipping at 50 tests. Default under-build.',
    notToDo: 'Do not adopt every new Playwright feature in production week one. Do not rewrite to microservices pattern for tests.',
    interview: '"What not to build in year one?" — Custom runner, deep inheritance, multi-repo shared utils without versioning.',
  },
];
