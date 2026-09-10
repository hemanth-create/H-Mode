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
    // Only direct requests control persistent mode. Do not scan questions,
    // negations, or quoted examples for activation/deactivation words.
    const request = promptLower.replace(/^(?:please\s+)?(?:(?:can|could|would)\s+you\s+(?:please\s+)?)?/, '');
    // One-shot audit/review/help commands must not activate the persistent mode.
    if (/^\/(?:h-mode:)?h-mode-(?:audit|review|help)(?=$|[\s.!?,;:])/.test(request) ||
        /^(?:(?:activate|enable|turn on|start|use)\s+)?h-mode[ -](?:audit|review|help)(?=$|[\s.!?,;:])/.test(request)) return;

    // Slash commands retain legacy level arguments as activation aliases.
    if (/^\/(?:h-mode:)?h-mode(?:\s|$)/.test(promptLower)) {
      const parts = promptLower.split(/\s+/);
      const arg = parts[1] || '';
      if (arg === 'off' || arg === 'stop' || arg === 'disable') {
        safeWriteFlag(flagPath, 'off');
      } else {
        safeWriteFlag(flagPath, 'on');
      }
    } else if (/^(?:turn off|disable|deactivate|stop|kill|exit)\s+h-mode(?=$|[\s.!?,;:])/.test(request) ||
        /^(?:h-mode\s+(?:mode\s+)?(?:off|stop|disable|deactivate)|normal mode)[.!?]?$/.test(request)) {
      safeWriteFlag(flagPath, 'off');
    } else if (/^(?:(?:activate|enable|turn on|start|use)\s+h-mode|h-modify)(?=$|[\s.!?,;:])/.test(request) ||
        /^h-mode\s+(?:mode(?:\s+on)?|activate|enable|on)[.!?]?$/.test(request)) {
      // The target boundary excludes h-mode-audit/review/help. Off/stop words
      // later in the task (e.g. "use h-mode to turn off the logger") are unrelated.
      // Bare mode selectors must stand alone, not introduce an explanation.
      safeWriteFlag(flagPath, 'on');
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
