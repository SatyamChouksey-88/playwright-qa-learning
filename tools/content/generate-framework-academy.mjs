#!/usr/bin/env node
/** One-shot generator for Framework Academy content. Run: node tools/content/generate-framework-academy.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { LESSONS } from './framework-lessons-data.mjs';
import { MCQS } from './framework-mcqs-data.mjs';
import { SCENARIOS } from './framework-scenarios-data.mjs';
import { EXERCISES } from './framework-exercises-data.mjs';
import {
  parseFrameworkLesson,
  parseFrameworkMcq,
  parseFrameworkExercise,
  parseFrameworkScenarios,
} from './md-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const FW = path.join(ROOT, 'interview-qa/framework');
const EX_DIR = path.join(ROOT, 'practice-suite/exercises');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.replace(/\r\n/g, '\n'), 'utf8');
}

function lessonMd(L) {
  const fm = {
    id: L.id,
    type: 'framework-lesson',
    stage: L.stage,
    title: L.title,
    objective: L.objective,
    topic: 'framework',
    subtopics: L.subtopics,
    diagram: L.diagram,
    mcqs: L.mcqs,
    exercise: L.exercise,
    related: L.related,
  };
  return `---
${YAML.stringify(fm).trim()}
---

## Concept

${L.concept}

## Why it matters

${L.why}

## Architecture decision

${L.arch}

## TypeScript implementation

${L.impl}

## Trade-offs

${L.tradeoffs}

## What NOT to do

${L.notToDo}

## Interview angle

${L.interview}

## Related

${L.related.map((r) => `- ${r}`).join('\n')}
`;
}

function mcqMd(m) {
  const fm = {
    id: m.id,
    type: 'framework-mcq',
    topic: 'framework',
    subtopic: m.subtopic,
    difficulty: m.difficulty,
    stage: m.stage,
    answerIndex: m.answerIndex,
    lesson: m.lesson,
  };
  const opts = m.opts.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const wrong = m.wrong.map((w) => `- ${w}`).join('\n');
  return `---
${YAML.stringify(fm).trim()}
---

## Question

${m.q}

## Options

${opts}

## Correct answer

${m.correct}

## Why correct

${m.why}

## Why the others are wrong

${wrong}
`;
}

function exerciseMd(ex) {
  const _base = `FW-${ex.id.replace('FW-X-', 'X-')}`;
  void _base;
  const fileBase = `${ex.id}-${ex.slug}`;
  const fm = {
    id: ex.id,
    type: 'framework-exercise',
    topic: 'framework',
    stage: ex.stage,
    difficulty: ex.difficulty,
    lesson: ex.lesson,
    specFile: `practice-suite/exercises/${fileBase}.spec.ts`,
    runCommand: 'npm run exercise -- --grep ' + ex.id,
  };
  return `---
${YAML.stringify(fm).trim()}
---

## Goal

${ex.goal}

## Starter code

\`\`\`ts
${ex.starter.trim()}
\`\`\`

## Task

${ex.task}

## Hints

<details>
<summary>Hint 1</summary>

${ex.hints[0]}

</details>

<details>
<summary>Hint 2</summary>

${ex.hints[1]}

</details>

<details>
<summary>Hint 3</summary>

${ex.hints[2]}

</details>

## Solution

\`\`\`ts
${ex.solution.trim()}
\`\`\`

## Solution walkthrough

${ex.walkthrough}

## Self-check

${ex.selfCheck}
`;
}

function scenariosMd() {
  const fm = { topic: 'framework', title: 'Framework interview scenarios', count: SCENARIOS.length };
  const blocks = SCENARIOS.map((s) => {
    const think = s.think.map((t) => `- ${t}`).join('\n');
    const follow = s.followups.map((f) => `- ${f}`).join('\n');
    return `### ${s.id}. ${s.q}

**Think first:** ${think}

**Ideal approach:** ${s.ideal}

**Why they get stuck:** ${s.stuck}

**Why the interviewer asks this:** ${s.whyAsked}

**Common wrong answer:** ${s.wrong}

**Real project example:** ${s.example}

**Follow-up questions:** ${follow}
`;
  }).join('\n');
  return `---
${YAML.stringify(fm).trim()}
---

# Framework interview scenarios

${blocks}`;
}

function specForExercise(ex) {
  const file = `${ex.id}-${ex.slug}`;
  const maps = {
    'FW-X-01': `import { test, expect } from '@playwright/test';
import { buildExerciseConfig } from './${file}';

test('${ex.id}: scaffold config', () => {
  const cfg = buildExerciseConfig();
  expect(cfg.testDir).toBe('./');
  expect(cfg.projects).toHaveLength(1);
  expect(cfg.projects[0]?.name).toBe('exercises');
});`,
    'FW-X-02': `import { test, expect } from '@playwright/test';
import { validateFolderStructure } from './${file}';

test('${ex.id}: folder structure', () => {
  expect(validateFolderStructure(['tests', 'pages', 'fixtures'])).toBe(true);
  expect(validateFolderStructure(['tests'])).toBe(false);
});`,
    'FW-X-03': `import { test, expect } from '@playwright/test';
import { findAntiPatterns } from './${file}';

test('${ex.id}: anti-patterns', () => {
  expect(findAntiPatterns('await page.waitForTimeout(1000)')).toContain('waitForTimeout');
  expect(findAntiPatterns('await page.getByRole("button").click()')).toEqual([]);
});`,
    'FW-X-04': `import { test, expect } from '@playwright/test';
import { LoginPage, loginPageSource } from './${file}';

test('${ex.id}: thin POM', () => {
  expect(new LoginPage().hasAssertion).toBe(false);
  expect(LoginPage.violatesThinPom(loginPageSource())).toBe(false);
});`,
    'FW-X-05': `import { test, expect } from '@playwright/test';
import { describeSetupPattern } from './${file}';

test('${ex.id}: fixture pattern', () => {
  const m = describeSetupPattern();
  expect(m).toEqual({ usesFixtures: true, usesBeforeEach: false, exportsCustomTest: true });
});`,
    'FW-X-06': `import { test, expect } from '@playwright/test';
import { buildAuthProjects } from './${file}';

test('${ex.id}: auth projects', () => {
  const projects = buildAuthProjects();
  expect(projects[0]?.name).toBe('setup');
  expect(projects[1]?.dependencies).toEqual(['setup']);
  expect(projects[1]?.storageState).toBe('playwright/.auth/user.json');
});`,
    'FW-X-07': `import { test, expect } from '@playwright/test';
import { roleStoragePaths } from './${file}';

test('${ex.id}: multi-role paths', () => {
  const paths = roleStoragePaths();
  expect(paths.admin).toBe('playwright/.auth/admin.json');
  expect(paths.member).toBe('playwright/.auth/member.json');
  expect(paths.admin).not.toBe(paths.member);
});`,
    'FW-X-08': `import { test, expect } from '@playwright/test';
import { mergeConfigs } from './${file}';

test('${ex.id}: merge configs', () => {
  const base = { use: { baseURL: 'http://localhost', extraHTTPHeaders: { 'X-Base': '1' } } };
  const overlay = { use: { baseURL: 'https://staging.example', extraHTTPHeaders: { 'X-Overlay': '2' } } };
  const merged = mergeConfigs(base, overlay);
  expect(merged.use.baseURL).toBe('https://staging.example');
  expect(merged.use.extraHTTPHeaders).toEqual({ 'X-Base': '1', 'X-Overlay': '2' });
});`,
    'FW-X-09': `import { test, expect } from '@playwright/test';
import { createUser, resetFactoryForTests } from './${file}';

test('${ex.id}: data factory', () => {
  resetFactoryForTests();
  const a = createUser();
  const b = createUser();
  expect(a.email).not.toBe(b.email);
  expect(a.email).toContain('@example.test');
  expect(createUser({ role: 'admin' }).role).toBe('admin');
});`,
    'FW-X-10': `import { test, expect } from '@playwright/test';
import { ApiClient } from './${file}';

test('${ex.id}: worker api client', async () => {
  const client = new ApiClient();
  expect(client.meta.scope).toBe('worker');
  expect(client.meta.disposed).toBe(false);
  await client.dispose();
  expect(client.meta.disposed).toBe(true);
});`,
  };
  return maps[ex.id];
}

function diagramsJs() {
  const box = (x, y, w, h, label, fill = 'var(--panel)') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="var(--border)" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" fill="var(--text)" font-size="12" font-family="system-ui,sans-serif">${label}</text>`;
  const arrow = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr)"/>`;

  const wrap = (id, title, desc, body) =>
    `<svg role="img" width="520" height="320" xmlns="http://www.w3.org/2000/svg"><title>${title}</title><desc>${desc}</desc><defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="var(--accent)"/></marker></defs>${body}</svg>`;

  const DIAG = {
    'DIAG-FW-TREE': wrap('DIAG-FW-TREE', 'Framework repo tree', 'Stage 1 folder layout', `
      ${box(20, 20, 480, 36, 'playwright-suite/')}
      ${box(40, 70, 120, 32, 'tests/')}
      ${box(180, 70, 120, 32, 'pages/')}
      ${box(320, 70, 120, 32, 'fixtures/')}
      ${box(40, 120, 120, 32, 'config/')}
      ${box(180, 120, 160, 32, 'playwright.config.ts')}
      ${box(360, 120, 120, 32, 'data/')}
      ${arrow(100, 102, 100, 120)}
      ${arrow(240, 102, 260, 120)}
      ${arrow(380, 102, 420, 120)}
    `),
    'DIAG-FW-CONFIG': wrap('DIAG-FW-CONFIG', 'Config layers', 'Env vars feed defineConfig projects', `
      ${box(20, 40, 100, 36, 'ENV vars', 'var(--accent)')}
      ${box(160, 40, 140, 36, 'defineConfig')}
      ${box(340, 40, 160, 36, 'projects[]')}
      ${arrow(120, 58, 160, 58)}
      ${arrow(300, 58, 340, 58)}
      ${box(40, 120, 440, 36, 'use: baseURL · trace · timeout · storageState')}
      ${box(40, 180, 200, 36, 'reporter: list · html · blob')}
      ${box(280, 180, 200, 36, 'grep / dependencies')}
    `),
    'DIAG-FW-ARCH': wrap('DIAG-FW-ARCH', 'Four layers', 'Config fixtures pages tests', `
      ${box(160, 20, 200, 32, 'Reporting (CI artifacts)', 'var(--accent)')}
      ${box(160, 70, 200, 32, 'Tests (specs)')}
      ${box(160, 120, 200, 32, 'Pages / Components')}
      ${box(160, 170, 200, 32, 'Fixtures (test.extend)')}
      ${box(160, 220, 200, 32, 'Config (playwright.config.ts)')}
      ${arrow(260, 102, 260, 120)}
      ${arrow(260, 152, 260, 170)}
      ${arrow(260, 202, 260, 220)}
    `),
    'DIAG-FW-FIXTURES': wrap('DIAG-FW-FIXTURES', 'Fixture composition', 'mergeTests and scopes', `
      ${box(20, 50, 110, 36, 'auth-fixtures')}
      ${box(20, 110, 110, 36, 'api-fixtures')}
      ${box(20, 170, 110, 36, 'ui-fixtures')}
      ${box(180, 110, 120, 36, 'mergeTests', 'var(--accent)')}
      ${box(340, 110, 140, 36, 'spec imports test')}
      ${arrow(130, 68, 180, 120)}
      ${arrow(130, 128, 180, 128)}
      ${arrow(130, 188, 180, 140)}
      ${arrow(300, 128, 340, 128)}
      ${box(340, 200, 140, 28, 'test scope')}
      ${box(340, 240, 140, 28, 'worker scope')}
    `),
    'DIAG-FW-AUTH': wrap('DIAG-FW-AUTH', 'Auth setup project', 'setup writes storageState', `
      ${box(30, 60, 100, 36, 'setup project')}
      ${box(180, 60, 140, 36, 'auth.setup.ts')}
      ${box(360, 60, 130, 36, '.auth/*.json')}
      ${arrow(130, 78, 180, 78)}
      ${arrow(320, 78, 360, 78)}
      ${box(30, 160, 460, 36, 'consumer projects: dependencies + use.storageState')}
      ${box(80, 230, 120, 32, 'admin.json')}
      ${box(220, 230, 120, 32, 'member.json')}
      ${box(360, 230, 120, 32, 'tests parallel')}
    `),
    'DIAG-FW-DATA': wrap('DIAG-FW-DATA', 'Test data flow', 'Factory API UI cleanup', `
      ${box(20, 50, 100, 36, 'Factory', 'var(--accent)')}
      ${box(150, 50, 100, 36, 'API seed')}
      ${box(280, 50, 100, 36, 'UI test')}
      ${box(410, 50, 90, 36, 'Teardown')}
      ${arrow(120, 68, 150, 68)}
      ${arrow(250, 68, 280, 68)}
      ${arrow(380, 68, 410, 68)}
      ${box(80, 140, 360, 36, 'Prefix e2e-* · sweeper backstop')}
    `),
    'DIAG-FW-CI': wrap('DIAG-FW-CI', 'CI sharding', 'Shards emit blob then merge', `
      ${box(30, 40, 90, 36, 'Shard 1/4')}
      ${box(150, 40, 90, 36, 'Shard 2/4')}
      ${box(270, 40, 90, 36, 'Shard 3/4')}
      ${box(390, 40, 90, 36, 'Shard 4/4')}
      ${box(150, 120, 220, 40, 'merge-reports', 'var(--accent)')}
      ${arrow(75, 76, 200, 120)}
      ${arrow(195, 76, 240, 120)}
      ${arrow(315, 76, 280, 120)}
      ${arrow(435, 76, 320, 120)}
      ${box(150, 200, 220, 36, 'HTML artifact + traces')}
    `),
    'DIAG-FW-DECIDE': wrap('DIAG-FW-DECIDE', 'Build vs skip', 'Framework restraint decisions', `
      ${box(30, 40, 200, 36, 'Build: fixtures · thin POM', 'var(--panel)')}
      ${box(30, 90, 200, 36, 'Build: storageState auth')}
      ${box(30, 140, 200, 36, 'Build: tags + lint')}
      ${box(290, 40, 200, 36, 'Skip: custom runner', 'var(--accent)')}
      ${box(290, 90, 200, 36, 'Skip: BaseTest tree')}
      ${box(290, 140, 200, 36, 'Skip: plugin arch v1')}
    `),
  };

  const entries = Object.entries(DIAG)
    .map(([k, v]) => `  '${k}': ${JSON.stringify(v)}`)
    .join(',\n');
  return `/* Framework Academy diagrams — theme-aware inline SVG */
