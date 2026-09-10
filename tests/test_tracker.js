#!/usr/bin/env node
// Integration tests for h-mode-mode-tracker.js — drives it via stdin with a temp
// CLAUDE_CONFIG_DIR and asserts the resulting flag state.
// Run: node --test tests/test_tracker.js

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const TRACKER = path.join(__dirname, '..', 'hooks', 'h-mode-mode-tracker.js');

// Run the tracker with a given prompt against a fresh temp config dir.
// Returns the explicit on/off value, or null if state is uninitialized.
function runTracker(prompt, { preActive, defaultMode = 'on' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'h-mode-trk-'));
  const flagPath = path.join(dir, '.h-mode-active');
  if (preActive) fs.writeFileSync(flagPath, preActive, { mode: 0o600 });

  try {
    execFileSync(process.execPath, [TRACKER], {
      input: JSON.stringify({ prompt }),
      env: { ...process.env, CLAUDE_CONFIG_DIR: dir, H_MODE_DEFAULT_MODE: defaultMode },
      encoding: 'utf8',
      timeout: 5000,
    });
    return fs.existsSync(flagPath) ? fs.readFileSync(flagPath, 'utf8').trim() : null;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ── Activation ───────────────────────────────────────────────────────────────

test('/h-mode activates at default level', () => {
  assert.equal(runTracker('/h-mode'), 'on');
});

test('a leftover level argument still just activates', () => {
  // /h-mode lite|full|ultra used to select an intensity. One mode now, so any
  // stray argument is ignored rather than rejected — old muscle memory works.
  assert.equal(runTracker('/h-mode full'), 'on');
  assert.equal(runTracker('/h-mode ultra'), 'on');
});

test('natural language "activate h-mode" activates', () => {
  assert.equal(runTracker('please activate h-mode'), 'on');
});

test('explicit activation overrides an off default, including qualified and natural commands', () => {
  for (const prompt of [
    '/h-mode', '/h-mode on', '/h-mode:h-mode on', 'activate h-mode',
    'please enable h-mode', 'turn on h-mode', 'start h-mode',
    'use h-mode for this task.', 'h-mode mode', 'h-mode mode on', 'h-mode on',
    'h-mode activate', 'h-mode enable', 'h-modify this',
    'Can you please activate H-Mode?', 'use h-mode to turn off the logger',
  ]) {
    assert.equal(runTracker(prompt, { defaultMode: 'off', preActive: 'off' }), 'on', prompt);
  }
});

test('negations, questions, and quoted mentions preserve inactive and active state', () => {
  for (const prompt of [
    'Do not use h-mode for this task.', 'Please do not activate h-mode.',
    "Don't enable h-mode.", 'Never start h-mode.', 'Do not h-modify this.',
    'How do I use h-mode?', 'How do I activate h-mode?',
    'Explain how to use h-mode.', 'Tell me about h-mode mode.',
    '"activate h-mode"', '`h-modify this`', 'What does /h-mode on do?',
    'Do not disable h-mode.', 'How do I turn off h-mode?',
    'Explain normal mode.', 'H-mode mode is not enabled; leave it that way.',
    'H-mode on or off: which should I use?', 'H-mode mode: how do I use it?',
    'H-mode off means what?', 'Normal mode is what I used before.',
  ]) {
    for (const preActive of [null, 'off', 'on']) {
      assert.equal(runTracker(prompt, { defaultMode: 'off', preActive }), preActive, prompt);
    }
  }
});

// ── Deactivation ─────────────────────────────────────────────────────────────

test('"stop h-mode" deactivates', () => {
  assert.equal(runTracker('stop h-mode', { preActive: 'on' }), 'off');
});

test('"/h-mode off" deactivates', () => {
  assert.equal(runTracker('/h-mode off', { preActive: 'on' }), 'off');
});

test('"normal mode" deactivates', () => {
  assert.equal(runTracker('normal mode', { preActive: 'on' }), 'off');
});

test('direct deactivation commands still work with polite prefixes and mode aliases', () => {
  for (const prompt of [
    '/h-mode:h-mode off', '/h-mode stop', '/h-mode disable',
    'Please turn off h-mode.', 'Could you please disable h-mode?',
    'deactivate h-mode', 'kill h-mode', 'exit h-mode',
    'h-mode mode off', 'h-mode stop', 'h-mode disable', 'h-mode deactivate',
  ]) {
    assert.equal(runTracker(prompt, { preActive: 'on' }), 'off', prompt);
  }
});

test('slash off commands tolerate punctuation from either starting state', () => {
  for (const command of ['/h-mode', '/h-mode:h-mode']) {
    for (const arg of ['off', 'stop', 'disable', 'deactivate']) {
      for (const suffix of ['', '.', '!', '?', ',', ':', ';']) {
        for (const preActive of ['off', 'on']) {
          const prompt = command + ' ' + arg + suffix;
          assert.equal(runTracker(prompt, { preActive, defaultMode: 'off' }), 'off', prompt);
        }
      }
    }
  }
});

test('bare mode requests accept polite and scope suffixes without reversing intent', () => {
  const cases = [
    ['Normal mode', 'off'], ['h-mode off', 'off'], ['h-mode mode off', 'off'],
    ['h-mode on', 'on'], ['h-mode mode', 'on'],
  ];
  for (const [command, expected] of cases) {
    for (const suffix of [' please.', ', please!', ' for now', ' for this task',
      ' please for this session.', ' for the current task, please.']) {
      for (const preActive of ['off', 'on']) {
        const prompt = command + suffix;
        assert.equal(runTracker(prompt, { preActive, defaultMode: 'off' }), expected, prompt);
      }
    }
  }
});

test('suffix handling does not reinterpret explanations, negations, or help as mode requests', () => {
  for (const prompt of [
    'Do not use h-mode for this task, please.', 'Do not disable h-mode for now.',
    'How do I use h-mode for this task?', 'Explain normal mode, please.',
    'H-mode off means what, please?', 'H-mode on or off for this task?',
    'Normal mode is what I used for this task.', '"h-mode off for this task"',
    'Can you use h-mode-help for this task?', 'Please use h-mode-review for now.',
    'Use h-mode audit for this task, please.',
  ]) {
    for (const preActive of [null, 'off', 'on']) {
      assert.equal(runTracker(prompt, { preActive, defaultMode: 'off' }), preActive, prompt);
    }
  }
});

// ── Regression: must NOT deactivate on unrelated "off"/"stop" ─────────────────

test('REGRESSION: "use h-mode to turn off the logger" stays active', () => {
  assert.equal(runTracker('use h-mode to turn off the logger', { preActive: 'on' }), 'on');
});

test('REGRESSION: "h-mode please stop the server" stays active', () => {
  assert.equal(runTracker('h-mode please stop the server', { preActive: 'on' }), 'on');
});
