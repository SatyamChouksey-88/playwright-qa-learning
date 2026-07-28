#!/usr/bin/env node
/**
 * Non-blocking flake observability (interview C9): summarize retries from Playwright JSON reporter.
 * Usage: node tools/flake-report.mjs practice-suite/test-results/report.json
 */
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2] || 'practice-suite/test-results/report.json';
const abs = path.resolve(file);

if (!fs.existsSync(abs)) {
  console.log(`[flake-report] No report at ${abs} — skip`);
  process.exit(0);
}

/** @typedef {{ title: string, ok: boolean, results?: { retry?: number, status?: string }[] }} SuiteSpec */
/** @typedef {{ title: string, specs?: SuiteSpec[], suites?: unknown[] }} Suite */

const raw = JSON.parse(fs.readFileSync(abs, 'utf8'));

/** @type {{ title: string; retries: number; status: string }[]} */
const flaky = [];
let total = 0;
let failed = 0;

/**
 * @param {Suite} suite
 * @param {string} prefix
 */
function walk(suite, prefix = '') {
  const name = prefix ? `${prefix} › ${suite.title}` : suite.title;
  for (const spec of suite.specs || []) {
    total += 1;
    const results = spec.results || [];
    const maxRetry = Math.max(0, ...results.map((r) => r.retry || 0));
    const last = results[results.length - 1];
    const status = last?.status || (spec.ok ? 'passed' : 'failed');
    if (status === 'failed' || status === 'timedOut') failed += 1;
    if (maxRetry > 0 && status === 'passed') {
      flaky.push({ title: `${name} › ${spec.title}`, retries: maxRetry, status });
    }
  }
  for (const child of suite.suites || []) {
    walk(/** @type {Suite} */ (child), name);
  }
}

for (const suite of raw.suites || []) {
  walk(suite);
}

console.log(`[flake-report] specs=${total} failed=${failed} recovered-after-retry=${flaky.length}`);
for (const row of flaky) {
  console.log(`  FLKY  retries=${row.retries}  ${row.title}`);
}

if (flaky.length === 0) {
  console.log('[flake-report] No recovered flakes in this run.');
}
