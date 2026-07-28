/**
 * Tiny markdown helpers for the interview SSOT (no runtime deps).
 * Supports YAML frontmatter, ### ID. questions, Ideal / Stuck blocks,
 * and a small inline subset (**bold**, `code`).
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export function splitFrontmatter(raw) {
  if (!raw.startsWith('---\n') && !raw.startsWith('---\r\n')) {
    return { data: {}, body: raw };
  }
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: raw };
  const fm = raw.slice(4, end).replace(/\r/g, '');
  let body = raw.slice(end + 4);
  if (body.startsWith('\n') || body.startsWith('\r\n')) {
    body = body.replace(/^\r?\n/, '');
  }
  return { data: YAML.parse(fm) || {}, body };
}

export function inlineToHtml(text) {
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function blockToHtml(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return '<p></p>';
  // Preserve intentional blank-line paragraph breaks.
  const paras = trimmed.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim());
  return paras.map((p) => `<p>${inlineToHtml(p)}</p>`).join('');
}

export function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Scenario v2 optional bold-label sections, in documented order. */
const V2_FIELDS = [
  ['thinkFirst', 'Think first'],
  ['whyAsked', 'Why the interviewer asks this'],
  ['wrongAnswer', 'Common wrong answer'],
  ['realExample', 'Real project example'],
  ['followUps', 'Follow-up questions'],
];

function extractBoldSection(block, label, nextLabels) {
  const stopAlternation = nextLabels.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(
    `\\*\\*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*(?:${stopAlternation}):\\*\\*|$)`,
    'i',
  );
  const m = block.match(re);
  return (m?.[1] || '').trim();
}

/**
 * Parse a tier markdown file into question objects.
 * Expected shape (Scenario v2 — see interview-qa/_templates.md):
 *   ### A1. Question text?
 *   **Think first:** … (optional; required on Tier A/B)
 *   **Ideal approach:** …
 *   **Why they get stuck:** …
 *   **Why the interviewer asks this:** … (optional; required on Tier A/B)
 *   **Common wrong answer:** … (optional; required on Tier A/B)
 *   **Real project example:** … (optional; required on Tier A/B)
 *   **Follow-up questions:** … (optional; required on Tier A/B)
 *
 * @param {string} raw
 * @param {{ requireV2?: boolean, sourceFile?: string }} [opts]
 */
export function parseTierMarkdown(raw, opts = {}) {
  const { requireV2 = false, sourceFile = '(unknown file)' } = opts;
  const { data, body } = splitFrontmatter(raw);
  const questions = [];
  const allLabels = ['Think first', 'Ideal approach', 'Why they get stuck', ...V2_FIELDS.map((f) => f[1])];
  // NOTE: `\s*$` with the /m flag (needed for `^###`) matches at the end of
  // EVERY line, not just true end-of-string — `$(?![\s\S])` is the correct way
  // to anchor to the real end of the string regardless of the /m flag.
  const re =
    /^###\s+([A-Da-d]\d+)\.\s+(.+?)\r?\n([\s\S]*?)(?=^###\s+[A-Da-d]\d+\.|$(?![\s\S]))/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    const idRaw = m[1];
    const q = m[2].trim();
    const block = m[3];
    const idealMd = extractBoldSection(block, 'Ideal approach', allLabels.filter((l) => l !== 'Ideal approach'));
    const stuckMd = extractBoldSection(block, 'Why they get stuck', allLabels.filter((l) => l !== 'Why they get stuck'));
    const thinkFirstMd = extractBoldSection(block, 'Think first', allLabels.filter((l) => l !== 'Think first'));

    const question = {
      id: idRaw.toLowerCase(),
      q,
      ideal: blockToHtml(idealMd),
      stuck: blockToHtml(stuckMd),
      _idealMd: idealMd,
      _stuckMd: stuckMd,
    };
    if (thinkFirstMd) question.thinkFirst = blockToHtml(thinkFirstMd);

    for (const [key, label] of V2_FIELDS) {
      const md = extractBoldSection(block, label, allLabels.filter((l) => l !== label));
      if (md) question[key] = blockToHtml(md);
    }

    if (requireV2) {
      const missing = V2_FIELDS.filter(([key]) => !question[key]).map(([, label]) => label);
      if (missing.length) {
        throw new Error(
          `${sourceFile}: ${idRaw} is missing required Scenario v2 section(s): ${missing.join(', ')}`,
        );
      }
    }

    questions.push(question);
  }
  return { frontmatter: data, questions };
}

