const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..');

function session(t, defaultMode) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h-mode-lifecycle-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const flag = path.join(dir, '.h-mode-active');
  const env = { ...process.env, CLAUDE_CONFIG_DIR: dir, H_MODE_DEFAULT_MODE: defaultMode, H_MODE_UPDATE_CHECK: '0' };
  const hook = (name, payload) => {
    const result = spawnSync(process.execPath, [path.join(root, 'hooks', name)], {
      input: JSON.stringify(payload), encoding: 'utf8', env, timeout: 5000,
    });
    assert.equal(result.status, 0, result.stderr || String(result.error || ''));
    return result.stdout;
  };
  return {
    dir, flag, env,
    mode: () => fs.existsSync(flag) ? fs.readFileSync(flag, 'utf8').trim() : null,
    start: source => hook('h-mode-activate.js', { source }),
    prompt: prompt => hook('h-mode-mode-tracker.js', { prompt }),
    compress: () => hook('h-mode-compress-output.js', {
      tool_name: 'Bash', session_id: 'lifecycle',
      tool_response: 'line\n'.repeat(5000),
    }),
  };
}

for (const source of ['resume', 'clear', 'compact']) {
  test(`explicit off survives ${source} with an on default`, t => {
    const s = session(t, 'on');
    s.start('startup');
    s.prompt('/h-mode off');
    const out = s.start(source);
    assert.notEqual(s.mode(), 'on');
    assert.doesNotMatch(out, /H-MODE ACTIVE/);
    assert.equal(s.prompt('continue the task'), '');
    assert.equal(s.compress(), '');
  });

  test(`explicit on survives ${source} with an off default`, t => {
    const s = session(t, 'off');
    s.start('startup');
    s.prompt('/h-mode on');
    assert.equal(s.mode(), 'on');
    assert.match(s.start(source), /H-MODE ACTIVE/);
    assert.equal(s.mode(), 'on');
  });
}

test('a new startup applies the configured default again', t => {
  for (const defaultMode of ['off', 'on']) {
    const s = session(t, defaultMode);
    s.start('startup');
    s.prompt(defaultMode === 'off' ? '/h-mode on' : '/h-mode off');
    s.start('startup');
    assert.equal(s.mode(), defaultMode);
  }
});

test('one-shot commands preserve an explicit off choice', t => {
  const s = session(t, 'on');
  s.start('startup');
  s.prompt('/h-mode off');
  for (const name of ['audit', 'review', 'help']) {
    for (const prefix of ['/', '/h-mode:', '', 'use ', 'please use ',
      'Can you use ', 'Could you please use ', 'How do I use ']) {
      assert.equal(s.prompt(prefix + 'h-mode-' + name), '');
      assert.equal(s.mode(), 'off');
    }
    assert.equal(s.prompt('use h-mode ' + name + ' src/'), '');
    assert.equal(s.mode(), 'off');
  }
});

test('negated, help, and audit requests leave reminders and compression disabled', t => {
  const s = session(t, 'off');
  s.start('startup');
  for (const prompt of [
    'Do not use h-mode for this task.',
    'How do I use h-mode?',
    'Can you use h-mode-audit on this repository?',
    'Could you please use h-mode review on this repository?',
  ]) {
    assert.equal(s.prompt(prompt), '', prompt + ': no active reminder');
    assert.equal(s.mode(), 'off', prompt + ': preserve mode');
    assert.equal(s.compress(), '', prompt + ': no compression');
  }
});

test('off requests with punctuation or trailing courtesy disable all runtime effects', t => {
  const s = session(t, 'on');
  s.start('startup');
  for (const prompt of ['/h-mode off.', '/h-mode:h-mode off.',
    'Normal mode please.', 'h-mode off for this task']) {
    s.prompt('/h-mode on');
    assert.equal(s.prompt(prompt), '', prompt + ': no active reminder');
    assert.equal(s.mode(), 'off', prompt + ': mode is off');
    assert.equal(s.compress(), '', prompt + ': no compression');
    assert.doesNotMatch(s.start('compact'), /H-MODE ACTIVE/, prompt + ': stays off after compaction');
    assert.equal(s.mode(), 'off');
  }
});

test('Bash statusline hides an explicit off flag and still displays an active badge', { skip: process.platform === 'win32' }, t => {
  const s = session(t, 'on');
  const badge = () => {
    const result = spawnSync('bash', [path.join(root, 'hooks/h-mode-statusline.sh')], {
      input: '{}', encoding: 'utf8', env: s.env, timeout: 5000,
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  s.start('startup');
  assert.match(badge(), /\[H-MODE\]/);
  s.prompt('/h-mode off');
  assert.equal(s.mode(), 'off');
  assert.equal(badge(), '');
});

test('PowerShell statusline hides an explicit off flag and still displays an active badge', t => {
  const shell = process.platform === 'win32' ? 'powershell' : 'pwsh';
  // Allow CI's first PowerShell launch to warm up. Actual badge executions
  // below still have the five-second timeout and must return the right output.
  const probe = spawnSync(shell, ['-NoProfile', '-Command', 'exit 0'], { timeout: 30000 });
  if (probe.error?.code === 'ENOENT') { t.skip('PowerShell is unavailable'); return; }
  assert.equal(probe.status, 0, String(probe.error || 'PowerShell probe failed'));
  const s = session(t, 'on');
  const badge = () => {
    const result = spawnSync(shell, ['-NoProfile', '-File', path.join(root, 'hooks/h-mode-statusline.ps1')], {
      encoding: 'utf8', env: s.env, timeout: 5000,
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  s.start('startup');
  assert.match(badge(), /\[H-MODE\]/);
  s.prompt('/h-mode off');
  assert.equal(badge(), '');
});
