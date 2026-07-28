#!/usr/bin/env node
/** Generate Skill Modules (SK-*) markdown + exercise files. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { TRACKS } from './skills-tracks-data.mjs';
import { buildLessons, buildMcqs, buildExercises } from './skills-content-factory.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SK_ROOT = path.join(ROOT, 'interview-qa/skills');
const EX_ROOT = path.join(ROOT, 'practice-suite/exercises/skills');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.replace(/\r\n/g, '\n'), 'utf8');
}

function slug(s) {
  return s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 50).toLowerCase();
}

function lessonMd(L) {
  const fm = {
    id: L.id,
    type: 'skill-lesson',
    track: L.track,
    title: L.title,
    topic: L.topic,
    estMinutes: L.estMinutes,
    prereqIds: L.prereqIds,
    exerciseId: L.exerciseId,
    mcqIds: L.mcqIds,
  };
  const tryIt = L.exerciseId
    ? `Complete exercise \`${L.exerciseId}\` — run \`npm --prefix practice-suite run exercise:skills\`.`
    : L.mcqIds.length
      ? `Answer MCQs ${L.mcqIds.map((m) => `\`${m}\``).join(', ')} in the Skills hub.`
      : 'Review recap bullets and explain each out loud.';
  return `---
${YAML.stringify(fm).trim()}
---

## Concept

${L.concept}

## Why it matters for QA

${L.why}

## Worked example

${L.example}

## Common mistakes

${L.mistakes}

## Interview angle

${L.interview}

## Try it

${tryIt}

## Recap bullets

${L.recap.map((r) => `- ${r}`).join('\n')}
`;
}

function trackMd(track, lessons, mcqs, exercises) {
  const lessonIds = lessons.filter((l) => l.track === track.id).map((l) => l.id);
  const mcqIds = mcqs.filter((m) => m.track === track.id).map((m) => m.id);
  const exIds = exercises.filter((e) => e.track === track.id).map((e) => e.id);
  const fm = {
    id: track.id,
    type: 'skill-track',
    title: track.title,
    slug: track.slug,
    order: track.order,
    estMinutes: Math.round(track.estHours * 60),
    lessonIds,
    mcqIds,
    exerciseIds: exIds,
    prerequisites: track.prerequisites,
  };
  return `---
${YAML.stringify(fm).trim()}
---

# ${track.title}

${track.description}

**Estimated time:** ~${track.estHours} hours · **Lessons:** ${lessonIds.length} · **MCQs:** ${mcqIds.length} · **Exercises:** ${exIds.length}
`;
}

function mcqMd(m) {
  const fm = {
    id: m.id,
    type: 'skill-mcq',
    track: m.track,
    topic: m.topic,
    difficulty: m.difficulty,
    answerIndex: m.answerIndex,
  };
  const opts = m.opts.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const wrong = m.whyWrong.map((w) => `- ${w}`).join('\n');
  return `---
${YAML.stringify(fm).trim()}
---

## Question

${m.stem}

## Options

${opts}

## Correct answer

${m.opts[m.answerIndex]}

## Why correct

${m.whyCorrect}

## Why the others are wrong

${wrong}
`;
}

function exerciseMd(ex) {
  const fm = {
    id: ex.id,
    type: 'skill-exercise',
    track: ex.track,
    topic: ex.topic,
    kind: ex.kind,
    specFile: ex.specFile,
    runCommand: ex.runCommand,
    expectedOutput: ex.expectedOutput || undefined,
  };
  return `---
${YAML.stringify(fm).trim()}
---

## Goal

${ex.prompt}

## Starter code

\`\`\`ts
${ex.starter.trim()}
\`\`\`

## Task

${ex.prompt}

## Hints

- Read the lesson recap for this topic.
- Run the self-check spec after editing the starter file.

## Solution

\`\`\`ts
${ex.solution.trim()}
\`\`\`

## Solution walkthrough

Compare your solution to the exemplar — focus on typing, edge cases, and Playwright idioms.

## Self-check

Run: \`${ex.runCommand}\` — spec file: \`${ex.specFile}\`
`;
}

function main() {
  const lessons = buildLessons();
  const mcqs = buildMcqs();
  const exercises = buildExercises();

  const counts = { lessons: lessons.length, mcqs: mcqs.length, exercises: exercises.length, tracks: TRACKS.length };
  console.log('Generating Skill Modules:', counts);

  if (lessons.length !== 47) throw new Error(`Expected 47 lessons, got ${lessons.length}`);
  if (mcqs.length !== 59) throw new Error(`Expected 59 MCQs, got ${mcqs.length}`);
  if (exercises.length !== 15) throw new Error(`Expected 15 exercises, got ${exercises.length}`);

  for (const track of TRACKS) {
    const dir = path.join(SK_ROOT, track.slug);
    write(path.join(dir, 'track.md'), trackMd(track, lessons, mcqs, exercises));
    for (const L of lessons.filter((l) => l.track === track.id)) {
      write(path.join(dir, 'lessons', `${L.id}-${slug(L.title)}.md`), lessonMd(L));
    }
    for (const m of mcqs.filter((x) => x.track === track.id)) {
      write(path.join(dir, 'mcqs', `${m.id}.md`), mcqMd(m));
    }
    for (const ex of exercises.filter((x) => x.track === track.id)) {
      write(path.join(dir, 'exercises', `${ex.id}.md`), exerciseMd(ex));
    }
  }

  write(
    path.join(EX_ROOT, 'playwright.config.ts'),
    `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: /SK-.*\\.spec\\.ts$/,
  testIgnore: /\\.solution\\.ts$/,
  grep: /@skills/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  projects: [{ name: 'skills-exercises' }],
});
`,
  );

  write(
    path.join(EX_ROOT, 'sql-utils.ts'),
    `export function normalizeSql(sql: string): string {
  return sql.replace(/\\s+/g, ' ').trim().toLowerCase();
}
`,
  );

  for (const ex of exercises) {
    const base = `${ex.id}-${slug(ex.topic)}`;
    write(path.join(EX_ROOT, `${base}.ts`), ex.starter.trim() + '\n');
    write(path.join(EX_ROOT, `${base}.solution.ts`), ex.solution.trim() + '\n');
    write(path.join(EX_ROOT, `${base}.spec.ts`), ex.spec.trim() + '\n');
  }

  const pkgPath = path.join(ROOT, 'practice-suite/package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts['exercise:skills'] = 'playwright test -c exercises/skills/playwright.config.ts';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  console.log('Skill Modules generated OK');
}

main();
