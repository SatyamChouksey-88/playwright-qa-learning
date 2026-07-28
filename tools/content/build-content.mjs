#!/usr/bin/env node
/**
 * Author-time content pipeline (Stage 2).
 *
 * SSOT: interview-qa/*.md + interview-qa/_meta.yaml + interview-qa/stuck/*.md
 * Emits (committed artifacts; runtime stays zero-install / file:// safe):
 *   - learning-site/interview-data.js
 *   - learning-site/interview/*.md (mirrors of every interview-qa/*.md)
 *   - learning-site/stuck-data.js    → window.STUCK_ENTRIES = [...]
 *   - learning-site/cases-data.js    → window.CASE_STUDIES = [...]
 *   - learning-site/search-index.js  → window.SEARCH_INDEX = {…}
 *   - learning-site/reading-times.js → window.READING_TIMES = {…}
 *   - interview-qa/scenario-based-question-bank.md (consolidated mirror)
 *
 * Usage:
 *   node tools/content/build-content.mjs           # write
 *   node tools/content/build-content.mjs --check   # fail if dirty
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import MiniSearch from 'minisearch';
import {
  parseTierMarkdown,
  parseStuckMarkdown,
  parseCaseStudies,
  parseFrameworkLesson,
  parseFrameworkMcq,
  parseFrameworkExercise,
  parseFrameworkScenarios,
  parseInterviewerQuestion,
  parseInterviewerCoding,
  parseInterviewerKit,
  parseInterviewerCraft,
  parseInterviewerRubric,
  parseSkillTrack,
  parseSkillLesson,
  parseSkillMcq,
  parseSkillExercise,
  readText,
  writeText,
  stableStringifyJs,
  stripHtml,
  splitFrontmatter,
} from './md-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const checkOnly = process.argv.includes('--check');

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function ensureFrontmatter(filePath, fmObject) {
  const raw = readText(filePath);
  const { body } = splitFrontmatter(raw);
  const fm = `---\n${YAML.stringify(fmObject).trim()}\n---\n\n`;
  return fm + body.replace(/^\uFEFF/, '').replace(/^\s+/, '');
}

function lintTemplateCoverage(interviewData, stuckEntries) {
  const violations = [];
  for (const [key, block] of Object.entries(interviewData)) {
    if (!block?.questions) continue;
    for (const q of block.questions) {
      if (!q.thinkFirst && key === 'tierA') {
        violations.push(`${q.id}: missing Scenario v2 "Think first" (Tier A)`);
      }
    }
  }
  for (const e of stuckEntries) {
    for (const field of ['symptom', 'why', 'debug', 'fix']) {
      if (!e[field]?.trim()) violations.push(`stuck:${e.id}: missing ${field}`);
    }
  }
  if (violations.length) {
    throw new Error(`Template linter failed:\n  - ${violations.join('\n  - ')}`);
  }
}

function loadMeta() {
  return YAML.parse(readText(path.join(ROOT, 'interview-qa/_meta.yaml')));
}

function renderConsolidatedBank(meta, interviewData) {
  const lines = [
    '# Scenario-based Playwright interview bank',
    '',
    '> Generated mirror — edit `interview-qa/01-junior.md` … `04-architect.md` then run `npm run build:content`.',
    '',
    meta.hub?.lead || '',
    '',
  ];
  for (const info of Object.values(meta.tiers)) {
    const block = interviewData[info.key];
    lines.push(`## ${block.title}`, '', block.lead, '');
    for (const q of block.questions) {
      const num = q.id.toUpperCase();
      lines.push(`### ${num}. ${q.q}`);
      lines.push(`**Ideal approach:** ${stripHtml(q.ideal)}`);
      lines.push(`**Why they get stuck:** ${stripHtml(q.stuck)}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

/** ~200 wpm; at least 1 min when there is any prose. */
function readingMinutesFromText(text) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.round(words / 200));
}

