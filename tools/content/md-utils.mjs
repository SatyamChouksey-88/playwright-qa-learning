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

/**
 * Parse a tier markdown file into question objects.
 * Expected shape:
 *   ### A1. Question text?
 *   **Ideal approach:** …
 *   **Why they get stuck:** …
 */
export function parseTierMarkdown(raw) {
  const { data, body } = splitFrontmatter(raw);
  const questions = [];
  const re =
    /^###\s+([A-Da-d]\d+)\.\s+(.+?)\r?\n([\s\S]*?)(?=^###\s+[A-Da-d]\d+\.|\s*$)/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    const idRaw = m[1];
    const q = m[2].trim();
    const block = m[3];
    const idealMatch = block.match(
      /\*\*Ideal approach:\*\*\s*([\s\S]*?)(?=\*\*Why they get stuck:\*\*|$)/i,
    );
    const stuckMatch = block.match(/\*\*Why they get stuck:\*\*\s*([\s\S]*?)$/i);
    const idealMd = (idealMatch?.[1] || '').trim();
    const stuckMd = (stuckMatch?.[1] || '').trim();
    questions.push({
      id: idRaw.toLowerCase(),
      q,
      ideal: blockToHtml(idealMd),
      stuck: blockToHtml(stuckMd),
      _idealMd: idealMd,
      _stuckMd: stuckMd,
    });
  }
  return { frontmatter: data, questions };
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