/**
 * Parse a Stuck-hub markdown file (interview-qa/stuck/*.md) into entry objects.
 * See interview-qa/_templates.md — Template 1.
 */
const STUCK_SECTIONS = [
  ['symptom', 'Symptom'],
  ['why', 'Why it happens'],
  ['debug', 'How to debug it'],
  ['fix', 'Fix'],
  ['bestPractice', 'Best practice'],
  ['wrongFixes', 'Common wrong fixes'],
  ['interviewAngle', 'Interview angle'],
];
const STUCK_CATEGORIES = [
  'login-auth',
  'locators',
  'frames-windows',
  'waits-timing',
  'network-api',
  'files-data',
  'parallel-ci',
  'flaky-debug',
];
const STUCK_SEVERITIES = ['common', 'tricky', 'rare'];

/** Strip standalone `---` horizontal-rule separator lines used for authoring readability. */
function stripHr(raw) {
  return raw.replace(/^[ \t]*---[ \t]*$\r?\n?/gm, '');
}

export function parseStuckMarkdown(raw, sourceFile = '(unknown file)') {
  raw = stripHr(raw);
  const entries = [];
  const re = /^##\s+(.+?)\r?\n([\s\S]*?)(?=^##\s+|\s*$(?![\s\S]))/gm;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const title = m[1].trim();
    const block = m[2];
    const idMatch = block.match(/^id:\s*(\S+)\s*$/m);
    const categoryMatch = block.match(/^category:\s*(\S+)\s*$/m);
    const severityMatch = block.match(/^severity:\s*(\S+)\s*$/m);
    const id = idMatch?.[1];
    const category = categoryMatch?.[1];
    const severity = severityMatch?.[1];
    if (!id) throw new Error(`${sourceFile}: entry "${title}" is missing required "id:" line`);
    if (!STUCK_CATEGORIES.includes(category)) {
      throw new Error(`${sourceFile}: entry "${id}" has invalid category "${category}"`);
    }
    if (!STUCK_SEVERITIES.includes(severity)) {
      throw new Error(`${sourceFile}: entry "${id}" has invalid severity "${severity}"`);
    }

    const sectionLabels = STUCK_SECTIONS.map((s) => s[1]).concat(['Related']);
    const entry = { id, title, category, severity };
    for (const [key, label] of STUCK_SECTIONS) {
      const re2 = new RegExp(
        `^###\\s+${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\r?\\n([\\s\\S]*?)(?=^###\\s+(?:${sectionLabels
          .filter((l) => l !== label)
          .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('|')})|\\s*$(?![\\s\\S]))`,
        'm',
      );
      const sm = block.match(re2);
      if (!sm) {
        throw new Error(`${sourceFile}: entry "${id}" is missing required section "### ${label}"`);
      }
      entry[key] = sm[1].trim();
    }
    const relatedMatch = block.match(/^###\s+Related\r?\n([\s\S]*?)(?=^##\s+|\s*$(?![\s\S]))/m);
    entry.related = (relatedMatch?.[1] || '').trim();

    entries.push(entry);
  }
  return entries;
}

/** Parse interview-qa/case-studies.md — production-failure stories. */
const CASE_SECTIONS = [
  ['situation', 'Situation'],
  ['impact', 'Impact'],
  ['investigation', 'Investigation'],
  ['rootCause', 'Root cause'],
  ['fix', 'Fix'],
  ['permanentChange', 'What we changed permanently'],
  ['interviewQuestion', 'Interview question this becomes'],
];

