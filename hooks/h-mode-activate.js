#!/usr/bin/env node
// h-mode — SessionStart hook
//
// 1. Writes flag at $CLAUDE_CONFIG_DIR/.h-mode-active
// 2. Resets session turn counter
// 3. Emits the h-mode ruleset as system context
// 4. Nudges user to configure statusline if missing
// 5. Major-version update notice (majors only, cached, fail-silent)

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getClaudeDir, safeWriteFlag, legacySetting } = require('./h-mode-config');

// ── Update-notice helpers (pure — tested directly) ─────────────────────────
// Minor/patch releases stay quiet: a nudge per major is signal, more is spam.
const UPDATE_CACHE_MS = 3 * 24 * 60 * 60 * 1000;

function majorOf(v) {
  const m = /^(\d+)\./.exec(String(v || ''));
  return m ? parseInt(m[1], 10) : null;
}

// Notice line for a major jump, else null.
function majorUpdateNotice(installed, latest) {
  const i = majorOf(installed), l = majorOf(latest);
  if (i == null || l == null || l <= i) return null;
  return '\n\nH-MODE UPDATE AVAILABLE: v' + latest + ' (major; you run v' + installed + '). ' +
    'Mention this to the user once: update with `claude plugin update h-mode@h-mode` or `npx github:hemanth-create/H-Mode`.';
}

function installedVersion() {
  try {
    return JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', '.claude-plugin', 'plugin.json'), 'utf8')).version;
  } catch (e) { return null; } // standalone-hooks install → no manifest → skip
}

