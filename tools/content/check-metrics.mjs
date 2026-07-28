#!/usr/bin/env node
/**
 * Fails CI if README.md's "Metrics (portfolio snapshot)" table has drifted
 * from the actual generated/counted values. Run after `npm run build:content`.
 *
 * Usage: node tools/content/check-metrics.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function countInterviewScenarios() {
  const meta = YAML.parse(read(path.join(ROOT, 'interview-qa/_meta.yaml')));
  let total = 0;
  const parts = [];
  for (const [letter, info] of Object.entries(meta.tiers)) {
    const raw = read(path.join(ROOT, 'interview-qa', info.file));
    const n = (raw.match(/^### [A-Z]\d+\./gm) || []).length;
    total += n;
    parts.push(`${letter}${n}`);
  }
  return { total, label: parts.join(' + ') };
}

function countSearchDocs() {
  const raw = read(path.join(ROOT, 'learning-site/search-index.js'));
  const m = raw.match(/"documentCount":(\d+)/);
  if (!m) throw new Error('Could not read documentCount from search-index.js');
  return Number(m[1]);
}

function countGapPages() {
  const raw = read(path.join(ROOT, 'learning-site/gap-pages-data.js'));
  return (raw.match(/^\s*id: '[^']+',/gm) || []).length;
}

function countExternalSpecs() {
  const testsDir = path.join(ROOT, 'practice-suite/tests');
  let files = 0;
  let tests = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.spec.ts')) {
        const raw = read(full);
        const matches = raw.match(/test\(\s*['"]@external/g) || [];
        if (matches.length) {
          files += 1;
          tests += matches.length;
        }
      }
    }
  };
  if (fs.existsSync(testsDir)) walk(testsDir);
  return { files, tests };
}

function extractMetric(readme, label) {
  const re = new RegExp(`\\| ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\| \\*\\*(\\d+)\\*\\*`);
  const m = readme.match(re);
  return m ? Number(m[1]) : null;
}

function countFramework() {
  const raw = read(path.join(ROOT, 'learning-site/framework-data.js'));
  const lessons = (raw.match(/id: "FW-L-\d+"/g) || []).length;
  const mcqs = (raw.match(/id: "FW-Q-\d+"/g) || []).length;
  const exercises = (raw.match(/id: "FW-X-\d+"/g) || []).length;
  const scenarios = (raw.match(/id: "fw-s-\d+"/g) || []).length;
  return { lessons, mcqs, exercises, scenarios };
}

function countStuck() {
  const raw = read(path.join(ROOT, 'learning-site/stuck-data.js'));
  return (raw.match(/id: "stuck-/g) || []).length;
}

function countInterviewer() {
  const raw = read(path.join(ROOT, 'learning-site/interviewer-data.js'));
  const questions = (raw.match(/type: "iv-question"/g) || []).length;
  const coding = (raw.match(/type: "iv-coding"/g) || []).length;
  const kits = (raw.match(/type: "iv-kit"/g) || []).length;
  const craft = (raw.match(/type: "iv-craft"/g) || []).length;
  return { questions, coding, kits, craft };
}

function countSkills() {
  const raw = read(path.join(ROOT, 'learning-site/skills-data.js'));
  const tracks = (raw.match(/type: "skill-track"/g) || []).length;
  const lessons = (raw.match(/type: "skill-lesson"/g) || []).length;
  const mcqs = (raw.match(/type: "skill-mcq"/g) || []).length;
  const exercises = (raw.match(/type: "skill-exercise"/g) || []).length;
  return { tracks, lessons, mcqs, exercises };
}

function countMockPool() {
  const raw = read(path.join(ROOT, 'learning-site/mock-exam-pool.js'));
  return (raw.match(/id: "/g) || []).length;
}

function countTopics() {
  const raw = read(path.join(ROOT, 'interview-qa/_meta/topics.json'));
  const data = JSON.parse(raw);
  return data.topics?.length || 0;
}

function main() {
  const readme = read(path.join(ROOT, 'README.md'));
  const scenarios = countInterviewScenarios();
  const searchDocs = countSearchDocs();
  const gapPages = countGapPages();
  const external = countExternalSpecs();
  const fw = countFramework();
  const stuck = countStuck();
  const iv = countInterviewer();
  const sk = countSkills();
  const mockPool = countMockPool();
  const topics = countTopics();

  const checks = [
    ['Interview scenarios', scenarios.total],
    ['Search corpus', searchDocs],
    ['SDET guide & labs', gapPages],
    ['External practice specs', external.tests],
    ['Stuck hub entries', stuck],
  ];

  // Framework Academy multi-number cell: verify each count appears as **N** near its label
  const fwChecks = [
    ['Framework lessons', fw.lessons, /\*\*(\d+)\*\* lessons/],
    ['Framework MCQs', fw.mcqs, /\*\*(\d+)\*\* MCQs/],
    ['Framework exercises', fw.exercises, /\*\*(\d+)\*\* exercises/],
    ['Framework scenarios', fw.scenarios, /\*\*(\d+)\*\* FW-S/],
  ];

  const ivChecks = [
    ['Interviewer questions', iv.questions, /\*\*(\d+)\*\* questions/],
    ['Interviewer coding', iv.coding, /\*\*(\d+)\*\* live coding/],
    ['Interviewer kits', iv.kits, /\*\*(\d+)\*\* kits/],
    ['Interviewer craft', iv.craft, /\*\*(\d+)\*\* craft/],
  ];

  const skChecks = [
    ['Skill tracks', sk.tracks, /\| Skill Modules \| \*\*(\d+)\*\* tracks/],
    ['Skill lessons', sk.lessons, /Skill Modules \| \*\*\d+\*\* tracks · \*\*(\d+)\*\* lessons/],
    ['Skill MCQs', sk.mcqs, /Skill Modules \| \*\*\d+\*\* tracks · \*\*\d+\*\* lessons · \*\*(\d+)\*\* MCQs/],
    ['Skill exercises', sk.exercises, /Skill Modules \| \*\*\d+\*\* tracks · \*\*\d+\*\* lessons · \*\*\d+\*\* MCQs · \*\*(\d+)\*\* exercises/],
    ['Mock exam pool', mockPool, /\| Mock exam pool \| \*\*(\d+)\*\* MCQs/],
    ['Readiness topics', topics, /\| Readiness topics \| \*\*(\d+)\*\* in topic registry/],
  ];

  let drift = false;
  for (const [label, actual] of checks) {
    const documented = extractMetric(readme, label);
    if (documented === null) {
      console.warn(`  warn  README metric "${label}" not found in expected "**N**" format — skipping`);
      continue;
    }
    if (documented !== actual) {
      drift = true;
      console.error(`  DRIFT ${label}: README says ${documented}, actual is ${actual}`);
    } else {
      console.log(`  ok    ${label}: ${actual}`);
    }
  }

  for (const [label, actual, re] of fwChecks) {
    const m = readme.match(re);
    const documented = m ? Number(m[1]) : null;
    if (documented === null) {
      console.warn(`  warn  README metric "${label}" not found — skipping`);
      continue;
    }
    if (documented !== actual) {
      drift = true;
      console.error(`  DRIFT ${label}: README says ${documented}, actual is ${actual}`);
    } else {
      console.log(`  ok    ${label}: ${actual}`);
    }
  }

  for (const [label, actual, re] of ivChecks) {
    const m = readme.match(re);
    const documented = m ? Number(m[1]) : null;
    if (documented === null) {
      console.warn(`  warn  README metric "${label}" not found — skipping`);
      continue;
    }
    if (documented !== actual) {
      drift = true;
      console.error(`  DRIFT ${label}: README says ${documented}, actual is ${actual}`);
    } else {
      console.log(`  ok    ${label}: ${actual}`);
    }
  }

  for (const [label, actual, re] of skChecks) {
    const m = readme.match(re);
    const documented = m ? Number(m[1]) : null;
    if (documented === null) {
      console.warn(`  warn  README metric "${label}" not found — skipping`);
      continue;
    }
    if (documented !== actual) {
      drift = true;
      console.error(`  DRIFT ${label}: README says ${documented}, actual is ${actual}`);
    } else {
      console.log(`  ok    ${label}: ${actual}`);
    }
  }

  if (drift) {
    console.error('\nREADME metrics are stale. Update README.md "Metrics (portfolio snapshot)" table.');
    process.exit(1);
  }
  console.log('\nMetrics check passed.');
}

main();
