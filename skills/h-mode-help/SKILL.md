---
name: h-mode-help
description: >
  Explain H-Mode commands, activation, and platform differences.
  Use for /h-mode-help, "h-mode help", "how do I use h-mode", or
  "what h-mode commands". One-shot help; does not activate persistent mode.
---

# H-Mode Help

Explain the commands relevant to the user's host and question. Keep the answer
concise while including the setup details needed to use them.

| Skill | Purpose |
|---|---|
| h-mode | Complete the requested work with concise output and reuse-first code |
| h-mode-audit [path] | Read-only audit of code and prose in a diff, file, or repo |
| h-mode-review [path] | Read-only complexity review of a diff or file |
| h-mode-help | Command, setup, and platform guidance |

Audit includes prose and can cover a whole repository when requested. Review
focuses on code and defaults to the current diff. Both report evidence, impact,
confidence, and limitations; neither applies fixes or activates the main mode.

## Activation

Claude standalone skills use /h-mode and /h-mode on to activate, even with
H_MODE_DEFAULT_MODE=off. /h-mode off, "stop h-mode", or "normal mode" deactivates.
Resume, clear, and compaction preserve that choice; a new startup uses the
configured default. The mode flag is shared by sessions in one Claude config
directory.

Natural activation includes "activate h-mode", "h-mode mode", and "h-modify this".
The configured default controls startup, not whether an explicit command works.

## Platforms and statusline

Claude plugin commands may be qualified: /h-mode:h-mode, /h-mode:h-mode-audit,
/h-mode:h-mode-review, and /h-mode:h-mode-help. Use the host's command picker.

Codex selects $h-mode, $h-mode-audit, $h-mode-review, or $h-mode-help.
Gemini supplies the four corresponding slash commands. Editor rules apply
through their host's instruction mechanism. Those hosts do not use Claude's
runtime flag.

Runtime compression and statuslines are Claude-specific. The Bash statusline
shows host-provided usage/cost plus approximate savings; PowerShell shows the
badge and approximate savings. Both hide the badge while off. Compression is
lossy, and character-based token estimates are not billing evidence.

For a manual log preview, the main skill includes an optional helper. Do not
install, configure, or activate anything just to display this help.