window.FRAMEWORK_DIAGRAMS = {
${entries}
};
`;
}

function templatesAppend() {
  return `

## TEMPLATE 3 — Framework Lesson (\`interview-qa/framework/lessons/FW-L-*.md\`)

YAML frontmatter keys: \`id\`, \`type: framework-lesson\`, \`stage\` (1–4), \`title\`, \`objective\`, \`topic: framework\`, \`subtopics\`, \`diagram\` (id or null), \`mcqs\`, \`exercise\` (id or null), \`related\`.

Required \`##\` sections **in order**: \`Concept\`, \`Why it matters\`, \`Architecture decision\`, \`TypeScript implementation\`, \`Trade-offs\`, \`What NOT to do\`, \`Interview angle\`, \`Related\`.

Code blocks in \`TypeScript implementation\` must be strict-mode clean — no \`waitForTimeout\`, \`force: true\`, or \`networkidle\`.

\`\`\`markdown
---
id: FW-L-101
type: framework-lesson
stage: 1
title: Project initialization
objective: One sentence learner outcome.
topic: framework
subtopics: []
diagram: DIAG-FW-TREE
mcqs: [FW-Q-001]
exercise: FW-X-01
related: [FW-L-102]
---

## Concept
...

## Why it matters
...

## Architecture decision
...

## TypeScript implementation
\`\`\`ts
// strict, web-first locators
\`\`\`

## Trade-offs
...

## What NOT to do
...

## Interview angle
...

## Related
- FW-L-102
\`\`\`

Validated by \`parseFrameworkLesson\` in \`tools/content/md-utils.mjs\`.

## TEMPLATE 4 — Framework MCQ (\`interview-qa/framework/mcqs/FW-Q-*.md\`)

Frontmatter: \`id\`, \`type: framework-mcq\`, \`topic: framework\`, \`subtopic\`, \`difficulty\` (\`beginner|intermediate|advanced\`), \`stage\`, \`answerIndex\` (0–3), \`lesson\`.

Body headings: \`## Question\`, \`## Options\` (exactly 4 lines \`1. \` … \`4. \`), \`## Correct answer\`, \`## Why correct\`, \`## Why the others are wrong\` (exactly 3 bullets starting \`- Option\`).

## TEMPLATE 5 — Framework Exercise (\`interview-qa/framework/exercises/FW-X-*.md\`)

Frontmatter: \`id\`, \`type: framework-exercise\`, \`topic: framework\`, \`stage\`, \`difficulty\`, \`lesson\`, \`specFile\`, \`runCommand\`.

Headings: \`Goal\`, \`Starter code\`, \`Task\`, \`Hints\` (three \`<details><summary>Hint N</summary>\`), \`Solution\`, \`Solution walkthrough\`, \`Self-check\`.

Companion TypeScript under \`practice-suite/exercises/\`: learner \`.ts\`, \`.solution.ts\`, validating \`.spec.ts\`. Run via \`npm run exercise\` from \`practice-suite/\`.

## Framework scenarios (\`interview-qa/framework/scenarios/framework-scenarios.md\`)

Frontmatter \`topic: framework\`. Each \`### FW-S-NN.\` uses Scenario v2 bold sections: \`Think first\`, \`Ideal approach\`, \`Why they get stuck\`, \`Why the interviewer asks this\`, \`Common wrong answer\`, \`Real project example\`, \`Follow-up questions\`.
`;
}

