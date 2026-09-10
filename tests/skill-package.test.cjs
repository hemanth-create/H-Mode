'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const skillDir = path.join(root, 'skills/h-mode');

test('skill entrypoint and UI metadata identify the same usable skill', () => {
  const skill = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
  const ui = fs.readFileSync(path.join(skillDir, 'agents/openai.yaml'), 'utf8');
  assert.match(skill, /^---\nname: h-mode\ndescription: >-?/);
  assert.match(ui, /default_prompt: ".*\$h-mode/);
  assert.ok(!skill.includes('[TODO:'));
});

test('local Markdown links resolve inside the distributable repository', () => {
  const files = ['README.md', 'NOTICE.md', 'skills/h-mode/SKILL.md', 'skills/h-mode/references/tool-output.md'];
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      const link = match[1];
      if (/^https?:\/\//.test(link)) continue;
      const target = path.resolve(path.dirname(path.join(root, file)), link);
      assert.ok(target.startsWith(root + path.sep), `${file}: outside-repo link ${link}`);
      assert.ok(fs.existsSync(target), `${file}: broken link ${link}`);
    }
  }
});

test('installing only the skill folder preserves the license and optional helper', () => {
  const license = fs.readFileSync(path.join(skillDir, 'LICENSE'), 'utf8');
  assert.equal(license, fs.readFileSync(path.join(root, 'LICENSE'), 'utf8'));
  assert.match(license, /Copyright \(c\) 2026 Jay Pokale/);
  assert.match(license, /Copyright \(c\) 2026 Hemanth/);
  assert.ok(fs.existsSync(path.join(skillDir, 'scripts/compact-output.cjs')));
  assert.ok(fs.existsSync(path.join(skillDir, 'references/tool-output.md')));
});