export function parseCaseStudies(raw, sourceFile = 'interview-qa/case-studies.md') {
  raw = stripHr(raw);
  const cases = [];
  const re = /^##\s+(.+?)\r?\n([\s\S]*?)(?=^##\s+|\s*$(?![\s\S]))/gm;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const title = m[1].trim();
    const block = m[2];
    const idMatch = block.match(/^id:\s*(\S+)\s*$/m);
    const id = idMatch?.[1];
    if (!id) throw new Error(`${sourceFile}: case "${title}" is missing required "id:" line`);

    const sectionLabels = CASE_SECTIONS.map((s) => s[1]).concat(['Related']);
    const item = { id, title };
    for (const [key, label] of CASE_SECTIONS) {
      const re2 = new RegExp(
        `^###\\s+${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\r?\\n([\\s\\S]*?)(?=^###\\s+(?:${sectionLabels
          .filter((l) => l !== label)
          .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('|')})|\\s*$(?![\\s\\S]))`,
        'm',
      );
      const sm = block.match(re2);
      if (!sm) {
        throw new Error(`${sourceFile}: case "${id}" is missing required section "### ${label}"`);
      }
      item[key] = sm[1].trim();
    }
    const relatedMatch = block.match(/^###\s+Related\r?\n([\s\S]*?)(?=^##\s+|\s*$(?![\s\S]))/m);
    const related = (relatedMatch?.[1] || '')
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (related.length < 2) {
      throw new Error(`${sourceFile}: case "${id}" must link at least 2 related stuck entries (found ${related.length})`);
    }
    item.related = related;
    cases.push(item);
  }
  return cases;
}

const FORBIDDEN_CODE_TOKENS = ['waitForTimeout', 'force: true', 'force:true', 'networkidle'];

export function assertNoForbiddenTokens(code, sourceFile) {
  for (const tok of FORBIDDEN_CODE_TOKENS) {
    if (code.includes(tok)) {
      throw new Error(`${sourceFile}: forbidden anti-pattern token "${tok}" in code block`);
    }
  }
}

const LESSON_HEADINGS = [
  'Concept',
  'Why it matters',
  'Architecture decision',
  'TypeScript implementation',
  'Trade-offs',
  'What NOT to do',
  'Interview angle',
  'Related',
];

/**
 * Parse a Framework Lesson markdown file (YAML frontmatter + ## sections).
 * @see interview-qa/_templates.md
 */
export function parseFrameworkLesson(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'framework-lesson') {
    throw new Error(`${sourceFile}: expected type: framework-lesson`);
  }
  if (!/^FW-L-\d{3}$/.test(String(data.id || ''))) {
    throw new Error(`${sourceFile}: id must match FW-L-NNN (got ${data.id})`);
  }
  const requiredFm = ['id', 'type', 'stage', 'title', 'objective', 'topic'];
  for (const k of requiredFm) {
    if (data[k] == null || data[k] === '') {
      throw new Error(`${sourceFile}: missing frontmatter key "${k}"`);
    }
  }
  if (data.topic !== 'framework') {
    throw new Error(`${sourceFile}: topic must be "framework"`);
  }
  const sections = {};
  for (let i = 0; i < LESSON_HEADINGS.length; i++) {
    const label = LESSON_HEADINGS[i];
    const next = LESSON_HEADINGS.slice(i + 1);
    const stop = next.length
      ? `(?=^##\\s+(?:${next.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})|$(?![\\s\\S]))`
      : `(?=$(?![\\s\\S]))`;
    const re = new RegExp(`^##\\s+${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\r?\\n([\\s\\S]*?)${stop}`, 'm');
    const m = body.match(re);
    if (!m) throw new Error(`${sourceFile}: missing required heading "## ${label}"`);
    sections[label] = m[1].trim();
  }
  const impl = sections['TypeScript implementation'];
  const codeBlocks = [...impl.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (const block of codeBlocks) assertNoForbiddenTokens(block, sourceFile);

  return {
    id: data.id,
    type: data.type,
    stage: Number(data.stage),
    title: data.title,
    objective: data.objective,
    topic: data.topic,
    subtopics: data.subtopics || [],
    diagram: data.diagram || null,
    mcqs: data.mcqs || [],
    exercise: data.exercise || null,
    related: data.related || [],
    concept: sections.Concept,
    whyMatters: sections['Why it matters'],
    architecture: sections['Architecture decision'],
    implementation: impl,
    tradeoffs: sections['Trade-offs'],
    whatNotToDo: sections['What NOT to do'],
    interviewAngle: sections['Interview angle'],
    relatedBody: sections.Related,
  };
}

/**
 * Parse a Framework MCQ markdown file.
 */