function collectSearchDocuments(interviewData, stuckEntries = [], caseStudies = [], framework = null, interviewer = null, skills = null) {
  const docs = [];
  const readingTimes = {};

  for (const e of stuckEntries) {
    const fullBody = [e.symptom, e.why, e.debug, e.fix, e.bestPractice, e.wrongFixes, e.interviewAngle].join(' ');
    const mins = readingMinutesFromText(fullBody);
    if (mins) readingTimes[e.id] = mins;
    docs.push({
      id: `stuck:${e.id}`,
      kind: 'stuck',
      target: e.id,
      title: e.title,
      nav: `Project Stuck? · ${e.category}`,
      body: fullBody.slice(0, 4000),
    });
  }

  for (const c of caseStudies) {
    const fullBody = [c.situation, c.impact, c.investigation, c.rootCause, c.fix, c.permanentChange, c.interviewQuestion].join(' ');
    const mins = readingMinutesFromText(fullBody);
    if (mins) readingTimes[c.id] = mins;
    docs.push({
      id: `case:${c.id}`,
      kind: 'case-study',
      target: c.id,
      title: c.title,
      nav: 'Production case studies',
      body: fullBody.slice(0, 4000),
    });
  }

  if (framework) {
    for (const l of framework.lessons) {
      const fullBody = [l.objective, l.concept, l.whyMatters, l.architecture, l.tradeoffs, l.whatNotToDo, l.interviewAngle].join(' ');
      const mins = readingMinutesFromText(fullBody);
      if (mins) readingTimes[l.id] = mins;
      docs.push({
        id: `fw-lesson:${l.id}`,
        kind: 'framework',
        target: l.id,
        title: l.title,
        nav: `Framework Academy · Stage ${l.stage}`,
        body: fullBody.slice(0, 4000),
      });
    }
    for (const m of framework.mcqs) {
      docs.push({
        id: `fw-mcq:${m.id}`,
        kind: 'framework-mcq',
        target: m.id,
        title: m.question.slice(0, 120),
        nav: 'Framework MCQ',
        body: [m.question, ...m.options, m.whyCorrect].join(' ').slice(0, 2000),
      });
    }
    for (const s of framework.scenarios) {
      docs.push({
        id: `fw-scenario:${s.id}`,
        kind: 'framework-scenario',
        target: s.id,
        title: s.q,
        nav: 'Framework interview',
        body: stripHtml(s.ideal + ' ' + s.stuck).slice(0, 3000),
      });
    }
  }

  if (interviewer) {
    for (const q of interviewer.questions) {
      const fullBody = [q.question, q.tests, q.modelAnswer, q.strongSignals.join(' ')].join(' ');
      const mins = readingMinutesFromText(fullBody);
      if (mins) readingTimes[q.id] = mins;
      docs.push({
        id: `iv-q:${q.id}`,
        kind: 'iv-question',
        target: q.id,
        title: q.question.slice(0, 120),
        nav: `Interviewer · ${q.level} · ${q.round}`,
        body: fullBody.slice(0, 4000),
      });
    }
    for (const c of interviewer.coding) {
      docs.push({
        id: `iv-code:${c.id}`,
        kind: 'iv-coding',
        target: c.id,
        title: c.task.slice(0, 120),
        nav: `Interviewer coding · ${c.level}`,
        body: [c.task, c.script, c.evaluate.join(' ')].join(' ').slice(0, 4000),
      });
    }
    for (const k of interviewer.kits) {
      docs.push({
        id: `iv-kit:${k.id}`,
        kind: 'iv-kit',
        target: k.id,
        title: k.id.replace(/^IV-KIT-/, '').replace(/-/g, ' '),
        nav: `Interview kit · ${k.level} · ${k.duration}m`,
        body: [k.hireBar, k.questions.map((q) => q.id).join(' ')].join(' ').slice(0, 2000),
      });
    }
    for (const c of interviewer.craft) {
      const fullBody = [c.concept, c.why, c.practice].join(' ');
      docs.push({
        id: `iv-craft:${c.id}`,
        kind: 'iv-craft',
        target: c.id,
        title: c.title,
        nav: 'Interviewer craft',
        body: fullBody.slice(0, 4000),
      });
    }
  }

  if (skills) {
    for (const t of skills.tracks) {
      docs.push({
        id: `sk-track:${t.id}`,
        kind: 'skill-track',
        target: t.id,
        title: t.title,
        nav: `Skills · ${t.title}`,
        body: t.description.slice(0, 4000),
      });
    }
    for (const l of skills.lessons) {
      const fullBody = [l.concept, l.why, l.interview].join(' ');
      docs.push({
        id: `sk-lesson:${l.id}`,
        kind: 'skill-lesson',
        target: l.id,
        title: l.title,
        nav: `Skills · ${l.track}`,
        body: fullBody.slice(0, 4000),
      });
    }
    for (const m of skills.mcqs) {
      docs.push({
        id: `sk-mcq:${m.id}`,
        kind: 'skill-mcq',
        target: m.id,
        title: m.question.slice(0, 120),
        nav: 'Skills MCQ',
        body: [m.question, ...m.options].join(' ').slice(0, 2000),
      });
    }
  }

  // Curriculum sections from the live SPA shell.
  const html = readText(path.join(ROOT, 'learning-site/index.html'));
  const sectionRe = /<section\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/gi;
  let sm;
  while ((sm = sectionRe.exec(html)) !== null) {
    const id = sm[1];
    if (id === 'searchPanel') continue;
    const chunk = sm[2];
    const title =
      (chunk.match(/<h2 class="sec"[^>]*>([\s\S]*?)<\/h2>/i) ||
        chunk.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
        [])[1] || id;
    const titleText = stripHtml(title).replace(/\s+/g, ' ').trim();
    const fullBody = stripHtml(chunk);
    const bodyText = fullBody.slice(0, 4000);
    const mins = readingMinutesFromText(fullBody);
    if (mins) readingTimes[id] = mins;
    docs.push({
      id: `section:${id}`,
      kind: 'section',
      target: id,
      title: titleText,
      nav: titleText,
      body: bodyText,
    });
  }

  for (const [key, block] of Object.entries(interviewData)) {
    if (!block?.questions) continue;
    for (const q of block.questions) {
      docs.push({
        id: `interview:${q.id}`,
        kind: 'interview',
        target: block.id || 'interview',
        title: q.q,
        nav: `${block.title || key} · ${q.id.toUpperCase()}`,
        body: `${stripHtml(q.ideal)} ${stripHtml(q.stuck)}`,
      });
    }
  }

  // Orphan SSOT markdown mirrored but not tier/stuck/case parsed — index for search (A9/D1).
  for (const name of ['QA-75.md', 'playwright-interview-qa.md']) {
    const p = path.join(ROOT, 'interview-qa', name);
    if (!fs.existsSync(p)) continue;
    const raw = readText(p);
    const { body } = splitFrontmatter(raw);
    const title = stripHtml(body.match(/^#\s+(.+)$/m)?.[1] || name.replace(/\.md$/, ''));
    const slug = name.replace(/\.md$/, '').toLowerCase();
    docs.push({
      id: `ssot:${slug}`,
      kind: 'ssot-doc',
      target: 'interview',
      title,
      nav: 'Interview SSOT',
      body: stripHtml(body).slice(0, 4000),
    });
  }

  // Essentials + other committed data blobs (eval in isolated context).
  const extras = [
    ['interview-essentials-data.js', 'INTERVIEW_ESSENTIALS', 'essentials'],
    ['quiz-data.js', 'QUIZ', 'quiz'],
    ['mistakes-data.js', 'MISTAKES_DATA', 'mistakes'],
    ['xpath-data.js', 'XPATH_DATA', 'xpath'],
    ['playground-data.js', 'PLAYGROUND_DATA', 'playground'],
    ['miniapps-data.js', 'MINIAPPS_DATA', 'miniapps'],
    ['gap-pages-data.js', 'GAP_PAGES', 'gap'],
  ];

  for (const [file, globalName, kind] of extras) {
    const full = path.join(ROOT, 'learning-site', file);
    if (!fs.existsSync(full)) continue;
    const ctx = { window: {}, console };
     
    const run = new Function('window', 'console', readText(full) + `\nreturn window.${globalName};`);
    let data;
    try {
      data = run(ctx.window, console);
    } catch (err) {
      console.warn(`  skip ${file}: ${err.message}`);
      continue;
    }
    if (!data) continue;

    if (globalName === 'INTERVIEW_ESSENTIALS') {
      for (const cat of data.categories || []) {
        for (const q of cat.questions || []) {
          docs.push({
            id: `essentials:${q.id}`,
            kind,
            target: 'interview-essentials',
            title: q.q,
            nav: `Essentials · ${cat.title}`,
            body: `${stripHtml(q.ideal)} ${stripHtml(q.stuck)}`,
          });
        }
      }
    } else if (globalName === 'QUIZ') {
      const list = Array.isArray(data) ? data : Object.values(data || {});
      list.forEach((item, i) => {
        if (!item || typeof item !== 'object') return;
        docs.push({
          id: `quiz:${item.id || i}`,
          kind,
          target: 'quiz',
          title: item.q || item.question || `Quiz ${i + 1}`,
          nav: 'Quiz',
          body: (item.options || []).join(' '),
        });
      });
    } else if (globalName === 'MISTAKES_DATA') {
      (data.pitfalls || []).forEach((m, i) => {
        docs.push({
          id: `mistakes:${m.id || i}`,
          kind,
          target: 'mistakes',
          title: m.title || m.id || `Mistake ${i + 1}`,
          nav: 'Anti-patterns',
          body: `${m.think || ''} ${m.actual || ''} ${m.fix || ''} ${m.bad || ''} ${m.good || ''}`,
        });
      });
      (data.interview || []).forEach((m, i) => {
        docs.push({
          id: `mistakes-qa:${i}`,
          kind,
          target: 'mistakes',
          title: m.q || `Mistakes Q${i + 1}`,
          nav: 'Anti-patterns Q&A',
          body: m.a || '',
        });
      });
    } else if (globalName === 'XPATH_DATA') {
      (data.theory || []).forEach((t, i) => {
        docs.push({
          id: `xpath-theory:${t.id || i}`,
          kind,
          target: 'xpath',
          title: t.h || t.title || `XPath theory ${i + 1}`,
          nav: 'XPath',
          body: t.p || t.body || '',
        });
      });
      (data.pitfalls || []).forEach((t, i) => {
        docs.push({
          id: `xpath-pitfall:${t.id || i}`,
          kind,
          target: 'xpath',
          title: t.title || t.h || `XPath pitfall ${i + 1}`,
          nav: 'XPath troubleshooting',
          body: `${t.body || t.p || ''} ${t.fix || ''}`,
        });
      });
      (data.challenges || []).forEach((t, i) => {
        docs.push({
          id: `xpath-challenge:${t.id || i}`,
          kind,
          target: 'xpath',
          title: t.name || t.title || `XPath challenge ${i + 1}`,
          nav: 'XPath challenges',
          body: `${t.goal || ''} ${t.answer || ''} ${t.why || ''}`,
        });
      });
      (data.interview || []).forEach((t, i) => {
        docs.push({
          id: `xpath-qa:${i}`,
          kind,
          target: 'xpath',
          title: t.q || `XPath Q${i + 1}`,
          nav: 'XPath Q&A',
          body: t.a || '',
        });
      });
    } else if (globalName === 'PLAYGROUND_DATA') {
      for (const el of data.elements || []) {
        docs.push({
          id: `playground:${el.id}`,
          kind,
          target: 'playground',
          title: el.name,
          nav: `Practice Lab · ${el.level || ''}`,
          body: `${el.goal || ''} ${el.traps || ''} ${el.skill || ''}`,
        });
      }
    } else if (globalName === 'MINIAPPS_DATA') {
      for (const el of data.challenges || []) {
        docs.push({
          id: `miniapps:${el.id}`,
          kind,
          target: 'miniapps',
          title: el.name || el.id,
          nav: 'Mini-apps',
          body: `${el.challenge || ''} ${(el.skills || []).join(' ')} ${el.why || ''}`,
        });
      }
      (data.questions || []).forEach((q, i) => {
        docs.push({
          id: `miniapps-qa:${i}`,
          kind,
          target: 'miniapps-qa',
          title: q.q || `Mini-app Q${i + 1}`,
          nav: 'Mini-app Q&A',
          body: q.a || '',
        });
      });
    } else if (globalName === 'GAP_PAGES') {
      const list = Array.isArray(data) ? data : [];
      for (const p of list) {
        const fullBody = stripHtml(p.html || p.lead || '');
        const mins = readingMinutesFromText(fullBody);
        if (mins && p.id) readingTimes[p.id] = mins;
        docs.push({
          id: `gap:${p.id}`,
          kind,
          target: p.id,
          title: p.title || p.nav || p.id,
          nav: p.nav || p.title || p.id,
          body: fullBody.slice(0, 4000),
        });
      }
    }
  }

  // Index remaining gap practice globals (same file, multiple window.* assignments).
  {
    const full = path.join(ROOT, 'learning-site', 'gap-practice-data.js');
    if (fs.existsSync(full)) {
      const ctx = { window: {}, console };
       
      const run = new Function(
        'window',
        'console',
        readText(full) +
          '\nreturn { ap: window.GAP_ANTIPATTERNS, star: window.GAP_STAR_PROMPTS, mock: window.GAP_MOCK_QUESTIONS, pm: window.GAP_POSTMORTEMS, tr: window.GAP_TRACE_CHECKLIST, cr: window.GAP_CODEREVIEW };',
      );
      try {
        const g = run(ctx.window, console);
        (g.ap || []).forEach((a, i) => {
          docs.push({
            id: `gap-ap:${a.id || i}`,
            kind: 'gap-practice',
            target: 'antipattern-lab',
            title: a.title || `Antipattern ${i + 1}`,
            nav: 'Spot the antipattern',
            body: `${a.bad || ''} ${a.fix || ''} ${a.explain || ''} ${(a.issues || []).join(' ')}`,
          });
        });
        (g.star || []).forEach((s) => {
          docs.push({
            id: `gap-star:${s.id}`,
            kind: 'gap-practice',
            target: 'star-builder',
            title: s.q,
            nav: 'STAR builder',
            body: s.q,
          });
        });
        (g.mock || []).forEach((m, i) => {
          docs.push({
            id: `gap-mock:${i}`,
            kind: 'gap-practice',
            target: 'mock-interview',
            title: m.q,
            nav: 'Mock interview',
            body: `${(m.followUps || []).join(' ')} ${Object.values(m.rubric || {}).join(' ')}`,
          });
        });
        (g.pm || []).forEach((p) => {
          docs.push({
            id: `gap-pm:${p.id}`,
            kind: 'gap-practice',
            target: 'postmortems',
            title: p.title,
            nav: 'Postmortems',
            body: `${p.blurb || ''} ${p.prompt || ''}`,
          });
        });
        (g.tr || []).forEach((t) => {
          docs.push({
            id: `gap-trace:${t.id}`,
            kind: 'gap-practice',
            target: 'trace-lab',
            title: t.text,
            nav: 'Trace lab',
            body: t.text,
          });
        });
        (g.cr || []).forEach((c) => {
          docs.push({
            id: `gap-cr:${c.id}`,
            kind: 'gap-practice',
            target: 'code-review-lab',
            title: c.title,
            nav: 'Code review lab',
            body: `${(c.issues || []).join(' ')} ${c.fix || ''}`,
          });
        });
      } catch (err) {
        console.warn(`  skip gap-practice extras: ${err.message}`);
      }
    }
  }

  return { docs, readingTimes };
}

function buildSearchIndexPayload(docs) {
  const mini = new MiniSearch({
    fields: ['title', 'body', 'nav'],
    storeFields: ['title', 'nav', 'target', 'kind'],
    searchOptions: {
      boost: { title: 4, nav: 2, body: 1 },
      fuzzy: 0.15,
      prefix: true,
    },
  });
  mini.addAll(docs);
  return {
    version: 1,
    documentCount: docs.length,
    options: {
      fields: ['title', 'body', 'nav'],
      storeFields: ['title', 'nav', 'target', 'kind'],
      searchOptions: {
        boost: { title: 4, nav: 2, body: 1 },
        fuzzy: 0.15,
        prefix: true,
      },
    },
    index: mini.toJSON(),
  };
}

function emitInterviewJs(data) {
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * SSOT: interview-qa/*.md + interview-qa/_meta.yaml
 * Regenerate: npm run build:content
 */
window.INTERVIEW_DATA = ${stableStringifyJs(data)};
`;
}

function emitSearchJs(payload) {
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * Prebuilt MiniSearch index as a JS global (file:// safe — no fetch/JSON).
 * Regenerate: npm run build:content
 */
window.SEARCH_INDEX = ${JSON.stringify(payload)};
`;
}

function emitReadingTimesJs(times) {
  const sorted = Object.fromEntries(
    Object.entries(times).sort(([a], [b]) => a.localeCompare(b)),
  );
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * Reading minutes (~200 wpm) from section / gap page word counts.
 * Regenerate: npm run build:content
 */
window.READING_TIMES = ${JSON.stringify(sorted)};
`;
}

function emitStuckJs(entries) {
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * SSOT: interview-qa/stuck/*.md — see interview-qa/_templates.md (Template 1)
 * Regenerate: npm run build:content
 */
window.STUCK_ENTRIES = ${stableStringifyJs(sorted)};
`;
}

function emitCasesJs(cases) {
  const sorted = [...cases].sort((a, b) => a.id.localeCompare(b.id));
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * SSOT: interview-qa/case-studies.md
 * Regenerate: npm run build:content
 */
window.CASE_STUDIES = ${stableStringifyJs(sorted)};
`;
}

function emitFrameworkJs(payload) {
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * SSOT: interview-qa/framework/{lessons,mcqs,exercises,scenarios}/
 * Regenerate: npm run build:content
 */
window.FRAMEWORK_ACADEMY = ${stableStringifyJs(payload)};
`;
}

function emitInterviewerJs(payload) {
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * SSOT: interview-qa/interviewer/
 * Regenerate: npm run build:content
 */
window.INTERVIEWER_MODE = ${stableStringifyJs(payload)};
`;
}

function loadInterviewerMode() {
  const base = path.join(ROOT, 'interview-qa/interviewer');
  if (!fs.existsSync(base)) {
    return { questions: [], coding: [], kits: [], craft: [], rubric: null };
  }
  const questions = [];
  const qDir = path.join(base, 'questions');
  if (fs.existsSync(qDir)) {
    for (const level of fs.readdirSync(qDir).sort()) {
      const levelPath = path.join(qDir, level);
      if (!fs.statSync(levelPath).isDirectory()) continue;
      for (const name of fs.readdirSync(levelPath).sort()) {
        if (!name.endsWith('.md')) continue;
        questions.push(parseInterviewerQuestion(readText(path.join(levelPath, name)), name));
      }
    }
  }
  const coding = [];
  const codeDir = path.join(base, 'coding');
  if (fs.existsSync(codeDir)) {
    for (const name of fs.readdirSync(codeDir).sort()) {
      if (!name.endsWith('.md')) continue;
      const item = parseInterviewerCoding(readText(path.join(codeDir, name)), name);
      if (item.specFile) {
        const abs = path.join(ROOT, item.specFile);
        if (!fs.existsSync(abs)) throw new Error(`${name}: specFile does not exist: ${item.specFile}`);
      }
      coding.push(item);
    }
  }
  const kits = [];
  const kitsDir = path.join(base, 'kits');
  if (fs.existsSync(kitsDir)) {
    for (const name of fs.readdirSync(kitsDir).sort()) {
      if (!name.endsWith('.md')) continue;
      kits.push(parseInterviewerKit(readText(path.join(kitsDir, name)), name));
    }
  }
  const craft = [];
  const craftDir = path.join(base, 'craft');
  if (fs.existsSync(craftDir)) {
    for (const name of fs.readdirSync(craftDir).sort()) {
      if (!name.endsWith('.md')) continue;
      craft.push(parseInterviewerCraft(readText(path.join(craftDir, name)), name));
    }
  }
  let rubric = null;
  const rubricPath = path.join(base, '_rubric.md');
  if (fs.existsSync(rubricPath)) {
    rubric = parseInterviewerRubric(readText(rubricPath), '_rubric.md');
  }

  const qIds = new Set(questions.map((q) => q.id));
  const codeIds = new Set(coding.map((c) => c.id));
  for (const k of kits) {
    for (const q of k.questions) {
      if (!qIds.has(q.id) && !codeIds.has(q.id)) {
        throw new Error(`${k.id}: ordered question ${q.id} not found in question/coding bank`);
      }
    }
    for (const b of k.backup) {
      if (!qIds.has(b) && !codeIds.has(b)) {
        throw new Error(`${k.id}: backup question ${b} not found`);
      }
    }
  }

  const byLevel = { fresher: 0, junior: 0, mid: 0, senior: 0, architect: 0 };
  for (const q of questions) byLevel[q.level] = (byLevel[q.level] || 0) + 1;
  const expected = { fresher: 12, junior: 13, mid: 25, senior: 25, architect: 15 };
  for (const [level, n] of Object.entries(expected)) {
    if (byLevel[level] !== n) {
      throw new Error(`Interviewer questions: expected ${n} ${level}, got ${byLevel[level] || 0}`);
    }
  }
  if (questions.length !== 90) throw new Error(`Interviewer questions expected 90, got ${questions.length}`);
  if (coding.length !== 10) throw new Error(`Interviewer coding expected 10, got ${coding.length}`);
  if (kits.length !== 8) throw new Error(`Interviewer kits expected 8, got ${kits.length}`);
  if (craft.length !== 8) throw new Error(`Interviewer craft expected 8, got ${craft.length}`);
  if (!rubric) throw new Error('Interviewer rubric (_rubric.md) missing');

  return {
    questions: questions.sort((a, b) => a.id.localeCompare(b.id)),
    coding: coding.sort((a, b) => a.id.localeCompare(b.id)),
    kits: kits.sort((a, b) => a.id.localeCompare(b.id)),
    craft: craft.sort((a, b) => a.id.localeCompare(b.id)),
    rubric,
  };
}

function loadTopicsRegistry() {
  const p = path.join(ROOT, 'interview-qa/_meta/topics.json');
  if (!fs.existsSync(p)) return { version: 1, topics: [] };
  return JSON.parse(readText(p));
}

function loadSkillModules() {
  const base = path.join(ROOT, 'interview-qa/skills');
  if (!fs.existsSync(base)) {
    return { tracks: [], lessons: [], mcqs: [], exercises: [] };
  }
  const topics = loadTopicsRegistry();
  const topicKeys = new Set(topics.topics.map((t) => t.key));

  const tracks = [];
  const lessons = [];
  const mcqs = [];
  const exercises = [];

  for (const slug of fs.readdirSync(base).sort()) {
    const trackDir = path.join(base, slug);
    if (!fs.statSync(trackDir).isDirectory()) continue;
    const trackPath = path.join(trackDir, 'track.md');
    if (!fs.existsSync(trackPath)) continue;
    tracks.push(parseSkillTrack(readText(trackPath), `${slug}/track.md`));

    const lessonsDir = path.join(trackDir, 'lessons');
    if (fs.existsSync(lessonsDir)) {
      for (const name of fs.readdirSync(lessonsDir).sort()) {
        if (!name.endsWith('.md')) continue;
        const L = parseSkillLesson(readText(path.join(lessonsDir, name)), name);
        if (!topicKeys.has(L.topic)) {
          throw new Error(`${name}: topic "${L.topic}" not in topics.json`);
        }
        lessons.push(L);
      }
    }
    const mcqsDir = path.join(trackDir, 'mcqs');
    if (fs.existsSync(mcqsDir)) {
      for (const name of fs.readdirSync(mcqsDir).sort()) {
        if (!name.endsWith('.md')) continue;
        const m = parseSkillMcq(readText(path.join(mcqsDir, name)), name);
        if (!topicKeys.has(m.topic)) throw new Error(`${name}: topic "${m.topic}" not in topics.json`);
        mcqs.push(m);
      }
    }
    const exDir = path.join(trackDir, 'exercises');
    if (fs.existsSync(exDir)) {
      for (const name of fs.readdirSync(exDir).sort()) {
        if (!name.endsWith('.md')) continue;
        const ex = parseSkillExercise(readText(path.join(exDir, name)), name);
        if (!topicKeys.has(ex.topic)) throw new Error(`${name}: topic "${ex.topic}" not in topics.json`);
        if (ex.specFile) {
          const abs = path.join(ROOT, ex.specFile);
          if (!fs.existsSync(abs)) throw new Error(`${name}: specFile missing: ${ex.specFile}`);
        }
        exercises.push(ex);
      }
    }
  }

  if (tracks.length !== 6) throw new Error(`Skill tracks expected 6, got ${tracks.length}`);
  if (lessons.length !== 47) throw new Error(`Skill lessons expected 47, got ${lessons.length}`);
  if (mcqs.length !== 59) throw new Error(`Skill MCQs expected 59, got ${mcqs.length}`);
  if (exercises.length !== 15) throw new Error(`Skill exercises expected 15, got ${exercises.length}`);

  return {
    tracks: tracks.sort((a, b) => a.order - b.order),
    lessons: lessons.sort((a, b) => a.id.localeCompare(b.id)),
    mcqs: mcqs.sort((a, b) => a.id.localeCompare(b.id)),
    exercises: exercises.sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function emitSkillsJs(payload) {
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * SSOT: interview-qa/skills/
 * Regenerate: npm run build:content
 */
window.SKILL_MODULES = ${stableStringifyJs(payload)};
`;
}

function emitTopicsJs(registry) {
  return `/* Generated by tools/content/build-content.mjs — do not edit by hand.
 * SSOT: interview-qa/_meta/topics.json
 */
window.TOPICS_REGISTRY = ${stableStringifyJs(registry)};
`;
}

function buildMockExamPool(framework, skills, quizData) {
  const pool = [];
  for (const m of skills?.mcqs || []) {
    pool.push({
      id: m.id,
      source: 'skill',
      topic: m.topic,
      difficulty: m.difficulty <= 1 ? 'easy' : m.difficulty === 2 ? 'medium' : 'hard',
      question: m.question,
      options: m.options,
      answerIndex: m.answerIndex,
      explanation: m.whyCorrect,
    });
  }
  for (const m of framework?.mcqs || []) {
    pool.push({
      id: m.id,
      source: 'framework',
      topic: m.topic || 'framework',
      difficulty: m.difficulty === 'beginner' ? 'easy' : m.difficulty === 'advanced' ? 'hard' : 'medium',
      question: m.question,
      options: m.options,
      answerIndex: m.answerIndex,
      explanation: m.whyCorrect,
    });
  }
  if (Array.isArray(quizData)) {
    quizData.forEach((q, i) => {
      if (!q?.options?.length) return;
      pool.push({
        id: q.id || `quiz-${i}`,
        source: 'quiz',
        topic: q.topic || 'general',
        difficulty: 'medium',
        question: q.q || q.question,
        options: q.options,
        answerIndex: q.answer ?? q.answerIndex ?? 0,
        explanation: q.explain || '',
      });
    });
  }
  return pool;
}

function emitMockExamPoolJs(pool) {
  return `/* Generated by tools/content/build-content.mjs — unified MCQ pool for mock exams.
 * Regenerate: npm run build:content
 */
window.MOCK_EXAM_POOL = ${stableStringifyJs(pool)};
`;
}

function loadFrameworkAcademy() {
  const base = path.join(ROOT, 'interview-qa/framework');
  if (!fs.existsSync(base)) {
    return { lessons: [], mcqs: [], exercises: [], scenarios: [] };
  }
  const lessons = [];
  const lessonsDir = path.join(base, 'lessons');
  if (fs.existsSync(lessonsDir)) {
    for (const name of fs.readdirSync(lessonsDir).sort()) {
      if (!name.endsWith('.md')) continue;
      lessons.push(parseFrameworkLesson(readText(path.join(lessonsDir, name)), name));
    }
  }
  const mcqs = [];
  const mcqsDir = path.join(base, 'mcqs');
  if (fs.existsSync(mcqsDir)) {
    for (const name of fs.readdirSync(mcqsDir).sort()) {
      if (!name.endsWith('.md')) continue;
      mcqs.push(parseFrameworkMcq(readText(path.join(mcqsDir, name)), name));
    }
  }
  const exercises = [];
  const exDir = path.join(base, 'exercises');
  if (fs.existsSync(exDir)) {
    for (const name of fs.readdirSync(exDir).sort()) {
      if (!name.endsWith('.md')) continue;
      const ex = parseFrameworkExercise(readText(path.join(exDir, name)), name);
      if (ex.specFile) {
        const abs = path.join(ROOT, ex.specFile);
        if (!fs.existsSync(abs)) {
          throw new Error(`${name}: specFile does not exist: ${ex.specFile}`);
        }
      }
      exercises.push(ex);
    }
  }
  let scenarios = [];
  const scenPath = path.join(base, 'scenarios/framework-scenarios.md');
  if (fs.existsSync(scenPath)) {
    scenarios = parseFrameworkScenarios(readText(scenPath), 'framework-scenarios.md').questions;
  }

  // Cross-reference integrity
  const lessonIds = new Set(lessons.map((l) => l.id));
  const mcqIds = new Set(mcqs.map((m) => m.id));
  const exIds = new Set(exercises.map((e) => e.id));
  for (const l of lessons) {
    for (const mid of l.mcqs || []) {
      if (!mcqIds.has(mid)) throw new Error(`${l.id}: mcqs[] references missing ${mid}`);
    }
    if (l.exercise && !exIds.has(l.exercise)) {
      throw new Error(`${l.id}: exercise references missing ${l.exercise}`);
    }
    for (const rid of l.related || []) {
      if (rid.startsWith('FW-L-') && !lessonIds.has(rid)) {
        throw new Error(`${l.id}: related references missing ${rid}`);
      }
    }
  }
  if (lessons.length < 30) throw new Error(`Framework lessons expected ≥30, got ${lessons.length}`);
  if (mcqs.length < 40) throw new Error(`Framework MCQs expected ≥40, got ${mcqs.length}`);
  if (exercises.length < 10) throw new Error(`Framework exercises expected ≥10, got ${exercises.length}`);
  if (scenarios.length < 20) throw new Error(`Framework scenarios expected ≥20, got ${scenarios.length}`);

  return { lessons, mcqs, exercises, scenarios };
}

function writeOrCollect(filePath, contents, planned) {
  const next = contents.replace(/\r\n/g, '\n');
  planned.push({ filePath, next });
}

function applyWrites(planned) {
  let dirty = 0;
  for (const { filePath, next } of planned) {
    const exists = fs.existsSync(filePath);
    const prev = exists ? readText(filePath).replace(/\r\n/g, '\n') : null;
    if (prev === next) {
      console.log(`  ok   ${rel(filePath)}`);
      continue;
    }
    dirty += 1;
    if (checkOnly) {
      console.log(`  DRIFT ${rel(filePath)}`);
    } else {
      writeText(filePath, next);
      console.log(`  write ${rel(filePath)}`);
    }
  }
  return dirty;
}

function main() {
  console.log(checkOnly ? 'Content check…' : 'Building content…');
  const meta = loadMeta();
  const planned = [];

  // Normalize frontmatter on tier files (idempotent).
  for (const [letter, info] of Object.entries(meta.tiers)) {
    const mdPath = path.join(ROOT, 'interview-qa', info.file);
    const fm = {
      tier: letter,
      tier_key: info.key,
      id: info.id,
      title: info.title,
      lead: info.lead,
      difficulty: info.difficulty,
      topic: info.topic,
      pw_version_introduced: info.pw_version_introduced || '1.40',
    };
    writeOrCollect(mdPath, ensureFrontmatter(mdPath, fm), planned);
  }

  // Rebuild interview data from (current disk) MD — if we're writing frontmatter
  // in the same pass, read the planned body for tier files.
  const tierContents = {};
  for (const item of planned) {
    tierContents[item.filePath] = item.next;
  }

  // Temporarily materialize planned MD into memory for parsing.
  const interviewData = {
    hub: meta.hub,
    recommendations: meta.recommendations,
  };
  // Scenario v2 required on Tier A (fully migrated). Tier B optional until
  // Scenario-v2 authoring for mid-level is completed in a follow-up pass.
  const V2_REQUIRED_TIERS = new Set(['tierA']);
  for (const [, info] of Object.entries(meta.tiers)) {
    const mdPath = path.join(ROOT, 'interview-qa', info.file);
    const raw = tierContents[mdPath] || readText(mdPath);
    const { frontmatter, questions } = parseTierMarkdown(raw, {
      requireV2: V2_REQUIRED_TIERS.has(info.key),
      sourceFile: info.file,
    });
    if (!questions.length) throw new Error(`No questions in ${info.file}`);
    interviewData[info.key] = {
      id: info.id,
      title: frontmatter.title || info.title,
      lead: frontmatter.lead || info.lead,
      questions: questions.map(
        ({ id, q, ideal, stuck, thinkFirst, whyAsked, wrongAnswer, realExample, followUps }) => ({
          id,
          q,
          ideal,
          stuck,
          ...(thinkFirst ? { thinkFirst } : {}),
          ...(whyAsked ? { whyAsked } : {}),
          ...(wrongAnswer ? { wrongAnswer } : {}),
          ...(realExample ? { realExample } : {}),
          ...(followUps ? { followUps } : {}),
        }),
      ),
    };
    const v2Count = questions.filter((qq) => qq.thinkFirst).length;
    console.log(`  parse ${info.key}: ${questions.length} (${v2Count} with Scenario v2 sections)`);
  }

  writeOrCollect(
    path.join(ROOT, 'learning-site/interview-data.js'),
    emitInterviewJs(interviewData),
    planned,
  );

  // Mirror every interview-qa/*.md (except underscore-prefixed authoring docs and
  // the consolidated bank, which is regenerated + mirrored explicitly below) into
  // learning-site/interview/ so in-app links to source markdown resolve.
  for (const name of fs.readdirSync(path.join(ROOT, 'interview-qa'))) {
    if (!name.endsWith('.md') || name.startsWith('_') || name === 'scenario-based-question-bank.md') continue;
    const src = path.join(ROOT, 'interview-qa', name);
    const dest = path.join(ROOT, 'learning-site/interview', name);
    writeOrCollect(dest, tierContents[src] || readText(src), planned);
  }

  const consolidated = renderConsolidatedBank(meta, interviewData);
  writeOrCollect(path.join(ROOT, 'interview-qa/scenario-based-question-bank.md'), consolidated, planned);
  writeOrCollect(
    path.join(ROOT, 'learning-site/interview/scenario-based-question-bank.md'),
    consolidated,
    planned,
  );

  // Stuck hub (interview-qa/stuck/*.md — see _templates.md Template 1)
  const stuckDir = path.join(ROOT, 'interview-qa/stuck');
  const stuckEntries = [];
  if (fs.existsSync(stuckDir)) {
    for (const name of fs.readdirSync(stuckDir).sort()) {
      if (!name.endsWith('.md')) continue;
      const src = path.join(stuckDir, name);
      const raw = readText(src);
      const entries = parseStuckMarkdown(raw, `interview-qa/stuck/${name}`);
      stuckEntries.push(...entries);
      writeOrCollect(path.join(ROOT, 'learning-site/interview/stuck', name), raw, planned);
    }
  }
  const seenStuckIds = new Set();
  for (const e of stuckEntries) {
    if (seenStuckIds.has(e.id)) throw new Error(`Duplicate stuck entry id: ${e.id}`);
    seenStuckIds.add(e.id);
  }
  console.log(`  stuck hub: ${stuckEntries.length} entries`);
  lintTemplateCoverage(interviewData, stuckEntries);
  writeOrCollect(path.join(ROOT, 'learning-site/stuck-data.js'), emitStuckJs(stuckEntries), planned);

  // Case studies (interview-qa/case-studies.md)
  const caseStudiesPath = path.join(ROOT, 'interview-qa/case-studies.md');
  const caseStudies = fs.existsSync(caseStudiesPath) ? parseCaseStudies(readText(caseStudiesPath)) : [];
  console.log(`  case studies: ${caseStudies.length}`);
  writeOrCollect(path.join(ROOT, 'learning-site/cases-data.js'), emitCasesJs(caseStudies), planned);
  if (fs.existsSync(caseStudiesPath)) {
    writeOrCollect(
      path.join(ROOT, 'learning-site/interview/case-studies.md'),
      readText(caseStudiesPath),
      planned,
    );
  }

  const framework = loadFrameworkAcademy();
  console.log(
    `  framework academy: ${framework.lessons.length} lessons, ${framework.mcqs.length} MCQs, ${framework.exercises.length} exercises, ${framework.scenarios.length} scenarios`,
  );
  writeOrCollect(path.join(ROOT, 'learning-site/framework-data.js'), emitFrameworkJs(framework), planned);

  const interviewer = loadInterviewerMode();
  console.log(
    `  interviewer mode: ${interviewer.questions.length} questions, ${interviewer.coding.length} coding, ${interviewer.kits.length} kits, ${interviewer.craft.length} craft`,
  );
  writeOrCollect(path.join(ROOT, 'learning-site/interviewer-data.js'), emitInterviewerJs(interviewer), planned);

  const topics = loadTopicsRegistry();
  const skills = loadSkillModules();
  console.log(
    `  skill modules: ${skills.tracks.length} tracks, ${skills.lessons.length} lessons, ${skills.mcqs.length} MCQs, ${skills.exercises.length} exercises`,
  );
  writeOrCollect(path.join(ROOT, 'learning-site/skills-data.js'), emitSkillsJs(skills), planned);
  writeOrCollect(path.join(ROOT, 'learning-site/topics-data.js'), emitTopicsJs(topics), planned);

  let quizData = [];
  const quizPath = path.join(ROOT, 'learning-site/quiz-data.js');
  if (fs.existsSync(quizPath)) {
    try {
      const run = new Function('window', readText(quizPath) + '\nreturn window.QUIZ;');
      quizData = run({ QUIZ: undefined }) || [];
    } catch {
      quizData = [];
    }
  }
  const mockPool = buildMockExamPool(framework, skills, quizData);
  console.log(`  mock exam pool: ${mockPool.length} MCQs`);
  writeOrCollect(path.join(ROOT, 'learning-site/mock-exam-pool.js'), emitMockExamPoolJs(mockPool), planned);

  const { docs, readingTimes } = collectSearchDocuments(
    interviewData,
    stuckEntries,
    caseStudies,
    framework,
    interviewer,
    skills,
  );
  console.log(`  search corpus: ${docs.length} documents`);
  console.log(`  reading times: ${Object.keys(readingTimes).length} sections`);
  writeOrCollect(
    path.join(ROOT, 'learning-site/search-index.js'),
    emitSearchJs(buildSearchIndexPayload(docs)),
    planned,
  );
  writeOrCollect(
    path.join(ROOT, 'learning-site/reading-times.js'),
    emitReadingTimesJs(readingTimes),
    planned,
  );

  const dirty = applyWrites(planned);
  if (checkOnly && dirty) {
    console.error(`\n${dirty} generated file(s) out of date. Run: npm run build:content`);
    process.exit(1);
  }
  if (!checkOnly) {
    console.log(`\nDone. ${planned.length} artifacts considered, ${dirty} updated.`);
  } else {
    console.log('\nContent check passed.');
  }
}

main();
