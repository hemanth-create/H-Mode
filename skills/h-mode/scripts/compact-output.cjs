#!/usr/bin/env node
'use strict';

// MIT-licensed adaptation; see ../LICENSE and the repository NOTICE.md.
// Manual log previews only: no hooks, history, network requests, or file writes.
const fs = require('node:fs');

const LIMITS = Object.freeze({ maxChars: 8000, headLines: 60, tailLines: 40 });
const ANSI = /\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g;
const ERROR_LINE = /\b(error|err!|fail(ed|ure|ing)?|exception|traceback|panic|fatal|denied|refused|timed?[ _-]?out|assert(ion)?|segfault|undefined reference|cannot find|not found|warning)\b/i;

function scrub(text) {
  const lines = text.replace(ANSI, '').replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n').split('\n');
  const out = [];
  for (let i = 0; i < lines.length;) {
    let end = i + 1;
    while (end < lines.length && lines[end] === lines[i]) end++;
    const count = end - i;
    if (count >= 4 && lines[i].trim()) {
      out.push(lines[i], `[h-mode: previous line occurred ${count} times total]`);
    } else {
      out.push(...lines.slice(i, end));
    }
    i = end;
  }
  const cleaned = out.join('\n');
  return cleaned.length < text.length ? cleaned : text;
}

function salvage(text) {
  const found = [];
  for (const line of text.split('\n')) {
    const match = ERROR_LINE.exec(line);
    if (!match) continue;
    // Center a bounded excerpt near the match, not far before a late error.
    const start = line.length > 300 ? Math.max(0, match.index - 80) : 0;
    const end = start + 300;
    found.push((start ? '[line truncated] ' : '') + line.slice(start, end) +
      (line.length > end ? ' [line truncated]' : ''));
    if (found.length === 12) break;
  }
  return found.length
    ? '\n[h-mode: sampled error-like lines from omitted content]\n' + found.join('\n')
    : '';
}

function elide(text) {
  const lines = text.split('\n');
  if (lines.length > LIMITS.headLines + LIMITS.tailLines) {
    const head = lines.slice(0, LIMITS.headLines).join('\n');
    const tail = lines.slice(-LIMITS.tailLines).join('\n');
    const middle = lines.slice(LIMITS.headLines, -LIMITS.tailLines);
    const preview = head + `\n[h-mode: ${middle.length} middle lines omitted]` +
      salvage(middle.join('\n')) + '\n' + tail;
    if (preview.length < text.length && head.length + tail.length <= LIMITS.maxChars) {
      return preview;
    }
  }

  // A huge first/last line must not defeat the line-based preview.
  const keep = Math.floor(LIMITS.maxChars / 2);
  const middle = text.slice(keep, -keep);
  const preview = text.slice(0, keep) +
    `\n[h-mode: ${middle.length} middle characters omitted]` + salvage(middle) +
    '\n' + text.slice(-keep);
  return preview.length < text.length ? preview : text;
}

function compact(text, { allowElision = false } = {}) {
  if (typeof text !== 'string') throw new TypeError('Expected plain-text input.');
  if (text.length <= 1024) return text;
  const cleaned = scrub(text);
  return allowElision && cleaned.length > LIMITS.maxChars ? elide(cleaned) : cleaned;
}

function main(args) {
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    process.stdout.write('Usage: node compact-output.cjs [--elide] <log-file|->\n' +
      'Plain-text logs only. Keep the original; output is a potentially lossy preview.\n');
    return;
  }
  const allowElision = args[0] === '--elide';
  const paths = allowElision ? args.slice(1) : args;
  if (paths.length !== 1 || !paths[0] || (paths[0] !== '-' && paths[0].startsWith('--'))) {
    throw new Error('Usage: node compact-output.cjs [--elide] <log-file|->');
  }
  const original = fs.readFileSync(paths[0] === '-' ? 0 : paths[0], 'utf8');
  process.stdout.write(compact(original, { allowElision }));
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`h-mode: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { compact, scrub, LIMITS };
