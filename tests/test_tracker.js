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
  for (const prompt of ['/h-mode', '/h-mode on', '/h-mode:h-mode on', 'activate h-mode']) {
    assert.equal(runTracker(prompt, { defaultMode: 'off', preActive: 'off' }), 'on', prompt);
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

// ── Regression: must NOT deactivate on unrelated "off"/"stop" ─────────────────

test('REGRESSION: "use h-mode to turn off the logger" stays active', () => {
  assert.equal(runTracker('use h-mode to turn off the logger', { preActive: 'on' }), 'on');
});

test('REGRESSION: "h-mode please stop the server" stays active', () => {
  assert.equal(runTracker('h-mode please stop the server', { preActive: 'on' }), 'on');
});
