/** Exercise TS starter/solution/spec definitions */
export const EXERCISES = [
  {
    id: 'FW-X-01', slug: 'scaffold-config', stage: 1, lesson: 'FW-L-101', difficulty: 'beginner',
    goal: 'Export a minimal Playwright config object for the exercises project: testDir `./`, single project named `exercises`.',
    starter: `export type ExerciseConfig = { testDir: string; projects: { name: string }[] };

/** TODO: return testDir './' and one project named 'exercises' */
export function buildExerciseConfig(): ExerciseConfig {
  return { testDir: './tests', projects: [] };
}
`,
    solution: `export type ExerciseConfig = { testDir: string; projects: { name: string }[] };

export function buildExerciseConfig(): ExerciseConfig {
  return {
    testDir: './',
    projects: [{ name: 'exercises' }],
  };
}
`,
    task: 'Implement `buildExerciseConfig()` so it returns `testDir: \'./\'` and exactly one project `{ name: \'exercises\' }`.',
    hints: ['Match the shape in the type — no extra keys required.', 'Project name is case-sensitive: `exercises`.', 'testDir is relative to the config file location.'],
    walkthrough: 'The function is a pure config builder — no Playwright import needed. Spec validates shape for lesson FW-L-101 init conventions.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-01` from practice-suite.',
  },
  {
    id: 'FW-X-02', slug: 'organize-folders', stage: 1, lesson: 'FW-L-104', difficulty: 'beginner',
    goal: 'Validate that a folder list includes the v1 framework directories.',
    starter: `const REQUIRED = ['tests', 'pages', 'fixtures'] as const;

export function validateFolderStructure(paths: string[]): boolean {
  // TODO: every REQUIRED folder must appear in paths (any order)
  return paths.includes('tests');
}
`,
    solution: `const REQUIRED = ['tests', 'pages', 'fixtures'] as const;

export function validateFolderStructure(paths: string[]): boolean {
  return REQUIRED.every((folder) => paths.includes(folder));
}
`,
    task: 'Return true only when `paths` includes `tests`, `pages`, and `fixtures`.',
    hints: ['Use Array.every over REQUIRED.', 'Extra folders like config/ are allowed.', 'Order of paths does not matter.'],
    walkthrough: 'Feature-first layout needs tests, pages, fixtures at minimum — matches FW-L-104 tree.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-02`.',
  },
  {
    id: 'FW-X-03', slug: 'kill-anti-patterns', stage: 1, lesson: 'FW-L-107', difficulty: 'intermediate',
    goal: 'Scan code strings for framework anti-patterns banned in this academy.',
    starter: `const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;

export function findAntiPatterns(code: string): string[] {
  // TODO: return all BANNED tokens found in code (may be multiple)
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
    task: 'Return every banned substring present in the input code string.',
    hints: ['Filter BANNED with code.includes.', 'Return empty array when clean.', 'Do not modify BANNED list.'],
    walkthrough: 'Lint and review catch these in real repos — exercise teaches recognition.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-03`.',
  },
  {
    id: 'FW-X-04', slug: 'make-pom-thin', stage: 2, lesson: 'FW-L-201', difficulty: 'intermediate',
    goal: 'Thin POM: page object methods must not contain expect() calls.',
    starter: `export class LoginPage {
  readonly hasAssertion: boolean;

  constructor() {
    this.hasAssertion = true; // TODO: thin POM has no assertions — should be false
  }

  /** Returns true if this class violates thin POM (contains assertions) */
  static violatesThinPom(source: string): boolean {
    return /expect\\s*\\(/.test(source);
  }
}

export function loginPageSource(): string {
  return \`
    async signIn() {
      await this.email.fill('a@test.com');
      await expect(this.toast).toBeVisible();
    }
  \`;
}
`,
    solution: `export class LoginPage {
  readonly hasAssertion: boolean;

  constructor() {
    this.hasAssertion = false;
  }

  static violatesThinPom(source: string): boolean {
    return /expect\\s*\\(/.test(source);
  }
}

export function loginPageSource(): string {
  return \`
    async signIn() {
      await this.email.fill('a@test.com');
      await this.submit.click();
    }
  \`;
}
`,
    task: 'Fix `loginPageSource()` to remove expect(); set `hasAssertion` to false in constructor.',
    hints: ['Thin POM: actions only in methods.', 'Tests own expect().', 'violatesThinPom uses regex on source string.'],
    walkthrough: 'Refactor moves assertion to spec — page method clicks submit instead.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-04`.',
  },
  {
    id: 'FW-X-05', slug: 'beforeeach-to-fixture', stage: 2, lesson: 'FW-L-203', difficulty: 'intermediate',
    goal: 'Express setup as fixture pattern metadata instead of beforeEach flag.',
    starter: `export type FixtureMeta = { usesFixtures: boolean; usesBeforeEach: boolean; exportsCustomTest: boolean };

export function describeSetupPattern(): FixtureMeta {
  return { usesFixtures: false, usesBeforeEach: true, exportsCustomTest: false };
}
`,
    solution: `export type FixtureMeta = { usesFixtures: boolean; usesBeforeEach: boolean; exportsCustomTest: boolean };

export function describeSetupPattern(): FixtureMeta {
  return { usesFixtures: true, usesBeforeEach: false, exportsCustomTest: true };
}
`,
    task: 'Return metadata reflecting fixtures-first pattern: fixtures true, beforeEach false, custom test export true.',
    hints: ['FW-L-203 replaces beforeEach with test.extend.', 'Specs import test from fixtures/base.', 'No Playwright runtime needed here.'],
    walkthrough: 'Pure metadata exercise — encodes the decision from the lesson.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-05`.',
  },
  {
    id: 'FW-X-06', slug: 'auth-setup-project', stage: 2, lesson: 'FW-L-207', difficulty: 'intermediate',
    goal: 'Build projects array with setup dependency and storageState on consumer.',
    starter: `export type ProjectDef = { name: string; dependencies?: string[]; storageState?: string };

export function buildAuthProjects(): ProjectDef[] {
  return [{ name: 'chromium' }];
}
`,
    solution: `export type ProjectDef = { name: string; dependencies?: string[]; storageState?: string };

export function buildAuthProjects(): ProjectDef[] {
  return [
    { name: 'setup' },
    {
      name: 'authenticated',
      dependencies: ['setup'],
      storageState: 'playwright/.auth/user.json',
    },
  ];
}
`,
    task: 'Return setup project plus authenticated project with dependencies [\'setup\'] and storageState path.',
    hints: ['Setup project has no storageState.', 'Consumer depends on setup by name.', 'Path matches lesson convention.'],
    walkthrough: 'Mirrors playwright.config projects for auth setup lesson.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-06`.',
  },
  {
    id: 'FW-X-07', slug: 'multi-role-auth', stage: 2, lesson: 'FW-L-208', difficulty: 'intermediate',
    goal: 'Map roles to distinct storageState file paths.',
    starter: `export function roleStoragePaths(): Record<'admin' | 'member', string> {
  return {
    admin: 'playwright/.auth/user.json',
    member: 'playwright/.auth/user.json',
  };
}
`,
    solution: `export function roleStoragePaths(): Record<'admin' | 'member', string> {
  return {
    admin: 'playwright/.auth/admin.json',
    member: 'playwright/.auth/member.json',
  };
}
`,
    task: 'Give admin and member separate files under playwright/.auth/.',
    hints: ['Same folder, different filenames.', 'Keys must be admin and member.', 'Do not share one path.'],
    walkthrough: 'Multi-role parallel tests need isolated storageState files.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-07`.',
  },
  {
    id: 'FW-X-08', slug: 'layer-configs', stage: 2, lesson: 'FW-L-209', difficulty: 'intermediate',
    goal: 'Merge base config with environment overlay (deep merge use object).',
    starter: `export type LayerConfig = { use: { baseURL: string; extraHTTPHeaders?: Record<string, string> } };

export function mergeConfigs(base: LayerConfig, overlay: LayerConfig): LayerConfig {
  return base;
}
`,
    solution: `export type LayerConfig = { use: { baseURL: string; extraHTTPHeaders?: Record<string, string> } };

export function mergeConfigs(base: LayerConfig, overlay: LayerConfig): LayerConfig {
  return {
    use: {
      ...base.use,
      ...overlay.use,
      extraHTTPHeaders: {
        ...base.use.extraHTTPHeaders,
        ...overlay.use.extraHTTPHeaders,
      },
    },
  };
}
`,
    task: 'Overlay wins on baseURL; merge extraHTTPHeaders from both layers.',
    hints: ['Spread use objects.', 'Headers need nested merge.', 'Return new object — do not mutate base.'],
    walkthrough: 'Config layering pattern from FW-L-209 without multiple files.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-08`.',
  },
  {
    id: 'FW-X-09', slug: 'data-factory', stage: 3, lesson: 'FW-L-301', difficulty: 'intermediate',
    goal: 'Factory produces unique emails and applies overrides.',
    starter: `export type User = { email: string; name: string; role: 'member' | 'admin' };

let counter = 0;

export function createUser(overrides: Partial<User> = {}): User {
  counter += 1;
  return {
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    ...overrides,
  };
}

export function resetFactoryForTests(): void {
  counter = 0;
}
`,
    solution: `export type User = { email: string; name: string; role: 'member' | 'admin' };

let counter = 0;

export function createUser(overrides: Partial<User> = {}): User {
  counter += 1;
  const id = \`\${Date.now()}-\${counter}\`;
  return {
    email: \`user-\${id}@example.test\`,
    name: 'Test User',
    role: 'member',
    ...overrides,
  };
}

export function resetFactoryForTests(): void {
  counter = 0;
}
`,
    task: 'Generate unique email per call; still apply overrides last.',
    hints: ['Use counter + timestamp in email.', 'Domain example.test avoids real mail.', 'Overrides can replace email explicitly.'],
    walkthrough: 'Parallel-safe factory from FW-L-301.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-09`.',
  },
  {
    id: 'FW-X-10', slug: 'worker-api-client', stage: 3, lesson: 'FW-L-304', difficulty: 'advanced',
    goal: 'ApiClient tracks worker scope metadata and disposes cleanly.',
    starter: `export type ClientMeta = { scope: 'test' | 'worker'; disposed: boolean };

export class ApiClient {
  meta: ClientMeta;

  constructor(scope: 'test' | 'worker' = 'test') {
    this.meta = { scope, disposed: false };
  }

  async dispose(): Promise<void> {
    // TODO: mark disposed
  }
}
`,
    solution: `export type ClientMeta = { scope: 'test' | 'worker'; disposed: boolean };

export class ApiClient {
  meta: ClientMeta;

  constructor(scope: 'test' | 'worker' = 'worker') {
    this.meta = { scope, disposed: false };
  }

  async dispose(): Promise<void> {
    this.meta.disposed = true;
  }
}
`,
    task: 'Default scope worker; dispose() sets disposed true.',
    hints: ['FW-L-304 hybrid uses worker-scoped API client.', 'dispose is idempotent.', 'Default constructor arg worker.'],
    walkthrough: 'Encodes worker-scoped client lifecycle from hybrid API+UI lesson.',
    selfCheck: 'Run `npm run exercise -- --grep FW-X-10`.',
  },
];
