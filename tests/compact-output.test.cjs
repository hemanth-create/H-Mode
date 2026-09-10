'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { compact, scrub } = require('../skills/h-mode/scripts/compact-output.cjs');
const script = path.resolve(__dirname, '../skills/h-mode/scripts/compact-output.cjs');

function logLines(count = 400) {
  return Array.from({ length: count }, (_, i) => `step ${i}: ${'progress detail '.repeat(3)}`);
}

function run(args, input) {
  return spawnSync(process.execPath, [script, ...args], { input, encoding: 'utf8' });
}

test('empty and short outputs remain byte-for-byte unchanged', () => {
  for (const text of ['', 'OK\n', '\x1b[31merror\x1b[0m\n', 'x'.repeat(1024)]) {
    assert.equal(compact(text, { allowElision: true }), text);
  }
});

test('non-text inputs fail clearly', () => {
  assert.throws(() => compact({ stdout: 'log' }), TypeError);
  assert.throws(() => compact(null), TypeError);
});

test('cleanup removes ANSI color and OSC sequences while retaining log text', () => {
  const text = '\x1b]0;build\x07\x1b[31mERROR: compile\x1b[0m\n' + 'context '.repeat(200);
  const result = compact(text);
  assert.ok(result.startsWith('ERROR: compile\n'));
  assert.ok(!result.includes('\x1b'));
});

test('cleanup collapses excess blank lines and trailing whitespace', () => {
  assert.equal(scrub('one   \n\n\n\ntwo\t\n'), 'one\n\ntwo\n');
});

test('repeated long lines retain their value and correct total occurrence count', () => {
  const repeated = 'waiting for build dependencies '.repeat(4).trimEnd();
  const input = Array(12).fill(repeated).join('\n');
  const result = compact(input);
  assert.ok(result.startsWith(repeated + '\n'));
  assert.match(result, /12 times total/);
  assert.ok(result.length < input.length);
});

test('short repeat markers are not emitted when they would increase output', () => {
  assert.equal(scrub('x\nx\nx\nx'), 'x\nx\nx\nx');
});

test('default cleanup does not discard unique lines from a large log', () => {
  const input = logLines().join('\n');
  const result = compact(input);
  assert.equal(result.split('\n').length, 400);
  assert.ok(result.includes('step 200:'));
  assert.ok(!result.includes('omitted'));
});

test('elision retains the head, tail, and a middle error while marking the omission', () => {
  const lines = logLines();
  lines[150] = 'ERROR: failed to compile authentication module';
  const input = lines.join('\n');
  const result = compact(input, { allowElision: true });
  assert.ok(result.startsWith('step 0:'));
  assert.ok(result.includes('step 59:'));
  assert.ok(result.includes('step 360:'));
  assert.ok(result.includes('step 399:'));
  assert.ok(result.includes(lines[150]));
  assert.ok(!result.includes('step 200:'));
  assert.match(result, /300 middle lines omitted/);
  assert.ok(result.length < input.length);
});

test('error sampling is bounded and does not claim to preserve every error', () => {
  const lines = logLines();
  for (let i = 100; i < 120; i++) lines[i] = `ERROR: middle failure ${i}`;
  const result = compact(lines.join('\n'), { allowElision: true });
  assert.equal((result.match(/ERROR: middle failure/g) || []).length, 12);
  assert.match(result, /sampled error-like lines/);
});

test('long sampled error lines are explicitly marked as truncated', () => {
  const lines = logLines();
  lines[150] = 'ERROR: ' + 'detail'.repeat(300);
  const result = compact(lines.join('\n'), { allowElision: true });
  assert.match(result, /\[line truncated\]/);
  assert.ok(!result.includes(lines[150]));
});

test('a giant single-line log still retains head, tail, and a middle error preview', () => {
  const input = 'HEAD ' + 'a'.repeat(10000) + ' ERROR: broken input ' + 'b'.repeat(10000) + ' TAIL';
  const result = compact(input, { allowElision: true });
  assert.ok(result.startsWith('HEAD '));
  assert.ok(result.endsWith(' TAIL'));
  assert.match(result, /middle characters omitted/);
  assert.match(result, /sampled error-like lines/);
  assert.match(result, /ERROR: broken input/);
  assert.ok(result.length < input.length);
});

test('extremely long boundary lines fall back to a smaller character preview', () => {
  const lines = logLines();
  lines[0] = 'FIRST ' + 'a'.repeat(10000);
  lines[399] = 'b'.repeat(10000) + ' LAST';
  const result = compact(lines.join('\n'), { allowElision: true });
  assert.ok(result.startsWith('FIRST '));
  assert.ok(result.endsWith(' LAST'));
  assert.match(result, /middle characters omitted/);
  assert.ok(result.length < 16000);
});

test('an input just over the threshold is retained if markers would make it larger', () => {
  const input = 'x'.repeat(8001);
  assert.equal(compact(input, { allowElision: true }), input);
});

test('repeated calls return content instead of suppressing it as a duplicate', () => {
  const input = logLines().join('\n');
  const first = compact(input, { allowElision: true });
  assert.equal(compact(input, { allowElision: true }), first);
  assert.ok(first.includes('step 0:'));
});

test('CLI reads a file without changing it or creating state beside it', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h-mode-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'build log.txt');
  const input = logLines().join('\n');
  fs.writeFileSync(file, input);
  const result = run(['--elide', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, compact(input, { allowElision: true }));
  assert.equal(fs.readFileSync(file, 'utf8'), input);
  assert.deepEqual(fs.readdirSync(dir), ['build log.txt']);
});

test('CLI supports stdin and leaves its source-command status interpretation to the caller', () => {
  const input = 'ERROR: original build failed\n';
  const result = run(['-'], input);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, input);
  assert.equal(result.stderr, '');
});

test('CLI reports invalid arguments and missing files without a success exit', () => {
  for (const args of [[], ['--elide'], ['--unknown'], ['a', 'b']]) {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Usage:/);
  }
  const result = run([path.join(__dirname, 'missing-input.log')]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ENOENT/);
});

test('CLI help completes without reading stdin or creating any files', () => {
  const result = run(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /potentially lossy preview/);
});
