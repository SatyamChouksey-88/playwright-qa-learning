#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const testsDir = path.join(ROOT, 'practice-suite/tests');
const bad = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.ts')) {
      const text = fs.readFileSync(p, 'utf8');
      if (/force:\s*true/.test(text)) bad.push(`${p}: force:true`);
      if (/waitForTimeout\s*\(/.test(text)) bad.push(`${p}: waitForTimeout`);
      if (/toBeTruthy\s*\(\s*\)/.test(text)) bad.push(`${p}: toBeTruthy()`);
    }
  }
}

walk(testsDir);
if (bad.length) {
  console.error('Test anti-patterns found:\n' + bad.join('\n'));
  process.exit(1);
}
console.log('Test anti-pattern check passed');