export function parseFrameworkMcq(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'framework-mcq') {
    throw new Error(`${sourceFile}: expected type: framework-mcq`);
  }
  if (!/^FW-Q-\d{3}$/.test(String(data.id || ''))) {
    throw new Error(`${sourceFile}: id must match FW-Q-NNN`);
  }
  const answerIndex = Number(data.answerIndex);
  if (![0, 1, 2, 3].includes(answerIndex)) {
    throw new Error(`${sourceFile}: answerIndex must be 0..3 (got ${data.answerIndex})`);
  }
  const qMatch = body.match(/^##\s+Question\r?\n([\s\S]*?)(?=^##\s+Options|$(?![\s\S]))/m);
  const optMatch = body.match(/^##\s+Options\r?\n([\s\S]*?)(?=^##\s+Correct answer|$(?![\s\S]))/m);
  const correctMatch = body.match(/^##\s+Correct answer\r?\n([\s\S]*?)(?=^##\s+Why correct|$(?![\s\S]))/m);
  const whyMatch = body.match(/^##\s+Why correct\r?\n([\s\S]*?)(?=^##\s+Why the others are wrong|$(?![\s\S]))/m);
  const wrongMatch = body.match(/^##\s+Why the others are wrong\r?\n([\s\S]*?)(?=$(?![\s\S]))/m);
  if (!qMatch || !optMatch || !correctMatch || !whyMatch || !wrongMatch) {
    throw new Error(`${sourceFile}: missing one or more required MCQ headings`);
  }
  const options = [...optMatch[1].matchAll(/^\d+\.\s+(.+)$/gm)].map((m) => m[1].trim());
  if (options.length !== 4) {
    throw new Error(`${sourceFile}: Options must have exactly 4 numbered items (found ${options.length})`);
  }
  const whyWrong = [...wrongMatch[1].matchAll(/^-\s+(.+)$/gm)].map((m) => m[1].trim());
  if (whyWrong.length !== 3) {
    throw new Error(`${sourceFile}: Why the others are wrong must have exactly 3 bullets (found ${whyWrong.length})`);
  }
  return {
    id: data.id,
    type: data.type,
    topic: data.topic || 'framework',
    subtopic: data.subtopic || '',
    difficulty: data.difficulty || 'intermediate',
    stage: Number(data.stage),
    answerIndex,
    lesson: data.lesson || null,
    question: qMatch[1].trim(),
    options,
    correctAnswer: correctMatch[1].trim(),
    whyCorrect: whyMatch[1].trim(),
    whyWrong,
  };
}

/**
 * Parse a Framework coding exercise markdown file.
 */
export function parseFrameworkExercise(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'framework-exercise') {
    throw new Error(`${sourceFile}: expected type: framework-exercise`);
  }
  if (!/^FW-X-\d{2}$/.test(String(data.id || ''))) {
    throw new Error(`${sourceFile}: id must match FW-X-NN`);
  }
  const headings = ['Goal', 'Starter code', 'Task', 'Hints', 'Solution', 'Solution walkthrough', 'Self-check'];
  const sections = {};
  for (let i = 0; i < headings.length; i++) {
    const label = headings[i];
    const next = headings.slice(i + 1);
    const stop = next.length
      ? `(?=^##\\s+(?:${next.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})|$(?![\\s\\S]))`
      : `(?=$(?![\\s\\S]))`;
    const re = new RegExp(`^##\\s+${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\r?\\n([\\s\\S]*?)${stop}`, 'm');
    const m = body.match(re);
    if (!m) throw new Error(`${sourceFile}: missing "## ${label}"`);
    sections[label] = m[1].trim();
  }
  for (const key of ['Starter code', 'Solution']) {
    const blocks = [...sections[key].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
    for (const block of blocks) assertNoForbiddenTokens(block, `${sourceFile} (${key})`);
  }
  return {
    id: data.id,
    type: data.type,
    topic: data.topic || 'framework',
    stage: Number(data.stage),
    difficulty: data.difficulty || 'intermediate',
    lesson: data.lesson || null,
    specFile: data.specFile,
    runCommand: data.runCommand,
    goal: sections.Goal,
    starter: sections['Starter code'],
    task: sections.Task,
    hints: sections.Hints,
    solution: sections.Solution,
    walkthrough: sections['Solution walkthrough'],
    selfCheck: sections['Self-check'],
  };
}

/**
 * Parse Framework interview scenarios (Scenario v2 shape, ids FW-S-*).
 * File may contain multiple ### FW-S-NN. questions.
 */
export function parseFrameworkScenarios(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  const questions = [];
  const allLabels = [
    'Think first',
    'Ideal approach',
    'Why they get stuck',
    'Why the interviewer asks this',
    'Common wrong answer',
    'Real project example',
    'Follow-up questions',
  ];
  const re = /^###\s+(FW-S-\d+)\.\s+(.+?)\r?\n([\s\S]*?)(?=^###\s+FW-S-\d+\.|$(?![\s\S]))/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    const id = m[1];
    const q = m[2].trim();
    const block = m[3];
    const idealMd = extractBoldSection(block, 'Ideal approach', allLabels.filter((l) => l !== 'Ideal approach'));
    const stuckMd = extractBoldSection(block, 'Why they get stuck', allLabels.filter((l) => l !== 'Why they get stuck'));
    if (!idealMd || !stuckMd) {
      throw new Error(`${sourceFile}: ${id} missing Ideal approach or Why they get stuck`);
    }
    const item = {
      id: id.toLowerCase(),
      q,
      ideal: blockToHtml(idealMd),
      stuck: blockToHtml(stuckMd),
      topic: 'framework',
      tier: data.tier || 'framework',
    };
    for (const [key, label] of V2_FIELDS) {
      const md = extractBoldSection(block, label, allLabels.filter((l) => l !== label));
      if (md) item[key] = blockToHtml(md);
    }
    const missing = V2_FIELDS.filter(([key]) => !item[key]).map(([, label]) => label);
    if (missing.length) {
      throw new Error(`${sourceFile}: ${id} missing Scenario v2 section(s): ${missing.join(', ')}`);
    }
    questions.push(item);
  }
  return { frontmatter: data, questions };
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractMdSection(body, label, nextLabels, sourceFile) {
  const stop = nextLabels.length
    ? `(?=^##\\s+(?:${nextLabels.map(escRe).join('|')})|$(?![\\s\\S]))`
    : `(?=$(?![\\s\\S]))`;
  const re = new RegExp(`^##\\s+${escRe(label)}\\r?\\n([\\s\\S]*?)${stop}`, 'm');
  const m = body.match(re);
  if (!m) throw new Error(`${sourceFile}: missing required heading "## ${label}"`);
  return m[1].trim();
}

function parseBulletList(md) {
  return [...md.matchAll(/^-\s+(.+)$/gm)].map((m) => m[1].trim());
}

function parseScoringTable(md, sourceFile, id) {
  const scoring = {};
  for (const m of md.matchAll(/^\|\s*(\d)\s*\|\s*(.+?)\s*\|$/gm)) {
    scoring[Number(m[1])] = m[2].trim();
  }
  for (const s of [1, 2, 3, 4]) {
    if (!scoring[s]) {
      throw new Error(`${sourceFile}: ${id} scoring guide missing anchor for score ${s}`);
    }
  }
  return scoring;
}

function parseHintLadder(md) {
  return [...md.matchAll(/<details>\s*<summary>Hint (\d+)<\/summary>\s*([\s\S]*?)<\/details>/gi)]
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map((m) => m[2].trim());
}

const IV_QUESTION_HEADINGS = [
  'Question',
  'What this tests',
  'Model answer',
  'Strong answer signals',
  'Weak answer / red flags',
  'Follow-up probes',
  'Hint ladder',
  'Scoring guide',
];

const IV_CODING_HEADINGS = [
  'Interviewer script',
  'Task statement',
  'Starter code',
  'What to evaluate',
  'Exemplar solution',
  'Common candidate mistakes',
  'Hint ladder',
  'Rubric',
];

const IV_CRAFT_HEADINGS = ['Concept', 'Why it matters', 'Practice', 'Common mistakes', 'Related'];

/**
 * Parse Interviewer Mode question (`type: iv-question`).
 */
export function parseInterviewerQuestion(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'iv-question') {
    throw new Error(`${sourceFile}: expected type: iv-question`);
  }
  if (!/^IV-Q-/.test(String(data.id || ''))) {
    throw new Error(`${sourceFile}: id must match IV-Q-* (got ${data.id})`);
  }
  const levels = ['fresher', 'junior', 'mid', 'senior', 'architect'];
  if (!levels.includes(data.level)) {
    throw new Error(`${sourceFile}: invalid level "${data.level}"`);
  }
  const sections = {};
  for (let i = 0; i < IV_QUESTION_HEADINGS.length; i++) {
    sections[IV_QUESTION_HEADINGS[i]] = extractMdSection(
      body,
      IV_QUESTION_HEADINGS[i],
      IV_QUESTION_HEADINGS.slice(i + 1),
      sourceFile,
    );
  }
  const modelAnswer = sections['Model answer'];
  const codeBlocks = [...modelAnswer.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (const block of codeBlocks) assertNoForbiddenTokens(block, sourceFile);

  return {
    id: data.id,
    type: data.type,
    level: data.level,
    round: data.round,
    kind: data.kind,
    timebox: Number(data.timebox),
    difficulty: Number(data.difficulty),
    topic: data.topic,
    crosslinks: data.crosslinks || [],
    question: sections.Question,
    tests: sections['What this tests'],
    modelAnswer,
    strongSignals: parseBulletList(sections['Strong answer signals']),
    weakSignals: parseBulletList(sections['Weak answer / red flags']),
    followUps: parseBulletList(sections['Follow-up probes']),
    hints: parseHintLadder(sections['Hint ladder']),
    scoring: parseScoringTable(sections['Scoring guide'], sourceFile, data.id),
  };
}

/**
 * Parse Interviewer Mode live coding task (`type: iv-coding`).
 */
export function parseInterviewerCoding(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'iv-coding') {
    throw new Error(`${sourceFile}: expected type: iv-coding`);
  }
  if (!/^IV-CODE-\d{3}$/.test(String(data.id || ''))) {
    throw new Error(`${sourceFile}: id must match IV-CODE-NNN`);
  }
  const sections = {};
  for (let i = 0; i < IV_CODING_HEADINGS.length; i++) {
    sections[IV_CODING_HEADINGS[i]] = extractMdSection(
      body,
      IV_CODING_HEADINGS[i],
      IV_CODING_HEADINGS.slice(i + 1),
      sourceFile,
    );
  }
  return {
    id: data.id,
    type: data.type,
    level: data.level,
    round: data.round || 'coding',
    timebox: Number(data.timebox),
    difficulty: Number(data.difficulty),
    topic: data.topic,
    specFile: data.specFile,
    script: sections['Interviewer script'],
    task: sections['Task statement'],
    starter: sections['Starter code'],
    evaluate: parseBulletList(sections['What to evaluate']),
    solution: sections['Exemplar solution'],
    mistakes: parseBulletList(sections['Common candidate mistakes']),
    hints: parseHintLadder(sections['Hint ladder']),
    rubric: [...sections.Rubric.matchAll(/^\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|$/gm)]
      .filter((m) => !m[1].includes('---') && !/^Dimension$/i.test(m[1].trim()))
      .map((m) => [m[1].trim(), m[2].trim()]),
  };
}

/**
 * Parse Interviewer Mode kit (`type: iv-kit`).
 */
export function parseInterviewerKit(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'iv-kit') {
    throw new Error(`${sourceFile}: expected type: iv-kit`);
  }
  if (!/^IV-KIT-/.test(String(data.id || ''))) {
    throw new Error(`${sourceFile}: id must match IV-KIT-*`);
  }
  const agendaMd = extractMdSection(body, 'Agenda', ['Ordered questions'], sourceFile);
  const orderedMd = extractMdSection(body, 'Ordered questions', ['Backup questions'], sourceFile);
  const backupMd = extractMdSection(body, 'Backup questions', ['Scoring sheet'], sourceFile);
  const hireBar = extractMdSection(body, 'Hire bar', ["Do's & don'ts"], sourceFile);
  const dosDonts = extractMdSection(body, "Do's & don'ts", [], sourceFile);

  const agenda = [...agendaMd.matchAll(/^\|\s*([^|*]+?)\s*\|\s*(\d+)\s*\|/gm)]
    .filter((m) => !/Segment|Minutes|^[-| ]+$/.test(m[1]))
    .map((m) => [m[1].trim(), Number(m[2])]);
  const agendaTotal = agenda.reduce((s, [, m]) => s + m, 0);
  if (agendaTotal !== Number(data.duration)) {
    throw new Error(
      `${sourceFile}: agenda minutes sum to ${agendaTotal}, expected duration ${data.duration}`,
    );
  }
  const questions = [...orderedMd.matchAll(/^-\s+`([^`]+)`\s+\((\d+)\s*min\)/gm)].map((m) => ({
    id: m[1],
    timebox: Number(m[2]),
  }));
  const backup = [...backupMd.matchAll(/^-\s+`([^`]+)`/gm)].map((m) => m[1]);

  const dosBlock = dosDonts.match(/\*\*Do's\*\*\s*([\s\S]*?)(?=\*\*Don'ts\*\*|$)/i);
  const dontsBlock = dosDonts.match(/\*\*Don'ts\*\*\s*([\s\S]*?)$/i);
  const dos = dosBlock ? parseBulletList(dosBlock[1]) : [];
  const donts = dontsBlock ? parseBulletList(dontsBlock[1]) : [];

  return {
    id: data.id,
    type: data.type,
    level: data.level,
    round: data.round,
    duration: Number(data.duration),
    agenda,
    questions,
    backup,
    hireBar,
    dos,
    donts,
  };
}

/**
 * Parse Interviewer craft lesson (`type: iv-craft`).
 */
export function parseInterviewerCraft(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'iv-craft') {
    throw new Error(`${sourceFile}: expected type: iv-craft`);
  }
  if (!/^IV-CRAFT-\d{3}$/.test(String(data.id || ''))) {
    throw new Error(`${sourceFile}: id must match IV-CRAFT-NNN`);
  }
  const sections = {};
  for (let i = 0; i < IV_CRAFT_HEADINGS.length; i++) {
    sections[IV_CRAFT_HEADINGS[i]] = extractMdSection(
      body,
      IV_CRAFT_HEADINGS[i],
      IV_CRAFT_HEADINGS.slice(i + 1),
      sourceFile,
    );
  }
  return {
    id: data.id,
    type: data.type,
    title: data.title,
    objective: data.objective,
    concept: sections.Concept,
    why: sections['Why it matters'],
    practice: sections.Practice,
    mistakes: sections['Common mistakes'],
    related: parseBulletList(sections.Related),
  };
}

/**
 * Parse shared rubric partial (`type: iv-rubric`).
 */
export function parseInterviewerRubric(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'iv-rubric') {
    throw new Error(`${sourceFile}: expected type: iv-rubric`);
  }
  const dimensions = [
    'Technical depth',
    'Problem-solving process',
    'Communication',
    'Code quality',
    'Judgment / trade-offs',
  ];
  const rubric = {};
  for (const dim of dimensions) {
    const section = extractMdSection(body, dim, dimensions.filter((d) => d !== dim), sourceFile);
    rubric[dim] = parseScoringTable(section, sourceFile, data.id);
  }
  return { id: data.id, type: data.type, dimensions: data.dimensions || 5, rubric };
}