function main() {
  let counts = { lessons: 0, mcqs: 0, exercises: 0, scenarios: 0, diagrams: 8 };

  for (const L of LESSONS) {
    const name = `${L.id}-${L.slug}.md`;
    const raw = lessonMd(L);
    parseFrameworkLesson(raw, name);
    write(path.join(FW, 'lessons', name), raw);
    counts.lessons++;
  }

  for (const m of MCQS) {
    const name = `${m.id}-${m.slug}.md`;
    const raw = mcqMd(m);
    parseFrameworkMcq(raw, name);
    write(path.join(FW, 'mcqs', name), raw);
    counts.mcqs++;
  }

  for (const ex of EXERCISES) {
    const name = `${ex.id}-${ex.slug}.md`;
    const raw = exerciseMd(ex);
    parseFrameworkExercise(raw, name);
    write(path.join(FW, 'exercises', name), raw);
    counts.exercises++;

    const base = `${ex.id}-${ex.slug}`;
    write(path.join(EX_DIR, `${base}.ts`), ex.starter);
    write(path.join(EX_DIR, `${base}.solution.ts`), ex.solution);
    write(path.join(EX_DIR, `${base}.spec.ts`), specForExercise(ex));
  }

  const scenRaw = scenariosMd();
  parseFrameworkScenarios(scenRaw, 'framework-scenarios.md');
  write(path.join(FW, 'scenarios/framework-scenarios.md'), scenRaw);
  counts.scenarios = SCENARIOS.length;

  write(path.join(ROOT, 'learning-site/framework-diagrams.js'), diagramsJs());

  write(
    path.join(EX_DIR, 'playwright.config.ts'),
    `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  projects: [{ name: 'exercises' }],
});
`,
  );

  const templatesPath = path.join(ROOT, 'interview-qa/_templates.md');
  const existing = fs.readFileSync(templatesPath, 'utf8');
  if (!existing.includes('TEMPLATE 3 — Framework Lesson')) {
    fs.writeFileSync(templatesPath, existing.trimEnd() + templatesAppend(), 'utf8');
  }

  const pkgPath = path.join(ROOT, 'practice-suite/package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts.exercise = 'playwright test -c exercises/playwright.config.ts';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  const tsPath = path.join(ROOT, 'practice-suite/tsconfig.json');
  const ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));
  if (!ts.include.includes('exercises/**/*.ts')) {
    ts.include.push('exercises/**/*.ts');
    fs.writeFileSync(tsPath, JSON.stringify(ts, null, 2) + '\n', 'utf8');
  }

  console.log('Framework Academy generated:', counts);
}

main();
