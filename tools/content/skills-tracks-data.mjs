/** Skill Module track definitions — SSOT for generate-skills-modules.mjs */
export const TRACKS = [
  {
    id: 'SK-API',
    slug: 'api',
    title: 'API Testing with Playwright',
    subtitle: 'REST, request fixture, hybrid API+UI',
    description:
      'Master Playwright APIRequestContext, the request fixture, JSON assertions, auth headers, and hybrid arrange-via-API / assert-via-UI patterns used in senior SDET interviews.',
    lessonCount: 12,
    mcqCount: 14,
    exerciseCount: 3,
    estHours: 4,
    prerequisites: ['SK-HTTP'],
    order: 1,
  },
  {
    id: 'SK-TS',
    slug: 'ts',
    title: 'TypeScript for Test Engineers',
    subtitle: 'Strict types, fixtures, factories',
    description:
      'TypeScript patterns every Playwright SDET needs: strict mode, async typing, interfaces for models, generics in fixtures, and utility types for test data.',
    lessonCount: 10,
    mcqCount: 12,
    exerciseCount: 4,
    estHours: 3.5,
    prerequisites: [],
    order: 2,
  },
  {
    id: 'SK-SQL',
    slug: 'sql',
    title: 'SQL for QA Verification',
    subtitle: 'Queries, joins, data integrity',
    description:
      'Write SELECT/JOIN/aggregate queries to verify backend state, seed test data, and diagnose data-related test failures — the SQL interview baseline for SDET roles.',
    lessonCount: 8,
    mcqCount: 10,
    exerciseCount: 5,
    estHours: 3,
    prerequisites: [],
    order: 3,
  },
  {
    id: 'SK-GIT',
    slug: 'git',
    title: 'Git for QA Engineers',
    subtitle: 'Branching, bisect, CI workflows',
    description:
      'Git workflows QA engineers use daily: feature branches, merge vs rebase, conflict resolution, bisect for flaky commits, and how CI uses git triggers.',
    lessonCount: 6,
    mcqCount: 8,
    exerciseCount: 2,
    estHours: 2,
    prerequisites: [],
    order: 4,
  },
  {
    id: 'SK-HTTP',
    slug: 'http',
    title: 'HTTP Protocol Essentials',
    subtitle: 'Headers, cookies, CORS, TLS',
    description:
      'HTTP fundamentals that underpin every API and browser test: request/response anatomy, headers, cookies, content types, CORS, HTTPS, and caching.',
    lessonCount: 6,
    mcqCount: 8,
    exerciseCount: 1,
    estHours: 2,
    prerequisites: [],
    order: 5,
  },
  {
    id: 'SK-SEC',
    slug: 'sec',
    title: 'Security Testing Awareness',
    subtitle: 'Defensive verification only',
    description:
      'Defensive security knowledge for QA: OWASP Top 10 awareness, XSS/CSRF verification patterns, secure cookies, and secrets handling in test environments. No offensive tooling.',
    lessonCount: 5,
    mcqCount: 7,
    exerciseCount: 0,
    estHours: 1.5,
    prerequisites: ['SK-HTTP'],
    order: 6,
  },
];

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t]));
