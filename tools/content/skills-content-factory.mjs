/** Factory helpers + lesson/MCQ/exercise specs for Skill Modules (SK-*). */

export function mkLesson({
  track,
  num,
  title,
  topic,
  estMinutes = 15,
  prereqIds = [],
  exerciseId = null,
  mcqIds = [],
  concept,
  why,
  example,
  mistakes,
  interview,
  recap,
}) {
  const n = String(num).padStart(2, '0');
  return {
    id: `${track}-L${n}`,
    track,
    num,
    title,
    topic,
    estMinutes,
    prereqIds,
    exerciseId,
    mcqIds,
    concept,
    why,
    example,
    mistakes,
    interview,
    recap: Array.isArray(recap) ? recap : [recap],
  };
}

export function mkMcq({ track, num, topic, difficulty, stem, opts, answerIndex, whyCorrect, whyWrong }) {
  const n = String(num).padStart(3, '0');
  return {
    id: `${track}-Q${n}`,
    track,
    topic,
    difficulty,
    stem,
    opts,
    answerIndex,
    whyCorrect,
    whyWrong,
  };
}

export function mkExercise({
  track,
  num,
  topic,
  kind,
  prompt,
  starter = '',
  solution = '',
  spec = '',
  expectedOutput = '',
  runCommand = '',
}) {
  const n = String(num).padStart(2, '0');
  const id = `${track}-E${n}`;
  return {
    id,
    track,
    topic,
    kind,
    prompt,
    starter,
    solution,
    spec,
    expectedOutput,
    runCommand:
      runCommand ||
      (kind === 'playwright'
        ? 'npm --prefix practice-suite run exercise:skills'
        : 'npm --prefix practice-suite run exercise:skills'),
    specFile:
      kind === 'playwright'
        ? `practice-suite/exercises/skills/${id}-${slugFromTopic(topic)}.spec.ts`
        : `practice-suite/exercises/skills/${id}-${slugFromTopic(topic)}.spec.ts`,
  };
}

function slugFromTopic(topic) {
  return topic.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40);
}

const TS_EXAMPLE = `\`\`\`ts
type ApiUser = { id: string; email: string; role: 'admin' | 'member' };

function isApiUser(value: unknown): value is ApiUser {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.email === 'string';
}
\`\`\``;

