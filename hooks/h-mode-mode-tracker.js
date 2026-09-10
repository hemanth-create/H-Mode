#!/usr/bin/env node
// h-mode — UserPromptSubmit hook
// Handles /h-mode commands, natural language activation/deactivation, and
// per-turn reinforcement.

const path = require('path');
const { getClaudeDir, safeWriteFlag, readFlag } = require('./h-mode-config');
const { reminder } = require('./h-mode-instructions.json');

const claudeDir = getClaudeDir();
const flagPath = path.join(claudeDir, '.h-mode-active');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input.replace(/^﻿/, ''));
    const prompt = (data.prompt || '').trim();
    const promptLower = prompt.toLowerCase();
    // One-shot audit/review/help commands must not activate the persistent mode.
    if (/^\/(?:h-mode:)?h-mode-(?:audit|review|help)(?:\s|$)/.test(promptLower) ||
        /^(?:please\s+)?(?:use\s+)?h-mode[ -](?:audit|review|help)(?:\s|$)/.test(promptLower)) return;

    // Natural language activation
    if (/\b(activate|enable|turn on|start|use)\b.*\bh-mode\b/i.test(promptLower) ||
        /\bh-mode\b.*\b(mode|activate|enable|on)\b/i.test(promptLower) ||
        /\bh-modify\b/i.test(promptLower)) {
      if (!/\b(stop|disable|turn off|deactivate|off)\b/i.test(promptLower)) {
        safeWriteFlag(flagPath, 'on');
      }
    }

    // /h-mode slash commands. No level argument any more: /h-mode on,
    // /h-mode off, nothing else.
    if (/^\/(?:h-mode:)?h-mode(?:\s|$)/.test(promptLower)) {
      const parts = promptLower.split(/\s+/);
      const arg = parts[1] || '';
      if (arg === 'off' || arg === 'stop' || arg === 'disable') {
        safeWriteFlag(flagPath, 'off');
      } else {
        safeWriteFlag(flagPath, 'on');
      }
    }

    // Natural language deactivation.
    // Only fire when the off-verb actually targets h-mode — NOT when h-mode merely
    // appears in a sentence that also mentions turning something else off.
    // ("use h-mode to turn off the logger" must NOT deactivate.)
    if (/\b(turn off|disable|deactivate|stop|kill|exit)\s+h-mode\b/i.test(promptLower) ||
        /\bh-mode\s+(mode\s+)?(off|stop|disable|deactivate)\b/i.test(promptLower) ||
        /\bnormal mode\b/i.test(promptLower)) {
      safeWriteFlag(flagPath, 'off');
    }

    // Per-turn reinforcement
    const activeMode = readFlag(flagPath);
    if (activeMode && activeMode !== 'off') {
      // Inject compact reminder — keeps h-mode visible across context compression
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: reminder
        }
      }));
    }
  } catch (e) {
    // Silent fail
  }
});