const SKILL_LESSON_HEADINGS = [
  'Concept',
  'Why it matters for QA',
  'Worked example',
  'Common mistakes',
  'Interview angle',
  'Try it',
  'Recap bullets',
];

export function parseSkillTrack(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'skill-track') throw new Error(`${sourceFile}: expected type: skill-track`);
  if (!/^SK-[A-Z]+$/.test(String(data.id || ''))) throw new Error(`${sourceFile}: invalid track id`);
  const titleMatch = body.match(/^#\s+(.+)$/m);
  return {
    id: data.id,
    type: data.type,
    slug: data.slug,
    title: data.title,
    order: Number(data.order),
    estMinutes: Number(data.estMinutes),
    lessonIds: data.lessonIds || [],
    mcqIds: data.mcqIds || [],
    exerciseIds: data.exerciseIds || [],
    prerequisites: data.prerequisites || [],
    description: body.replace(/^#[^\n]+\n*/m, '').trim().slice(0, 500),
  };
}

export function parseSkillLesson(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'skill-lesson') throw new Error(`${sourceFile}: expected type: skill-lesson`);
  if (!/^SK-[A-Z]+-L\d{2}$/.test(String(data.id || ''))) {
    throw new Error(`${sourceFile}: id must match SK-TRACK-LNN`);
  }
  const sections = {};
  for (let i = 0; i < SKILL_LESSON_HEADINGS.length; i++) {
    sections[SKILL_LESSON_HEADINGS[i]] = extractMdSection(
      body,
      SKILL_LESSON_HEADINGS[i],
      SKILL_LESSON_HEADINGS.slice(i + 1),
      sourceFile,
    );
  }
  const example = sections['Worked example'];
  const codeBlocks = [...example.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (const block of codeBlocks) assertNoForbiddenTokens(block, sourceFile);
  return {
    id: data.id,
    type: data.type,
    track: data.track,
    title: data.title,
    topic: data.topic,
    estMinutes: Number(data.estMinutes),
    prereqIds: data.prereqIds || [],
    exerciseId: data.exerciseId || null,
    mcqIds: data.mcqIds || [],
    concept: sections.Concept,
    why: sections['Why it matters for QA'],
    example,
    mistakes: sections['Common mistakes'],
    interview: sections['Interview angle'],
    tryIt: sections['Try it'],
    recap: parseBulletList(sections['Recap bullets']),
  };
}

export function parseSkillMcq(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'skill-mcq') throw new Error(`${sourceFile}: expected type: skill-mcq`);
  const answerIndex = Number(data.answerIndex);
  if (![0, 1, 2, 3].includes(answerIndex)) {
    throw new Error(`${sourceFile}: answerIndex must be 0..3`);
  }
  const qMatch = body.match(/^##\s+Question\r?\n([\s\S]*?)(?=^##\s+Options|$(?![\s\S]))/m);
  const optMatch = body.match(/^##\s+Options\r?\n([\s\S]*?)(?=^##\s+Correct answer|$(?![\s\S]))/m);
  const correctMatch = body.match(/^##\s+Correct answer\r?\n([\s\S]*?)(?=^##\s+Why correct|$(?![\s\S]))/m);
  const whyMatch = body.match(/^##\s+Why correct\r?\n([\s\S]*?)(?=^##\s+Why the others are wrong|$(?![\s\S]))/m);
  const wrongMatch = body.match(/^##\s+Why the others are wrong\r?\n([\s\S]*?)(?=$(?![\s\S]))/m);
  if (!qMatch || !optMatch || !correctMatch || !whyMatch || !wrongMatch) {
    throw new Error(`${sourceFile}: missing MCQ headings`);
  }
  const options = [...optMatch[1].matchAll(/^\d+\.\s+(.+)$/gm)].map((m) => m[1].trim());
  if (options.length !== 4) throw new Error(`${sourceFile}: need 4 options`);
  const whyWrong = [...wrongMatch[1].matchAll(/^-\s+(.+)$/gm)].map((m) => m[1].trim());
  if (whyWrong.length !== 3) throw new Error(`${sourceFile}: need 3 distractor explanations`);
  return {
    id: data.id,
    type: data.type,
    track: data.track,
    topic: data.topic,
    difficulty: Number(data.difficulty),
    answerIndex,
    question: qMatch[1].trim(),
    options,
    correctAnswer: correctMatch[1].trim(),
    whyCorrect: whyMatch[1].trim(),
    whyWrong,
  };
}

export function parseSkillExercise(raw, sourceFile = '(unknown)') {
  const { data, body } = splitFrontmatter(raw);
  if (data.type !== 'skill-exercise') throw new Error(`${sourceFile}: expected type: skill-exercise`);
  const goalMatch = body.match(/^##\s+Goal\r?\n([\s\S]*?)(?=^##\s+Starter code|$(?![\s\S]))/m);
  const starterMatch = body.match(/^##\s+Starter code\r?\n([\s\S]*?)(?=^##\s+Task|$(?![\s\S]))/m);
  const solutionMatch = body.match(/^##\s+Solution\r?\n([\s\S]*?)(?=^##\s+Solution walkthrough|$(?![\s\S]))/m);
  if (!goalMatch || !starterMatch || !solutionMatch) {
    throw new Error(`${sourceFile}: missing exercise sections`);
  }
  if (data.kind === 'playwright') {
    const blocks = [...solutionMatch[1].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
    for (const block of blocks) assertNoForbiddenTokens(block, sourceFile);
  }
  return {
    id: data.id,
    type: data.type,
    track: data.track,
    topic: data.topic,
    kind: data.kind,
    specFile: data.specFile,
    runCommand: data.runCommand,
    expectedOutput: data.expectedOutput || '',
    goal: goalMatch[1].trim(),
    starter: starterMatch[1].trim(),
    solution: solutionMatch[1].trim(),
  };
}

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function writeText(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
}

export function stableStringifyJs(value, indent = 2) {
  return stringifyValue(value, indent, 0);
}

function stringifyValue(value, indent, depth) {
  const pad = ' '.repeat(indent * depth);
  const padIn = ' '.repeat(indent * (depth + 1));
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    const items = value.map((v) => `${padIn}${stringifyValue(v, indent, depth + 1)}`);
    return `[\n${items.join(',\n')}\n${pad}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return '{}';
    const items = keys.map((k) => {
      const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
      return `${padIn}${key}: ${stringifyValue(value[k], indent, depth + 1)}`;
    });
    return `{\n${items.join(',\n')},\n${pad}}`;
  }
  throw new Error(`Unsupported value: ${typeof value}`);
}
