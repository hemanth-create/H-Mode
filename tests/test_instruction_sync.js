const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..');

test('skill edits propagate to editor rules, context files, hook text, and all Gemini commands', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h-mode-instructions-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(path.join(root, 'scripts/build-rules.js'), path.join(dir, 'scripts/build-rules.js'));
  fs.cpSync(path.join(root, 'skills'), path.join(dir, 'skills'), { recursive: true });
  const run = (...args) => spawnSync(process.execPath, [path.join(dir, 'scripts/build-rules.js'), ...args], {
    encoding: 'utf8', timeout: 5000,
  });
  const read = file => fs.readFileSync(path.join(dir, file), 'utf8');
  const update = (file, transform) => fs.writeFileSync(path.join(dir, file), transform(read(file)));
  assert.equal(run().status, 0);
  assert.equal(run('--check').status, 0);

  const original = read('AGENTS.md');
  const mainUpdate = 'Preserve the fixture-specific deployment contract.';
  update('skills/h-mode/SKILL.md', text =>
    text.replace('<!-- h-mode:reminder:end -->', mainUpdate + '\n<!-- h-mode:reminder:end -->'));
  for (const name of ['audit', 'review', 'help']) {
    update('skills/h-mode-' + name + '/SKILL.md', text => text + '\nUpdated ' + name + ' guidance.\n');
  }
  assert.equal(run('--check').status, 1, 'check must detect source drift');
  assert.equal(read('AGENTS.md'), original, 'check must not rewrite files');
  assert.equal(run().status, 0);
  assert.equal(run('--check').status, 0);

  for (const file of ['AGENTS.md', 'GEMINI.md', 'rules/h-mode-activate.md',
    '.cursor/rules/h-mode.mdc', '.windsurf/rules/h-mode.md', '.clinerules/h-mode.md',
    '.kiro/steering/h-mode.md', '.github/copilot-instructions.md']) {
    assert.ok(read(file).includes(mainUpdate), file);
  }
  const instructions = JSON.parse(read('hooks/h-mode-instructions.json'));
  assert.ok(instructions.reminder.includes(mainUpdate));
  assert.ok(instructions.fallback.includes(mainUpdate));
  for (const name of ['h-mode', 'h-mode-audit', 'h-mode-review', 'h-mode-help']) {
    const line = read('commands/' + name + '.toml').split('\n').find(s => s.startsWith('prompt = '));
    const prompt = JSON.parse(line.slice('prompt = '.length));
    const expected = name === 'h-mode' ? mainUpdate : 'Updated ' + name.slice(7) + ' guidance.';
    assert.ok(prompt.includes(expected), name);
    assert.ok(prompt.includes('{{args}}'), name + ' must retain command arguments');
  }

  const generated = read('AGENTS.md');
  update('skills/h-mode/SKILL.md', text => text.replace('<!-- h-mode:core:end -->', ''));
  assert.notEqual(run().status, 0, 'invalid source must fail before writing');
  assert.equal(read('AGENTS.md'), generated);
});