// Registry lookup, cached on disk. Network capped at 1.5s inside the 5s hook budget.
async function latestVersion(cachePath) {
  try {
    const c = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (c && Date.now() - c.checkedAt < UPDATE_CACHE_MS) return c.latest;
  } catch (e) {}
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch('https://api.github.com/repos/hemanth-create/H-Mode/releases/latest', {
      signal: ctrl.signal, headers: { Accept: 'application/vnd.github+json' },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const latest = String((await res.json()).tag_name || '').replace(/^v/, '');
    try {
      fs.writeFileSync(cachePath, JSON.stringify({ checkedAt: Date.now(), latest }), { mode: 0o600 });
    } catch (e) {}
    return latest;
  } catch (e) { return null; }
}

// SessionStart fires on startup, resume, clear and compact. Only a genuinely
// new session needs the whole ruleset: on the other three the conversation
// already carries it, and the UserPromptSubmit reminder re-states the active
// behaviour every turn anyway. Re-sending ~1.6k tokens each time was the bulk
// of the plugin's own overhead and piled standing instructions on top of what
// the user actually asked for. Measured and reported by @enc0ded (#2).
const FULL_INJECT_SOURCES = new Set(['startup']);

// ── Hook body ───────────────────────────────────────────────────────────────
function run(source) {
  const claudeDir = getClaudeDir();
  const flagPath = path.join(claudeDir, '.h-mode-active');
  const settingsPath = path.join(claudeDir, 'settings.json');

  const mode = getDefaultMode();

  if (mode === 'off') {
    try { fs.unlinkSync(flagPath); } catch (e) {}
    process.stdout.write('OK');
    process.exit(0);
  }

  // 1. Write flag
  safeWriteFlag(flagPath, mode);

  // 2. Resumed/cleared/compacted session: reactivate, don't re-teach.
  if (!FULL_INJECT_SOURCES.has(source)) {
    process.stdout.write(
      'H-MODE ACTIVE (resumed). ' +
      'Ruleset already in context; see the h-mode skill if it is not.'
    );
    return;
  }

  // 3. Read SKILL.md — single source of truth for behaviour. No level
  // filtering any more: there is one mode, so the whole body ships.
  let skillContent = '';
  try {
    skillContent = fs.readFileSync(
      path.join(__dirname, '..', 'skills', 'h-mode', 'SKILL.md'), 'utf8'
    );
  } catch (e) {}

  let output;

  if (skillContent) {
    output = 'H-MODE ACTIVE\n\n' + skillContent.replace(/^---[\s\S]*?---\s*/, '');
  } else {
    // Fallback ruleset when SKILL.md not found
    output =
      'H-MODE ACTIVE\n\n' +
      'H-Mode: maximum-efficiency dev mode. Zero-fluff prose. YAGNI-first code.\n\n' +
      '## Persistence\n\n' +
      'ACTIVE EVERY RESPONSE. Off only: "stop h-mode" / "normal mode".\n\n' +
      '## Prose\n\n' +
      'Drop articles/filler/pleasantries/hedging. Fragments OK. Technical terms exact.\n\n' +
      '## Code\n\n' +
      'Ladder: YAGNI → reuse → stdlib → native → installed dep → one line → min code.\n' +
      'No unrequested abstractions. Deletion over addition. Shortest diff wins.';
  }

  // 3. Detect missing statusline config
  try {
    let hasStatusline = false;
    if (fs.existsSync(settingsPath)) {
      const raw = fs.readFileSync(settingsPath, 'utf8').replace(/^﻿/, '');
      const settings = JSON.parse(raw);
      if (settings.statusLine) hasStatusline = true;
    }

    if (!hasStatusline) {
      const windows = process.platform === 'win32';
      const scriptPath = path.join(__dirname, windows ? 'h-mode-statusline.ps1' : 'h-mode-statusline.sh');
      const command = windows ? `powershell -NoProfile -File "${scriptPath}"` : `bash "${scriptPath}"`;
      const statusLineSnippet =
        '"statusLine": { "type": "command", "command": ' + JSON.stringify(command) + ' }';
      output += '\n\n' +
        'STATUSLINE SETUP NEEDED: The h-mode plugin includes a statusline badge ' +
        '([H-MODE]) with token savings. It is not configured yet. ' +
        'To enable, add this to ' + settingsPath + ': ' +
        statusLineSnippet + ' ' +
        'Proactively offer to set this up for the user on first interaction.';
    }
  } catch (e) {}

  // 3b. One-time courtesy for the 3.0.0 upgrade: a lite/full/ultra setting is
  // no longer meaningful. H-Mode still runs (the value falls through to the
  // default), but silently ignoring a setting someone chose is worse than
  // saying so once.
  const legacy = legacySetting();
  if (legacy) {
    output += '\n\nH-MODE NOTE: `' + legacy.value + '` came from ' + legacy.source +
      '. Intensity levels were removed in 3.0.0 — there is one mode now, and it is ' +
      'active. Set it to `on` or `off`, or drop it entirely. Mention this once.';
  }

  // 4. Update notice, then emit. H_MODE_UPDATE_CHECK=0 disables.
  (async () => {
    try {
      if (process.env.H_MODE_UPDATE_CHECK !== '0') {
        const installed = installedVersion();
        if (installed) {
          const latest = await latestVersion(path.join(claudeDir, '.h-mode-update-check.json'));
          const notice = majorUpdateNotice(installed, latest);
          if (notice) output += notice;
        }
      }
    } catch (e) {}
    process.stdout.write(output);
  })();
}

// Claude Code pipes the hook payload (including `source`) on stdin. If it is
// absent or unparseable, fall back to a full inject — over-teaching once is a
// far cheaper failure than a session that never receives the ruleset at all.
function main() {
  let input = '';
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    let source = 'startup';
    try {
      const parsed = JSON.parse(input.replace(/^﻿/, ''));
      if (parsed && typeof parsed.source === 'string') source = parsed.source;
    } catch (e) {}
    run(source);
  });
  // stdin never opened (manual run): behave like a fresh session.
  if (process.stdin.isTTY) run('startup');
}

if (require.main === module) main();

module.exports = { majorOf, majorUpdateNotice };
