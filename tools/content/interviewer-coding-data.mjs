/** Interviewer Mode live coding exercises — unit-style, no live server required */
export const CODING = [
  {
    id: 'IV-CODE-001',
    slug: 'locator-strategy',
    level: 'junior',
    timebox: 18,
    difficulty: 2,
    topic: 'locators',
    goal: 'Given a DOM snippet and candidate locators, rank choices by Playwright web-first priority and return the best legal locator string.',
    script:
      'Say: "Implement `pickBestLocator` for our stub page interface. Prefer role+name, then label, then test id — never CSS xpath or banned patterns." Allow 15 minutes coding, 3 minutes walkthrough.',
    task:
      'Implement `pickBestLocator(candidates: LocatorCandidate[]): string` returning the highest-priority valid locator. Invalid candidates (css, xpath, banned substrings) are skipped. Tie-break by array order.',
    starter: `export type LocatorCandidate = {
  strategy: 'role' | 'label' | 'testid' | 'text' | 'css' | 'xpath';
  value: string;
  name?: string;
};

const BANNED = ['waitForTimeout', 'force: true', 'networkidle'] as const;

/** TODO: return best candidate's value; throw if none valid */
export function pickBestLocator(candidates: LocatorCandidate[]): string {
  return candidates[0]?.value ?? '';
}

export function isBanned(code: string): boolean {
  return BANNED.some((token) => code.includes(token));
}
`,
    solution: `export type LocatorCandidate = {
  strategy: 'role' | 'label' | 'testid' | 'text' | 'css' | 'xpath';
  value: string;
  name?: string;
};

const BANNED = ['waitForTimeout', 'force: true', 'networkidle'] as const;

const PRIORITY: LocatorCandidate['strategy'][] = ['role', 'label', 'testid', 'text'];

export function isBanned(code: string): boolean {
  return BANNED.some((token) => code.includes(token));
}

export function pickBestLocator(candidates: LocatorCandidate[]): string {
  for (const strategy of PRIORITY) {
    const match = candidates.find(
      (c) => c.strategy === strategy && !isBanned(c.value) && c.value.length > 0,
    );
    if (match) return match.value;
  }
  throw new Error('No valid locator candidate');
}
`,
    evaluate: [
      'Correct priority order (role before label before testid)',
      'Rejects css/xpath strategies',
      'Rejects banned substrings in values',
      'Throws when no valid candidate',
    ],
    mistakes: [
      'Picking first array element regardless of strategy',
      'Allowing css when role exists',
      'Returning empty string instead of throwing',
    ],
    hints: [
      'Iterate PRIORITY array outer loop, candidates inner.',
      'Skip strategies css and xpath entirely.',
      'Use isBanned on each candidate value.',
    ],
    rubric: [
      ['Technical depth', 'Implements priority walk and validation'],
      ['Code quality', 'Clear types, no side effects'],
      ['Process', 'Explains why role beats test id'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { pickBestLocator, isBanned } from './IV-CODE-001-locator-strategy';

test('IV-CODE-001: locator strategy', () => {
  expect(isBanned('await page.waitForTimeout(1)')).toBe(true);
  const best = pickBestLocator([
    { strategy: 'css', value: '.btn-primary' },
    { strategy: 'testid', value: 'submit' },
    { strategy: 'role', value: 'button[name="Sign in"]', name: 'Sign in' },
  ]);
  expect(best).toBe('button[name="Sign in"]');
  expect(() =>
    pickBestLocator([{ strategy: 'css', value: '.x' }]),
  ).toThrow();
});`,
  },
  {
    id: 'IV-CODE-002',
    slug: 'anti-patterns',
    level: 'junior',
    timebox: 15,
    difficulty: 2,
    topic: 'code-quality',
    goal: 'Scan a test code string and return all banned anti-patterns present.',
    script:
      'Say: "Our linter needs a `findAntiPatterns` helper for PR review. Return every banned token found." This mirrors real review duty.',
    task: 'Implement `findAntiPatterns(code: string): string[]` returning all matching banned tokens (may be multiple).',
    starter: `const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;

export function findAntiPatterns(code: string): string[] {
  return [];
}
`,
    solution: `const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;

export function findAntiPatterns(code: string): string[] {
  return BANNED.filter((token) => code.includes(token));
}
`,
    evaluate: ['Detects each banned token', 'Returns empty array when clean', 'Does not false-positive on getByRole'],
    mistakes: ['Only returning first match', 'Case-sensitive misses', 'Modifying BANNED list'],
    hints: ['Filter BANNED with includes.', 'Return all matches.', 'Empty array when none.'],
    rubric: [
      ['Technical depth', 'Correct substring scan'],
      ['Judgment', 'Can explain why each token is banned'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { findAntiPatterns } from './IV-CODE-002-anti-patterns';

test('IV-CODE-002: anti-patterns', () => {
  expect(findAntiPatterns('await page.waitForTimeout(1000)')).toContain('waitForTimeout');
  expect(findAntiPatterns('await page.getByRole("button").click()')).toEqual([]);
});`,
  },
  {
    id: 'IV-CODE-003',
    slug: 'fixture-scope',
    level: 'mid',
    timebox: 15,
    difficulty: 3,
    topic: 'fixtures',
    goal: 'Classify fixture definitions into correct Playwright scope: test, worker, or invalid.',
    script:
      'Say: "Review these fixture descriptors and return the scope each should use." Discuss worker vs test after implementation.',
    task:
      'Implement `classifyFixture(name: string): \'test\' | \'worker\' | \'invalid\'` using rules: apiClient/dbPool/browserContext→worker; page/user→test; unknown→invalid.',
    starter: `const WORKER = new Set(['apiClient', 'dbPool', 'sharedToken']);
const TEST = new Set(['page', 'user', 'checkoutCart']);

export function classifyFixture(name: string): 'test' | 'worker' | 'invalid' {
  return 'test';
}
`,
    solution: `const WORKER = new Set(['apiClient', 'dbPool', 'sharedToken']);
const TEST = new Set(['page', 'user', 'checkoutCart']);

export function classifyFixture(name: string): 'test' | 'worker' | 'invalid' {
  if (WORKER.has(name)) return 'worker';
  if (TEST.has(name)) return 'test';
  return 'invalid';
}
`,
    evaluate: ['Correct worker fixtures', 'Correct test fixtures', 'Invalid for unknown names'],
    mistakes: ['Everything as test scope', 'Using worker for page'],
    hints: ['Check WORKER set first.', 'page is always test scope.', 'Unknown names are invalid.'],
    rubric: [
      ['Technical depth', 'Scope rules correct'],
      ['Communication', 'Explains pollution risk of wrong scope'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { classifyFixture } from './IV-CODE-003-fixture-scope';

test('IV-CODE-003: fixture scope', () => {
  expect(classifyFixture('apiClient')).toBe('worker');
  expect(classifyFixture('page')).toBe('test');
  expect(classifyFixture('unknownFixture')).toBe('invalid');
});`,
  },
  {
    id: 'IV-CODE-004',
    slug: 'auth-projects',
    level: 'mid',
    timebox: 15,
    difficulty: 3,
    topic: 'storageState',
    goal: 'Build the projects array for setup + authenticated consumer pattern.',
    script:
      'Say: "Return playwright.config projects for setup writing storageState and chromium depending on it." No live auth needed.',
    task:
      'Implement `buildAuthProjects()` returning `[setup, chromium]` where setup has `testMatch: /auth\\.setup\\.ts/` and chromium has `dependencies: [\'setup\']` and `storageState: \'playwright/.auth/user.json\'`.',
    starter: `export type AuthProject = {
  name: string;
  testMatch?: RegExp;
  dependencies?: string[];
  storageState?: string;
};

export function buildAuthProjects(): AuthProject[] {
  return [{ name: 'chromium' }];
}
`,
    solution: `export type AuthProject = {
  name: string;
  testMatch?: RegExp;
  dependencies?: string[];
  storageState?: string;
};

export function buildAuthProjects(): AuthProject[] {
  return [
    { name: 'setup', testMatch: /auth\\.setup\\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      storageState: 'playwright/.auth/user.json',
    },
  ];
}
`,
    evaluate: ['Setup project first', 'Consumer depends on setup', 'storageState path correct'],
    mistakes: ['Missing dependencies', 'Same project for setup and tests', 'Wrong path'],
    hints: ['Two projects minimum.', 'Consumer name chromium.', 'testMatch is RegExp for setup only.'],
    rubric: [
      ['Technical depth', 'Setup project pattern'],
      ['Judgment', 'Explains why not UI login every test'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { buildAuthProjects } from './IV-CODE-004-auth-projects';

test('IV-CODE-004: auth projects', () => {
  const projects = buildAuthProjects();
  expect(projects[0]?.name).toBe('setup');
  expect(projects[1]?.dependencies).toEqual(['setup']);
  expect(projects[1]?.storageState).toBe('playwright/.auth/user.json');
});`,
  },
  {
    id: 'IV-CODE-005',
    slug: 'route-cleanup',
    level: 'mid',
    timebox: 12,
    difficulty: 3,
    topic: 'network',
    goal: 'Validate that a route handler registration includes proper cleanup via unroute.',
    script: 'Say: "Flag route mocks that leak between tests." Pure string analysis.',
    task:
      'Implement `hasRouteCleanup(code: string): boolean` — true when code includes both `page.route` and `page.unroute` (or `await route.fallback()` with unroute in finally).',
    starter: `export function hasRouteCleanup(code: string): boolean {
  return code.includes('page.route');
}
`,
    solution: `export function hasRouteCleanup(code: string): boolean {
  const hasRoute = code.includes('page.route');
  const hasUnroute = code.includes('page.unroute') || code.includes('unrouteAll');
  return hasRoute && hasUnroute;
}
`,
    evaluate: ['Requires both route and unroute', 'False when only route', 'True for unrouteAll pattern'],
    mistakes: ['Route alone passes', 'Ignoring parallel leakage'],
    hints: ['Both route and unroute required.', 'unrouteAll counts.', 'Route without cleanup fails.'],
    rubric: [
      ['Technical depth', 'Detects cleanup'],
      ['Judgment', 'Explains parallel pollution'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { hasRouteCleanup } from './IV-CODE-005-route-cleanup';

test('IV-CODE-005: route cleanup', () => {
  expect(hasRouteCleanup('await page.route("**", h); await page.unroute("**")')).toBe(true);
  expect(hasRouteCleanup('await page.route("**", h)')).toBe(false);
});`,
  },
  {
    id: 'IV-CODE-006',
    slug: 'flake-category',
    level: 'mid',
    timebox: 10,
    difficulty: 3,
    topic: 'flaky',
    goal: 'Categorize failure descriptions into timing, data, environment, or assertion.',
    script: 'Say: "Triage these CI failures — return category for each message."',
    task:
      'Implement `categorizeFailure(message: string): FlakeCategory` using keyword rules: timeout/wait→timing; duplicate/unique→data; linux/mac/docker→environment; else assertion.',
    starter: `export type FlakeCategory = 'timing' | 'data' | 'environment' | 'assertion';

export function categorizeFailure(message: string): FlakeCategory {
  return 'assertion';
}
`,
    solution: `export type FlakeCategory = 'timing' | 'data' | 'environment' | 'assertion';

export function categorizeFailure(message: string): FlakeCategory {
  const m = message.toLowerCase();
  if (m.includes('timeout') || m.includes('waiting')) return 'timing';
  if (m.includes('duplicate') || m.includes('unique')) return 'data';
  if (m.includes('linux') || m.includes('mac') || m.includes('docker')) return 'environment';
  return 'assertion';
}
`,
    evaluate: ['Timing keywords', 'Data collision keywords', 'Environment keywords'],
    mistakes: ['Everything assertion', 'Ignoring environment signals'],
    hints: ['Check timeout first.', 'duplicate → data.', 'OS names → environment.'],
    rubric: [
      ['Problem-solving', 'Systematic triage'],
      ['Technical depth', 'Category rules'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { categorizeFailure } from './IV-CODE-006-flake-category';

test('IV-CODE-006: flake category', () => {
  expect(categorizeFailure('Timeout 30000ms waiting for locator')).toBe('timing');
  expect(categorizeFailure('duplicate key email')).toBe('data');
  expect(categorizeFailure('snapshot differs on linux')).toBe('environment');
});`,
  },
  {
    id: 'IV-CODE-007',
    slug: 'isolation-audit',
    level: 'senior',
    timebox: 12,
    difficulty: 3,
    topic: 'isolation',
    goal: 'Detect shared mutable state patterns that break parallel isolation.',
    script: 'Say: "Audit this test file string for isolation violations."',
    task:
      'Implement `findIsolationViolations(code: string): string[]` returning tags: `global-mutable`, `shared-file`, `missing-unique-data` when detected.',
    starter: `export function findIsolationViolations(code: string): string[] {
  return [];
}
`,
    solution: `export function findIsolationViolations(code: string): string[] {
  const violations: string[] = [];
  if (/let\\s+shared\\s*=/.test(code) || /var\\s+globalUser/.test(code)) {
    violations.push('global-mutable');
  }
  if (code.includes('writeFileSync') && code.includes('/tmp/shared')) {
    violations.push('shared-file');
  }
  if (code.includes('test@example.com') && !code.includes('unique')) {
    violations.push('missing-unique-data');
  }
  return violations;
}
`,
    evaluate: ['Detects global mutable', 'Detects shared file path', 'Detects hardcoded email'],
    mistakes: ['Missing subtle globals', 'Flagging legitimate fixtures'],
    hints: ['Look for module-level let shared.', '/tmp/shared path.', 'Static email without factory.'],
    rubric: [
      ['Technical depth', 'Isolation patterns'],
      ['Judgment', 'Proposes fix per violation'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { findIsolationViolations } from './IV-CODE-007-isolation-audit';

test('IV-CODE-007: isolation audit', () => {
  const code = 'let shared = {}; await writeFileSync("/tmp/shared", "x"); login("test@example.com")';
  expect(findIsolationViolations(code)).toContain('global-mutable');
  expect(findIsolationViolations(code)).toContain('shared-file');
});`,
  },
  {
    id: 'IV-CODE-008',
    slug: 'shard-plan',
    level: 'senior',
    timebox: 12,
    difficulty: 3,
    topic: 'ci',
    goal: 'Distribute test files across N shards as evenly as possible by file count.',
    script: 'Say: "Given file list and shard count, return shard assignments." Discuss runtime-based sharding as follow-up.',
    task: 'Implement `planShards(files: string[], shardCount: number): string[][]` — round-robin assignment.',
    starter: `export function planShards(files: string[], shardCount: number): string[][] {
  return [files];
}
`,
    solution: `export function planShards(files: string[], shardCount: number): string[][] {
  const shards: string[][] = Array.from({ length: shardCount }, () => []);
  files.forEach((file, index) => {
    const shard = shards[index % shardCount];
    if (shard) shard.push(file);
  });
  return shards;
}
`,
    evaluate: ['Correct shard count', 'Even round-robin', 'Handles empty input'],
    mistakes: ['All files shard 1', 'Off-by-one modulo'],
    hints: ['Create shardCount arrays.', 'index % shardCount.', 'Empty files → empty shards.'],
    rubric: [
      ['Technical depth', 'Sharding algorithm'],
      ['Judgment', 'Mentions runtime-weighted follow-up'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { planShards } from './IV-CODE-008-shard-plan';

test('IV-CODE-008: shard plan', () => {
  const shards = planShards(['a.spec.ts', 'b.spec.ts', 'c.spec.ts', 'd.spec.ts'], 2);
  expect(shards).toHaveLength(2);
  expect(shards[0]).toEqual(['a.spec.ts', 'c.spec.ts']);
  expect(shards[1]).toEqual(['b.spec.ts', 'd.spec.ts']);
});`,
  },
  {
    id: 'IV-CODE-009',
    slug: 'thin-pom',
    level: 'senior',
    timebox: 12,
    difficulty: 3,
    topic: 'pom',
    goal: 'Detect fat page object anti-patterns: assertions inside page class methods.',
    script: 'Say: "Return true if Page class source violates thin POM (contains expect() inside methods)."',
    task: 'Implement `violatesThinPom(source: string): boolean` — true if /expect\\(/ appears inside class body.',
    starter: `export function violatesThinPom(source: string): boolean {
  return false;
}
`,
    solution: `export function violatesThinPom(source: string): boolean {
  if (!source.includes('class ')) return false;
  const classMatch = source.match(/class\\s+\\w+[\\s\\S]*/);
  if (!classMatch) return false;
  return /expect\\s*\\(/.test(classMatch[0]);
}
`,
    evaluate: ['Detects expect in class', 'False for spec files', 'False for thin POM'],
    mistakes: ['Flagging spec files', 'Missing nested expects'],
    hints: ['Scope to class body.', 'expect( triggers violation.', 'Specs outside class OK.'],
    rubric: [
      ['Code quality', 'POM boundaries'],
      ['Communication', 'Explains assertion placement'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { violatesThinPom } from './IV-CODE-009-thin-pom';

test('IV-CODE-009: thin POM', () => {
  const fat = 'class LoginPage { async login() { expect(this.page).toHaveURL(/dash/); } }';
  const thin = 'class LoginPage { submit() { return this.page.getByRole("button").click(); } }';
  expect(violatesThinPom(fat)).toBe(true);
  expect(violatesThinPom(thin)).toBe(false);
});`,
  },
  {
    id: 'IV-CODE-010',
    slug: 'rubric-score',
    level: 'senior',
    timebox: 10,
    difficulty: 2,
    topic: 'hiring',
    goal: 'Compute weighted hire score from dimension scores 1–4 and return recommendation tier.',
    script:
      'Say: "Given rubric dimension scores, compute weighted total and recommendation." Connects to IV-RUBRIC.',
    task:
      'Implement `hireRecommendation(scores: Record<Dimension, number>): { total: number; tier: string }` with weights: technical 0.3, process 0.25, communication 0.15, codeQuality 0.2, judgment 0.1. Tier: ≥3.2 Strong hire, ≥2.6 Hire, ≥2.0 No hire, else Strong no hire.',
    starter: `export type Dimension = 'technical' | 'process' | 'communication' | 'codeQuality' | 'judgment';

const WEIGHTS: Record<Dimension, number> = {
  technical: 0.3,
  process: 0.25,
  communication: 0.15,
  codeQuality: 0.2,
  judgment: 0.1,
};

export function hireRecommendation(scores: Record<Dimension, number>): { total: number; tier: string } {
  return { total: 0, tier: 'No hire' };
}
`,
    solution: `export type Dimension = 'technical' | 'process' | 'communication' | 'codeQuality' | 'judgment';

const WEIGHTS: Record<Dimension, number> = {
  technical: 0.3,
  process: 0.25,
  communication: 0.15,
  codeQuality: 0.2,
  judgment: 0.1,
};

export function hireRecommendation(scores: Record<Dimension, number>): { total: number; tier: string } {
  const total = (Object.keys(WEIGHTS) as Dimension[]).reduce(
    (sum, key) => sum + (scores[key] ?? 0) * WEIGHTS[key],
    0,
  );
  let tier = 'Strong no hire';
  if (total >= 3.2) tier = 'Strong hire';
  else if (total >= 2.6) tier = 'Hire';
  else if (total >= 2.0) tier = 'No hire';
  return { total: Math.round(total * 100) / 100, tier };
}
`,
    evaluate: ['Weighted sum correct', 'Tier thresholds', 'Rounding total'],
    mistakes: ['Simple average ignoring weights', 'Wrong tier boundaries'],
    hints: ['Multiply each score by WEIGHTS.', 'Sum all five.', 'Check thresholds top-down.'],
    rubric: [
      ['Technical depth', 'Correct computation'],
      ['Judgment', 'Interprets tier for debrief'],
    ],
    spec: `import { test, expect } from '@playwright/test';
import { hireRecommendation } from './IV-CODE-010-rubric-score';

test('IV-CODE-010: rubric score', () => {
  const result = hireRecommendation({
    technical: 4,
    process: 3,
    communication: 3,
    codeQuality: 4,
    judgment: 3,
  });
  expect(result.tier).toBe('Strong hire');
  expect(result.total).toBeGreaterThan(3.2);
});`,
  },
];