export function buildLessons() {
  const lessons = [];
  const push = (...items) => lessons.push(...items);

  push(
    mkLesson({
      track: 'SK-API',
      num: 1,
      title: 'HTTP methods & REST resource model',
      topic: 'api-http-methods',
      mcqIds: ['SK-API-Q001'],
      concept:
        'REST maps nouns (resources) to URLs and verbs (HTTP methods) to actions. GET reads, POST creates, PUT/PATCH updates, DELETE removes. Idempotent methods (GET, PUT, DELETE) should not change server state on repeat; POST is not idempotent.',
      why: 'API tests fail when teams treat every endpoint as POST or ignore idempotency — duplicate charges and phantom records follow.',
      example: `\`\`\`ts
import { test, expect } from '@playwright/test';

test('@skills GET account is idempotent', async ({ request }) => {
  const res = await request.get('/api/accounts/1');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toMatchObject({ id: '1' });
});
\`\`\``,
      mistakes: 'Using GET to mutate data; assuming 200 on DELETE without checking body; hard-coding URLs without baseURL.',
      interview: '"Which HTTP method for a transfer?" — POST for create; GET must not move money.',
      recap: ['Resources are nouns; methods are verbs', 'GET/PUT/DELETE are idempotent', 'Use typed JSON assertions'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 2,
      title: 'Status codes deep-dive',
      topic: 'api-status-codes',
      mcqIds: ['SK-API-Q002', 'SK-API-Q003'],
      concept:
        '2xx success, 3xx redirect, 4xx client error, 5xx server error. In tests, assert the code that matches intent: 201 on create, 404 when resource missing, 401/403 for auth, 422 for validation.',
      why: 'Interviewers ask which code proves a bug vs expected validation — conflating 401 and 403 is a common fail.',
      example: `\`\`\`ts
test('@skills create returns 201', async ({ request }) => {
  const res = await request.post('/api/accounts', { data: { email: 'e2e@test.com' } });
  expect(res.status()).toBe(201);
});
\`\`\``,
      mistakes: 'Only asserting 200; ignoring 204 No Content bodies; treating 500 as pass with retries.',
      interview: 'Explain difference between 401, 403, and 404 with examples from banking APIs.',
      recap: ['Assert status before parsing body', '4xx often expected in negative tests', '5xx is a product bug signal'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 3,
      title: 'Request/response anatomy',
      topic: 'api-rest-basics',
      mcqIds: ['SK-API-Q004'],
      concept:
        'An HTTP message has start line, headers, optional body. Content-Type drives parsing. Playwright `request` returns APIResponse with status(), headers(), json(), text().',
      why: 'Misreading Content-Type causes flaky JSON parse errors and wrong assertions.',
      example: `\`\`\`ts
const res = await request.get('/api/health');
expect(res.headers()['content-type']).toContain('application/json');
const body = await res.json();
expect(body.status).toBe('ok');
\`\`\``,
      mistakes: 'Calling json() on empty 204; ignoring charset in Content-Type; not logging response on failure.',
      interview: 'Walk through headers you inspect when an API test fails in CI.',
      recap: ['Check Content-Type', 'Use json() or text() appropriately', 'Log response on failure'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 4,
      title: 'Auth types for API tests',
      topic: 'api-auth-headers',
      mcqIds: ['SK-API-Q005'],
      concept:
        'Basic (Authorization: Basic …), Bearer JWT, API keys (header or query), session cookies. OAuth2 awareness: auth server issues token; resource server validates.',
      why: 'Senior roles expect you to seed auth once and reuse — not login via UI for every API call.',
      example: `\`\`\`ts
test('@skills bearer token', async ({ request }) => {
  const res = await request.get('/api/me', {
    headers: { Authorization: 'Bearer test-token' },
  });
  expect(res.ok()).toBeTruthy();
});
\`\`\``,
      mistakes: 'Committing real tokens; using UI login for pure API suites; mixing cookie and bearer without understanding.',
      interview: 'How do you store API credentials in CI safely?',
      recap: ['Prefer Bearer or session from setup project', 'Never commit secrets', 'Use env vars in CI'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 5,
      title: 'Playwright request fixture vs APIRequestContext',
      topic: 'api-request-fixture',
      mcqIds: ['SK-API-Q006'],
      exerciseId: 'SK-API-E01',
      concept:
        '`request` fixture is a pre-configured APIRequestContext sharing config baseURL and extra headers. `playwright.request.newContext()` creates isolated contexts for multi-tenant tests.',
      why: 'This is the #1 API testing question in Playwright interviews.',
      example: `\`\`\`ts
test('@skills request fixture', async ({ request }) => {
  const res = await request.get('/api/ping');
  expect(res.status()).toBe(200);
});
\`\`\``,
      mistakes: 'Using page.request when browser not needed; creating new context per assertion without disposal.',
      interview: 'When would you use a standalone APIRequestContext instead of the fixture?',
      recap: ['request fixture uses config baseURL', 'Dispose custom contexts', 'Browserless API tests are fast'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 6,
      title: 'Sharing auth between API and browser',
      topic: 'api-hybrid-ui',
      mcqIds: ['SK-API-Q007'],
      exerciseId: 'SK-API-E02',
      concept:
        'Run auth via API, save storageState, load in UI project. Or set cookies on context via APIResponse headers.',
      why: 'Hybrid arrange-via-API / assert-via-UI is the professional pattern for stable E2E.',
      example: `\`\`\`ts
// setup/auth.setup.ts — login via API, save storage
test('authenticate', async ({ request }) => {
  const res = await request.post('/api/login', { data: { user: 'e2e', pass: 'secret' } });
  expect(res.ok()).toBeTruthy();
  await request.storageState({ path: 'playwright/.auth/user.json' });
});
\`\`\``,
      mistakes: 'UI login in every test; not invalidating storage when roles change.',
      interview: 'Describe storageState flow for admin vs member roles.',
      recap: ['API login once', 'storageState for UI projects', 'Separate roles = separate files'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 7,
      title: 'JSON schema validation patterns',
      topic: 'api-json-assertions',
      mcqIds: ['SK-API-Q008'],
      concept:
        'Assert shape with toMatchObject, property checks, and TypeScript narrowing. Prefer explicit fields over snapshotting entire payloads.',
      why: 'Untyped JSON assertions hide contract drift until production.',
      example: TS_EXAMPLE,
      mistakes: 'Snapshotting timestamps; asserting entire response when only id matters; using any.',
      interview: 'How do you validate API contracts without a heavy schema library?',
      recap: ['toMatchObject for shape', 'Type guards for unknown', 'Avoid full snapshots on dynamic fields'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 8,
      title: 'Contract testing basics',
      topic: 'contract-testing',
      mcqIds: ['SK-API-Q009'],
      concept:
        'Consumer tests define expected provider behavior; versioning and backward compatibility prevent breaking clients. Playwright API tests often serve as lightweight contract checks.',
      why: 'Microservice teams ask how you catch breaking API changes before merge.',
      example: `\`\`\`ts
test('@skills contract: account shape', async ({ request }) => {
  const res = await request.get('/api/accounts/1');
  expect(res.status()).toBe(200);
  await expect(res).toMatchObject({ json: { id: expect.any(String), balance: expect.any(Number) } });
});
\`\`\``,
      mistakes: 'Testing provider internals; no version header checks; duplicating same contract in 50 E2E tests.',
      interview: 'Difference between contract tests and full E2E for an API change?',
      recap: ['Consumer-driven contracts', 'Version breaking changes explicitly', 'Keep contract tests fast'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 9,
      title: 'Network interception & mocking',
      topic: 'network-mocking',
      mcqIds: ['SK-API-Q010'],
      exerciseId: 'SK-API-E03',
      concept:
        'Use page.route and route.fulfill for deterministic UI tests when backend is flaky or unavailable. Prefer fulfilling JSON over abort unless testing error UI.',
      why: 'Deterministic mocks separate UI logic tests from environment instability.',
      example: `\`\`\`ts
test('@skills mock accounts API', async ({ page }) => {
  await page.route('**/api/accounts', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: '1' }]) }),
  );
  await page.goto('/accounts');
  await expect(page.getByRole('row')).toHaveCount(1);
});
\`\`\``,
      mistakes: 'Using networkidle; mocking after navigation; forgetting to unroute in parallel workers.',
      interview: 'When mock vs hit real API in CI?',
      recap: ['route.fulfill for happy path', 'Unroute in fixture teardown', 'Never networkidle'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 10,
      title: 'Negative & edge API testing',
      topic: 'api-negative-testing',
      mcqIds: ['SK-API-Q011'],
      concept:
        'Test 400 validation, empty arrays, null optional fields, boundary values. Negative tests document API contracts as much as happy paths.',
      why: 'Interviewers probe whether you only test sunny-day scenarios.',
      example: `\`\`\`ts
test('@skills invalid email returns 422', async ({ request }) => {
  const res = await request.post('/api/users', { data: { email: 'not-an-email' } });
  expect(res.status()).toBe(422);
});
\`\`\``,
      mistakes: 'Only happy path; not asserting error body shape; using invalid data that passes client validation.',
      interview: 'Give three negative API test cases for a transfer endpoint.',
      recap: ['Assert error status and body', 'Boundary values', 'Empty collections'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 11,
      title: 'Data setup/teardown via API',
      topic: 'api-setup-teardown',
      mcqIds: ['SK-API-Q012'],
      concept:
        'Create test data via POST, delete via DELETE in afterEach or fixture teardown. Faster and more reliable than UI-only setup.',
      why: 'Slow UI setup is the main cause of long CI times and order-dependent tests.',
      example: `\`\`\`ts
test('@skills seed via API', async ({ request }) => {
  const create = await request.post('/api/accounts', { data: { balance: 1000 } });
  const { id } = await create.json();
  const res = await request.get(\`/api/accounts/\${id}\`);
  expect(res.ok()).toBeTruthy();
});
\`\`\``,
      mistakes: 'Shared golden accounts; no cleanup; setup in beforeAll without worker isolation.',
      interview: 'How do you isolate API-created data in parallel CI?',
      recap: ['Unique data per test', 'API teardown', 'Fixtures own cleanup'],
    }),
    mkLesson({
      track: 'SK-API',
      num: 12,
      title: 'Organizing an API test suite',
      topic: 'api-client-fixture',
      mcqIds: ['SK-API-Q013', 'SK-API-Q014'],
      concept:
        'Group by resource or user journey. Extract API client helpers in fixtures — thin wrappers around request with typed methods.',
      why: 'Maintainability question — fat tests vs layered API clients.',
      example: `\`\`\`ts
import { test as base } from '@playwright/test';

type AccountsApi = { create(email: string): Promise<string> };
export const test = base.extend<{ accounts: AccountsApi }>({
  accounts: async ({ request }, use) => {
    await use({
      async create(email) {
        const res = await request.post('/api/accounts', { data: { email } });
        const body = await res.json();
        return body.id as string;
      },
    });
  },
});
\`\`\``,
      mistakes: 'Copy-pasting URL strings; no baseURL; mixing API and UI assertions in one 200-line test.',
      interview: 'Folder structure for a growing API suite?',
      recap: ['Thin API fixtures', 'Typed helpers', 'Separate API vs E2E projects'],
    }),
  );

  // SK-TS lessons (10)
  const tsTopics = [
    ['Strict mode & compiler options', 'ts-strict'],
    ['unknown vs any vs never', 'ts-type-guards'],
    ['Generics & constrained type params', 'ts-generics'],
    ['Utility types for test data', 'ts-utility-types'],
    ['Type narrowing & guards', 'ts-type-guards'],
    ['Discriminated unions for async state', 'ts-unions'],
    ['Literal unions & as const', 'ts-unions'],
    ['Async Promise typing', 'ts-async-await'],
    ['Typing Playwright fixtures & POMs', 'ts-interfaces'],
    ['Mapped & conditional types (awareness)', 'ts-generics'],
  ];
  tsTopics.forEach(([title, topic], i) => {
    push(
      mkLesson({
        track: 'SK-TS',
        num: i + 1,
        title,
        topic,
        mcqIds: i < 6 ? [`SK-TS-Q${String(i * 2 + 1).padStart(3, '0')}`, `SK-TS-Q${String(i * 2 + 2).padStart(3, '0')}`].filter((id) => parseInt(id.split('-Q')[1], 10) <= 12) : [`SK-TS-Q${String(11 + (i - 6)).padStart(3, '0')}`],
        exerciseId: i < 4 ? `SK-TS-E${String(i + 1).padStart(2, '0')}` : null,
        concept: `${title}: TypeScript gives compile-time safety for test code — treat specs and page objects as production code with strict null checks and explicit return types.`,
        why: '2026 SDET interviews test whether you model product states with types, not whether you memorized Partial<T> syntax alone.',
        example: TS_EXAMPLE,
        mistakes: 'Using any for API responses; ignoring strictNullChecks; @ts-ignore on awaits.',
        interview: `Explain how ${title.toLowerCase()} prevents a real test bug.`,
        recap: ['strict: true in tsconfig', 'Narrow unknown API data', 'Type fixtures explicitly'],
      }),
    );
  });

  // Fix TS mcqIds - simplify: assign in buildMcqs instead
  lessons.filter((l) => l.track === 'SK-TS').forEach((l, i) => {
    const base = i * 2 + 1;
    l.mcqIds = [`SK-TS-Q${String(base).padStart(3, '0')}`];
    if (base + 1 <= 12) l.mcqIds.push(`SK-TS-Q${String(base + 1).padStart(3, '0')}`);
    if (i >= 6) l.mcqIds = [`SK-TS-Q${String(11 + (i - 6)).padStart(3, '0')}`];
  });

  // SK-SQL (8)
  const sqlLessons = [
    ['Relational model for testers', 'sql-select'],
    ['SELECT/WHERE/ORDER BY', 'sql-select'],
    ['JOINs & ON vs WHERE', 'sql-joins'],
    ['GROUP BY/HAVING & aggregates', 'sql-aggregates'],
    ['Subqueries vs joins', 'sql-subqueries'],
    ['Test-data validation queries', 'sql-constraints'],
    ['Integrity & constraints', 'sql-constraints'],
    ['QA SQL interview traps', 'sql-subqueries'],
  ];
  sqlLessons.forEach(([title, topic], i) => {
    push(
      mkLesson({
        track: 'SK-SQL',
        num: i + 1,
        title,
        topic,
        mcqIds: [`SK-SQL-Q${String(i + 1).padStart(3, '0')}`, `SK-SQL-Q${String(i + 2).padStart(3, '0')}`].filter((_, j) => i * 2 + j + 1 <= 10),
        exerciseId: i < 5 ? `SK-SQL-E${String(i + 1).padStart(2, '0')}` : null,
        concept: `${title}: SQL lets testers verify backend truth — row counts, orphans, duplicates — faster than clicking through UI.`,
        why: 'SQL appears in most SDET interviews for data verification and debugging failed tests.',
        example: '```sql\nSELECT u.email, COUNT(s.id) AS sessions\nFROM users u\nLEFT JOIN sessions s ON s.user_id = u.id\nGROUP BY u.email;\n```',
        mistakes: 'NULL in outer joins; forgetting GROUP BY columns; using SELECT * in production checks.',
        interview: 'Write a query to find duplicate emails in a users table.',
        recap: ['LEFT JOIN for optional relations', 'HAVING filters groups', 'COUNT for integrity checks'],
      }),
    );
  });

  // SK-GIT (6)
  ['Repo/branch model', 'Feature-branch & PR hygiene', 'Merge vs rebase', 'Conflict resolution', 'Cherry-pick, stash, bisect', 'Branch protection & CI gates'].forEach(
    (title, i) => {
      const topics = ['git-workflow', 'git-branching', 'git-merge-rebase', 'git-conflicts', 'git-bisect', 'git-ci'];
      push(
        mkLesson({
          track: 'SK-GIT',
          num: i + 1,
          title,
          topic: topics[i],
          mcqIds: [`SK-GIT-Q${String(i + 1).padStart(3, '0')}`, `SK-GIT-Q${String(i + 2).padStart(3, '0')}`].filter((_, j) => i + j + 1 <= 8),
          exerciseId: i < 2 ? `SK-GIT-E${String(i + 1).padStart(2, '0')}` : null,
          concept: `${title}: Git is how QA engineers collaborate on test code, bisect flaky commits, and understand CI triggers.`,
          why: 'Universal interview topic for any team using GitHub/GitLab.',
          example: '```bash\ngit bisect start\ngit bisect bad HEAD\ngit bisect good v1.2.0\n# run test, then git bisect good|bad\n```',
          mistakes: 'Rebasing shared branches; force-push to main; huge PRs without description.',
          interview: `When would you use ${title.toLowerCase()} in a test repo?`,
          recap: ['Small PRs with tests', 'Never rebase shared main', 'Bisect links commits to flakes'],
        }),
      );
    },
  );

  // SK-HTTP (6)
  ['Request/response lifecycle', 'Headers for QA', 'Cookies & sessions', 'CORS & preflight', 'Caching & ETag', 'HTTPS/TLS awareness'].forEach((title, i) => {
    const topics = ['http-anatomy', 'http-headers-cookies', 'http-headers-cookies', 'http-cors', 'http-caching', 'http-tls'];
    push(
      mkLesson({
        track: 'SK-HTTP',
        num: i + 1,
        title,
        topic: topics[i],
        mcqIds: [`SK-HTTP-Q${String(i + 1).padStart(3, '0')}`, `SK-HTTP-Q${String(i + 2).padStart(3, '0')}`].filter((_, j) => i + j + 1 <= 8),
        exerciseId: i === 5 ? 'SK-HTTP-E01' : null,
        concept: `${title}: HTTP fundamentals explain why API and browser tests behave differently — headers, cookies, CORS, cache.`,
        why: 'Underpins API track and security awareness; interviewers connect HTTP to flaky tests.',
        example: 'Inspect `Set-Cookie` for HttpOnly and SameSite flags when testing session persistence.',
        mistakes: 'Ignoring CORS in component tests; not clearing cookies between roles; assuming 304 is error.',
        interview: 'Explain CORS preflight in one minute.',
        recap: ['Content-Type matters', 'SameSite cookies affect auth', '304 is cache hit'],
      }),
    );
  });

  // SK-SEC (5)
  ['OWASP Top 10 overview', 'XSS verification (defensive)', 'CSRF defenses', 'Broken access control / IDOR', 'Auth & session testing'].forEach((title, i) => {
    const topics = ['sec-owasp', 'sec-xss', 'sec-csrf', 'sec-session', 'sec-secrets'];
    push(
      mkLesson({
        track: 'SK-SEC',
        num: i + 1,
        title,
        topic: topics[i],
        mcqIds: [`SK-SEC-Q${String(i + 1).padStart(3, '0')}`, `SK-SEC-Q${String(i + 2).padStart(3, '0')}`].filter((_, j) => i + j + 1 <= 7),
        concept: `${title}: QA verifies defenses exist — output encoding, CSRF tokens, authorization checks — without exploit tutorials.`,
        why: 'Regulated teams expect testers to recognize OWASP categories and write verification tests.',
        example: 'Assert Content-Security-Policy header present on login page; verify CSRF token field in transfer form.',
        mistakes: 'Running exploit payloads in CI; storing prod creds in tests; skipping authz negative cases.',
        interview: 'How does QA verify XSS is mitigated without attacking production?',
        recap: ['Defensive verification only', 'Check headers and tokens', 'No secrets in repos'],
      }),
    );
  });

  return lessons;
}

export function buildMcqs() {
  const mcqs = [];
  const tracks = [
    { track: 'SK-API', count: 14, topic: 'api-request-fixture' },
    { track: 'SK-TS', count: 12, topic: 'ts-strict' },
    { track: 'SK-SQL', count: 10, topic: 'sql-joins' },
    { track: 'SK-GIT', count: 8, topic: 'git-merge-rebase' },
    { track: 'SK-HTTP', count: 8, topic: 'http-cors' },
    { track: 'SK-SEC', count: 7, topic: 'sec-owasp' },
  ];
  for (const { track, count, topic } of tracks) {
    for (let i = 1; i <= count; i++) {
      mcqs.push(
        mkMcq({
          track,
          num: i,
          topic,
          difficulty: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
          stem: `${track} question ${i}: Which approach is correct for professional Playwright QA work?`,
          opts: [
            'Use web-first locators, auto-waiting assertions, and fixtures for setup',
            'Add waitForTimeout before every click',
            'Use force: true when elements are stubborn',
            'Wait for networkidle before asserting',
          ],
          answerIndex: 0,
          whyCorrect: 'Web-first locators and auto-waiting are Playwright best practices; fixtures centralize setup.',
          whyWrong: [
            'Fixed sleeps hide timing bugs and slow CI.',
            'force:true bypasses actionability checks.',
            'networkidle is deprecated and flaky for SPAs.',
          ],
        }),
      );
    }
  }
  return mcqs;
}

export function buildExercises() {
  return [
    mkExercise({
      track: 'SK-API',
      num: 1,
      topic: 'api-request-fixture',
      kind: 'playwright',
      prompt: 'Implement getStatusCode(path) using Playwright request fixture pattern in pure TS helper.',
      starter: `export async function getStatusCode(baseUrl: string, path: string): Promise<number> {
  void baseUrl;
  void path;
  return 0;
}`,
      solution: `import { request as pwRequest } from '@playwright/test';

export async function getStatusCode(baseUrl: string, path: string): Promise<number> {
  const ctx = await pwRequest.newContext({ baseURL: baseUrl });
  const res = await ctx.get(path);
  const code = res.status();
  await ctx.dispose();
  return code;
}`,
      spec: `import { test, expect } from '@playwright/test';
import { getStatusCode } from './SK-API-E01-api-request-fixture';

test('@skills SK-API-E01 status helper', async () => {
  const code = await getStatusCode('https://example.com', '/');
  expect(code).toBeGreaterThanOrEqual(200);
  expect(code).toBeLessThan(500);
});`,
    }),
    mkExercise({
      track: 'SK-API',
      num: 2,
      topic: 'api-hybrid-ui',
      kind: 'playwright',
      prompt: 'Implement hasAuthCookie(cookies) returning true when session cookie present.',
      starter: `export type Cookie = { name: string; value: string };
export function hasAuthCookie(cookies: Cookie[]): boolean {
  void cookies;
  return false;
}`,
      solution: `export type Cookie = { name: string; value: string };
export function hasAuthCookie(cookies: Cookie[]): boolean {
  return cookies.some((c) => c.name === 'session' && c.value.length > 0);
}`,
      spec: `import { test, expect } from '@playwright/test';
import { hasAuthCookie } from './SK-API-E02-api-hybrid-ui';

test('@skills SK-API-E02 auth cookie', () => {
  expect(hasAuthCookie([{ name: 'session', value: 'abc' }])).toBe(true);
  expect(hasAuthCookie([{ name: 'other', value: 'x' }])).toBe(false);
});`,
    }),
    mkExercise({
      track: 'SK-API',
      num: 3,
      topic: 'network-mocking',
      kind: 'playwright',
      prompt: 'Implement mockJsonRoute(body) returning a fulfill handler.',
      starter: `export function mockJsonRoute(body: unknown) {
  void body;
  return async () => {};
}`,
      solution: `import type { Route } from '@playwright/test';

export function mockJsonRoute(body: unknown) {
  return async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  };
}`,
      spec: `import { test, expect } from '@playwright/test';
import { mockJsonRoute } from './SK-API-E03-network-mocking';

test('@skills SK-API-E03 mock handler', async ({ page }) => {
  await page.route('**/api/x', mockJsonRoute({ ok: true }));
  await page.setContent('<script>fetch("/api/x").then(r=>r.json()).then(d=>document.body.textContent=String(d.ok))</script>');
  await expect(page.locator('body')).toHaveText('true');
});`,
    }),
    ...[1, 2, 3, 4].map((n) =>
      mkExercise({
        track: 'SK-TS',
        num: n,
        topic: 'ts-factories',
        kind: 'playwright',
        prompt: `TS drill ${n}: implement buildUser with typed email.`,
        starter: `export type User = { email: string; role: 'admin' | 'member' };
export function buildUser(email: string): User {
  return { email, role: 'admin' };
}`,
        solution: `export type User = { email: string; role: 'admin' | 'member' };
export function buildUser(email: string, role: User['role'] = 'member'): User {
  return { email, role };
}`,
        spec: `import { test, expect } from '@playwright/test';
import { buildUser } from './SK-TS-E${String(n).padStart(2, '0')}-ts-factories';

test('@skills SK-TS-E${String(n).padStart(2, '0')}', () => {
  expect(buildUser('a@test.com').role).toBe('member');
});`,
      }),
    ),
    ...[1, 2, 3, 4, 5].map((n) =>
      mkExercise({
        track: 'SK-SQL',
        num: n,
        topic: 'sql-joins',
        kind: 'text',
        prompt: `SQL exercise ${n}: write query matching expected output.`,
        starter: `export function verificationQuery(): string {
  return '-- Write SQL here';
}`,
        solution: `export function verificationQuery(): string {
  return 'SELECT 1;';
}`,
        expectedOutput: '1',
        spec: `import { test, expect } from '@playwright/test';
import { normalizeSql } from './sql-utils';
import { verificationQuery } from './SK-SQL-E${String(n).padStart(2, '0')}-sql-joins';

test('@skills SK-SQL-E${String(n).padStart(2, '0')}', () => {
  const userAnswer = normalizeSql(verificationQuery());
  expect(userAnswer).toContain('select');
});`,
      }),
    ),
    mkExercise({
      track: 'SK-GIT',
      num: 1,
      topic: 'git-conflicts',
      kind: 'text',
      prompt: 'Resolve merge conflict markers in provided file text.',
      starter: `export function resolveConflict(raw: string): string {
  void raw;
  return '';
}`,
      solution: `export function resolveConflict(raw: string): string {
  const m = raw.match(/=======\\r?\\n([\\s\\S]*?)\\r?\\n>>>>>>>/);
  return (m?.[1] ?? '').trim();
}`,
      expectedOutput: 'const x = 2;',
      spec: `import { test, expect } from '@playwright/test';
import { resolveConflict } from './SK-GIT-E01-git-conflicts';

test('@skills SK-GIT-E01 conflict', () => {
  const raw = '<<<<<<< HEAD\\nconst x = 1;\\n=======\\nconst x = 2;\\n>>>>>>> feature';
  expect(resolveConflict(raw).trim()).toBe('const x = 2;');
});`,
    }),
    mkExercise({
      track: 'SK-GIT',
      num: 2,
      topic: 'git-merge-rebase',
      kind: 'text',
      prompt: 'Return correct ordered git commands after failed rebase.',
      starter: `export function rebaseContinueSteps(): string[] {
  return [];
}`,
      solution: `export function rebaseContinueSteps(): string[] {
  return ['git add .', 'git rebase --continue'];
}`,
      spec: `import { test, expect } from '@playwright/test';
import { rebaseContinueSteps } from './SK-GIT-E02-git-merge-rebase';

test('@skills SK-GIT-E02 rebase', () => {
  expect(rebaseContinueSteps()).toEqual(['git add .', 'git rebase --continue']);
});`,
    }),
    mkExercise({
      track: 'SK-HTTP',
      num: 1,
      topic: 'http-cors',
      kind: 'text',
      prompt: 'Given headers, identify CORS issue type.',
      starter: `export function diagnoseCors(hasOrigin: boolean, hasCredentials: boolean): string {
  void hasOrigin;
  void hasCredentials;
  return 'unknown';
}`,
      solution: `export function diagnoseCors(hasOrigin: boolean, hasCredentials: boolean): string {
  if (!hasOrigin) return 'missing-access-control-allow-origin';
  if (hasCredentials) return 'credentials-requires-specific-origin';
  return 'ok';
}`,
      spec: `import { test, expect } from '@playwright/test';
import { diagnoseCors } from './SK-HTTP-E01-http-cors';

test('@skills SK-HTTP-E01 cors', () => {
  expect(diagnoseCors(false, false)).toBe('missing-access-control-allow-origin');
});`,
    }),
  ];
}
