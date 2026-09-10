const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const names = ['h-mode', 'h-mode-audit', 'h-mode-review', 'h-mode-help'];
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h-mode-suite-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function cli(args, env = {}) {
  return spawnSync(process.execPath, [path.join(root, 'bin/install.js'), ...args], {
    encoding: 'utf8', env: { ...process.env, ...env }, timeout: 10000,
  });
}

test('Codex plugin exposes the four real, self-contained skill folders', () => {
  const manifest = JSON.parse(read('.codex-plugin/plugin.json'));
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.instructions, undefined);
  for (const name of names) {
    assert.match(read(`skills/${name}/SKILL.md`), new RegExp(`name: ${name}\\n`));
    assert.ok(read(`skills/${name}/agents/openai.yaml`).includes(`$${name}`));
    assert.equal(read(`skills/${name}/LICENSE`), read('LICENSE'));
  }
});

test('Claude manifests register the same complete hook set and every script exists', () => {
  const a = JSON.parse(read('.claude-plugin/plugin.json'));
  const b = JSON.parse(read('.github/plugin/plugin.json'));
  assert.deepEqual(a.hooks, b.hooks);
  assert.deepEqual(Object.keys(a.hooks).sort(), ['PostToolUse', 'SessionStart', 'UserPromptSubmit']);
  for (const groups of Object.values(a.hooks)) for (const group of groups) {
    for (const hook of group.hooks) {
      const file = /\/hooks\/([^"\s]+)/.exec(hook.command)[1];
      assert.ok(fs.existsSync(path.join(root, 'hooks', file)));
    }
  }
});

test('Gemini commands contain executable prompts, not metadata-only command tables', () => {
  for (const name of names) {
    const command = read(`commands/${name}.toml`);
    assert.ok(!command.includes('[command]'));
    const promptLine = command.split('\n').find(line => line.startsWith('prompt = '));
    assert.ok(promptLine);
    assert.ok(JSON.parse(promptLine.slice('prompt = '.length)).length > 50);
  }
});

test('standalone Claude installation includes all skills and full activation rules', t => {
  const dir = fixture(t);
  const settingsPath = path.join(dir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify({ model: 'existing', custom: { keep: true } }));
  const result = cli(['--only', 'claude', '--config-dir', dir]);
  assert.equal(result.status, 0, result.stderr);
  for (const name of names) assert.ok(fs.existsSync(path.join(dir, 'skills', name, 'SKILL.md')));
  const after = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  assert.equal(after.model, 'existing');
  assert.deepEqual(after.custom, { keep: true });
  const activate = spawnSync(process.execPath, [path.join(dir, 'h-mode-hooks/h-mode-activate.js')], {
    input: JSON.stringify({ source: 'startup' }), encoding: 'utf8',
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir, H_MODE_UPDATE_CHECK: '0', H_MODE_DEFAULT_MODE: 'on' },
  });
  assert.equal(activate.status, 0, activate.stderr);
  assert.ok(activate.stdout.includes('## Code: The Efficiency Ladder'));
});

test('Codex custom-directory install is complete, repeatable, and preserves user instructions', t => {
  const dir = fixture(t);
  const instructions = path.join(dir, 'AGENTS.md');
  fs.writeFileSync(instructions, 'User instructions: keep this.\n');
  let result = cli(['--only', 'codex', '--config-dir', dir]);
  assert.equal(result.status, 0, result.stderr);
  for (const name of names) assert.ok(fs.existsSync(path.join(dir, 'skills', name, 'SKILL.md')));
  result = cli(['--only', 'codex', '--config-dir', dir]);
  assert.equal(result.status, 0, result.stderr);
  const installed = fs.readFileSync(instructions, 'utf8');
  assert.ok(installed.startsWith('User instructions: keep this.\n'));
  assert.equal(installed.split('<!-- h-mode-begin -->').length - 1, 1);
  result = cli(['--uninstall', '--only', 'codex', '--config-dir', dir]);
  assert.equal(result.status, 0, result.stderr);
  const removed = fs.readFileSync(instructions, 'utf8');
  assert.ok(removed.includes('User instructions: keep this.'));
  assert.ok(!removed.includes('<!-- h-mode-begin -->'));
  assert.ok(fs.existsSync(path.join(dir, 'skills/h-mode/SKILL.md')), 'local skill edits are retained');
});

test('dry-run does not install any of the four skills', t => {
  const dir = fixture(t);
  const result = cli(['--only', 'codex', '--config-dir', dir, '--dry-run']);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fs.readdirSync(dir), []);
  for (const name of names) assert.ok(result.stdout.includes(`skill ${name}`));
});

test('audit/review/help commands do not toggle persistent mode, including namespaced forms', t => {
  const dir = fixture(t);
  const flag = path.join(dir, '.h-mode-active');
  const tracker = path.join(root, 'hooks/h-mode-mode-tracker.js');
  const run = prompt => spawnSync(process.execPath, [tracker], {
    input: JSON.stringify({ prompt }), encoding: 'utf8',
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir, H_MODE_DEFAULT_MODE: 'on' },
  });
  for (const name of names.slice(1)) for (const prefix of ['/', '/h-mode:']) {
    assert.equal(run(prefix + name + ' src/').status, 0);
    assert.ok(!fs.existsSync(flag));
  }
  assert.equal(run('/h-mode:h-mode').status, 0);
  assert.equal(fs.readFileSync(flag, 'utf8').trim(), 'on');
  run('/h-mode:h-mode off');
  assert.ok(!fs.existsSync(flag));
});

test('plugin installation removes duplicate standalone hooks while preserving foreign hooks', { skip: process.platform === 'win32' }, t => {
  const dir = fixture(t);
  const fakeBin = path.join(dir, 'bin');
  fs.mkdirSync(fakeBin);
  fs.writeFileSync(path.join(fakeBin, 'claude'), '#!/bin/sh\necho h-mode\n', { mode: 0o755 });
  const config = path.join(dir, 'config');
  fs.mkdirSync(config);
  fs.writeFileSync(path.join(config, 'settings.json'), JSON.stringify({
    model: 'keep', hooks: { PostToolUse: [{ hooks: [
      { type: 'command', command: 'node /old/h-mode-compress-output.js' },
      { type: 'command', command: 'node /foreign/keep.js' },
    ] }] },
  }));
  const result = cli(['--only', 'claude'], { PATH: fakeBin + path.delimiter + process.env.PATH, CLAUDE_CONFIG_DIR: config });
  assert.equal(result.status, 0, result.stderr);
  const after = fs.readFileSync(path.join(config, 'settings.json'), 'utf8');
  assert.ok(!after.includes('h-mode-compress-output'));
  assert.ok(after.includes('/foreign/keep.js'));
  assert.equal(JSON.parse(after).model, 'keep');
});

test('live benchmark refuses paid model calls without explicit opt-in', { skip: process.platform === 'win32' }, () => {
  const result = spawnSync('bash', [path.join(root, 'benchmarks/run-live.sh')], {
    encoding: 'utf8', env: { ...process.env, H_MODE_ALLOW_PAID_BENCHMARK: '0' },
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /paid model calls/);
});
