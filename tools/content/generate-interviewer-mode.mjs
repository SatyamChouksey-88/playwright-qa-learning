#!/usr/bin/env node
/** One-shot generator for Interviewer Mode content. Run: node tools/content/generate-interviewer-mode.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { QUESTIONS } from './interviewer-questions-data.mjs';
import { CODING } from './interviewer-coding-data.mjs';
import { KITS } from './interviewer-kits-data.mjs';
import { CRAFT } from './interviewer-craft-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const IV = path.join(ROOT, 'interview-qa/interviewer');
const EX_DIR = path.join(ROOT, 'practice-suite/exercises/interviewer');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.replace(/\r\n/g, '\n'), 'utf8');
}

function questionMd(q) {
  const fm = {
    id: q.id,
    type: 'iv-question',
    level: q.level,
    round: q.round,
    kind: q.kind,
    timebox: q.timebox,
    difficulty: q.difficulty,
    topic: q.topic,
    crosslinks: q.crosslinks ?? [],
  };
  const scoringRows = [1, 2, 3, 4]
    .map((s) => `| ${s} | ${q.scoring[s]} |`)
    .join('\n');
  const hints = q.hints
    .map(
      (h, i) => `<details>
<summary>Hint ${i + 1}</summary>

${h}

</details>`,
    )
    .join('\n\n');
  return `---
${YAML.stringify(fm).trim()}
---

## Question

${q.question}

## What this tests

${q.tests}

## Model answer

${q.modelAnswer}

## Strong answer signals

${q.strongSignals.map((s) => `- ${s}`).join('\n')}

## Weak answer / red flags

${q.weakSignals.map((s) => `- ${s}`).join('\n')}

## Follow-up probes

${q.followUps.map((s) => `- ${s}`).join('\n')}

## Hint ladder

${hints}

## Scoring guide

| Score | Anchor |
|-------|--------|
${scoringRows}
`;
}

function codingMd(ex) {
  const fileBase = `${ex.id}-${ex.slug}`;
  const fm = {
    id: ex.id,
    type: 'iv-coding',
    level: ex.level,
    round: 'coding',
    timebox: ex.timebox,
    difficulty: ex.difficulty,
    topic: ex.topic,
    specFile: `practice-suite/exercises/interviewer/${fileBase}.spec.ts`,
  };
  const hints = ex.hints
    .map(
      (h, i) => `<details>
<summary>Hint ${i + 1}</summary>

${h}

</details>`,
    )
    .join('\n\n');
  const rubricRows = ex.rubric.map(([dim, anchor]) => `| ${dim} | ${anchor} |`).join('\n');
  return `---
${YAML.stringify(fm).trim()}
---

## Interviewer script

${ex.script}

## Task statement

${ex.task}

## Starter code

\`\`\`ts
${ex.starter.trim()}
\`\`\`

## What to evaluate

${ex.evaluate.map((e) => `- ${e}`).join('\n')}

## Exemplar solution

\`\`\`ts
${ex.solution.trim()}
\`\`\`

## Common candidate mistakes

${ex.mistakes.map((m) => `- ${m}`).join('\n')}

## Hint ladder

${hints}

## Rubric

| Dimension | Look for |
|-----------|----------|
${rubricRows}
`;
}

function kitMd(k) {
  const fm = {
    id: k.id,
    type: 'iv-kit',
    level: k.level,
    round: k.round,
    duration: k.duration,
  };
  const agendaRows = k.agenda.map(([item, min]) => `| ${item} | ${min} |`).join('\n');
  const agendaTotal = k.agenda.reduce((s, [, m]) => s + m, 0);
  const ordered = k.questions.map((q) => `- \`${q.id}\` (${q.timebox} min)`).join('\n');
  return `---
${YAML.stringify(fm).trim()}
---

## Agenda

| Segment | Minutes |
|---------|---------|
${agendaRows}
| **Total** | **${agendaTotal}** |

## Ordered questions

${ordered}

## Backup questions

${k.backup.map((b) => `- \`${b}\``).join('\n')}

## Scoring sheet

Use \`IV-RUBRIC\` dimensions (1–4 each). Record evidence bullets per question id.

| Dimension | Score (1–4) | Evidence |
|-----------|-------------|----------|
| Technical depth | | |
| Problem-solving process | | |
| Communication | | |
| Code quality | | |
| Judgment / trade-offs | | |

## Hire bar

${k.hireBar}

## Do's & don'ts

**Do's**

${k.dos.map((d) => `- ${d}`).join('\n')}

**Don'ts**

${k.donts.map((d) => `- ${d}`).join('\n')}
`;
}

function craftMd(c) {
  const fm = { id: c.id, type: 'iv-craft', title: c.title, objective: c.objective };
  return `---
${YAML.stringify(fm).trim()}
---

## Concept

${c.concept}

## Why it matters

${c.why}

## Practice

${c.practice}

## Common mistakes

${c.mistakes}

## Related

${c.related.map((r) => `- ${r}`).join('\n')}
`;
}

function templatesMd() {
  return `# Interviewer Mode content templates

Validated structure for \`interview-qa/interviewer/\` content. Regenerate via \`node tools/content/generate-interviewer-mode.mjs\`.

## TEMPLATE 1 — Interview question (\`questions/<level>/IV-Q-*.md\`)

Frontmatter keys: \`id\`, \`type: iv-question\`, \`level\` (fresher|junior|mid|senior|architect), \`round\` (screening|theory|coding|design|behavioral-technical), \`kind\` (theory|scenario|coding|design), \`timebox\`, \`difficulty\` (1–5), \`topic\`, \`crosslinks\` (optional tier ids like a1, b12).

Required \`##\` sections **in order**: \`Question\`, \`What this tests\`, \`Model answer\`, \`Strong answer signals\`, \`Weak answer / red flags\`, \`Follow-up probes\`, \`Hint ladder\`, \`Scoring guide\`.

Scoring guide is a markdown table with columns **Score | Anchor** and rows **1, 2, 3, 4** only (no score 5).

Code in model answers must be strict TypeScript — no \`waitForTimeout\`, \`force: true\`, \`networkidle\`, hand-rolled retries, or legacy \`page.$\`.

## TEMPLATE 2 — Live coding task (\`coding/IV-CODE-*.md\`)

Frontmatter: \`id\`, \`type: iv-coding\`, \`level\`, \`round: coding\`, \`timebox\`, \`difficulty\`, \`topic\`, \`specFile\`.

Sections **in order**: \`Interviewer script\`, \`Task statement\`, \`Starter code\`, \`What to evaluate\`, \`Exemplar solution\`, \`Common candidate mistakes\`, \`Hint ladder\`, \`Rubric\`.

Companion runnable files under \`practice-suite/exercises/interviewer/\`: \`IV-CODE-NNN.ts\` (starter), \`IV-CODE-NNN.solution.ts\`, \`IV-CODE-NNN.spec.ts\`. Run via \`npm run exercise:interviewer\`.

## TEMPLATE 3 — Interview kit (\`kits/IV-KIT-*.md\`)

Frontmatter: \`id\`, \`type: iv-kit\`, \`level\`, \`round\`, \`duration\` (45 or 60).

Sections: \`Agenda\` (table, minutes sum to duration), \`Ordered questions\`, \`Backup questions\`, \`Scoring sheet\`, \`Hire bar\`, \`Do's & don'ts\`.

## TEMPLATE 4 — Interviewer craft lesson (\`craft/IV-CRAFT-*.md\`)

Frontmatter: \`id\`, \`type: iv-craft\`, \`title\`, \`objective\`.

Sections **in order**: \`Concept\`, \`Why it matters\`, \`Practice\`, \`Common mistakes\`, \`Related\`.

Reference hiring science (Schmidt & Hunter 1998, Huffcutt & Arthur 1994, Sackett et al. 2022, Google re:Work) — no banned content tokens in generated material.
`;
}

function rubricMd() {
  const fm = { id: 'IV-RUBRIC', type: 'iv-rubric', dimensions: 5 };
  return `---
${YAML.stringify(fm).trim()}
---

# Interviewer scoring rubric

Score each dimension **1–4** using behavioral anchors. Do not use score 5. Cite evidence bullets in notes.

## Technical depth

| Score | Anchor |
|-------|--------|
| 1 | Cannot explain Playwright mechanisms; relies on buzzwords or outdated Selenium habits. |
| 2 | Partial accuracy — knows terms (fixtures, storageState) but cannot sketch usage or confuses scopes. |
| 3 | Solid explanations with minor gaps; can write basic TypeScript examples when prompted. |
| 4 | Deep, precise answers — auto-wait, scopes, network, CI — with correct APIs and trade-offs unprompted. |

## Problem-solving process

| Score | Anchor |
|-------|--------|
| 1 | Random guessing; jumps to fixes without reproduction. |
| 2 | Some structure but skips trace/evidence; reaches for sleeps or retries. |
| 3 | Systematic triage (reproduce → trace → categorize → fix) with one missed step. |
| 4 | Consistent structured approach; names verification step and prevention guard. |

## Communication

| Score | Anchor |
|-------|--------|
| 1 | Cannot articulate reasoning; needs constant rephrasing. |
| 2 | Understandable but disorganized; jargon without explanation. |
| 3 | Clear narrative; explains trade-offs when asked. |
| 4 | Teaches-back clearly; checks understanding; adapts to whiteboard or live code. |

## Code quality

| Score | Anchor |
|-------|--------|
| 1 | Writes banned anti-patterns; no TypeScript structure. |
| 2 | Working-ish code with locator or async mistakes. |
| 3 | Clean web-first locators, proper await, readable naming. |
| 4 | Idiomatic Playwright Test — fixtures, isolation, no anti-patterns — production-ready style. |

## Judgment / trade-offs

| Score | Anchor |
|-------|--------|
| 1 | One-size-fits-all answers; no awareness of cost or flake. |
| 2 | Mentions trade-offs superficially when prompted. |
| 3 | Reasonable boundaries (mock vs live, E2E vs API) with light quantification. |
| 4 | Explicit non-goals, metrics (flake rate, CI minutes), and context-aware decisions. |

## References

- Schmidt, F. L., & Hunter, J. E. (1998). The validity and utility of selection methods in personnel psychology.
- Huffcutt, A. I., & Arthur, W. Jr. (1994). Hunter and Hunter (1984) revisited: Interview validity for job performance.
- Sackett, P. R., et al. (2022). Revisiting meta-analytic estimates of validity in personnel selection.
- Google re:Work — Structured behavioral interviewing practices.
`;
}

function diagramsJs() {
  const box = (x, y, w, h, label, fill = 'var(--panel)') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="var(--border)" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" fill="var(--text)" font-size="12" font-family="system-ui,sans-serif">${label}</text>`;
  const arrow = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-iv)"/>`;
  const wrap = (title, desc, body) =>
    `<svg role="img" width="520" height="320" xmlns="http://www.w3.org/2000/svg"><title>${title}</title><desc>${desc}</desc><defs><marker id="arr-iv" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="var(--accent)"/></marker></defs>${body}</svg>`;

  const ROUND = wrap(
    'Interview round flow',
    'Timed segments from intro to scoring',
    `
      ${box(160, 20, 200, 32, 'Intro + format', 'var(--accent)')}
      ${box(40, 80, 120, 32, 'Warm-up Q')}
      ${box(200, 80, 120, 32, 'Core depth Q')}
      ${box(360, 80, 120, 32, 'Live coding')}
      ${box(120, 140, 280, 32, 'Follow-up probes + hints')}
      ${box(160, 200, 200, 32, 'Candidate Q&A')}
      ${box(160, 260, 200, 32, 'Rubric scoring', 'var(--accent)')}
      ${arrow(260, 52, 100, 80)}
      ${arrow(260, 52, 260, 80)}
      ${arrow(260, 52, 420, 80)}
      ${arrow(260, 112, 260, 140)}
      ${arrow(260, 172, 260, 200)}
      ${arrow(260, 232, 260, 260)}
    `,
  );

  const SCORING = wrap(
    'Structured scoring',
    'Five rubric dimensions scored 1-4',
    `
      ${box(190, 20, 140, 36, 'Interview evidence', 'var(--accent)')}
      ${box(30, 90, 130, 28, 'Technical depth')}
      ${box(190, 90, 130, 28, 'Process')}
      ${box(350, 90, 130, 28, 'Communication')}
      ${box(110, 150, 130, 28, 'Code quality')}
      ${box(280, 150, 130, 28, 'Judgment')}
      ${box(160, 220, 200, 40, 'Hire recommendation', 'var(--accent)')}
      ${arrow(260, 56, 95, 90)}
      ${arrow(260, 56, 255, 90)}
      ${arrow(260, 56, 415, 90)}
      ${arrow(260, 56, 175, 150)}
      ${arrow(260, 56, 345, 150)}
      ${arrow(175, 178, 220, 220)}
      ${arrow(345, 178, 300, 220)}
    `,
  );

  const entries = {
    'IV-DIAG-ROUND-FLOW': ROUND,
    'IV-DIAG-SCORING': SCORING,
  };
  const body = Object.entries(entries)
    .map(([k, v]) => `  '${k}': ${JSON.stringify(v)}`)
    .join(',\n');
  return `/* Interviewer Mode diagrams — theme-aware inline SVG */
