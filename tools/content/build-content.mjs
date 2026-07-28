#!/usr/bin/env node
/**
 * Author-time content pipeline (Stage 2).
 *
 * SSOT: interview-qa/*.md + interview-qa/_meta.yaml
 * Emits (committed artifacts; runtime stays zero-install / file:// safe):
 *   - learning-site/interview-data.js
 *   - learning-site/interview/*.md (mirrors)
 *   - learning-site/search-index.js  → window.SEARCH_INDEX = {…}
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

function collectSearchDocuments(interviewData) {
  const docs = [];

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
    const bodyText = stripHtml(chunk).slice(0, 4000);
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
    // eslint-disable-next-line no-new-func
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
        docs.push({
          id: `gap:${p.id}`,
          kind,
          target: p.id,
          title: p.title || p.nav || p.id,
          nav: p.nav || p.title || p.id,
          body: stripHtml(p.html || p.lead || '').slice(0, 4000),
        });
      }
    }
  }

  // Index remaining gap practice globals (same file, multiple window.* assignments).
  {
    const full = path.join(ROOT, 'learning-site', 'gap-practice-data.js');
    if (fs.existsSync(full)) {
      const ctx = { window: {}, console };
      // eslint-disable-next-line no-new-func
      const run = new Function(
        'window',
        'console',
        readText(full) +
          '\nreturn { ap: window.GAP_ANTIPATTERNS, star: window.GAP_STAR_PROMPTS, mock: window.GAP_MOCK_QUESTIONS, pm: window.GAP_POSTMORTEMS, tr: window.GAP_TRACE_CHECKLIST };',
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
      } catch (err) {
        console.warn(`  skip gap-practice extras: ${err.message}`);
      }
    }
  }

  return docs;
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
  for (const [, info] of Object.entries(meta.tiers)) {
    const mdPath = path.join(ROOT, 'interview-qa', info.file);
    const raw = tierContents[mdPath] || readText(mdPath);
    const { frontmatter, questions } = parseTierMarkdown(raw);
    if (!questions.length) throw new Error(`No questions in ${info.file}`);
    interviewData[info.key] = {
      id: info.id,
      title: frontmatter.title || info.title,
      lead: frontmatter.lead || info.lead,
      questions: questions.map(({ id, q, ideal, stuck }) => ({ id, q, ideal, stuck })),
    };
    console.log(`  parse ${info.key}: ${questions.length}`);
  }

  writeOrCollect(
    path.join(ROOT, 'learning-site/interview-data.js'),
    emitInterviewJs(interviewData),
    planned,
  );

  // Mirror MD into learning-site/interview/
  for (const info of Object.values(meta.tiers)) {
    const src = path.join(ROOT, 'interview-qa', info.file);
    const dest = path.join(ROOT, 'learning-site/interview', info.file);
    writeOrCollect(dest, tierContents[src] || readText(src), planned);
  }

  const consolidated = renderConsolidatedBank(meta, interviewData);
  writeOrCollect(path.join(ROOT, 'interview-qa/scenario-based-question-bank.md'), consolidated, planned);
  writeOrCollect(
    path.join(ROOT, 'learning-site/interview/scenario-based-question-bank.md'),
    consolidated,
    planned,
  );

  const docs = collectSearchDocuments(interviewData);
  console.log(`  search corpus: ${docs.length} documents`);
  writeOrCollect(
    path.join(ROOT, 'learning-site/search-index.js'),
    emitSearchJs(buildSearchIndexPayload(docs)),
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