window.INTERVIEWER_DIAGRAMS = {
${body}
};
`;
}

function assertNoBannedTokens(content, file) {
  const banned = /\b(AI|LLM|MCP|GPT|copilot|self-healing|agent)\b/i;
  if (banned.test(content)) {
    throw new Error(`Banned token in ${file}`);
  }
}

function main() {
  const counts = {
    questions: { fresher: 0, junior: 0, mid: 0, senior: 0, architect: 0 },
    coding: 0,
    kits: 0,
    craft: 0,
    diagrams: 2,
  };

  write(path.join(IV, '_templates.md'), templatesMd());
  write(path.join(IV, '_rubric.md'), rubricMd());

  for (const q of QUESTIONS) {
    const slug = `${q.id}-${q.slug}`.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 80);
    const raw = questionMd(q);
    assertNoBannedTokens(raw, q.id);
    write(path.join(IV, 'questions', q.level, `${slug}.md`), raw);
    counts.questions[q.level]++;
  }

  for (const ex of CODING) {
    const fileBase = `${ex.id}-${ex.slug}`;
    const raw = codingMd(ex);
    assertNoBannedTokens(raw, ex.id);
    write(path.join(IV, 'coding', `${fileBase}.md`), raw);
    counts.coding++;

    write(path.join(EX_DIR, `${fileBase}.ts`), ex.starter.trim() + '\n');
    write(path.join(EX_DIR, `${fileBase}.solution.ts`), ex.solution.trim() + '\n');
    write(path.join(EX_DIR, `${fileBase}.spec.ts`), ex.spec.trim() + '\n');
  }

  for (const k of KITS) {
    const raw = kitMd(k);
    assertNoBannedTokens(raw, k.id);
    write(path.join(IV, 'kits', `${k.id}.md`), raw);
    counts.kits++;
  }

  for (const c of CRAFT) {
    const raw = craftMd(c);
    assertNoBannedTokens(raw, c.id);
    write(path.join(IV, 'craft', `${c.id}.md`), raw);
    counts.craft++;
  }

  write(path.join(ROOT, 'learning-site/interviewer-diagrams.js'), diagramsJs());

  write(
    path.join(EX_DIR, 'playwright.config.ts'),
    `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: /IV-CODE-.*\\.spec\\.ts$/,
  testIgnore: /\\.solution\\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  projects: [{ name: 'interviewer-exercises' }],
});
`,
  );

  const pkgPath = path.join(ROOT, 'practice-suite/package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts['exercise:interviewer'] =
    'playwright test -c exercises/interviewer/playwright.config.ts';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  const totalQ = Object.values(counts.questions).reduce((a, b) => a + b, 0);
  console.log('Interviewer Mode generated:', { ...counts, questionsTotal: totalQ });

  // Validate expected counts
  const expected = { fresher: 12, junior: 13, mid: 25, senior: 25, architect: 15 };
  for (const [level, n] of Object.entries(expected)) {
    if (counts.questions[level] !== n) {
      throw new Error(`Expected ${n} ${level} questions, got ${counts.questions[level]}`);
    }
  }
  if (counts.coding !== 10) throw new Error(`Expected 10 coding tasks, got ${counts.coding}`);
  if (counts.kits !== 8) throw new Error(`Expected 8 kits, got ${counts.kits}`);
  if (counts.craft !== 8) throw new Error(`Expected 8 craft lessons, got ${counts.craft}`);
}

main();
